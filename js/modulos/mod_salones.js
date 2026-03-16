/**
 * MÓDULO: GESTIÓN DE GRADOS Y SALONES (UNIFICADO A DISEÑO OPCIÓN A)
 * BLINDADO CON window.ModSalones
 */

window.ModSalones = {
    niveles: [], grados: [], secciones: [], salones: [],
    editandoGradoId: null, editandoSeccionId: null, editandoSalonId: null,
    vistaActualOculta: null,
    
    init: function() {
        this.dibujarDashboardTarjetas();
        this.cargarTodo();
    },

    // -----------------------------------------
    // LÓGICA UI OPCIÓN A: TARJETAS Y TRANSICIONES
    // -----------------------------------------
    dibujarDashboardTarjetas: function() {
        let html = '';
        // Usamos el permiso global del módulo en la Matriz
        let pVer = window.Aplicacion.permiso('Grados y Salones', 'ver');
        
        html += `
        <div class="col-md-4">
            <div class="tarjeta-btn p-4 text-center h-100 shadow-sm ${pVer ? '' : 'bloqueado'}" onclick="window.ModSalones.abrirVistaSegura('Grados')">
                <div class="bg-primary bg-opacity-10 d-inline-block p-3 rounded-circle mb-3"><i class="bi bi-layers-fill text-primary fs-1"></i></div>
                <h5 class="fw-bold text-dark">Grupos y Grados</h5>
                <p class="small text-muted mb-2">Crear años o niveles de estudio.</p>
                ${!pVer ? '<span class="badge bg-danger"><i class="bi bi-lock-fill me-1"></i> Sin Permiso</span>' : ''}
            </div>
        </div>
        
        <div class="col-md-4">
            <div class="tarjeta-btn p-4 text-center h-100 shadow-sm ${pVer ? '' : 'bloqueado'}" onclick="window.ModSalones.abrirVistaSegura('Secciones')">
                <div class="bg-info bg-opacity-10 d-inline-block p-3 rounded-circle mb-3"><i class="bi bi-alphabet text-info fs-1"></i></div>
                <h5 class="fw-bold text-dark">Secciones</h5>
                <p class="small text-muted mb-2">Definir identificadores (A, B, C...).</p>
                ${!pVer ? '<span class="badge bg-danger"><i class="bi bi-lock-fill me-1"></i> Sin Permiso</span>' : ''}
            </div>
        </div>

        <div class="col-md-4">
            <div class="tarjeta-btn p-4 text-center h-100 shadow-sm ${pVer ? '' : 'bloqueado'}" onclick="window.ModSalones.abrirVistaSegura('Salones')">
                <div class="bg-success bg-opacity-10 d-inline-block p-3 rounded-circle mb-3"><i class="bi bi-door-open-fill text-success fs-1"></i></div>
                <h5 class="fw-bold text-dark">Apertura de Salones</h5>
                <p class="small text-muted mb-2">Vincular grados y secciones.</p>
                ${!pVer ? '<span class="badge bg-danger"><i class="bi bi-lock-fill me-1"></i> Sin Permiso</span>' : ''}
            </div>
        </div>`;

        document.getElementById('salones-dashboard').innerHTML = html;

        // Ocultar formularios si no tiene permiso de crear
        let pCrear = window.Aplicacion.permiso('Grados y Salones', 'crear');
        if(!pCrear) {
            document.getElementById('form-grados-area').innerHTML = `<div class="text-center py-4"><i class="bi bi-lock fs-1 text-muted"></i><p class="mt-2 text-muted small">Sin permiso para crear</p></div>`;
            document.getElementById('form-secciones-area').innerHTML = `<div class="text-center py-4"><i class="bi bi-lock fs-1 text-muted"></i><p class="mt-2 text-muted small">Sin permiso para crear</p></div>`;
            document.getElementById('form-salones-area').innerHTML = `<div class="text-center py-4"><i class="bi bi-lock fs-1 text-muted"></i><p class="mt-2 text-muted small">Sin permiso para crear</p></div>`;
        }
    },

    abrirVistaSegura: function(vista) {
        if(!window.Aplicacion.permiso('Grados y Salones', 'ver')) return;
        
        let dash = document.getElementById('salones-dashboard');
        dash.classList.add('animate__fadeOutLeft');
        
        setTimeout(() => {
            dash.classList.add('d-none');
            dash.classList.remove('animate__fadeOutLeft');
            
            let panel = document.getElementById(`vista-${vista.toLowerCase()}`);
            panel.classList.remove('d-none');
            panel.classList.add('animate__fadeInRight');
            
            document.getElementById('btn-volver-dashboard').classList.remove('d-none');
            document.getElementById('btn-volver-dashboard').classList.add('animate__fadeIn');
            
            document.getElementById('titulo-salones-main').innerText = `Gestión de ${vista}`;
            this.vistaActualOculta = vista;
        }, 300);
    },

    volverDashboard: function() {
        if(!this.vistaActualOculta) return;
        
        let panel = document.getElementById(`vista-${this.vistaActualOculta.toLowerCase()}`);
        panel.classList.replace('animate__fadeInRight', 'animate__fadeOutRight');
        document.getElementById('btn-volver-dashboard').classList.add('d-none');
        
        setTimeout(() => {
            panel.classList.add('d-none');
            panel.classList.remove('animate__fadeOutRight');
            
            let dash = document.getElementById('salones-dashboard');
            dash.classList.remove('d-none');
            dash.classList.add('animate__fadeInLeft');
            
            document.getElementById('titulo-salones-main').innerText = "Grados y Salones";
            this.vistaActualOculta = null;
        }, 300);
    },

    // -----------------------------------------
    // LÓGICA BACKEND
    // -----------------------------------------
    cargarTodo: function(silencioso = false) {
        if(!silencioso && typeof window.Aplicacion !== 'undefined') window.Aplicacion.mostrarCarga();
        
        window.Aplicacion.peticion({ action: "get_salones_data" }, (res) => {
            if(!silencioso && typeof window.Aplicacion !== 'undefined') window.Aplicacion.ocultarCarga(); 
            if (res && res.status === "success") {
                this.niveles = res.niveles || []; this.grados = res.grados || [];
                this.secciones = res.secciones || []; this.salones = res.salones || [];
                
                this.dibujarListasConfig();
                this.dibujarListaSalones();
                this.llenarSelectores();
            }
        });
    },

    dibujarListasConfig: function() {
        let pEditar = window.Aplicacion.permiso('Grados y Salones', 'editar');
        let pEliminar = window.Aplicacion.permiso('Grados y Salones', 'eliminar');

        // Tabla Grados
        let htmlG = '';
        this.grados.forEach(g => {
            let btnE = pEditar ? `<button class="btn btn-sm btn-light border text-primary shadow-sm me-1" onclick="window.ModSalones.cargarParaEditarGrado('${g.id}')"><i class="bi bi-pencil-fill"></i></button>` : '';
            let btnL = pEliminar ? `<button class="btn btn-sm btn-light border text-danger shadow-sm" onclick="window.ModSalones.eliminarConfig('${g.id}')"><i class="bi bi-trash-fill"></i></button>` : '';
            htmlG += `<tr><td class="py-3 ps-3 fw-bold text-dark">${g.valor}</td><td class="py-3 text-end pe-3">${btnE}${btnL}</td></tr>`;
        });
        document.getElementById('tabla-grados').innerHTML = htmlG || `<tr><td colspan="2" class="text-center py-4 text-muted">No hay grados.</td></tr>`;

        // Tabla Secciones
        let htmlS = '';
        this.secciones.forEach(s => {
            let btnE = pEditar ? `<button class="btn btn-sm btn-light border text-primary shadow-sm me-1" onclick="window.ModSalones.cargarParaEditarSeccion('${s.id}')"><i class="bi bi-pencil-fill"></i></button>` : '';
            let btnL = pEliminar ? `<button class="btn btn-sm btn-light border text-danger shadow-sm" onclick="window.ModSalones.eliminarConfig('${s.id}')"><i class="bi bi-trash-fill"></i></button>` : '';
            htmlS += `<tr><td class="py-3 ps-3 fw-bold text-dark">Sección "${s.valor}"</td><td class="py-3 text-end pe-3">${btnE}${btnL}</td></tr>`;
        });
        document.getElementById('tabla-secciones').innerHTML = htmlS || `<tr><td colspan="2" class="text-center py-4 text-muted">No hay secciones.</td></tr>`;
    },

    llenarSelectores: function() {
        let optN = '<option value="">-- Seleccione Nivel --</option>'; this.niveles.forEach(n => optN += `<option value="${n.valor}">${n.valor}</option>`);
        let selN = document.getElementById('sel-nivel'); if(selN) selN.innerHTML = optN;

        let optG = '<option value="">-- Seleccione Grado/Año --</option>'; this.grados.forEach(g => optG += `<option value="${g.valor}">${g.valor}</option>`);
        let selG = document.getElementById('sel-grado'); if(selG) selG.innerHTML = optG;

        let optS = '<option value="">-- Seleccione Sección --</option>'; this.secciones.forEach(s => optS += `<option value="${s.valor}">${s.valor}</option>`);
        let selS = document.getElementById('sel-seccion'); if(selS) selS.innerHTML = optS;

        this.previsualizarNombre();
    },

    previsualizarNombre: function() {
        let nivel = document.getElementById('sel-nivel'); let grado = document.getElementById('sel-grado'); let seccion = document.getElementById('sel-seccion');
        if(!nivel || !grado || !seccion) return;
        
        if (nivel.value && grado.value && seccion.value) {
            document.getElementById('lbl-preview-salon').innerHTML = `<span class="text-muted d-block" style="font-size:0.85rem">${nivel.value}</span>${grado.value} - Sección "${seccion.value}"`;
        } else {
            document.getElementById('lbl-preview-salon').innerHTML = "Seleccione las opciones...";
        }
    },

    dibujarListaSalones: function() {
        let html = '';
        let pEditar = window.Aplicacion.permiso('Grados y Salones', 'editar');
        let pEliminar = window.Aplicacion.permiso('Grados y Salones', 'eliminar');

        this.salones.forEach(s => {
            let btnE = pEditar ? `<button class="btn btn-sm btn-light border text-primary shadow-sm me-1" onclick="window.ModSalones.cargarParaEditarSalon('${s.id_salon}')" title="Editar"><i class="bi bi-pencil-fill"></i></button>` : '';
            let btnL = pEliminar ? `<button class="btn btn-sm btn-light border text-danger shadow-sm" onclick="window.ModSalones.eliminarSalon('${s.id_salon}')" title="Clausurar"><i class="bi bi-x-square-fill"></i></button>` : '';

            html += `
            <tr class="text-center">
                <td class="py-3 text-start ps-3 fw-bold text-dark" style="font-size:14px;">${s.nombre_salon}</td>
                <td class="py-3"><span class="badge bg-light text-secondary border shadow-sm">${s.nivel_educativo}</span></td>
                <td class="py-3 fw-bold text-primary">${s.grado_anio}</td>
                <td class="py-3 fw-bold text-info">"${s.seccion}"</td>
                <td class="py-3 text-end pe-3">${btnE}${btnL}</td>
            </tr>`;
        });
        document.getElementById('tabla-salones').innerHTML = html || `<tr><td colspan="5" class="text-center py-5 text-muted">Aún no se ha aperturado ningún salón.</td></tr>`;
    },

    // --- EDICIÓN Y GUARDADO ---
    cargarParaEditarGrado: function(id) { let g = this.grados.find(x => x.id === id); if(g) { this.editandoGradoId = id; document.getElementById('txt-grado').value = g.valor; document.getElementById('titulo-form-grado').innerHTML = '<i class="bi bi-pencil-fill text-warning me-2"></i>Editar Grado'; document.getElementById('btn-guardar-grado').innerHTML = '<i class="bi bi-save-fill me-2"></i>Actualizar'; document.getElementById('btn-guardar-grado').classList.replace('btn-primario', 'btn-warning'); document.getElementById('btn-cancelar-grado').classList.remove('d-none'); document.getElementById('vista-grados').scrollIntoView({ behavior: 'smooth' }); } },
    cancelarEdicionGrado: function() { this.editandoGradoId = null; document.getElementById('txt-grado').value = ''; document.getElementById('titulo-form-grado').innerHTML = '<i class="bi bi-plus-circle-fill text-primary me-2"></i>Añadir Grado'; document.getElementById('btn-guardar-grado').innerHTML = '<i class="bi bi-save-fill me-2"></i>Registrar'; document.getElementById('btn-guardar-grado').classList.replace('btn-warning', 'btn-primario'); document.getElementById('btn-cancelar-grado').classList.add('d-none'); },

    cargarParaEditarSeccion: function(id) { let s = this.secciones.find(x => x.id === id); if(s) { this.editandoSeccionId = id; document.getElementById('txt-seccion').value = s.valor; document.getElementById('titulo-form-seccion').innerHTML = '<i class="bi bi-pencil-fill text-warning me-2"></i>Editar Sección'; document.getElementById('btn-guardar-seccion').innerHTML = '<i class="bi bi-save-fill me-2"></i>Actualizar'; document.getElementById('btn-guardar-seccion').classList.replace('btn-primario', 'btn-warning'); document.getElementById('btn-cancelar-seccion').classList.remove('d-none'); document.getElementById('vista-secciones').scrollIntoView({ behavior: 'smooth' }); } },
    cancelarEdicionSeccion: function() { this.editandoSeccionId = null; document.getElementById('txt-seccion').value = ''; document.getElementById('titulo-form-seccion').innerHTML = '<i class="bi bi-plus-circle-fill text-primary me-2"></i>Añadir Sección'; document.getElementById('btn-guardar-seccion').innerHTML = '<i class="bi bi-save-fill me-2"></i>Registrar'; document.getElementById('btn-guardar-seccion').classList.replace('btn-warning', 'btn-primario'); document.getElementById('btn-cancelar-seccion').classList.add('d-none'); },

    cargarParaEditarSalon: function(id) { let s = this.salones.find(x => x.id_salon === id); if(s) { this.editandoSalonId = id; document.getElementById('sel-nivel').value = s.nivel_educativo; document.getElementById('sel-grado').value = s.grado_anio; document.getElementById('sel-seccion').value = s.seccion; this.previsualizarNombre(); document.getElementById('titulo-form-salon').innerHTML = '<i class="bi bi-pencil-fill text-warning me-2"></i>Editar Salón'; document.getElementById('btn-guardar-salon').innerHTML = '<i class="bi bi-save-fill me-2"></i>Actualizar'; document.getElementById('btn-guardar-salon').classList.replace('btn-exito', 'btn-warning'); document.getElementById('btn-cancelar-salon').classList.remove('d-none'); document.getElementById('vista-salones').scrollIntoView({ behavior: 'smooth' }); } },
    cancelarEdicionSalon: function() { this.editandoSalonId = null; document.getElementById('sel-nivel').selectedIndex = 0; document.getElementById('sel-grado').selectedIndex = 0; document.getElementById('sel-seccion').selectedIndex = 0; this.previsualizarNombre(); document.getElementById('titulo-form-salon').innerHTML = '<i class="bi bi-door-open text-success me-2"></i>Aperturar Nuevo Salón'; document.getElementById('btn-guardar-salon').innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>Aperturar'; document.getElementById('btn-guardar-salon').classList.replace('btn-warning', 'btn-exito'); document.getElementById('btn-cancelar-salon').classList.add('d-none'); },

    guardarConfiguracion: function(categoria, idInput) {
        let valor = document.getElementById(idInput).value.trim();
        if (!valor) return Swal.fire('Atención', 'El campo no puede estar vacío.', 'warning');
        let payload = { action: 'save_config', categoria: categoria, valor: valor };
        if (categoria === 'Grado_Anio' && this.editandoGradoId) payload.id = this.editandoGradoId;
        if (categoria === 'Seccion' && this.editandoSeccionId) payload.id = this.editandoSeccionId;

        window.Aplicacion.mostrarCarga();
        window.Aplicacion.peticion(payload, (res) => {
            window.Aplicacion.ocultarCarga();
            if (res && res.status === 'success') {
                if (categoria === 'Grado_Anio') this.cancelarEdicionGrado();
                if (categoria === 'Seccion') this.cancelarEdicionSeccion();
                Swal.fire({toast: true, position: 'top-end', icon: 'success', title: res.message || 'Guardado.', showConfirmButton: false, timer: 3000});
                this.cargarTodo(true);
            } else { Swal.fire('Error', res ? res.message : 'Error al guardar.', 'error'); }
        });
    },

    eliminarConfig: function(idConfig) {
        Swal.fire({ title: '¿Eliminar registro?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33' }).then((result) => {
            if (result.isConfirmed) {
                window.Aplicacion.peticion({ action: 'delete_config', id: idConfig }, (res) => {
                    if (res && res.status === 'success') {
                        if(this.editandoGradoId === idConfig) this.cancelarEdicionGrado();
                        if(this.editandoSeccionId === idConfig) this.cancelarEdicionSeccion();
                        this.cargarTodo(true);
                    }
                });
            }
        });
    },

    guardarSalon: function() {
        let nivel = document.getElementById('sel-nivel').value; let grado = document.getElementById('sel-grado').value; let seccion = document.getElementById('sel-seccion').value;
        if (!nivel || !grado || !seccion) return Swal.fire('Incompleto', 'Seleccione Nivel, Grado y Sección.', 'warning');
        let payload = { action: 'save_salon', nivel_educativo: nivel, grado_anio: grado, seccion: seccion, nombre_salon: `${nivel} / ${grado} - Sección "${seccion}"` };
        if (this.editandoSalonId) payload.id_salon = this.editandoSalonId;

        window.Aplicacion.mostrarCarga();
        window.Aplicacion.peticion(payload, (res) => {
            window.Aplicacion.ocultarCarga();
            if (res && res.status === 'success') {
                this.cancelarEdicionSalon();
                Swal.fire({toast: true, position: 'top-end', icon: 'success', title: res.message, showConfirmButton: false, timer: 3000});
                this.cargarTodo(true);
            } else { Swal.fire('Atención', res ? res.message : 'Error.', 'warning'); }
        });
    },

    eliminarSalon: function(idSalon) {
        Swal.fire({ title: '¿Clausurar salón?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33' }).then((result) => {
            if (result.isConfirmed) {
                window.Aplicacion.peticion({ action: 'delete_salon', id_salon: idSalon }, (res) => {
                    if (res && res.status === 'success') {
                        if(this.editandoSalonId === idSalon) this.cancelarEdicionSalon();
                        this.cargarTodo(true);
                    }
                });
            }
        });
    }
};

window.init_Grados_y_Salones = function() { window.ModSalones.init(); };