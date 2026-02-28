/**
 * MÓDULO: TRANSPORTE ESCOLAR
 * Gestión de Rutas, Paradas, Recorridos y Generación de Rutogramas PDF.
 */

const ModTransporte = {
    datosRutas: [], datosParadas: [], 
    rutaSeleccionadaId: null, recorridoTemp: [],

    // ==========================================
    // CARGA DE DATOS GENERAL
    // ==========================================
    cargarDatos: function(callback) {
        Aplicacion.peticion({ action: "get_transporte" }, (res) => {
            this.datosRutas = res.rutas || [];
            this.datosParadas = res.paradas || [];
            if(callback) callback();
        });
    },

    // ==========================================
    // 1. RUTAS Y PARADAS
    // ==========================================
    cargarVistaRutas: function() {
        this.cargarDatos(() => {
            this.dibujarRutas();
            this.dibujarParadas();
        });
    },

    dibujarRutas: function() {
        const tbody = document.getElementById('tabla-rutas');
        if(!tbody) return;
        
        tbody.innerHTML = this.datosRutas.length === 0 ? '<tr><td colspan="2" class="text-center text-muted">No hay rutas</td></tr>' :
        this.datosRutas.map(r => `
            <tr>
                <td>
                    <div class="fw-bold text-primary mb-1" style="font-size: 1.1rem;">${r.nombre}</div>
                    <div class="d-flex flex-wrap gap-2 text-muted small">
                        <span><i class="bi bi-person-fill"></i> ${r.chofer || 'Sin Chofer'}</span>
                        <span class="d-none d-sm-inline">|</span>
                        <span><i class="bi bi-telephone-fill"></i> ${r.telefono || '---'}</span>
                    </div>
                </td>
                <td class="text-end celda-acciones">
                    <button onclick="ModTransporte.modalRuta('${r.id}')" class="btn-circulo me-1" style="background: rgba(0,102,255,0.1);"><i class="bi bi-pencil text-primary"></i></button>
                    <button onclick="ModTransporte.eliminarRuta('${r.id}')" class="btn-circulo btn-peligro"><i class="bi bi-trash"></i></button>
                </td>
            </tr>
        `).join('');
    },

    dibujarParadas: function() {
        const div = document.getElementById('tabla-paradas');
        if(!div) return;

        div.innerHTML = this.datosParadas.length === 0 ? '<div class="text-center text-muted py-4">No hay paradas</div>' :
        this.datosParadas.map(p => `
            <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded-4 border-start border-4 border-warning shadow-sm">
                <span class="fw-bold text-dark text-truncate ps-2">${p.nombre}</span>
                <div class="celda-acciones">
                    <button onclick="ModTransporte.modalParada('${p.id}', '${p.nombre}')" class="btn btn-sm btn-link text-primary"><i class="bi bi-pencil fs-5"></i></button>
                    <button onclick="ModTransporte.eliminarParada('${p.id}')" class="btn btn-sm btn-link text-danger"><i class="bi bi-trash fs-5"></i></button>
                </div>
            </div>
        `).join('');
    },

    modalRuta: function(id = null) {
        const d = id ? this.datosRutas.find(x => x.id === id) : { nombre: '', chofer: '', docente: '', telefono: '' };
        
        // Simulación de docentes para el select (idealmente vendría del módulo Docentes)
        let docOpts = '<option value="">-- Docente de Guardia --</option>';
        docOpts += `<option value="Prof. Demo" ${d.docente === 'Prof. Demo' ? 'selected' : ''}>Prof. Demo</option>`;

        Swal.fire({
            title: id ? 'Editar Ruta' : 'Nueva Ruta',
            html: `
                <div class="text-start mt-3">
                    <input id="sw-r-nom" class="input-moderno mb-3" placeholder="Nombre Ruta (Ej: Ruta 1)" value="${d.nombre}">
                    <input id="sw-r-cho" class="input-moderno mb-3" placeholder="Nombre del Chofer" value="${d.chofer}">
                    <input id="sw-r-tel" class="input-moderno" placeholder="Teléfono de Contacto" value="${d.telefono}">
                </div>
            `,
            showCancelButton: true, confirmButtonText: 'Guardar', confirmButtonColor: 'var(--color-primario)'
        }).then(r => {
            if(r.isConfirmed) {
                const n = document.getElementById('sw-r-nom').value;
                const c = document.getElementById('sw-r-cho').value;
                const t = document.getElementById('sw-r-tel').value;
                if(!n) return Swal.fire('Error', 'El nombre es obligatorio', 'error');
                
                Aplicacion.peticion({ action: "save_ruta", ruta: { id, nombre: n, chofer: c, docente: '', telefono: t } }, (res) => {
                    if(res.status === 'success') { Swal.fire('Guardado', '', 'success'); this.cargarVistaRutas(); }
                });
            }
        });
    },

    modalParada: function(id = null, nombre = '') {
        Swal.fire({
            title: id ? 'Editar Parada' : 'Nueva Parada',
            input: 'text', inputValue: nombre, inputPlaceholder: 'Nombre del sector o punto',
            showCancelButton: true, confirmButtonText: 'Guardar', confirmButtonColor: 'var(--color-primario)'
        }).then(r => {
            if(r.isConfirmed && r.value) {
                Aplicacion.peticion({ action: "save_parada", parada: { id, nombre: r.value } }, (res) => {
                    if(res.status === 'success') { Swal.fire('Guardado', '', 'success'); this.cargarVistaRutas(); }
                });
            }
        });
    },

    eliminarRuta: function(id) {
        Swal.fire({ title: '¿Eliminar Ruta?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#FF3D00' }).then(r => {
            if(r.isConfirmed) Aplicacion.peticion({ action: "delete_ruta", id }, (res) => { if(res.status === 'success') this.cargarVistaRutas(); });
        });
    },

    eliminarParada: function(id) {
        Swal.fire({ title: '¿Eliminar Parada?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#FF3D00' }).then(r => {
            if(r.isConfirmed) Aplicacion.peticion({ action: "delete_parada", id }, (res) => { if(res.status === 'success') this.cargarVistaRutas(); });
        });
    },

    // ==========================================
    // 2. ASIGNACIÓN DE RECORRIDOS
    // ==========================================
    cargarRecorridos: function() {
        this.cargarDatos(() => {
            const sel = document.getElementById('rec-ruta-select');
            if(sel) sel.innerHTML = '<option value="">-- Seleccione una Ruta --</option>' + 
                this.datosRutas.map(r => `<option value="${r.id}">${r.nombre}</option>`).join('');
        });
    },

    seleccionarRuta: function(id) {
        this.rutaSeleccionadaId = id;
        if(!id) { this.recorridoTemp = []; this.dibujarListasRecorrido(); return; }
        
        const r = this.datosRutas.find(x => x.id === id);
        this.recorridoTemp = r && r.recorrido ? [...r.recorrido] : [];
        this.dibujarListasRecorrido();
    },

    dibujarListasRecorrido: function() {
        const divDisp = document.getElementById('lista-disponibles');
        const divAsig = document.getElementById('lista-asignadas');
        if(!divDisp || !divAsig) return;

        if(!this.rutaSeleccionadaId) {
            divDisp.innerHTML = '<div class="text-center text-muted py-5 small">Seleccione una ruta arriba</div>';
            divAsig.innerHTML = '<div class="text-center text-muted py-5 small">El recorrido aparecerá aquí</div>';
            return;
        }

        // Disponibles (Las que NO están en recorridoTemp)
        const disponibles = this.datosParadas.filter(p => !this.recorridoTemp.includes(p.id));
        divDisp.innerHTML = disponibles.length === 0 ? '<div class="text-muted small text-center mt-3">No hay más paradas</div>' :
        disponibles.map(p => `
            <div class="d-flex justify-content-between align-items-center p-2 bg-white border rounded-3 shadow-sm">
                <span class="small fw-bold text-dark ps-2">${p.nombre}</span>
                <button onclick="ModTransporte.moverParada('${p.id}', 'agregar')" class="btn btn-sm btn-primary rounded-circle"><i class="bi bi-plus-lg"></i></button>
            </div>
        `).join('');

        // Asignadas (En orden)
        divAsig.innerHTML = this.recorridoTemp.length === 0 ? '<div class="text-muted small text-center mt-3">Arrastre o agregue paradas</div>' :
        this.recorridoTemp.map((pId, i) => {
            const p = this.datosParadas.find(x => x.id === pId);
            return `
            <div class="d-flex justify-content-between align-items-center p-2 bg-white border border-success border-2 rounded-3 shadow-sm animate__animated animate__fadeIn">
                <div class="d-flex align-items-center overflow-hidden">
                    <span class="badge bg-success rounded-circle me-2">${i + 1}</span>
                    <span class="small fw-bold text-dark text-truncate">${p ? p.nombre : '???'}</span>
                </div>
                <div class="d-flex gap-1">
                    <button onclick="ModTransporte.reordenar(${i}, -1)" class="btn btn-sm btn-light border" ${i===0?'disabled':''}><i class="bi bi-arrow-up"></i></button>
                    <button onclick="ModTransporte.reordenar(${i}, 1)" class="btn btn-sm btn-light border" ${i===this.recorridoTemp.length-1?'disabled':''}><i class="bi bi-arrow-down"></i></button>
                    <button onclick="ModTransporte.moverParada('${pId}', 'quitar')" class="btn btn-sm btn-danger-subtle text-danger border-0"><i class="bi bi-x-lg"></i></button>
                </div>
            </div>`;
        }).join('');
    },

    moverParada: function(id, accion) {
        if(accion === 'agregar') this.recorridoTemp.push(id);
        else this.recorridoTemp = this.recorridoTemp.filter(x => x !== id);
        this.dibujarListasRecorrido();
    },

    reordenar: function(index, dir) {
        const item = this.recorridoTemp.splice(index, 1)[0];
        this.recorridoTemp.splice(index + dir, 0, item);
        this.dibujarListasRecorrido();
    },

    guardarRecorrido: function() {
        if(!this.rutaSeleccionadaId) return;
        Aplicacion.peticion({ action: "save_recorrido", rutaId: this.rutaSeleccionadaId, recorrido: this.recorridoTemp }, (res) => {
            if(res.status === 'success') Swal.fire('¡Éxito!', 'Recorrido actualizado correctamente.', 'success');
        });
    },

    // ==========================================
    // 3. RUTOGRAMAS (PDF)
    // ==========================================
    cargarRutogramas: function() {
        this.cargarDatos(() => {
            const grid = document.getElementById('grid-rutas-pdf');
            if(grid) {
                grid.innerHTML = this.datosRutas.map(r => `
                    <div class="col-md-6 col-lg-4">
                        <div class="form-check p-3 bg-white rounded-4 border shadow-sm h-100 d-flex align-items-center">
                            <input class="form-check-input chk-ruta-pdf fs-5 me-2" type="checkbox" value="${r.id}" id="pdf-${r.id}">
                            <label class="form-check-label fw-bold text-dark cursor-pointer w-100" for="pdf-${r.id}">
                                ${r.nombre}
                            </label>
                        </div>
                    </div>
                `).join('');
            }
        });
    },

    toggleTodasRutas: function(checked) {
        document.querySelectorAll('.chk-ruta-pdf').forEach(c => c.checked = checked);
    },

    generarPDF: async function() {
        const desde = document.getElementById('ruto-desde').value;
        const hasta = document.getElementById('ruto-hasta').value;
        const seleccionadas = Array.from(document.querySelectorAll('.chk-ruta-pdf:checked')).map(cb => cb.value);

        if(!desde || !hasta) return Swal.fire('Faltan Fechas', 'Indique la vigencia del rutograma.', 'warning');
        if(seleccionadas.length === 0) return Swal.fire('Sin Selección', 'Elija al menos una ruta.', 'warning');

        Aplicacion.mostrarCarga();
        const contenedor = document.getElementById('contenedor-impresion-pdf');
        
        // Configuramos PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfW = pdf.internal.pageSize.getWidth();
        
        let paginas = 0;

        for (const id of seleccionadas) {
            const r = this.datosRutas.find(x => x.id === id);
            if(r && r.recorrido && r.recorrido.length > 0) {
                // Generar HTML del Mapa (Tipo Metro)
                let paradasHTML = '';
                r.recorrido.forEach((pId, i) => {
                    const p = this.datosParadas.find(x => x.id === pId);
                    paradasHTML += `
                        <div style="position: relative; margin-bottom: 25px; padding-left: 40px;">
                            <div style="position: absolute; left: 6px; top: 5px; width: 16px; height: 16px; background: white; border: 4px solid #0066FF; border-radius: 50%; z-index: 2;"></div>
                            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px 15px; border-radius: 10px; font-weight: 600; font-size: 14px; color: #333;">
                                ${p ? p.nombre : 'Parada Desconocida'}
                            </div>
                            ${i < r.recorrido.length - 1 ? '<div style="position: absolute; left: 12px; top: 20px; width: 4px; height: 40px; background: #0066FF; z-index: 1;"></div>' : ''}
                        </div>
                    `;
                });

                contenedor.innerHTML = `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <div style="border-bottom: 3px solid #FF8D00; padding-bottom: 15px; margin-bottom: 20px; display: flex; align-items: center;">
                            <img src="assets/img/logo.png" width="60" style="margin-right: 20px;">
                            <div>
                                <h2 style="margin: 0; color: #0066FF;">${r.nombre}</h2>
                                <p style="margin: 5px 0 0; font-size: 12px; color: #666;">Vigencia: ${desde} al ${hasta}</p>
                            </div>
                        </div>
                        
                        <div style="background: #f1f5f9; padding: 15px; border-radius: 10px; margin-bottom: 30px; font-size: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div><strong>Chofer:</strong><br>${r.chofer || 'No asignado'}</div>
                            <div><strong>Teléfono:</strong><br>${r.telefono || '---'}</div>
                        </div>

                        <div style="background: white; padding: 10px;">
                            <!-- INICIO -->
                            <div style="margin-bottom: 30px; display: flex; align-items: center;">
                                <div style="width: 40px; height: 40px; background: #FF8D00; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; font-size: 20px;">A</div>
                                <div style="font-weight: bold; color: #FF8D00;">INICIO DE RUTA</div>
                            </div>
                            
                            ${paradasHTML}

                            <!-- FIN -->
                            <div style="margin-top: 10px; display: flex; align-items: center;">
                                <div style="width: 40px; height: 40px; background: #0066FF; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; font-size: 20px;">B</div>
                                <div style="font-weight: bold; color: #0066FF;">LLEGADA AL PLANTEL</div>
                            </div>
                        </div>
                    </div>
                `;

                // Captura y PDF
                await new Promise(resolve => setTimeout(resolve, 100)); // Esperar render
                const canvas = await html2canvas(contenedor, { scale: 2 });
                const imgData = canvas.toDataURL('image/png');
                
                if(paginas > 0) pdf.addPage();
                
                const imgProps = pdf.getImageProperties(imgData);
                const pdfH = (imgProps.height * (pdfW - 20)) / imgProps.width;
                
                pdf.addImage(imgData, 'PNG', 10, 10, pdfW - 20, pdfH);
                paginas++;
            }
        }

        Aplicacion.ocultarCarga();
        if(paginas > 0) {
            pdf.save(`Rutogramas_Transporte.pdf`);
            Swal.fire('PDF Generado', 'Se descargaron los rutogramas seleccionados.', 'success');
        } else {
            Swal.fire('Error', 'Las rutas seleccionadas no tienen recorridos asignados.', 'error');
        }
        contenedor.innerHTML = '';
    }
};

// INICIALIZADORES
window['init_Rutas_y_Paradas'] = function() { ModTransporte.cargarVistaRutas(); };
window['init_Asignación_de_Recorridos'] = function() { ModTransporte.cargarRecorridos(); };
window['init_Rutogramas'] = function() { ModTransporte.cargarRutogramas(); };