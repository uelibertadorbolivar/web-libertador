/**
 * MÓDULO: MATRIZ DE ROLES Y PRIVILEGIOS
 * BLINDADO CON window.ModRoles
 */

window.ModRoles = {
    roles: [],
    rolActual: null,
    
    // LISTA MAESTRA DE TODOS LOS MÓDULOS DE SIGAE QUE SE PUEDEN APAGAR/PRENDER
    MATRIZ_CONFIG: [
        { id: "Perfil de la Escuela", nombre: "Directiva: Perfil de Escuela" },
        { id: "Configuración del Sistema", nombre: "Directiva: Parámetros y Fechas" },
        { id: "Calendario Escolar", nombre: "Directiva: Calendario" },
        { id: "Grados y Salones", nombre: "Académico: Salones y Secciones" },
        { id: "Asignar Guiaturas", nombre: "Personal: Asignar Guiaturas" },
        { id: "Transporte Escolar", nombre: "Transporte: Acceso Principal al Módulo" },
        { id: "Transporte: Paradas", nombre: "Transporte: Configurar Paradas" },
        { id: "Transporte: Rutas", nombre: "Transporte: Diseñar Rutas" },
        { id: "Transporte: Monitoreo", nombre: "Transporte: Ver Tracking GPS" },
        { id: "Gestión de Usuarios", nombre: "Seguridad: Cuentas de Usuario" },
        { id: "Roles y Privilegios", nombre: "Seguridad: Matriz de Roles" },
        { id: "Cargos Institucionales", nombre: "Personal: Cargos Base" },
        { id: "Cadena Supervisoria", nombre: "Personal: Organigrama Institucional" }
    ],

    init: function() {
        this.cargarRoles();
    },

    cargarRoles: function() {
        window.Aplicacion.mostrarCarga();
        window.Aplicacion.peticion({ action: "get_roles" }, (res) => {
            window.Aplicacion.ocultarCarga();
            if (res && res.status === "success") {
                this.roles = res.roles;
                this.dibujarListaRoles();
                if(this.rolActual) this.cargarMatriz(this.rolActual); // Mantener en pantalla si actualizó
            }
        });
    },

    dibujarListaRoles: function() {
        let div = document.getElementById('lista-roles');
        if(!div) return;
        let html = '';
        
        this.roles.forEach(rol => {
            let active = (this.rolActual === rol.nombre) ? 'active bg-primary text-white border-primary' : 'text-dark';
            html += `<button class="list-group-item list-group-item-action fw-bold ${active} d-flex justify-content-between align-items-center" onclick="window.ModRoles.cargarMatriz('${rol.nombre}')">
                        ${rol.nombre} <i class="bi bi-chevron-right small"></i>
                     </button>`;
        });
        div.innerHTML = html;
    },

    crearRol: function() {
        let txt = document.getElementById('txt-nuevo-rol');
        let nombre = txt.value.trim();
        if(!nombre) return Swal.fire('Error', 'Ingrese un nombre para el rol', 'warning');
        if(nombre === "Administrador" || nombre === "Directivo") return Swal.fire('Denegado', 'Nombres de sistema reservados.', 'error');
        
        window.Aplicacion.mostrarCarga();
        window.Aplicacion.peticion({ action: "save_role", nombre_rol: nombre, permisos: {} }, (res) => {
            if(res && res.status === 'success') {
                txt.value = '';
                this.cargarRoles();
            } else {
                window.Aplicacion.ocultarCarga();
                Swal.fire('Error', 'No se pudo crear.', 'error');
            }
        });
    },

    cargarMatriz: function(nombreRol) {
        this.rolActual = nombreRol;
        this.dibujarListaRoles(); // Repintar para marcar en azul

        let rolObj = this.roles.find(r => r.nombre === nombreRol);
        let pers = (rolObj && rolObj.permisos && typeof rolObj.permisos === 'object' && !Array.isArray(rolObj.permisos)) ? rolObj.permisos : {};

        document.getElementById('pantalla-espera-roles').classList.add('d-none');
        document.getElementById('panel-matriz').classList.remove('d-none');
        document.getElementById('lbl-rol-actual').innerText = nombreRol;

        let esDios = (nombreRol === "Administrador" || nombreRol === "Directivo");
        let html = '';

        this.MATRIZ_CONFIG.forEach(m => {
            // Leer estado guardado (o forzar prendido si es Dios)
            let v = esDios ? 'checked disabled' : ((pers[m.id] && pers[m.id].ver) ? 'checked' : '');
            let c = esDios ? 'checked disabled' : ((pers[m.id] && pers[m.id].crear) ? 'checked' : '');
            let e = esDios ? 'checked disabled' : ((pers[m.id] && pers[m.id].editar) ? 'checked' : '');
            let l = esDios ? 'checked disabled' : ((pers[m.id] && pers[m.id].eliminar) ? 'checked' : '');

            html += `
            <tr>
                <td class="text-start ps-4 fw-bold text-dark border-end" style="background:#f8fafc;">${m.nombre}</td>
                <td><div class="form-check form-switch d-flex justify-content-center"><input class="form-check-input shadow-sm chk-permiso" type="checkbox" data-modulo="${m.id}" data-accion="ver" ${v} style="cursor:pointer; width:2.5em; height:1.25em;"></div></td>
                <td><div class="form-check form-switch d-flex justify-content-center"><input class="form-check-input shadow-sm chk-permiso" type="checkbox" data-modulo="${m.id}" data-accion="crear" ${c} style="cursor:pointer; width:2.5em; height:1.25em;"></div></td>
                <td><div class="form-check form-switch d-flex justify-content-center"><input class="form-check-input shadow-sm chk-permiso" type="checkbox" data-modulo="${m.id}" data-accion="editar" ${e} style="cursor:pointer; width:2.5em; height:1.25em;"></div></td>
                <td><div class="form-check form-switch d-flex justify-content-center"><input class="form-check-input shadow-sm chk-permiso" type="checkbox" data-modulo="${m.id}" data-accion="eliminar" ${l} style="cursor:pointer; width:2.5em; height:1.25em;"></div></td>
            </tr>`;
        });

        document.getElementById('cuerpo-matriz').innerHTML = html;
    },

    guardarMatriz: function() {
        if(!this.rolActual) return;
        if(this.rolActual === "Administrador" || this.rolActual === "Directivo") return Swal.fire('Info', 'Estos roles de sistema no pueden modificarse.', 'info');

        let jsonPermisos = {};
        
        let switches = document.querySelectorAll('.chk-permiso');
        switches.forEach(sw => {
            let mod = sw.getAttribute('data-modulo');
            let acc = sw.getAttribute('data-accion');
            if(!jsonPermisos[mod]) jsonPermisos[mod] = { ver: false, crear: false, editar: false, eliminar: false };
            jsonPermisos[mod][acc] = sw.checked;
        });

        window.Aplicacion.mostrarCarga();
        window.Aplicacion.peticion({ action: "save_role", nombre_rol: this.rolActual, permisos: jsonPermisos }, (res) => {
            window.Aplicacion.ocultarCarga();
            if(res && res.status === 'success') {
                Swal.fire({toast:true, position:'top-end', icon:'success', title:'Permisos guardados', showConfirmButton:false, timer:2500});
                
                // Si el usuario editó SU PROPIO ROL, hay que refrescar el navegador para aplicar candados de inmediato
                if(window.Aplicacion.usuario && window.Aplicacion.usuario.rol === this.rolActual) {
                    setTimeout(() => location.reload(), 1500);
                } else {
                    this.cargarRoles();
                }
            }
        });
    },

    eliminarRolActual: function() {
        if(!this.rolActual) return;
        Swal.fire({title: `¿Eliminar rol ${this.rolActual}?`, icon: 'warning', showCancelButton:true, confirmButtonColor:'#d33'}).then(r => {
            if(r.isConfirmed) {
                window.Aplicacion.peticion({ action: "delete_role", nombre_rol: this.rolActual }, res => {
                    this.rolActual = null;
                    document.getElementById('pantalla-espera-roles').classList.remove('d-none');
                    document.getElementById('panel-matriz').classList.add('d-none');
                    this.cargarRoles();
                });
            }
        });
    }
};

window.init_Roles_y_Privilegios = function() { window.ModRoles.init(); };