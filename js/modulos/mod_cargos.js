/**
 * MÓDULO: GESTIÓN DE CARGOS INSTITUCIONALES
 * Crea cargos y los asigna al personal (con paginación y filtro de usuarios).
 */

window.ModCargos = {
    cargos: [],
    usuariosValidos: [],
    usuariosFiltrados: [], // Para el buscador
    
    // Configuración de Paginación
    itemsPorPaginaCargos: 6,
    paginaActualCargos: 1,
    
    itemsPorPaginaUsuarios: 10,
    paginaActualUsuarios: 1,

    init: function() {
        this.cargarDatos();
    },

    cambiarPestana: function(pestana) {
        document.getElementById('tab-definir').classList.remove('activo');
        document.getElementById('tab-asignar').classList.remove('activo');
        
        document.getElementById('seccion-definir').style.display = 'none';
        document.getElementById('seccion-asignar').style.display = 'none';

        if(pestana === 'definir') {
            document.getElementById('tab-definir').classList.add('activo');
            document.getElementById('seccion-definir').style.display = 'flex';
        } else {
            document.getElementById('tab-asignar').classList.add('activo');
            document.getElementById('seccion-asignar').style.display = 'flex';
        }
    },

    cargarDatos: function() {
        window.Aplicacion.mostrarCarga();
        
        // 1. Pedir Cargos
        window.Aplicacion.peticion({ action: "get_cargos" }, (resCargos) => {
            if (resCargos && resCargos.cargos) this.cargos = resCargos.cargos;
            
            // 2. Pedir Todos los Usuarios
            window.Aplicacion.peticion({ action: "get_users" }, (resUsers) => {
                window.Aplicacion.ocultarCarga();
                if (resUsers && resUsers.users) {
                    
                    // ✨ FILTRO ESTRICTO: Solo personal escolar
                    const rolesExcluidos = ["Estudiante", "Representante", "Invitado"];
                    this.usuariosValidos = resUsers.users.filter(u => !rolesExcluidos.includes(u.rol));
                    this.usuariosFiltrados = [...this.usuariosValidos]; // Copia para el buscador
                    
                    this.actualizarUI();
                }
            });
        });
    },

    actualizarUI: function() {
        document.getElementById('total-cargos').innerText = `${this.cargos.length} Cargos`;
        this.renderizarTablaCargos();
        this.renderizarTablaAsignacion();
    },

    // ==========================================
    // 🏢 PAGINACIÓN Y RENDER: CARGOS
    // ==========================================
    renderizarTablaCargos: function() {
        const tbody = document.getElementById('tabla-cargos-body');
        const ulPaginacion = document.getElementById('paginacion-cargos');
        
        const totalPaginas = Math.ceil(this.cargos.length / this.itemsPorPaginaCargos) || 1;
        if (this.paginaActualCargos > totalPaginas) this.paginaActualCargos = totalPaginas;

        const inicio = (this.paginaActualCargos - 1) * this.itemsPorPaginaCargos;
        const cargosPagina = this.cargos.slice(inicio, inicio + this.itemsPorPaginaCargos);

        if (cargosPagina.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center p-4 text-muted"><i class="bi bi-inbox fs-3 d-block mb-2"></i>No hay cargos registrados.</td></tr>`;
            ulPaginacion.innerHTML = '';
            return;
        }

        let html = '';
        cargosPagina.forEach(c => {
            let colorClasif = c.tipo_cargo === 'Directivo' ? 'danger' : (c.tipo_cargo === 'Supervisorio' ? 'warning text-dark' : 'primary');
            html += `
            <tr>
                <td class="ps-4 fw-bold text-dark">${c.nombre_cargo}</td>
                <td><span class="badge bg-${colorClasif} rounded-pill">${c.tipo_cargo}</span></td>
                <td class="text-muted small">${c.descripcion || '-'}</td>
                <td class="text-end pe-4">
                    <button class="btn btn-sm btn-light text-primary border shadow-sm me-1 hover-efecto" onclick="window.ModCargos.editarCargo('${c.id_cargo}')"><i class="bi bi-pencil-fill"></i></button>
                    <button class="btn btn-sm btn-light text-danger border shadow-sm hover-efecto" onclick="window.ModCargos.eliminarCargo('${c.id_cargo}')"><i class="bi bi-trash3-fill"></i></button>
                </td>
            </tr>`;
        });
        tbody.innerHTML = html;
        this.generarControlesPaginacion(totalPaginas, this.paginaActualCargos, 'paginacion-cargos', 'window.ModCargos.cambiarPaginaCargos');
    },

    cambiarPaginaCargos: function(pag) {
        this.paginaActualCargos = pag;
        this.renderizarTablaCargos();
    },

    // ==========================================
    // 👨‍🏫 PAGINACIÓN Y RENDER: ASIGNACIÓN A USUARIOS
    // ==========================================
    filtrarUsuarios: function() {
        const texto = document.getElementById('buscador-personal').value.toLowerCase();
        this.usuariosFiltrados = this.usuariosValidos.filter(u => 
            String(u.nombre_completo).toLowerCase().includes(texto) || 
            String(u.cedula).toLowerCase().includes(texto)
        );
        this.paginaActualUsuarios = 1;
        this.renderizarTablaAsignacion();
    },

    renderizarTablaAsignacion: function() {
        const tbody = document.getElementById('tabla-asignacion-body');
        const ulPaginacion = document.getElementById('paginacion-usuarios');
        
        const totalPaginas = Math.ceil(this.usuariosFiltrados.length / this.itemsPorPaginaUsuarios) || 1;
        if (this.paginaActualUsuarios > totalPaginas) this.paginaActualUsuarios = totalPaginas;

        const inicio = (this.paginaActualUsuarios - 1) * this.itemsPorPaginaUsuarios;
        const usuariosPagina = this.usuariosFiltrados.slice(inicio, inicio + this.itemsPorPaginaUsuarios);

        if (usuariosPagina.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" class="text-center p-4 text-muted"><i class="bi bi-search fs-3 d-block mb-2"></i>No se encontró personal.</td></tr>`;
            ulPaginacion.innerHTML = '';
            return;
        }

        // Construir opciones del Select de Cargos
        let opcionesCargos = `<option value="">Sin cargo asignado / Eliminar cargo</option>`;
        this.cargos.forEach(c => { opcionesCargos += `<option value="${c.nombre_cargo}">${c.nombre_cargo}</option>`; });

        let html = '';
        usuariosPagina.forEach(u => {
            // Pre-seleccionar si ya tiene cargo
            let selectHTML = `<select class="form-select form-select-sm border-primary text-dark fw-bold selector-cargo-bulk" data-cedula="${u.cedula}">${opcionesCargos}</select>`;
            if (u.cargo) { selectHTML = selectHTML.replace(`value="${u.cargo}"`, `value="${u.cargo}" selected`); }

            html += `
            <tr>
                <td class="ps-4">
                    <div class="fw-bold text-dark">${u.nombre_completo}</div>
                    <div class="small text-muted">C.I: ${u.cedula}</div>
                </td>
                <td><span class="badge bg-secondary rounded-pill">${u.rol}</span></td>
                <td class="pe-4">${selectHTML}</td>
            </tr>`;
        });
        tbody.innerHTML = html;
        this.generarControlesPaginacion(totalPaginas, this.paginaActualUsuarios, 'paginacion-usuarios', 'window.ModCargos.cambiarPaginaUsuarios');
    },

    cambiarPaginaUsuarios: function(pag) {
        this.paginaActualUsuarios = pag;
        this.renderizarTablaAsignacion();
    },

    // ==========================================
    // 🧮 HELPER: GENERADOR DE BOTONES DE PAGINACIÓN
    // ==========================================
    generarControlesPaginacion: function(totalPaginas, paginaActual, idContenedor, funcionClick) {
        const contenedor = document.getElementById(idContenedor);
        if (totalPaginas <= 1) { contenedor.innerHTML = ''; return; }
        
        let html = '';
        // Botón Anterior
        html += `<li class="page-item ${paginaActual === 1 ? 'disabled' : ''}"><button class="page-link" onclick="${funcionClick}(${paginaActual - 1})"><i class="bi bi-chevron-left"></i></button></li>`;
        
        // Números
        for (let i = 1; i <= totalPaginas; i++) {
            // Mostrar solo ventana cercana (para no hacer la lista infinita)
            if (i === 1 || i === totalPaginas || (i >= paginaActual - 2 && i <= paginaActual + 2)) {
                html += `<li class="page-item ${paginaActual === i ? 'active' : ''}"><button class="page-link" onclick="${funcionClick}(${i})">${i}</button></li>`;
            } else if (i === paginaActual - 3 || i === paginaActual + 3) {
                html += `<li class="page-item disabled"><span class="page-link border-0 text-muted">...</span></li>`;
            }
        }
        
        // Botón Siguiente
        html += `<li class="page-item ${paginaActual === totalPaginas ? 'disabled' : ''}"><button class="page-link" onclick="${funcionClick}(${paginaActual + 1})"><i class="bi bi-chevron-right"></i></button></li>`;
        
        contenedor.innerHTML = html;
    },

    // ==========================================
    // 💾 FUNCIONES DE BASE DE DATOS
    // ==========================================
    guardarCargo: function() {
        const id = document.getElementById('c-id').value;
        const nombre = document.getElementById('c-nombre').value;
        const tipo = document.getElementById('c-tipo').value;
        const desc = document.getElementById('c-desc').value;

        window.Aplicacion.mostrarCarga();
        window.Aplicacion.peticion({ action: "save_cargo", id_cargo: id, nombre_cargo: nombre, tipo_cargo: tipo, descripcion: desc }, (res) => {
            if (res && res.status === "success") {
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Cargo guardado', showConfirmButton: false, timer: 1500 });
                document.getElementById('form-cargo').reset();
                document.getElementById('c-id').value = '';
                this.cargarDatos();
            } else {
                window.Aplicacion.ocultarCarga();
                Swal.fire("Error", res ? res.message : "Error al guardar.", "error");
            }
        });
    },

    editarCargo: function(id) {
        const cargo = this.cargos.find(c => String(c.id_cargo) === String(id));
        if (!cargo) return;
        document.getElementById('c-id').value = cargo.id_cargo;
        document.getElementById('c-nombre').value = cargo.nombre_cargo;
        document.getElementById('c-tipo').value = cargo.tipo_cargo;
        document.getElementById('c-desc').value = cargo.descripcion || '';
    },

    eliminarCargo: function(id) {
        Swal.fire({
            title: '¿Eliminar cargo?', text: "Esta acción no se puede deshacer.", icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#6c757d', confirmButtonText: 'Sí, eliminar'
        }).then((result) => {
            if (result.isConfirmed) {
                window.Aplicacion.mostrarCarga();
                window.Aplicacion.peticion({ action: "delete_cargo", id_cargo: id }, (res) => {
                    if (res && res.status === "success") {
                        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Eliminado', showConfirmButton: false, timer: 1500 });
                        this.cargarDatos();
                    } else {
                        window.Aplicacion.ocultarCarga();
                        Swal.fire("Error", "Error al eliminar.", "error");
                    }
                });
            }
        });
    },

    guardarAsignacionesBulk: function() {
        // Recoge todos los selects de la PÁGINA ACTUAL
        const selects = document.querySelectorAll('.selector-cargo-bulk');
        let asignaciones = [];
        
        selects.forEach(sel => {
            asignaciones.push({ cedula: sel.getAttribute('data-cedula'), cargo: sel.value });
        });

        if (asignaciones.length === 0) return Swal.fire('Atención', 'No hay personal en esta página para guardar.', 'warning');

        window.Aplicacion.mostrarCarga();
        window.Aplicacion.peticion({ action: "assign_cargos_bulk", asignaciones: asignaciones }, (res) => {
            window.Aplicacion.ocultarCarga();
            if (res && res.status === "success") {
                Swal.fire('¡Éxito!', 'Los cargos de esta página han sido asignados correctamente a la base de datos.', 'success').then(() => {
                    this.cargarDatos(); // Recargar para asegurar sincronización
                });
            } else {
                Swal.fire("Error", res ? res.message : "Error al asignar.", "error");
            }
        });
    }
};

window.init_Cargos_Institucionales = function() { window.ModCargos.init(); };