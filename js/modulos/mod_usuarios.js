/**
 * MÓDULO: GESTIÓN DE USUARIOS
 * Permite crear, editar, eliminar y resetear contraseñas del personal.
 */

window.ModUsuarios = {
    usuarios: [],
    filtrados: [],
    roles: [],
    itemsPorPagina: 8,
    paginaActual: 1,

    init: function() {
        this.cargarDatos();
    },

    cargarDatos: function() {
        window.Aplicacion.mostrarCarga();
        
        // Cargar usuarios y roles al mismo tiempo
        window.Aplicacion.peticion({ action: "get_users" }, (resU) => {
            window.Aplicacion.peticion({ action: "get_roles" }, (resR) => {
                window.Aplicacion.ocultarCarga();
                
                // ✨ FIX: Aceptamos resU.users directamente aunque no traiga "status: success"
                if (resU && resU.users && resR && resR.status === "success") {
                    this.usuarios = resU.users || [];
                    this.roles = resR.roles || [];
                    this.filtrados = [...this.usuarios];
                    this.renderizarTabla();
                } else {
                    Swal.fire("Error", "No se pudieron cargar los datos de seguridad.", "error");
                }
            });
        });
    },

    filtrar: function() {
        const texto = document.getElementById('buscador-usuarios').value.toLowerCase();
        this.filtrados = this.usuarios.filter(u => 
            String(u.cedula).toLowerCase().includes(texto) || 
            String(u.nombre_completo).toLowerCase().includes(texto)
        );
        this.paginaActual = 1; 
        this.renderizarTabla();
    },

    renderizarTabla: function() {
        const tbody = document.getElementById('tabla-usuarios');
        const ulPaginacion = document.getElementById('paginacion-usuarios');
        
        const totalPaginas = Math.ceil(this.filtrados.length / this.itemsPorPagina) || 1;
        if (this.paginaActual > totalPaginas) this.paginaActual = totalPaginas;

        const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
        const usuariosPagina = this.filtrados.slice(inicio, inicio + this.itemsPorPagina);

        if (usuariosPagina.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center p-5 text-muted"><i class="bi bi-search fs-1 d-block mb-3"></i>No se encontraron usuarios.</td></tr>`;
            ulPaginacion.innerHTML = '';
            return;
        }

        let html = '';
        usuariosPagina.forEach(u => {
            let badgeEstado = u.estado === 'Activo' ? 'success' : 'danger';
            
            html += `
            <tr>
                <td class="ps-4 fw-bold text-dark">${u.cedula}</td>
                <td>
                    <div class="fw-bold text-dark">${u.nombre_completo}</div>
                    <div class="small text-muted">${u.email || 'Sin correo registrado'}</div>
                </td>
                <td><span class="badge bg-secondary rounded-pill">${u.rol}</span></td>
                <td><span class="badge bg-${badgeEstado} rounded-pill">${u.estado}</span></td>
                <td class="text-end pe-4">
                    <button class="btn btn-sm btn-light text-warning border shadow-sm hover-efecto me-1" onclick="window.ModUsuarios.resetearClave('${u.cedula}')" title="Resetear Contraseña a Fábrica"><i class="bi bi-key-fill"></i></button>
                    <button class="btn btn-sm btn-light text-primary border shadow-sm hover-efecto me-1" onclick="window.ModUsuarios.editarUsuario('${u.cedula}')" title="Editar Perfil"><i class="bi bi-pencil-fill"></i></button>
                    <button class="btn btn-sm btn-light text-danger border shadow-sm hover-efecto" onclick="window.ModUsuarios.eliminarUsuario('${u.cedula}')" title="Eliminar Acceso"><i class="bi bi-trash3-fill"></i></button>
                </td>
            </tr>`;
        });
        
        tbody.innerHTML = html;
        this.generarPaginacion(totalPaginas);
    },

    generarPaginacion: function(totalPaginas) {
        const contenedor = document.getElementById('paginacion-usuarios');
        if (totalPaginas <= 1) { contenedor.innerHTML = ''; return; }
        
        let html = '';
        html += `<li class="page-item ${this.paginaActual === 1 ? 'disabled' : ''}"><button class="page-link" onclick="window.ModUsuarios.cambiarPagina(${this.paginaActual - 1})"><i class="bi bi-chevron-left"></i></button></li>`;
        
        for (let i = 1; i <= totalPaginas; i++) {
            if (i === 1 || i === totalPaginas || (i >= this.paginaActual - 2 && i <= this.paginaActual + 2)) {
                html += `<li class="page-item ${this.paginaActual === i ? 'active' : ''}"><button class="page-link" onclick="window.ModUsuarios.cambiarPagina(${i})">${i}</button></li>`;
            } else if (i === this.paginaActual - 3 || i === this.paginaActual + 3) {
                html += `<li class="page-item disabled"><span class="page-link border-0 text-muted">...</span></li>`;
            }
        }
        
        html += `<li class="page-item ${this.paginaActual === totalPaginas ? 'disabled' : ''}"><button class="page-link" onclick="window.ModUsuarios.cambiarPagina(${this.paginaActual + 1})"><i class="bi bi-chevron-right"></i></button></li>`;
        contenedor.innerHTML = html;
    },

    cambiarPagina: function(pag) {
        this.paginaActual = pag;
        this.renderizarTabla();
    },

    generarOpcionesRoles: function(rolSeleccionado = '') {
        let html = '<option value="">Seleccione un Rol...</option>';
        this.roles.forEach(r => {
            let sel = r.nombre === rolSeleccionado ? 'selected' : '';
            html += `<option value="${r.nombre}" ${sel}>${r.nombre}</option>`;
        });
        return html;
    },

    nuevoUsuario: function() {
        Swal.fire({
            title: 'Registrar Usuario',
            html: `
                <div class="text-start mb-2"><label class="small fw-bold text-muted">Cédula de Identidad</label></div>
                <input id="swal-cedula" type="number" class="swal2-input input-moderno m-0 mb-3 w-100" placeholder="Ej: 12345678">
                
                <div class="text-start mb-2"><label class="small fw-bold text-muted">Nombre Completo</label></div>
                <input id="swal-nombre" type="text" class="swal2-input input-moderno m-0 mb-3 w-100" placeholder="Ej: Juan Pérez">
                
                <div class="text-start mb-2"><label class="small fw-bold text-muted">Rol en el Sistema</label></div>
                <select id="swal-rol" class="swal2-input input-moderno m-0 w-100">${this.generarOpcionesRoles()}</select>
            `,
            showCancelButton: true,
            confirmButtonText: 'Crear Usuario',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#263238',
            preConfirm: () => {
                const c = document.getElementById('swal-cedula').value;
                const n = document.getElementById('swal-nombre').value;
                const r = document.getElementById('swal-rol').value;
                if(!c || !n || !r) return Swal.showValidationMessage('Todos los campos son obligatorios');
                return { cedula_nueva: c, nombre: n, rol: r };
            }
        }).then(res => {
            if(res.isConfirmed) {
                window.Aplicacion.mostrarCarga();
                window.Aplicacion.peticion({ action: 'save_user', ...res.value }, (resp) => {
                    if(resp && resp.status === 'success') {
                        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Usuario Registrado', showConfirmButton: false, timer: 1500 });
                        this.cargarDatos();
                    } else {
                        window.Aplicacion.ocultarCarga();
                        Swal.fire('Error', resp.message, 'error');
                    }
                });
            }
        });
    },

    editarUsuario: function(cedula) {
        const u = this.usuarios.find(x => String(x.cedula) === String(cedula));
        if(!u) return;

        Swal.fire({
            title: 'Editar Usuario',
            html: `
                <div class="text-start mb-1"><label class="small fw-bold text-muted">Cédula</label></div>
                <input id="swal-cedula" class="swal2-input input-moderno m-0 mb-3 w-100" value="${u.cedula}">
                
                <div class="text-start mb-1"><label class="small fw-bold text-muted">Nombre Completo</label></div>
                <input id="swal-nombre" class="swal2-input input-moderno m-0 mb-3 w-100" value="${u.nombre_completo}">
                
                <div class="text-start mb-1"><label class="small fw-bold text-muted">Rol</label></div>
                <select id="swal-rol" class="swal2-input input-moderno m-0 mb-3 w-100">${this.generarOpcionesRoles(u.rol)}</select>
                
                <div class="text-start mb-1"><label class="small fw-bold text-muted">Estado del Acceso</label></div>
                <select id="swal-estado" class="swal2-input input-moderno m-0 w-100">
                    <option value="Activo" ${u.estado === 'Activo' ? 'selected' : ''}>Activo (Puede entrar)</option>
                    <option value="Bloqueado" ${u.estado === 'Bloqueado' ? 'selected' : ''}>Bloqueado (No puede entrar)</option>
                </select>
            `,
            showCancelButton: true, confirmButtonText: 'Actualizar', confirmButtonColor: '#263238',
            preConfirm: () => {
                return {
                    cedula_original: u.cedula,
                    nueva_cedula: document.getElementById('swal-cedula').value,
                    nombre: document.getElementById('swal-nombre').value,
                    rol: document.getElementById('swal-rol').value,
                    estado: document.getElementById('swal-estado').value,
                    email: u.email, telefono: u.telefono
                };
            }
        }).then(res => {
            if(res.isConfirmed) {
                window.Aplicacion.mostrarCarga();
                window.Aplicacion.peticion({ action: 'edit_user', ...res.value }, (resp) => {
                    if(resp && resp.status === 'success') {
                        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Actualizado', showConfirmButton: false, timer: 1500 });
                        this.cargarDatos();
                    } else {
                        window.Aplicacion.ocultarCarga(); 
                        Swal.fire('Error', resp.message, 'error');
                    }
                });
            }
        });
    },

    resetearClave: function(cedula) {
        Swal.fire({
            title: '¿Resetear Contraseña?', 
            text: "La contraseña volverá a estar en blanco y el usuario deberá configurar una nueva al iniciar sesión.", 
            icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#ffc107', confirmButtonText: 'Sí, resetear a fábrica'
        }).then(res => {
            if(res.isConfirmed) {
                window.Aplicacion.mostrarCarga();
                window.Aplicacion.peticion({ action: 'reset_password', cedula_reset: cedula }, resp => {
                    if(resp && resp.status === 'success') { 
                        Swal.fire('Éxito', 'Contraseña reseteada a fábrica.', 'success'); 
                        this.cargarDatos(); 
                    } else { 
                        window.Aplicacion.ocultarCarga(); 
                        Swal.fire('Error', resp.message, 'error'); 
                    }
                });
            }
        });
    },

    eliminarUsuario: function(cedula) {
        Swal.fire({
            title: '¿Eliminar Usuario?', 
            text: "Se borrará su acceso de forma permanente. ¡Esta acción no se puede deshacer!", 
            icon: 'error',
            showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Sí, eliminar'
        }).then(res => {
            if(res.isConfirmed) {
                window.Aplicacion.mostrarCarga();
                window.Aplicacion.peticion({ action: 'delete_users', cedulas: [cedula] }, resp => {
                    if(resp && resp.status === 'success') { 
                        Swal.fire('Eliminado', resp.message, 'success'); 
                        this.cargarDatos(); 
                    } else { 
                        window.Aplicacion.ocultarCarga(); 
                        Swal.fire('Error', resp.message, 'error'); 
                    }
                });
            }
        });
    }
};

// ✨ FIX: Múltiples aliases por si hay tildes en la ruta
window.init_Gestión_de_Usuarios = function() { window.ModUsuarios.init(); };
window.init_Gestion_de_Usuarios = function() { window.ModUsuarios.init(); };