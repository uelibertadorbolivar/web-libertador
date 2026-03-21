/**
 * MÓDULO: ROLES Y PRIVILEGIOS
 * Asigna permisos de visualización a cada rol leyendo el diccionario global del sistema.
 */

window.ModRoles = {
    roles: [],
    rolActual: null,

    init: function() {
        this.cargarDatos();
    },

    cargarDatos: function() {
        window.Aplicacion.mostrarCarga();
        window.Aplicacion.peticion({ action: "get_roles" }, (res) => {
            window.Aplicacion.ocultarCarga();
            if (res && res.status === "success") {
                this.roles = res.roles || [];
                this.renderizarListaRoles();
                
                // Si teníamos un rol abierto, volver a cargarlo
                if(this.rolActual) {
                    this.seleccionarRol(this.rolActual.nombre);
                } else {
                    document.getElementById('panel-privilegios').style.display = 'none';
                    document.getElementById('panel-vacio-roles').style.display = 'flex';
                }
            } else {
                Swal.fire("Error", "No se pudieron cargar los roles.", "error");
            }
        });
    },

    renderizarListaRoles: function() {
        const lista = document.getElementById('lista-roles-ui');
        let html = '';
        this.roles.forEach(r => {
            let icono = r.nombre === 'Administrador' ? 'bi-shield-check-fill text-success' : 'bi-person-badge-fill text-secondary';
            let bgClass = (this.rolActual && this.rolActual.nombre === r.nombre) ? 'bg-primary bg-opacity-10 border-primary' : '';
            
            html += `
            <a href="javascript:void(0)" class="list-group-item list-group-item-action p-3 border-bottom d-flex align-items-center hover-efecto ${bgClass}" onclick="window.ModRoles.seleccionarRol('${r.nombre}')">
                <i class="bi ${icono} fs-4 me-3"></i>
                <div class="fw-bold text-dark">${r.nombre}</div>
                <i class="bi bi-chevron-right ms-auto text-muted small"></i>
            </a>`;
        });
        lista.innerHTML = html;
    },

    seleccionarRol: function(nombreRol) {
        this.rolActual = this.roles.find(r => r.nombre === nombreRol);
        if (!this.rolActual) return;

        this.renderizarListaRoles(); // Repintar para marcar el seleccionado
        document.getElementById('titulo-rol-seleccionado').innerText = 'Privilegios: ' + this.rolActual.nombre;
        
        // Proteger roles críticos
        const btnEliminar = document.getElementById('btn-eliminar-rol');
        if (this.rolActual.nombre === 'Administrador' || this.rolActual.nombre === 'Directivo') {
            btnEliminar.style.display = 'none';
        } else {
            btnEliminar.style.display = 'inline-block';
        }

        this.construirMatrizPermisos();

        document.getElementById('panel-vacio-roles').style.display = 'none';
        document.getElementById('panel-privilegios').style.display = 'block';
    },

    construirMatrizPermisos: function() {
        const contenedor = document.getElementById('contenedor-permisos-dinamicos');
        let html = '';
        let permisosActuales = this.rolActual.permisos || {};
        
        const esSuperAdmin = (this.rolActual.nombre === 'Administrador' || this.rolActual.nombre === 'Directivo');

        // Leer la estructura central de aplicacion.js
        for (const [categoria, datosModulo] of Object.entries(window.Aplicacion.ModulosSistema)) {
            html += `
            <div class="bg-white p-3 rounded-4 shadow-sm border mb-3">
                <h6 class="fw-bold border-bottom pb-2 mb-3" style="color: ${datosModulo.color};"><i class="bi ${datosModulo.icono} me-2"></i>${categoria}</h6>
                <div class="row g-3">`;
            
            datosModulo.items.forEach(vistaObj => {
                const nombreVista = vistaObj.vista;
                // Verificar si tiene permiso guardado
                let tienePermiso = permisosActuales[nombreVista] && permisosActuales[nombreVista]['ver'] === true;
                if(esSuperAdmin) tienePermiso = true; // Admin ve todo siempre
                
                let idCheck = `chk-permiso-${nombreVista.replace(/\s+/g, '')}`;
                let disabledStr = esSuperAdmin ? 'disabled' : '';

                html += `
                <div class="col-md-6 col-xl-4">
                    <div class="form-check form-switch border p-2 rounded-3" style="padding-left: 3rem !important;">
                        <input class="form-check-input check-privilegio" type="checkbox" id="${idCheck}" data-vista="${nombreVista}" ${tienePermiso ? 'checked' : ''} ${disabledStr} style="cursor: pointer; width: 2.5em; height: 1.25em; margin-left: -2.5rem;">
                        <label class="form-check-label fw-bold small text-dark ms-2" for="${idCheck}" style="cursor: pointer; margin-top: 2px;">
                            ${nombreVista}
                        </label>
                    </div>
                </div>`;
            });
            html += `</div></div>`;
        }
        
        if(esSuperAdmin) {
            html += `<div class="alert alert-success mt-3"><i class="bi bi-info-circle-fill me-2"></i>Los roles Administrador y Directivo tienen acceso total por defecto y no pueden ser restringidos.</div>`;
        }

        contenedor.innerHTML = html;
    },

    guardarPrivilegios: function() {
        if (!this.rolActual) return;
        if (this.rolActual.nombre === 'Administrador' || this.rolActual.nombre === 'Directivo') {
            return Swal.fire("Información", "Los privilegios de este rol no necesitan ser guardados, su acceso total está blindado en el código base.", "info");
        }

        let nuevosPermisos = {};
        const checkboxes = document.querySelectorAll('.check-privilegio');
        
        checkboxes.forEach(chk => {
            const vista = chk.getAttribute('data-vista');
            nuevosPermisos[vista] = { ver: chk.checked };
        });

        window.Aplicacion.mostrarCarga();
        window.Aplicacion.peticion({
            action: 'save_role',
            nombre_rol: this.rolActual.nombre,
            permisos: nuevosPermisos
        }, (res) => {
            window.Aplicacion.ocultarCarga();
            if (res && res.status === "success") {
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Privilegios actualizados', showConfirmButton: false, timer: 1500 });
                
                // Si el usuario editó su propio rol, actualizar la sesión en vivo para aplicar permisos de inmediato
                if(window.Aplicacion.usuario.rol === this.rolActual.nombre) {
                    window.Aplicacion.permisosActuales = nuevosPermisos;
                    setTimeout(() => location.reload(), 1500); // Recargar suave
                } else {
                    this.cargarDatos();
                }
            } else {
                Swal.fire("Error", res ? res.message : "Error al guardar.", "error");
            }
        });
    },

    crearRol: function() {
        Swal.fire({
            title: 'Crear Nuevo Rol',
            input: 'text',
            inputPlaceholder: 'Ej: Coordinador de Cultura',
            showCancelButton: true, confirmButtonText: 'Crear', confirmButtonColor: '#263238',
            preConfirm: (valor) => {
                if (!valor) Swal.showValidationMessage('Debe escribir un nombre para el rol');
                return valor;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                window.Aplicacion.mostrarCarga();
                window.Aplicacion.peticion({ action: 'save_role', nombre_rol: result.value, permisos: {} }, (res) => {
                    if (res && res.status === 'success') {
                        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Rol creado', showConfirmButton: false, timer: 1500 });
                        this.cargarDatos();
                    } else {
                        window.Aplicacion.ocultarCarga();
                        Swal.fire('Error', res.message, 'error');
                    }
                });
            }
        });
    },

    eliminarRolActual: function() {
        if (!this.rolActual) return;
        Swal.fire({
            title: '¿Eliminar Rol?', 
            text: "Los usuarios con este rol perderán todos sus accesos hasta que se les asigne uno nuevo.", 
            icon: 'error',
            showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Sí, eliminar'
        }).then(res => {
            if(res.isConfirmed) {
                window.Aplicacion.mostrarCarga();
                window.Aplicacion.peticion({ action: 'delete_role', nombre_rol: this.rolActual.nombre }, resp => {
                    if(resp && resp.status === 'success') { 
                        Swal.fire('Eliminado', resp.message, 'success'); 
                        this.rolActual = null;
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

window.init_Roles_y_Privilegios = function() { window.ModRoles.init(); };