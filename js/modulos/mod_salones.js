/**
 * MÓDULO: GESTIÓN DE GRADOS Y SALONES (CON EDICIÓN Y ALERTAS REPARADAS)
 * BLINDADO CON window.ModSalones
 */

window.ModSalones = {
    niveles: [],
    grados: [],
    secciones: [],
    salones: [],
    
    // Variables para controlar qué estamos editando
    editandoGradoId: null,
    editandoSeccionId: null,
    editandoSalonId: null,
    
    init: function() {
        this.cargarTodo();
    },

    cambiarTab: function(vista) {
        ['Grados', 'Secciones', 'Salones'].forEach(tab => {
            let btn = document.getElementById(`tab-${tab.toLowerCase()}`);
            let panel = document.getElementById(`vista-${tab.toLowerCase()}`);
            
            if (vista === tab) {
                btn.classList.add('active', 'bg-primary', 'text-white');
                btn.classList.remove('text-secondary');
                panel.classList.remove('d-none');
            } else {
                btn.classList.remove('active', 'bg-primary', 'text-white');
                btn.classList.add('text-secondary');
                panel.classList.add('d-none');
            }
        });
    },

    // REPARACIÓN: Agregamos el parámetro "silencioso" para recargar la tabla 
    // sin mostrar la pantalla blanca que tapaba la alerta verde.
    cargarTodo: function(silencioso = false) {
        if(!silencioso && typeof window.Aplicacion !== 'undefined') window.Aplicacion.mostrarCarga();
        
        window.Aplicacion.peticion({ action: "get_salones_data" }, (res) => {
            if(!silencioso && typeof window.Aplicacion !== 'undefined') window.Aplicacion.ocultarCarga(); 
            
            if (res && res.status === "success") {
                this.niveles = res.niveles || [];
                this.grados = res.grados || [];
                this.secciones = res.secciones || [];
                this.salones = res.salones || [];
                
                this.dibujarListasConfig();
                this.dibujarListaSalones();
                this.llenarSelectores();
            }
        });
    },

    // -----------------------------------------
    // DIBUJO DE TABLAS Y SELECTORES
    // -----------------------------------------
    dibujarListasConfig: function() {
        // Tabla Grados
        let htmlG = '';
        this.grados.forEach(g => {
            htmlG += `
            <tr class="animate__animated animate__fadeIn">
                <td class="py-3 ps-3 fw-bold text-dark">${g.valor}</td>
                <td class="py-3 text-end pe-3">
                    <button class="btn btn-sm btn-light border text-primary shadow-sm me-1" onclick="window.ModSalones.cargarParaEditarGrado('${g.id}')" title="Editar">
                        <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="btn btn-sm btn-light border text-danger shadow-sm" onclick="window.ModSalones.eliminarConfig('${g.id}')" title="Eliminar">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </td>
            </tr>`;
        });
        document.getElementById('tabla-grados').innerHTML = htmlG || `<tr><td colspan="2" class="text-center py-4 text-muted">No hay grados registrados.</td></tr>`;

        // Tabla Secciones
        let htmlS = '';
        this.secciones.forEach(s => {
            htmlS += `
            <tr class="animate__animated animate__fadeIn">
                <td class="py-3 ps-3 fw-bold text-dark">Sección "${s.valor}"</td>
                <td class="py-3 text-end pe-3">
                    <button class="btn btn-sm btn-light border text-primary shadow-sm me-1" onclick="window.ModSalones.cargarParaEditarSeccion('${s.id}')" title="Editar">
                        <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="btn btn-sm btn-light border text-danger shadow-sm" onclick="window.ModSalones.eliminarConfig('${s.id}')" title="Eliminar">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </td>
            </tr>`;
        });
        document.getElementById('tabla-secciones').innerHTML = htmlS || `<tr><td colspan="2" class="text-center py-4 text-muted">No hay secciones registradas.</td></tr>`;
    },

    llenarSelectores: function() {
        let optN = '<option value="">-- Seleccione Nivel --</option>';
        this.niveles.forEach(n => optN += `<option value="${n.valor}">${n.valor}</option>`);
        document.getElementById('sel-nivel').innerHTML = optN;

        let optG = '<option value="">-- Seleccione Grado/Año --</option>';
        this.grados.forEach(g => optG += `<option value="${g.valor}">${g.valor}</option>`);
        document.getElementById('sel-grado').innerHTML = optG;

        let optS = '<option value="">-- Seleccione Sección --</option>';
        this.secciones.forEach(s => optS += `<option value="${s.valor}">${s.valor}</option>`);
        document.getElementById('sel-seccion').innerHTML = optS;

        this.previsualizarNombre();
    },

    previsualizarNombre: function() {
        let nivel = document.getElementById('sel-nivel').value;
        let grado = document.getElementById('sel-grado').value;
        let seccion = document.getElementById('sel-seccion').value;

        if (nivel && grado && seccion) {
            document.getElementById('lbl-preview-salon').innerHTML = `<span class="text-muted d-block" style="font-size:0.85rem">${nivel}</span>${grado} - Sección "${seccion}"`;
        } else {
            document.getElementById('lbl-preview-salon').innerHTML = "Seleccione las opciones...";
        }
    },

    dibujarListaSalones: function() {
        let html = '';
        this.salones.forEach(s => {
            html += `
            <tr class="animate__animated animate__fadeIn text-center">
                <td class="py-3 text-start ps-3 fw-bold text-dark" style="font-size:14px;">${s.nombre_salon}</td>
                <td class="py-3"><span class="badge bg-light text-secondary border shadow-sm">${s.nivel_educativo}</span></td>
                <td class="py-3 fw-bold text-primary">${s.grado_anio}</td>
                <td class="py-3 fw-bold text-info">"${s.seccion}"</td>
                <td class="py-3 text-end pe-3">
                    <button class="btn btn-sm btn-light border text-primary shadow-sm me-1" onclick="window.ModSalones.cargarParaEditarSalon('${s.id_salon}')" title="Editar Salón">
                        <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="btn btn-sm btn-light border text-danger shadow-sm" onclick="window.ModSalones.eliminarSalon('${s.id_salon}')" title="Clausurar Salón">
                        <i class="bi bi-x-square-fill"></i>
                    </button>
                </td>
            </tr>`;
        });
        document.getElementById('tabla-salones').innerHTML = html || `<tr><td colspan="5" class="text-center py-5 text-muted">Aún no se ha aperturado ningún salón.</td></tr>`;
    },

    // -----------------------------------------
    // LÓGICA DE EDICIÓN: GRADOS
    // -----------------------------------------
    cargarParaEditarGrado: function(idGrado) {
        let grado = this.grados.find(g => g.id === idGrado);
        if(!grado) return;

        this.editandoGradoId = idGrado;
        document.getElementById('txt-grado').value = grado.valor;
        
        document.getElementById('titulo-form-grado').innerHTML = '<i class="bi bi-pencil-fill text-warning me-2"></i>Editar Grado';
        document.getElementById('btn-guardar-grado').innerHTML = '<i class="bi bi-save-fill me-2"></i>Actualizar Grado';
        document.getElementById('btn-guardar-grado').classList.replace('btn-primario', 'btn-warning');
        document.getElementById('btn-cancelar-grado').classList.remove('d-none');
        document.getElementById('vista-grados').scrollIntoView({ behavior: 'smooth' });
    },

    cancelarEdicionGrado: function() {
        this.editandoGradoId = null;
        document.getElementById('txt-grado').value = '';
        
        document.getElementById('titulo-form-grado').innerHTML = '<i class="bi bi-plus-circle-fill text-primary me-2"></i>Añadir Grado / Año';
        document.getElementById('btn-guardar-grado').innerHTML = '<i class="bi bi-save-fill me-2"></i>Registrar Grado';
        document.getElementById('btn-guardar-grado').classList.replace('btn-warning', 'btn-primario');
        document.getElementById('btn-cancelar-grado').classList.add('d-none');
    },

    // -----------------------------------------
    // LÓGICA DE EDICIÓN: SECCIONES
    // -----------------------------------------
    cargarParaEditarSeccion: function(idSeccion) {
        let seccion = this.secciones.find(s => s.id === idSeccion);
        if(!seccion) return;

        this.editandoSeccionId = idSeccion;
        document.getElementById('txt-seccion').value = seccion.valor;
        
        document.getElementById('titulo-form-seccion').innerHTML = '<i class="bi bi-pencil-fill text-warning me-2"></i>Editar Sección';
        document.getElementById('btn-guardar-seccion').innerHTML = '<i class="bi bi-save-fill me-2"></i>Actualizar Sección';
        document.getElementById('btn-guardar-seccion').classList.replace('btn-primario', 'btn-warning');
        document.getElementById('btn-cancelar-seccion').classList.remove('d-none');
        document.getElementById('vista-secciones').scrollIntoView({ behavior: 'smooth' });
    },

    cancelarEdicionSeccion: function() {
        this.editandoSeccionId = null;
        document.getElementById('txt-seccion').value = '';
        
        document.getElementById('titulo-form-seccion').innerHTML = '<i class="bi bi-plus-circle-fill text-primary me-2"></i>Añadir Sección';
        document.getElementById('btn-guardar-seccion').innerHTML = '<i class="bi bi-save-fill me-2"></i>Registrar Sección';
        document.getElementById('btn-guardar-seccion').classList.replace('btn-warning', 'btn-primario');
        document.getElementById('btn-cancelar-seccion').classList.add('d-none');
    },

    // -----------------------------------------
    // LÓGICA DE EDICIÓN: SALONES
    // -----------------------------------------
    cargarParaEditarSalon: function(idSalon) {
        let salon = this.salones.find(s => s.id_salon === idSalon);
        if(!salon) return;

        this.editandoSalonId = idSalon;
        
        document.getElementById('sel-nivel').value = salon.nivel_educativo;
        document.getElementById('sel-grado').value = salon.grado_anio;
        document.getElementById('sel-seccion').value = salon.seccion;
        this.previsualizarNombre();

        document.getElementById('titulo-form-salon').innerHTML = '<i class="bi bi-pencil-fill text-warning me-2"></i>Editar Salón';
        document.getElementById('btn-guardar-salon').innerHTML = '<i class="bi bi-save-fill me-2"></i>Actualizar Salón';
        document.getElementById('btn-guardar-salon').classList.replace('btn-exito', 'btn-warning');
        document.getElementById('btn-cancelar-salon').classList.remove('d-none');
        document.getElementById('vista-salones').scrollIntoView({ behavior: 'smooth' });
    },

    cancelarEdicionSalon: function() {
        this.editandoSalonId = null;
        
        document.getElementById('sel-nivel').selectedIndex = 0;
        document.getElementById('sel-grado').selectedIndex = 0;
        document.getElementById('sel-seccion').selectedIndex = 0;
        this.previsualizarNombre();

        document.getElementById('titulo-form-salon').innerHTML = '<i class="bi bi-door-open text-success me-2"></i>Aperturar Nuevo Salón';
        document.getElementById('btn-guardar-salon').innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>Aperturar Salón';
        document.getElementById('btn-guardar-salon').classList.replace('btn-warning', 'btn-exito');
        document.getElementById('btn-cancelar-salon').classList.add('d-none');
    },

    // -----------------------------------------
    // FUNCIONES DE GUARDADO AL SERVIDOR (REPARADAS)
    // -----------------------------------------
    guardarConfiguracion: function(categoria, idInput) {
        let valor = document.getElementById(idInput).value.trim();
        if (!valor) return Swal.fire('Atención', 'El campo no puede estar vacío.', 'warning');

        let payload = { action: 'save_config', categoria: categoria, valor: valor };
        
        if (categoria === 'Grado_Anio' && this.editandoGradoId) payload.id = this.editandoGradoId;
        if (categoria === 'Seccion' && this.editandoSeccionId) payload.id = this.editandoSeccionId;

        window.Aplicacion.mostrarCarga();
        window.Aplicacion.peticion(payload, (res) => {
            // OCULTAR CARGA ANTES DE MOSTRAR LA ALERTA PARA QUE SE PUEDA VER
            window.Aplicacion.ocultarCarga();

            if (res && res.status === 'success') {
                if (categoria === 'Grado_Anio') this.cancelarEdicionGrado();
                if (categoria === 'Seccion') this.cancelarEdicionSeccion();
                
                // Mostrar alerta de éxito
                Swal.fire({toast: true, position: 'top-end', icon: 'success', title: res.message || 'Registro guardado.', showConfirmButton: false, timer: 3000});
                
                // Recargar los datos silenciosamente (sin tapar la pantalla)
                this.cargarTodo(true);
            } else {
                Swal.fire('Error', res ? res.message : 'Error al guardar.', 'error');
            }
        });
    },

    eliminarConfig: function(idConfig) {
        Swal.fire({ title: '¿Eliminar registro?', text: 'Esto afectará a los salones que lo estén usando.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, eliminar', confirmButtonColor: '#d33' }).then((result) => {
            if (result.isConfirmed) {
                window.Aplicacion.mostrarCarga();
                window.Aplicacion.peticion({ action: 'delete_config', id: idConfig }, (res) => {
                    // OCULTAR CARGA ANTES DE LA ALERTA
                    window.Aplicacion.ocultarCarga();

                    if (res && res.status === 'success') {
                        if(this.editandoGradoId === idConfig) this.cancelarEdicionGrado();
                        if(this.editandoSeccionId === idConfig) this.cancelarEdicionSeccion();
                        
                        Swal.fire({toast: true, position: 'top-end', icon: 'success', title: 'Registro eliminado.', showConfirmButton: false, timer: 3000});
                        this.cargarTodo(true);
                    } else { 
                        Swal.fire('Error', 'No se pudo eliminar.', 'error'); 
                    }
                });
            }
        });
    },

    guardarSalon: function() {
        let nivel = document.getElementById('sel-nivel').value;
        let grado = document.getElementById('sel-grado').value;
        let seccion = document.getElementById('sel-seccion').value;

        if (!nivel || !grado || !seccion) return Swal.fire('Incompleto', 'Debe seleccionar Nivel, Grado y Sección para crear/editar un salón.', 'warning');

        let nombreOficial = `${nivel} / ${grado} - Sección "${seccion}"`;

        let payload = { 
            action: 'save_salon', 
            nivel_educativo: nivel, 
            grado_anio: grado, 
            seccion: seccion, 
            nombre_salon: nombreOficial 
        };

        if (this.editandoSalonId) payload.id_salon = this.editandoSalonId;

        window.Aplicacion.mostrarCarga();
        window.Aplicacion.peticion(payload, (res) => {
            // OCULTAR CARGA ANTES DE LA ALERTA
            window.Aplicacion.ocultarCarga();

            if (res && res.status === 'success') {
                this.cancelarEdicionSalon();
                Swal.fire({toast: true, position: 'top-end', icon: 'success', title: res.message, showConfirmButton: false, timer: 3000});
                
                // Recargar tabla silenciosamente
                this.cargarTodo(true);
            } else {
                Swal.fire('Atención', res ? res.message : 'Error al guardar salón.', 'warning');
            }
        });
    },

    eliminarSalon: function(idSalon) {
        Swal.fire({ title: '¿Clausurar este salón?', text: "Se eliminará de los registros de inscripción.", icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, clausurar', confirmButtonColor: '#d33' }).then((result) => {
            if (result.isConfirmed) {
                window.Aplicacion.mostrarCarga();
                window.Aplicacion.peticion({ action: 'delete_salon', id_salon: idSalon }, (res) => {
                    // OCULTAR CARGA ANTES DE LA ALERTA
                    window.Aplicacion.ocultarCarga();

                    if (res && res.status === 'success') {
                        if(this.editandoSalonId === idSalon) this.cancelarEdicionSalon();
                        
                        Swal.fire({toast: true, position: 'top-end', icon: 'success', title: res.message || 'Salón clausurado.', showConfirmButton: false, timer: 3000});
                        this.cargarTodo(true);
                    } else { 
                        Swal.fire('Error', 'No se pudo clausurar el salón.', 'error'); 
                    }
                });
            }
        });
    }
};

// ==========================================
// LLAVE DE ENRUTADOR
// ==========================================
window.init_Grados_y_Salones = function() { window.ModSalones.init(); };