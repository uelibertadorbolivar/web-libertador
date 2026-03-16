/**
 * MÓDULO: CREACIÓN Y ASIGNACIÓN DE CARGOS INSTITUCIONALES
 * BLINDAJE EXTREMO: Se usa window.ModCargos para evitar colisiones de re-declaración.
 */

window.ModCargos = {
    cargos: [],
    personal: [],
    cargoEditandoId: null,
    
    init: function() {
        this.cargarTodo();
    },

    cambiarTab: function(vista) {
        if (vista === 'Definir') {
            document.getElementById('tab-definir').classList.add('active', 'bg-primary', 'text-white');
            document.getElementById('tab-definir').classList.remove('text-secondary');
            document.getElementById('tab-asignar').classList.remove('active', 'bg-primary', 'text-white');
            document.getElementById('tab-asignar').classList.add('text-secondary');
            
            document.getElementById('vista-definir').classList.remove('d-none');
            document.getElementById('vista-asignar').classList.add('d-none');
        } else {
            document.getElementById('tab-asignar').classList.add('active', 'bg-primary', 'text-white');
            document.getElementById('tab-asignar').classList.remove('text-secondary');
            document.getElementById('tab-definir').classList.remove('active', 'bg-primary', 'text-white');
            document.getElementById('tab-definir').classList.add('text-secondary');
            
            document.getElementById('vista-asignar').classList.remove('d-none');
            document.getElementById('vista-definir').classList.add('d-none');
        }
    },

    cargarTodo: function() {
        if(typeof Aplicacion !== 'undefined') Aplicacion.mostrarCarga();
        
        let timeoutSeguridad = setTimeout(() => {
            if(typeof Aplicacion !== 'undefined') Aplicacion.ocultarCarga();
            console.error("Timeout: El servidor tardó demasiado en responder.");
        }, 8000);

        try {
            Aplicacion.peticion({ action: "get_cargos" }, (resCargos) => {
                this.cargos = (resCargos && resCargos.cargos) ? resCargos.cargos : [];
                
                Aplicacion.peticion({ action: "get_users" }, (resUsers) => {
                    clearTimeout(timeoutSeguridad);
                    if(typeof Aplicacion !== 'undefined') Aplicacion.ocultarCarga(); 
                    
                    if (resUsers && resUsers.users) {
                        this.personal = resUsers.users.filter(u => 
                            String(u.rol).trim() !== 'Estudiante' && 
                            String(u.rol).trim() !== 'Representante'
                        );
                    } else {
                        this.personal = [];
                    }
                    
                    this.dibujarTablaCargos();
                    this.dibujarTablaAsignaciones();
                });
            });
        } catch (error) {
            clearTimeout(timeoutSeguridad);
            if(typeof Aplicacion !== 'undefined') Aplicacion.ocultarCarga();
            console.error("Error en Módulo Cargos:", error);
        }
    },

    dibujarTablaCargos: function() {
        const tbody = document.getElementById('tabla-cargos-creados');
        if (!tbody) return;
        
        if (this.cargos.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center py-5 text-muted">Aún no se han definido cargos en la institución.</td></tr>`;
            return;
        }

        let html = '';
        this.cargos.forEach(c => {
            let badgeClass = 'bg-secondary';
            if (c.tipo_cargo === 'Gerencial') badgeClass = 'bg-danger';
            if (c.tipo_cargo === 'Supervisorio') badgeClass = 'bg-warning text-dark';
            if (c.tipo_cargo === 'Docente') badgeClass = 'bg-success';
            if (c.tipo_cargo === 'Administrativo') badgeClass = 'bg-info text-dark';

            html += `
            <tr class="animate__animated animate__fadeIn">
                <td class="py-3 ps-3 fw-bold text-dark">${c.nombre_cargo}</td>
                <td class="py-3"><span class="badge ${badgeClass} shadow-sm px-2 py-1">${c.tipo_cargo}</span></td>
                <td class="py-3 small text-muted">${c.descripcion || '-'}</td>
                <td class="py-3 text-end pe-3">
                    <button class="btn btn-sm btn-light border text-primary shadow-sm me-1" onclick="window.ModCargos.cargarParaEditar('${c.id_cargo}')" title="Editar Cargo">
                        <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="btn btn-sm btn-light border text-danger shadow-sm" onclick="window.ModCargos.eliminarCargo('${c.id_cargo}')" title="Eliminar Cargo">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </td>
            </tr>`;
        });
        tbody.innerHTML = html;
    },

    cargarParaEditar: function(idCargo) {
        let cargo = this.cargos.find(c => c.id_cargo === idCargo);
        if(!cargo) return;

        this.cargoEditandoId = idCargo;
        document.getElementById('crg-nombre').value = cargo.nombre_cargo;
        document.getElementById('crg-tipo').value = cargo.tipo_cargo;
        document.getElementById('crg-desc').value = cargo.descripcion || '';

        document.getElementById('titulo-form-cargo').innerHTML = '<i class="bi bi-pencil-fill text-warning me-2"></i>Editar Cargo';
        document.getElementById('btn-guardar-cargo').innerHTML = '<i class="bi bi-save-fill me-2"></i>Actualizar Cargo';
        document.getElementById('btn-guardar-cargo').classList.replace('btn-primario', 'btn-warning');
        document.getElementById('btn-cancelar-edicion').classList.remove('d-none');
        document.getElementById('vista-definir').scrollIntoView({ behavior: 'smooth' });
    },

    cancelarEdicion: function() {
        this.cargoEditandoId = null;
        document.getElementById('crg-nombre').value = '';
        document.getElementById('crg-tipo').selectedIndex = 0;
        document.getElementById('crg-desc').value = '';

        document.getElementById('titulo-form-cargo').innerHTML = '<i class="bi bi-plus-circle-fill text-primary me-2"></i>Crear Nuevo Cargo';
        document.getElementById('btn-guardar-cargo').innerHTML = '<i class="bi bi-save-fill me-2"></i>Registrar Cargo';
        document.getElementById('btn-guardar-cargo').classList.replace('btn-warning', 'btn-primario');
        document.getElementById('btn-cancelar-edicion').classList.add('d-none');
    },

    guardarCargo: function() {
        const nombre = document.getElementById('crg-nombre').value.trim();
        const tipo = document.getElementById('crg-tipo').value;
        const desc = document.getElementById('crg-desc').value.trim();

        if (!nombre) return Swal.fire('Atención', 'El Nombre del Cargo es obligatorio.', 'warning');

        let payload = { action: "save_cargo", nombre_cargo: nombre, tipo_cargo: tipo, descripcion: desc };
        if(this.cargoEditandoId) payload.id_cargo = this.cargoEditandoId;

        Aplicacion.mostrarCarga();
        Aplicacion.peticion(payload, (res) => {
            if (res && res.status === "success") {
                this.cancelarEdicion();
                Swal.fire({toast: true, position: 'top-end', icon: 'success', title: res.message, showConfirmButton: false, timer: 3000});
                this.cargarTodo(); 
            } else {
                Aplicacion.ocultarCarga();
                Swal.fire('Error', res ? res.message : 'Error al guardar.', 'error');
            }
        });
    },

    eliminarCargo: function(idCargo) {
        Swal.fire({ title: '¿Eliminar este Cargo?', text: "Se borrará de la estructura.", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar' }).then((result) => {
            if (result.isConfirmed) {
                Aplicacion.mostrarCarga();
                Aplicacion.peticion({ action: "delete_cargo", id_cargo: idCargo }, (res) => {
                    if (res && res.status === "success") {
                        if(this.cargoEditandoId === idCargo) this.cancelarEdicion();
                        this.cargarTodo();
                    } else {
                        Aplicacion.ocultarCarga();
                        Swal.fire('Error', res ? res.message : 'Error al eliminar.', 'error');
                    }
                });
            }
        });
    },

    // GUARDA EL CAMBIO LOCALMENTE CUANDO SE MUEVE EL SELECTOR (SIN IR AL SERVIDOR AÚN)
    actualizarCargoLocal: function(cedula, nuevoCargo) {
        let usuario = this.personal.find(u => String(u.cedula) === String(cedula));
        if (usuario) {
            usuario.cargo = nuevoCargo;
        }
    },

    // FUNCIÓN PARA LIMPIAR TODOS LOS CARGOS DE LA PANTALLA
    limpiarTodo: function() {
        Swal.fire({
            title: '¿Limpiar Pantalla?',
            text: "Esto removerá todos los cargos asignados en la tabla actual. Deberás presionar 'Guardar Todos' para que los cambios se guarden en el sistema.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, limpiar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                // Vacía el registro local
                this.personal.forEach(u => u.cargo = "");
                // Vuelve a dibujar la tabla vacía
                this.dibujarTablaAsignaciones();
                Swal.fire({toast: true, position: 'top-end', icon: 'info', title: "Pantalla limpiada. Recuerde Guardar.", showConfirmButton: false, timer: 3000});
            }
        });
    },

    // FUNCIÓN PARA ENVIAR TODOS LOS CARGOS JUNTOS AL SERVIDOR
    guardarTodo: function() {
        // Extraemos un arreglo solo con las cédulas y los cargos actuales
        let asignacionesMasivas = this.personal.map(u => {
            return { cedula: u.cedula, cargo: u.cargo || "" };
        });

        Aplicacion.mostrarCarga();
        Aplicacion.peticion({ action: "assign_cargos_bulk", asignaciones: asignacionesMasivas }, (res) => {
            Aplicacion.ocultarCarga();
            if (res && res.status === "success") {
                Swal.fire('¡Proceso Exitoso!', res.message, 'success');
            } else {
                Swal.fire('Error', res ? res.message : 'Error al guardar masivamente', 'error');
            }
        });
    },

    dibujarTablaAsignaciones: function() {
        const tbody = document.getElementById('tabla-asignacion-personal');
        if (!tbody) return;

        let filtro = document.getElementById('buscador-personal');
        let termino = filtro ? filtro.value.toLowerCase() : "";

        let personalFiltrado = this.personal.filter(u => 
            u.nombre_completo.toLowerCase().includes(termino) || 
            String(u.cedula).includes(termino)
        );

        if (personalFiltrado.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center py-5 text-muted">No se encontró personal que coincida.</td></tr>`;
            return;
        }

        let optionsCargos = `<option value="">-- Sin Cargo Asignado --</option>`;
        this.cargos.forEach(c => {
            optionsCargos += `<option value="${c.nombre_cargo}">${c.nombre_cargo} (${c.tipo_cargo})</option>`;
        });

        let html = '';
        personalFiltrado.forEach(u => {
            // NOTA: Se agregó el evento onchange para capturar en tiempo real
            html += `
            <tr class="animate__animated animate__fadeIn">
                <td class="py-2 ps-3 fw-bold text-dark" style="font-size: 13px;">${u.nombre_completo}</td>
                <td class="py-2 text-muted" style="font-size: 13px;">V-${u.cedula}</td>
                <td class="py-2"><span class="badge bg-light text-secondary border shadow-sm">${u.rol}</span></td>
                <td class="py-2">
                    <select class="form-select form-select-sm input-moderno shadow-none" id="sel-cargo-${u.cedula}" onchange="window.ModCargos.actualizarCargoLocal('${u.cedula}', this.value)">
                        ${optionsCargos}
                    </select>
                </td>
                <td class="py-2 text-end pe-3">
                    <button class="btn btn-sm btn-light border text-success shadow-sm fw-bold px-3" onclick="window.ModCargos.asignarCargoUnico('${u.cedula}')" title="Guardar a este usuario">
                        <i class="bi bi-save"></i>
                    </button>
                </td>
            </tr>`;
        });
        
        tbody.innerHTML = html;

        // Auto-seleccionar lo que ya tienen guardado
        personalFiltrado.forEach(u => {
            if (u.cargo) {
                let select = document.getElementById(`sel-cargo-${u.cedula}`);
                if (select) {
                    for (let i = 0; i < select.options.length; i++) {
                        if (select.options[i].value === u.cargo) { select.selectedIndex = i; break; }
                    }
                }
            }
        });
    },

    asignarCargoUnico: function(cedulaUser) {
        let selectEl = document.getElementById(`sel-cargo-${cedulaUser}`);
        if (!selectEl) return;
        
        let cargoSeleccionado = selectEl.value;

        Aplicacion.mostrarCarga();
        Aplicacion.peticion({ action: "assign_cargo", cedula: cedulaUser, cargo_asignado: cargoSeleccionado }, (res) => {
            Aplicacion.ocultarCarga();
            if (res && res.status === "success") {
                Swal.fire({toast: true, position: 'top-end', icon: 'success', title: "Cargo individual asignado.", showConfirmButton: false, timer: 3000});
                let usuario = this.personal.find(u => String(u.cedula) === String(cedulaUser));
                if(usuario) usuario.cargo = cargoSeleccionado;
            } else {
                Swal.fire('Error', res ? res.message : 'Error al guardar', 'error');
            }
        });
    }
};

// ==========================================
// LLAVES DE ENRUTADOR
// ==========================================
window.init_Cargos_Operativos = function() { window.ModCargos.init(); };
window.init_Cargos_Institucionales = function() { window.ModCargos.init(); };
window.init_Cargos = function() { window.ModCargos.init(); };