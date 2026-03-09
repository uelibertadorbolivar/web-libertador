/**
 * MÓDULO: CONFIGURACIÓN GLOBAL (Periodos, Lapsos, Niveles)
 */

const ModConfiguracion = {
    datosActuales: { 
        periodos: [], 
        lapsos: [], 
        niveles: [] 
    },

    cargarDatos: function() {
        this.inyectarAlertaInteligente();
        
        Aplicacion.mostrarCarga();
        
        Aplicacion.peticion({ action: "get_config" }, (res) => {
            Aplicacion.ocultarCarga();
            
            if (res.status === "success") {
                this.datosActuales.periodos = res.periodos || [];
                this.datosActuales.lapsos = res.lapsos || [];
                this.datosActuales.niveles = res.niveles || [];

                // ==========================================
                // SOLUCIÓN: ORDENAMIENTO CRONOLÓGICO INFALIBLE
                // ==========================================
                const ordenarPorFecha = (a, b) => {
                    // Si un registro no tiene fecha, lo enviamos al final
                    if (!a.inicio && !b.inicio) return 0;
                    if (!a.inicio) return 1; 
                    if (!b.inicio) return -1;
                    
                    // Como el servidor devuelve "yyyy-MM-dd", una comparación de texto alfabética
                    // es la forma más segura y exacta de ordenar fechas sin errores de zona horaria.
                    return a.inicio.localeCompare(b.inicio);
                };

                // Ordenamos las listas antes de dibujarlas
                this.datosActuales.periodos.sort(ordenarPorFecha);
                this.datosActuales.lapsos.sort(ordenarPorFecha);
                // ==========================================

                this.dibujarTablas();
            } else { 
                Swal.fire('Error', 'No se pudieron cargar los parámetros del sistema.', 'error'); 
            }
        });
    },

    inyectarAlertaInteligente: function() {
        const contenedor = document.getElementById('area-dinamica');
        const infoTiempo = Aplicacion.momentoActual;
        
        if(infoTiempo && !document.getElementById('alerta-ai-config')) {
            const htmlAlerta = `
            <div id="alerta-ai-config" class="alert shadow-sm border-0 d-flex align-items-center mb-4 animate__animated animate__fadeIn" style="background-color: #e3f2fd; color: #084298;">
                <i class="bi bi-robot fs-2 me-3 text-primary"></i>
                <div>
                    <h6 class="fw-bold mb-1">Detección Automática por Fechas Activada</h6>
                    <p class="mb-0 small">El sistema lee matemáticamente las fechas que registras aquí. Basado en el día de hoy, estamos en el <b>Año Escolar ${infoTiempo.anioEscolar}</b> y cursando la fase: <b>${infoTiempo.lapso}</b>.</p>
                </div>
            </div>`;
            contenedor.insertAdjacentHTML('afterbegin', htmlAlerta);
        }
    },

    dibujarTablas: function() {
        // --- 1. AÑOS ESCOLARES ---
        const tablaPeriodos = document.getElementById('tabla-periodos');
        
        if(tablaPeriodos) {
            if (this.datosActuales.periodos.length === 0) {
                tablaPeriodos.innerHTML = `<tr><td colspan="3" class="text-center text-muted">Aún no hay años escolares registrados.</td></tr>`;
            } else {
                let htmlPeriodos = '';
                
                this.datosActuales.periodos.forEach(p => {
                    let colorBadge = 'bg-secondary';
                    
                    if (p.estado === 'Activo') {
                        colorBadge = 'bg-success';
                    } else if (p.estado === 'Próximo') {
                        colorBadge = 'bg-info text-dark';
                    } else if (p.estado === 'Finalizado') {
                        colorBadge = 'bg-secondary';
                    }
                    
                    let fInicioFormato = p.inicio ? p.inicio.split('-').reverse().join('/') : 'Sin definir';
                    let fFinFormato = p.fin ? p.fin.split('-').reverse().join('/') : 'Sin definir';
                    
                    let visualizacionFechas = '';
                    if (p.inicio && p.fin) {
                        visualizacionFechas = `<div class="small text-muted mt-1"><i class="bi bi-calendar-event me-1"></i>${fInicioFormato} al ${fFinFormato}</div>`;
                    }
                    
                    htmlPeriodos += `
                    <tr>
                        <td>
                            <div class="fw-bold text-dark">${p.valor}</div>
                            ${visualizacionFechas}
                        </td>
                        <td class="text-center">
                            <span class="badge ${colorBadge} px-3 py-2 rounded-pill">${p.estado}</span>
                        </td>
                        <td class="text-end" style="min-width: 90px;">
                            <button class="btn btn-sm btn-light border text-primary shadow-sm me-1" onclick="ModConfiguracion.editarParametro('${p.id}', '${p.categoria}', '${p.valor}', '${p.inicio}', '${p.fin}')">
                                <i class="bi bi-pencil-fill"></i>
                            </button>
                            <button class="btn btn-sm btn-light border text-danger shadow-sm" onclick="ModConfiguracion.eliminarParametro('${p.id}')">
                                <i class="bi bi-trash-fill"></i>
                            </button>
                        </td>
                    </tr>`;
                });
                
                tablaPeriodos.innerHTML = htmlPeriodos;
            }
        }

        // --- 2. LAPSOS (FASES) ---
        const tablaLapsos = document.getElementById('tabla-lapsos');
        
        if(tablaLapsos) {
            if (this.datosActuales.lapsos.length === 0) {
                tablaLapsos.innerHTML = `<tr><td colspan="3" class="text-center text-muted">Aún no hay fases o lapsos registrados.</td></tr>`;
            } else {
                let htmlLapsos = '';
                
                this.datosActuales.lapsos.forEach(p => {
                    let colorBadge = 'bg-secondary';
                    
                    if (p.estado === 'Activo') {
                        colorBadge = 'bg-success';
                    } else if (p.estado === 'Próximo') {
                        colorBadge = 'bg-info text-dark';
                    } else if (p.estado === 'Finalizado') {
                        colorBadge = 'bg-secondary';
                    }
                    
                    let fInicioFormato = p.inicio ? p.inicio.split('-').reverse().join('/') : 'Sin definir';
                    let fFinFormato = p.fin ? p.fin.split('-').reverse().join('/') : 'Sin definir';
                    
                    let visualizacionFechas = '';
                    if (p.inicio && p.fin) {
                        visualizacionFechas = `<div class="small text-muted mt-1"><i class="bi bi-calendar-event me-1"></i>${fInicioFormato} al ${fFinFormato}</div>`;
                    }
                    
                    htmlLapsos += `
                    <tr>
                        <td>
                            <div class="fw-bold text-dark">${p.valor}</div>
                            ${visualizacionFechas}
                        </td>
                        <td class="text-center">
                            <span class="badge ${colorBadge} px-3 py-2 rounded-pill">${p.estado}</span>
                        </td>
                        <td class="text-end" style="min-width: 90px;">
                            <button class="btn btn-sm btn-light border text-primary shadow-sm me-1" onclick="ModConfiguracion.editarParametro('${p.id}', '${p.categoria}', '${p.valor}', '${p.inicio}', '${p.fin}')">
                                <i class="bi bi-pencil-fill"></i>
                            </button>
                            <button class="btn btn-sm btn-light border text-danger shadow-sm" onclick="ModConfiguracion.eliminarParametro('${p.id}')">
                                <i class="bi bi-trash-fill"></i>
                            </button>
                        </td>
                    </tr>`;
                });
                
                tablaLapsos.innerHTML = htmlLapsos;
            }
        }

        // --- 3. NIVELES EDUCATIVOS ---
        const tablaNiveles = document.getElementById('tabla-niveles');
        
        if(tablaNiveles) {
            if (this.datosActuales.niveles.length === 0) {
                tablaNiveles.innerHTML = `<tr><td colspan="2" class="text-center text-muted">Aún no hay niveles registrados.</td></tr>`;
            } else {
                let htmlNiveles = '';
                
                this.datosActuales.niveles.forEach(p => {
                    htmlNiveles += `
                    <tr>
                        <td class="fw-bold text-dark">
                            <i class="bi bi-mortarboard-fill text-success me-2"></i> ${p.valor}
                        </td>
                        <td class="text-end" style="min-width: 90px;">
                            <button class="btn btn-sm btn-light border text-primary shadow-sm me-1" onclick="ModConfiguracion.editarParametro('${p.id}', '${p.categoria}', '${p.valor}', '', '')">
                                <i class="bi bi-pencil-fill"></i>
                            </button>
                            <button class="btn btn-sm btn-light border text-danger shadow-sm" onclick="ModConfiguracion.eliminarParametro('${p.id}')">
                                <i class="bi bi-trash-fill"></i>
                            </button>
                        </td>
                    </tr>`;
                });
                
                tablaNiveles.innerHTML = htmlNiveles;
            }
        }
    },

    nuevoParametro: function(categoria, titulo, placeholder) {
        let htmlFormulario = `<input id="swal-input1" class="swal2-input" placeholder="${placeholder}">`;
        
        if (categoria !== 'Nivel_Educativo') {
            htmlFormulario += `
            <div class="text-start mt-3 px-2">
                <label class="small fw-bold text-muted mb-1"><i class="bi bi-calendar-plus me-1"></i> Fecha de Inicio</label>
                <input id="swal-input2" type="date" class="form-control input-moderno mb-3">
                
                <label class="small fw-bold text-muted mb-1"><i class="bi bi-calendar-x me-1"></i> Fecha de Culminación</label>
                <input id="swal-input3" type="date" class="form-control input-moderno">
            </div>`;
        }

        Swal.fire({
            title: titulo, 
            html: htmlFormulario, 
            showCancelButton: true, 
            confirmButtonText: 'Guardar Parámetro', 
            confirmButtonColor: '#0066FF',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const valorNombre = document.getElementById('swal-input1').value;
                const valorInicio = document.getElementById('swal-input2') ? document.getElementById('swal-input2').value : null;
                const valorFin = document.getElementById('swal-input3') ? document.getElementById('swal-input3').value : null;
                
                if (!valorNombre) { 
                    Swal.showValidationMessage('El nombre es obligatorio'); 
                    return false; 
                }
                
                if (categoria !== 'Nivel_Educativo' && (!valorInicio || !valorFin)) { 
                    Swal.showValidationMessage('Las fechas de inicio y culminación son obligatorias'); 
                    return false; 
                }
                
                if (valorInicio && valorFin && new Date(valorInicio) > new Date(valorFin)) { 
                    Swal.showValidationMessage('La fecha de inicio no puede ser mayor a la de culminación'); 
                    return false; 
                }
                
                return { valor: valorNombre, inicio: valorInicio, fin: valorFin };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const adminCedula = JSON.parse(localStorage.getItem('sigae_usuario')).cedula;
                
                Aplicacion.mostrarCarga();
                
                Aplicacion.peticion({ 
                    action: "save_config", 
                    categoria: categoria, 
                    valor: result.value.valor, 
                    inicio: result.value.inicio, 
                    fin: result.value.fin, 
                    cedula_admin: adminCedula 
                }, (res) => {
                    Aplicacion.ocultarCarga();
                    
                    if(res.status === "success") { 
                        Swal.fire('¡Guardado!', res.message, 'success'); 
                        this.cargarDatos(); 
                        Aplicacion.prepararApp(); // Recarga la barra superior
                    } else {
                        Swal.fire('Error', res.message, 'error');
                    }
                });
            }
        });
    },

    editarParametro: function(idParametro, categoria, valorActual, inicioActual, finActual) {
        let htmlFormulario = `<input id="swal-input1" class="swal2-input" value="${valorActual}">`;
        
        if (categoria !== 'Nivel_Educativo') {
            htmlFormulario += `
            <div class="text-start mt-3 px-2">
                <label class="small fw-bold text-muted mb-1"><i class="bi bi-calendar-plus me-1"></i> Fecha de Inicio</label>
                <input id="swal-input2" type="date" class="form-control input-moderno mb-3" value="${inicioActual}">
                
                <label class="small fw-bold text-muted mb-1"><i class="bi bi-calendar-x me-1"></i> Fecha de Culminación</label>
                <input id="swal-input3" type="date" class="form-control input-moderno" value="${finActual}">
            </div>`;
        }

        Swal.fire({
            title: 'Editar Parámetro', 
            html: htmlFormulario, 
            showCancelButton: true, 
            confirmButtonText: 'Actualizar', 
            confirmButtonColor: '#0066FF',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const valorNombre = document.getElementById('swal-input1').value;
                const valorInicio = document.getElementById('swal-input2') ? document.getElementById('swal-input2').value : null;
                const valorFin = document.getElementById('swal-input3') ? document.getElementById('swal-input3').value : null;
                
                if (!valorNombre) { 
                    Swal.showValidationMessage('El nombre es obligatorio'); 
                    return false; 
                }
                
                if (categoria !== 'Nivel_Educativo' && (!valorInicio || !valorFin)) { 
                    Swal.showValidationMessage('Ambas fechas son obligatorias'); 
                    return false; 
                }
                
                return { valor: valorNombre, inicio: valorInicio, fin: valorFin };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const adminCedula = JSON.parse(localStorage.getItem('sigae_usuario')).cedula;
                
                Aplicacion.mostrarCarga();
                
                Aplicacion.peticion({ 
                    action: "save_config", 
                    id: idParametro, 
                    categoria: categoria, 
                    valor: result.value.valor, 
                    inicio: result.value.inicio, 
                    fin: result.value.fin, 
                    cedula_admin: adminCedula 
                }, (res) => {
                    Aplicacion.ocultarCarga();
                    
                    if(res.status === "success") { 
                        Swal.fire('¡Actualizado!', res.message, 'success'); 
                        this.cargarDatos(); 
                        Aplicacion.prepararApp(); // Recarga la barra superior
                    } else {
                        Swal.fire('Error', res.message, 'error');
                    }
                });
            }
        });
    },

    eliminarParametro: function(idParametro) {
        Swal.fire({ 
            title: '¿Estás seguro?', 
            text: "Se borrará este parámetro del sistema y no podrá ser recuperado.", 
            icon: 'warning', 
            showCancelButton: true, 
            confirmButtonColor: '#FF3D00', 
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                const adminCedula = JSON.parse(localStorage.getItem('sigae_usuario')).cedula;
                
                Aplicacion.mostrarCarga();
                
                Aplicacion.peticion({ 
                    action: "delete_config", 
                    id: idParametro, 
                    cedula_admin: adminCedula 
                }, (res) => {
                    Aplicacion.ocultarCarga();
                    
                    if(res.status === "success") { 
                        Swal.fire('Eliminado', res.message, 'success'); 
                        this.cargarDatos(); 
                        Aplicacion.prepararApp();
                    } else {
                        Swal.fire('Error', res.message, 'error');
                    }
                });
            }
        });
    }
};

window.init_Configuración_del_Sistema = function() { 
    ModConfiguracion.cargarDatos(); 
};