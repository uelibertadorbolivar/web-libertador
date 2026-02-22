/**
 * MÓDULO DE TRANSPORTE ESCOLAR
 * Gestión de rutas, paradas, recorridos y generación de reportes.
 */

const ModuloRutasParadas = {
    rutas: [], paradas: [],
    render: function(cont) {
        cont.innerHTML = `
        <div class="row g-4 w-100 m-0">
            <div class="col-lg-7 anim-stagger-1">
                <div class="card border-0 shadow-sm rounded-4 bg-white h-100 module-card overflow-hidden">
                    <div class="module-header bg-gradient-orange">
                        <div class="d-flex align-items-center">
                            <div class="module-icon-box text-warning"><i class="bi bi-signpost-split-fill fs-4"></i></div>
                            <div><h6 class="fw-bold mb-0 text-white">Rutas de Transporte</h6><small class="opacity-75 text-white">Creación de líneas/rutas</small></div>
                        </div>
                        <button onclick="ModuloRutasParadas.modalRuta()" class="btn btn-light btn-sm text-dark fw-bold rounded-pill px-3 shadow-sm btn-action"><i class="bi bi-plus-lg me-1"></i>Nueva Ruta</button>
                    </div>
                    <div class="p-4 table-responsive pt-2"><table class="table table-interactive align-middle"><thead><tr class="table-light"><th>Información de la Ruta</th><th class="text-end">Acción</th></tr></thead><tbody id="tbl-rutas"></tbody></table></div>
                </div>
            </div>
            <div class="col-lg-5 anim-stagger-2">
                <div class="card border-0 shadow-sm rounded-4 bg-white h-100 module-card overflow-hidden">
                    <div class="module-header bg-gradient-orange">
                        <div class="d-flex align-items-center">
                            <div class="module-icon-box text-warning"><i class="bi bi-geo-alt-fill fs-4"></i></div>
                            <div><h6 class="fw-bold mb-0 text-white">Paradas</h6><small class="opacity-75 text-white">Puntos de recolección</small></div>
                        </div>
                        <button onclick="ModuloRutasParadas.modalParada()" class="btn btn-light btn-sm text-dark fw-bold rounded-pill px-3 shadow-sm btn-action"><i class="bi bi-plus-lg me-1"></i>Agregar</button>
                    </div>
                    <div class="p-4 table-responsive pt-2"><table class="table table-interactive align-middle"><thead><tr class="table-light"><th>Nombre de la Parada</th><th class="text-end">Acción</th></tr></thead><tbody id="tbl-paradas"></tbody></table></div>
                </div>
            </div>
        </div>`;
        this.load();
    },
    load: function() { 
        App.showLoader(); 
        App.sendRequest({ action: "get_transporte" }, (res) => { 
            this.rutas = res.rutas || []; this.paradas = res.paradas || []; 
            this.draw(); App.hideLoader(); 
        }); 
    },
    draw: function() {
        const tr = document.getElementById('tbl-rutas'); 
        if(tr) tr.innerHTML = this.rutas.length === 0 ? '<tr><td colspan="2" class="text-center text-muted">Sin registros</td></tr>' : this.rutas.map((r,i) => `
            <tr class="anim-stagger-${(i%5)+1}">
                <td>
                    <div class="fw-bold text-primary">${r.nombre}</div>
                    <div class="small text-muted mt-1"><i class="bi bi-person-fill me-1"></i>Chofer: <b>${r.chofer || 'No asignado'}</b></div>
                    <div class="small text-muted"><i class="bi bi-person-badge-fill me-1"></i>Docente: <b>${r.docente || 'No asignado'}</b> | <i class="bi bi-telephone-fill me-1 ms-2"></i><b>${r.telefono || 'Sin N°'}</b></div>
                </td>
                <td class="text-end"><button onclick="ModuloRutasParadas.modalRuta('${r.id}')" class="btn btn-sm btn-light text-primary rounded-circle btn-action"><i class="bi bi-pencil"></i></button><button onclick="ModuloRutasParadas.deleteRuta('${r.id}')" class="btn btn-sm btn-light text-danger rounded-circle ms-1 btn-action"><i class="bi bi-trash"></i></button></td>
            </tr>`).join('');
        const tp = document.getElementById('tbl-paradas'); 
        if(tp) tp.innerHTML = this.paradas.length === 0 ? '<tr><td colspan="2" class="text-center text-muted">Sin registros</td></tr>' : this.paradas.map((p,i) => `<tr class="anim-stagger-${(i%5)+1}"><td class="fw-bold">${p.nombre}</td><td class="text-end"><button onclick="ModuloRutasParadas.modalParada('${p.id}', '${p.nombre}')" class="btn btn-sm btn-light text-primary rounded-circle btn-action"><i class="bi bi-pencil"></i></button><button onclick="ModuloRutasParadas.deleteParada('${p.id}')" class="btn btn-sm btn-light text-danger rounded-circle ms-1 btn-action"><i class="bi bi-trash"></i></button></td></tr>`).join('');
    },
    modalRuta: function(id=null){ 
        const d = id ? this.rutas.find(x=>x.id===id) : {nombre:'', chofer:'', docente:'', telefono:''}; 
        let docOpts = '<option value="">-- Seleccione Docente de Guardia --</option>';
        App.allUsers.forEach(u => { docOpts += `<option value="${u.nombre}" ${d.docente === u.nombre ? 'selected' : ''}>${u.nombre}</option>`; });
        
        Swal.fire({ 
            title: id ? 'Editar Ruta' : 'Nueva Ruta', 
            html: `
                <input id="sw-r-nom" class="form-control input-interactive rounded-pill mb-3" placeholder="Nombre de la Ruta (Ej: Ruta 1)" value="${d.nombre}">
                <input id="sw-r-cho" class="form-control input-interactive rounded-pill mb-3" placeholder="Nombre del Chofer" value="${d.chofer||''}">
                <select id="sw-r-doc" class="form-select input-interactive rounded-pill mb-3">${docOpts}</select>
                <input id="sw-r-tel" class="form-control input-interactive rounded-pill" placeholder="Teléfono de Enlace" value="${d.telefono||''}">
            `, 
            showCancelButton:true, confirmButtonText:'Guardar' 
        }).then(r=>{ 
            if(r.isConfirmed){ 
                const n = document.getElementById('sw-r-nom').value;
                const c = document.getElementById('sw-r-cho').value;
                const doc = document.getElementById('sw-r-doc').value;
                const t = document.getElementById('sw-r-tel').value;
                if(!n) return Swal.fire('Atención', 'El nombre de la ruta es obligatorio', 'warning');
                App.showLoader(); 
                App.sendRequest({ action:"save_ruta", ruta:{id, nombre:n, chofer:c, docente:doc, telefono:t}}, (res)=>{ App.hideLoader(); if(res.status==='success') { Swal.fire('Éxito','Ruta guardada','success'); this.load(); }}); 
            }
        }); 
    },
    modalParada: function(id=null, n=''){ Swal.fire({ title:'Parada de Transporte', input:'text', inputValue:n, showCancelButton:true, confirmButtonText:'Guardar' }).then(r=>{ if(r.isConfirmed){ App.showLoader(); App.sendRequest({ action:"save_parada", parada:{id, nombre:r.value}}, (res)=>{ App.hideLoader(); if(res.status==='success') { Swal.fire('Éxito','Parada guardada','success'); this.load(); }}); }}); },
    deleteRuta: function(id){ Swal.fire({ title:'¿Eliminar Ruta?', icon:'warning', showCancelButton:true }).then(r=>{ if(r.isConfirmed){ App.showLoader(); App.sendRequest({ action:"delete_ruta", id }, (res)=>{ App.hideLoader(); if(res.status==='success') { this.load(); }}); }}); },
    deleteParada: function(id){ Swal.fire({ title:'¿Eliminar Parada?', icon:'warning', showCancelButton:true }).then(r=>{ if(r.isConfirmed){ App.showLoader(); App.sendRequest({ action:"delete_parada", id }, (res)=>{ App.hideLoader(); if(res.status==='success') { this.load(); }}); }}); }
};

const ModuloRecorridos = {
    rutas: [], paradas: [], selectedRutaId: null, selectedRecorrido: [],
    render: function(cont) {
        cont.innerHTML = `
        <div class="col-12 card border-0 shadow-sm rounded-4 bg-white mb-4 module-card anim-stagger-1 overflow-hidden">
            <div class="module-header bg-gradient-orange mb-0">
                <div class="d-flex align-items-center">
                    <div class="module-icon-box text-warning"><i class="bi bi-shuffle fs-4"></i></div>
                    <div><h5 class="fw-bold mb-0 text-white">Asignación de Recorridos</h5><small class="opacity-75 text-white">Construcción paso a paso de cada ruta</small></div>
                </div>
            </div>
            <div class="p-4 pt-4 bg-light border-bottom">
                <label class="small fw-bold text-muted ps-2">Seleccione una Ruta para configurar:</label>
                <select id="rec-ruta-select" class="form-select input-interactive rounded-pill shadow-none fw-bold mt-2" style="max-width: 400px;" onchange="ModuloRecorridos.selectRuta(this.value)"></select>
            </div>
            <div class="row g-0">
                <div class="col-md-6 border-end p-4">
                    <h6 class="fw-bold text-primary mb-3">Paradas Disponibles</h6>
                    <div id="list-avail-paradas" class="d-flex flex-column gap-2" style="max-height: 400px; overflow-y: auto;"></div>
                </div>
                <div class="col-md-6 p-4 bg-light">
                    <h6 class="fw-bold text-success mb-3">Orden del Recorrido (Inicio a Fin)</h6>
                    <div id="list-assigned-paradas" class="d-flex flex-column gap-2" style="max-height: 400px; overflow-y: auto;"></div>
                    <div class="text-end mt-4 pt-3 border-top">
                        <button onclick="ModuloRecorridos.save()" class="btn btn-success-vibrant px-4 py-2 rounded-pill shadow fw-bold btn-action"><i class="bi bi-floppy-fill me-2"></i>Guardar Recorrido</button>
                    </div>
                </div>
            </div>
        </div>`;
        this.load();
    },
    load: function() { 
        App.showLoader(); 
        App.sendRequest({ action: "get_transporte" }, (res) => { 
            this.rutas = res.rutas || []; this.paradas = res.paradas || []; 
            const sel = document.getElementById('rec-ruta-select');
            if(sel) sel.innerHTML = '<option value="">-- Seleccione una Ruta --</option>' + this.rutas.map(r => `<option value="${r.id}">${r.nombre}</option>`).join('');
            App.hideLoader(); 
        }); 
    },
    selectRuta: function(rutaId) {
        this.selectedRutaId = rutaId;
        if(!rutaId) { this.selectedRecorrido = []; this.drawLists(); return; }
        const r = this.rutas.find(x => x.id === rutaId);
        this.selectedRecorrido = r && r.recorrido ? [...r.recorrido] : [];
        this.drawLists();
    },
    drawLists: function() {
        const availC = document.getElementById('list-avail-paradas');
        const assigC = document.getElementById('list-assigned-paradas');
        if(!availC || !assigC) return;
        
        if(!this.selectedRutaId) {
            availC.innerHTML = '<div class="text-muted small">Seleccione una ruta arriba</div>';
            assigC.innerHTML = '<div class="text-muted small">Seleccione una ruta arriba</div>';
            return;
        }

        const unassigned = this.paradas.filter(p => !this.selectedRecorrido.includes(p.id));
        availC.innerHTML = unassigned.length === 0 ? '<div class="text-muted small">No hay más paradas disponibles.</div>' : unassigned.map(p => `
            <div class="d-flex justify-content-between align-items-center p-3 bg-white rounded-4 border shadow-sm module-card">
                <span class="fw-bold text-dark"><i class="bi bi-geo-alt me-2 text-primary"></i>${p.nombre}</span>
                <button onclick="ModuloRecorridos.addStop('${p.id}')" class="btn btn-sm btn-primary-vibrant rounded-circle btn-action"><i class="bi bi-plus-lg"></i></button>
            </div>
        `).join('');

        assigC.innerHTML = this.selectedRecorrido.length === 0 ? '<div class="text-muted small">El recorrido está vacío. Añade paradas desde la izquierda.</div>' : this.selectedRecorrido.map((pId, idx) => {
            const p = this.paradas.find(x => x.id === pId);
            const pName = p ? p.nombre : 'Parada Desconocida';
            return `
            <div class="d-flex justify-content-between align-items-center p-3 bg-white rounded-4 border border-success border-2 shadow-sm module-card">
                <div>
                    <span class="badge bg-success me-2 rounded-circle px-2">${idx + 1}</span>
                    <span class="fw-bold text-dark">${pName}</span>
                </div>
                <div>
                    <button onclick="ModuloRecorridos.moveStop(${idx}, -1)" class="btn btn-sm btn-light text-dark rounded-circle btn-action" ${idx === 0 ? 'disabled' : ''}><i class="bi bi-arrow-up"></i></button>
                    <button onclick="ModuloRecorridos.moveStop(${idx}, 1)" class="btn btn-sm btn-light text-dark rounded-circle btn-action" ${idx === this.selectedRecorrido.length - 1 ? 'disabled' : ''}><i class="bi bi-arrow-down"></i></button>
                    <button onclick="ModuloRecorridos.removeStop('${pId}')" class="btn btn-sm btn-danger-vibrant rounded-circle ms-2 btn-action"><i class="bi bi-x-lg"></i></button>
                </div>
            </div>`;
        }).join('');
    },
    addStop: function(id) { this.selectedRecorrido.push(id); this.drawLists(); },
    removeStop: function(id) { this.selectedRecorrido = this.selectedRecorrido.filter(x => x !== id); this.drawLists(); },
    moveStop: function(idx, dir) {
        if (idx + dir < 0 || idx + dir >= this.selectedRecorrido.length) return;
        const temp = this.selectedRecorrido[idx];
        this.selectedRecorrido[idx] = this.selectedRecorrido[idx + dir];
        this.selectedRecorrido[idx + dir] = temp;
        this.drawLists();
    },
    save: function() {
        if(!this.selectedRutaId) return Swal.fire('Error', 'Seleccione una ruta primero', 'warning');
        App.showLoader();
        App.sendRequest({ action: "save_recorrido", rutaId: this.selectedRutaId, recorrido: this.selectedRecorrido }, (res) => {
            App.hideLoader();
            if(res.status==='success') { 
                Swal.fire('Éxito', 'Recorrido guardado correctamente', 'success'); 
                const rt = this.rutas.find(x => x.id === this.selectedRutaId);
                if(rt) rt.recorrido = [...this.selectedRecorrido];
            }
        });
    }
};

const ModuloRutogramas = {
    rutas: [], paradas: [],
    render: function(cont) {
        cont.innerHTML = `
        <div class="col-12 card border-0 shadow-sm rounded-4 bg-white mb-4 module-card anim-stagger-1 overflow-hidden">
            <div class="module-header bg-gradient-orange mb-0">
                <div class="d-flex align-items-center">
                    <div class="module-icon-box text-warning"><i class="bi bi-map-fill fs-4"></i></div>
                    <div><h5 class="fw-bold mb-0 text-white">Generador de Rutogramas</h5><small class="opacity-75 text-white">Mapas visuales tipo metro por ruta</small></div>
                </div>
            </div>
            
            <div class="p-4 pt-4 row g-4">
                <div class="col-12 col-md-6">
                    <label class="small fw-bold text-muted">Fecha Desde:</label>
                    <input type="date" id="rutograma-desde" class="form-control input-interactive rounded-pill mt-1">
                </div>
                <div class="col-12 col-md-6">
                    <label class="small fw-bold text-muted">Fecha Hasta:</label>
                    <input type="date" id="rutograma-hasta" class="form-control input-interactive rounded-pill mt-1">
                </div>
                
                <div class="col-12 mt-4">
                    <h6 class="fw-bold text-primary border-bottom pb-2">Seleccione las Rutas a generar:</h6>
                    <div class="form-check mb-3 mt-3">
                        <input class="form-check-input input-interactive cursor-pointer" type="checkbox" id="chk-all-rutos" onchange="ModuloRutogramas.toggleAll(this.checked)">
                        <label class="form-check-label fw-bold text-primary cursor-pointer" for="chk-all-rutos">Seleccionar Todas</label>
                    </div>
                    <div id="list-chk-rutogramas" class="row g-2"></div>
                </div>

                <div class="col-12 text-center mt-4 border-top pt-4">
                    <button onclick="ModuloRutogramas.generarPDF()" class="btn btn-primary-vibrant rounded-pill px-5 py-3 shadow-sm btn-action fw-bold"><i class="bi bi-file-earmark-pdf-fill me-2"></i>Generar Rutogramas PDF</button>
                </div>
            </div>
        </div>
        
        <!-- CONTENEDOR OCULTO PARA PDF -->
        <div id="rutograma-print-container" style="position:absolute; top:-9999px; left:0; width:800px; background:#ffffff; padding:40px;"></div>
        `;
        this.load();
    },
    load: function() { 
        App.showLoader(); 
        App.sendRequest({ action: "get_transporte" }, (res) => { 
            this.rutas = res.rutas || []; this.paradas = res.paradas || []; 
            const cont = document.getElementById('list-chk-rutogramas');
            if(cont) {
                cont.innerHTML = this.rutas.map(r => `
                    <div class="col-md-6 col-lg-4">
                        <div class="form-check p-3 bg-light rounded-4 border">
                            <input class="form-check-input ms-1 chk-ruta-pdf cursor-pointer input-interactive" type="checkbox" value="${r.id}" id="chk-pdf-${r.id}">
                            <label class="form-check-label small fw-bold cursor-pointer ms-2" for="chk-pdf-${r.id}">${r.nombre}</label>
                        </div>
                    </div>
                `).join('');
            }
            App.hideLoader(); 
        }); 
    },
    toggleAll: function(checked) {
        document.querySelectorAll('.chk-ruta-pdf').forEach(c => c.checked = checked);
    },
    generarPDF: async function() {
        const desde = document.getElementById('rutograma-desde').value;
        const hasta = document.getElementById('rutograma-hasta').value;
        const seleccionadas = Array.from(document.querySelectorAll('.chk-ruta-pdf:checked')).map(cb => cb.value);
        
        if(!desde || !hasta) return Swal.fire('Atención', 'Seleccione el rango de fechas de vigencia.', 'warning');
        if(seleccionadas.length === 0) return Swal.fire('Atención', 'Debe seleccionar al menos una ruta.', 'warning');

        const printCont = document.getElementById('rutograma-print-container');
        const schoolName = (App.schoolData && App.schoolData.nombre) ? App.schoolData.nombre : "UE Libertador Bolívar";
        
        App.showLoader();
        
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfW = pdf.internal.pageSize.getWidth();
        const pdfH = pdf.internal.pageSize.getHeight();
        let pageCount = 0;

        for (const id of seleccionadas) {
            const r = this.rutas.find(x => x.id === id);
            if(r && r.recorrido && r.recorrido.length > 0) {
                let nodesHtml = '';
                
                // INICIO (Bus)
                nodesHtml += `
                    <div style="position: relative; margin-bottom: 20px; display: flex; align-items: center; z-index: 2;">
                        <div style="position: absolute; left: -10px; width: 60px; height: 60px; background: #FF8D00; color:white; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.1); display:flex; align-items:center; justify-content:center; font-size:24px;">
                            <i class="bi bi-bus-front-fill"></i>
                        </div>
                        <div style="margin-left: 70px; font-weight: 700; color: #FF8D00; font-size: 16px;">INICIO DE RUTA</div>
                    </div>
                `;

                // PARADAS
                r.recorrido.forEach((pId, idx) => {
                    const p = this.paradas.find(x => x.id === pId);
                    nodesHtml += `
                    <div style="position: relative; margin-bottom: 30px; display: flex; align-items: center; z-index: 2;">
                        <div style="position: absolute; left: 10px; width: 20px; height: 20px; background: #ffffff; border: 4px solid #0085FF; border-radius: 50%;"></div>
                        <div style="margin-left: 70px; font-size: 14px; font-weight: 600; color: #2d3748; background: #f8fafc; padding: 10px 20px; border-radius: 15px; border: 1px solid #e2e8f0; width:100%;">
                            ${p ? p.nombre : 'Desconocida'}
                        </div>
                    </div>`;
                    
                    if(idx < r.recorrido.length - 1) {
                        nodesHtml += `<div style="margin-left:12px; margin-bottom:10px; color:#0085FF; font-size:18px;"><i class="bi bi-arrow-down"></i></div>`;
                    }
                });

                nodesHtml += `<div style="margin-left:12px; margin-bottom:10px; color:#0085FF; font-size:18px;"><i class="bi bi-arrow-down"></i></div>`;

                // FINAL (Escuela)
                nodesHtml += `
                    <div style="position: relative; margin-bottom: 20px; display: flex; align-items: center; z-index: 2;">
                        <div style="position: absolute; left: -10px; width: 60px; height: 60px; background: #0085FF; color:white; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.1); display:flex; align-items:center; justify-content:center; font-size:24px;">
                            <i class="bi bi-building"></i>
                        </div>
                        <div style="margin-left: 70px; font-weight: 700; color: #0085FF; font-size: 16px;">${schoolName} (Llegada)</div>
                    </div>
                `;

                // RENDERIZAR UNA RUTA EN EL CONTENEDOR OCULTO
                printCont.innerHTML = `
                <div style="font-family: 'Inter', sans-serif; padding: 20px; border: 2px solid #e2e8f0; border-radius: 20px; margin-bottom: 40px; background: white;">
                    <div style="display:flex; align-items:center; margin-bottom:20px; border-bottom: 2px solid #FF8D00; padding-bottom:15px;">
                        <img src="assets/img/logo.png" width="60" style="margin-right:15px;">
                        <div>
                            <h2 style="margin:0; color:#0085FF; font-size:22px;">${r.nombre}</h2>
                            <div style="font-size:12px; color:#64748b;">Vigente: ${desde.split('-').reverse().join('/')} al ${hasta.split('-').reverse().join('/')}</div>
                        </div>
                    </div>
                    
                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px; background:#f1f5f9; padding:15px; border-radius:12px; margin-bottom:30px; font-size:12px;">
                        <div><b>Chofer:</b><br>${r.chofer || '---'}</div>
                        <div><b>Docente Guardia:</b><br>${r.docente || '---'}</div>
                        <div><b>Teléfono:</b><br>${r.telefono || '---'}</div>
                    </div>

                    <div style="position: relative; padding-left: 20px;">
                        <div style="position: absolute; top: 20px; bottom: 40px; left: 39px; width: 4px; background: #0085FF; z-index: 1;"></div>
                        ${nodesHtml}
                    </div>
                </div>`;

                // ESPERAR Y CAPTURAR
                await new Promise(resolve => setTimeout(resolve, 200)); 
                const canvas = await html2canvas(printCont, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
                const imgData = canvas.toDataURL('image/png');
                
                if (pageCount > 0) pdf.addPage();
                
                const ratio = canvas.width / canvas.height;
                let finalW = pdfW - 20;
                let finalH = finalW / ratio;
                
                if (finalH > (pdfH - 20)) { 
                    finalH = pdfH - 20; 
                    finalW = finalH * ratio; 
                }
                
                pdf.addImage(imgData, 'PNG', 10, 10, finalW, finalH);
                pageCount++;
            }
        }

        if (pageCount === 0) {
            App.hideLoader();
            return Swal.fire('Atención', 'Las rutas seleccionadas no tienen recorridos asignados.', 'warning');
        }

        pdf.save(`Rutogramas_Transporte.pdf`);
        printCont.innerHTML = '';
        App.hideLoader();
        Swal.fire('Éxito', 'Rutogramas generados (1 por página)', 'success');
    }
};

const ModuloGuardiasTransporte = {
    rutas: [],
    render: function(cont) {
        cont.innerHTML = `
        <div class="col-12 card border-0 shadow-sm rounded-4 bg-white mb-4 module-card anim-stagger-1 overflow-hidden">
            <div class="module-header bg-gradient-orange mb-0">
                <div class="d-flex align-items-center">
                    <div class="module-icon-box text-warning"><i class="bi bi-person-vcard-fill fs-4"></i></div>
                    <div><h5 class="fw-bold mb-0 text-white">Guardias de Transporte</h5><small class="opacity-75 text-white">Generar listados de docentes asignados por semana</small></div>
                </div>
            </div>
            
            <div class="p-4 p-md-5 pt-4 row g-4">
                <div class="col-12 col-md-6">
                    <label class="small fw-bold text-muted">Inicio de Guardia:</label>
                    <input type="date" id="guardia-desde" class="form-control input-interactive rounded-pill mt-1">
                </div>
                <div class="col-12 col-md-6">
                    <label class="small fw-bold text-muted">Fin de Guardia:</label>
                    <input type="date" id="guardia-hasta" class="form-control input-interactive rounded-pill mt-1">
                </div>
                
                <div class="col-12 mt-4">
                    <h6 class="fw-bold text-primary border-bottom pb-2">Seleccione las Rutas a incluir en el reporte:</h6>
                    <div class="form-check mb-3 mt-3">
                        <input class="form-check-input input-interactive cursor-pointer" type="checkbox" id="chk-all-rutas" onchange="ModuloGuardiasTransporte.toggleAll(this.checked)">
                        <label class="form-check-label fw-bold text-primary cursor-pointer" for="chk-all-rutas">Seleccionar Todas las Rutas</label>
                    </div>
                    <div id="list-chk-rutas" class="row g-2"></div>
                </div>

                <div class="col-12 text-center mt-5 border-top pt-4">
                    <button onclick="ModuloGuardiasTransporte.generarReporte()" class="btn btn-primary-vibrant px-5 py-3 rounded-pill shadow-lg fw-bold btn-action" style="font-size:1.1rem;">
                        <i class="bi bi-file-earmark-pdf-fill me-2"></i> Generar y Descargar Reporte PDF
                    </button>
                </div>
            </div>
        </div>
        
        <!-- CONTENEDOR OCULTO PARA GENERAR EL PDF -->
        <div id="print-guardias-container" style="position:absolute; top:-9999px; left:0; width:900px; background:#ffffff; padding:40px;"></div>
        `;
        this.load();
    },
    load: function() { 
        App.showLoader(); 
        App.sendRequest({ action: "get_transporte" }, (res) => { 
            this.rutas = res.rutas || []; 
            const cont = document.getElementById('list-chk-rutas');
            if(cont) {
                cont.innerHTML = this.rutas.map(r => `
                    <div class="col-md-4 col-lg-3">
                        <div class="form-check p-3 bg-light rounded-4 border">
                            <input class="form-check-input ms-1 chk-ruta-guardia cursor-pointer input-interactive" type="checkbox" value="${r.id}" id="chk-rg-${r.id}">
                            <label class="form-check-label small fw-bold cursor-pointer ms-2" for="chk-rg-${r.id}">${r.nombre}</label>
                        </div>
                    </div>
                `).join('');
            }
            App.hideLoader(); 
        }); 
    },
    toggleAll: function(checked) {
        document.querySelectorAll('.chk-ruta-guardia').forEach(c => c.checked = checked);
    },
    generarReporte: async function() {
        const d = document.getElementById('guardia-desde').value;
        const h = document.getElementById('guardia-hasta').value;
        
        if(!d || !h) return Swal.fire('Atención', 'Debe indicar las fechas de Inicio y Fin de la guardia.', 'warning');
        
        // Formatear fechas para mostrar bonito (DD/MM/YYYY)
        const formatD = d.split('-').reverse().join('/');
        const formatH = h.split('-').reverse().join('/');
        const periodoTexto = `Desde el ${formatD} hasta el ${formatH}`;
        
        const seleccionadas = Array.from(document.querySelectorAll('.chk-ruta-guardia:checked')).map(cb => cb.value);
        if(seleccionadas.length === 0) return Swal.fire('Atención', 'Debe seleccionar al menos una ruta.', 'warning');

        const printCont = document.getElementById('print-guardias-container');
        const schoolName = (App.schoolData && App.schoolData.nombre) ? App.schoolData.nombre : "UE Libertador Bolívar";

        App.showLoader();

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape
        const pdfW = pdf.internal.pageSize.getWidth();
        const pdfH = pdf.internal.pageSize.getHeight();
        let pageCount = 0;

        for (const id of seleccionadas) {
            const r = this.rutas.find(x => x.id === id);
            if (r) {
                // Generar HTML de UNA SOLA PÁGINA (FICHA)
                printCont.innerHTML = `
                <div style="font-family: 'Inter', sans-serif; color: #1a202c; border: 4px solid #FF8D00; padding: 40px; border-radius: 20px; height: 100%;">
                    
                    <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px;">
                        <img src="assets/img/logo.png" width="100" style="margin-right: 30px;">
                        <div style="text-align: left;">
                            <h1 style="margin:0; font-size: 28px; color: #0085FF; text-transform: uppercase;">${schoolName}</h1>
                            <h2 style="margin:5px 0 0 0; font-size: 20px; color: #4a5568;">Notificación de Guardia de Transporte</h2>
                        </div>
                    </div>

                    <div style="background-color: #f8fafc; border-radius: 15px; padding: 30px; margin-bottom: 40px; border: 1px solid #cbd5e1;">
                        <table style="width: 100%; border-collapse: separate; border-spacing: 0 15px;">
                            <tr>
                                <td style="font-weight: bold; color: #FF8D00; font-size: 18px; width: 30%;">PERÍODO:</td>
                                <td style="font-size: 18px; border-bottom: 1px solid #cbd5e1;">${periodoTexto}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold; color: #0085FF; font-size: 18px;">RUTA ASIGNADA:</td>
                                <td style="font-size: 24px; font-weight: 700; border-bottom: 1px solid #cbd5e1;">${r.nombre}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold; color: #4a5568; font-size: 18px;">DOCENTE DE GUARDIA:</td>
                                <td style="font-size: 18px; border-bottom: 1px solid #cbd5e1;">${r.docente || '---'}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold; color: #4a5568; font-size: 18px;">CHOFER DE LA UNIDAD:</td>
                                <td style="font-size: 18px; border-bottom: 1px solid #cbd5e1;">${r.chofer || '---'}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold; color: #4a5568; font-size: 18px;">TELÉFONO ENLACE:</td>
                                <td style="font-size: 18px; border-bottom: 1px solid #cbd5e1;">${r.telefono || '---'}</td>
                            </tr>
                        </table>
                    </div>

                    <div style="margin-top: 80px; display: flex; justify-content: space-around; text-align: center;">
                        <div>
                            <div style="border-top: 2px solid #000; width: 200px; margin-bottom: 10px;"></div>
                            <div style="font-weight: bold;">Coordinación de Transporte</div>
                        </div>
                        <div>
                            <div style="border-top: 2px solid #000; width: 200px; margin-bottom: 10px;"></div>
                            <div style="font-weight: bold;">Dirección del Plantel</div>
                        </div>
                    </div>
                </div>`;

                // ESPERAR Y CAPTURAR
                await new Promise(resolve => setTimeout(resolve, 200)); 
                const canvas = await html2canvas(printCont, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
                const imgData = canvas.toDataURL('image/png');

                if (pageCount > 0) pdf.addPage();
                
                const ratio = canvas.width / canvas.height;
                let finalW = pdfW - 20;
                let finalH = finalW / ratio;
                
                if (finalH > (pdfH - 20)) { finalH = pdfH - 20; finalW = finalH * ratio; }

                pdf.addImage(imgData, 'PNG', 10, 10, finalW, finalH);
                pageCount++;
            }
        }

        if(pageCount === 0) {
            App.hideLoader();
            return Swal.fire('Error', 'No se pudo generar el reporte.', 'error');
        }

        pdf.save(`Guardias_Transporte_${formatD.replace(/\//g, '-')}.pdf`);
        printCont.innerHTML = '';
        App.hideLoader();
        Swal.fire('Éxito', 'Reporte de Guardias generado (1 por página)', 'success');
    }
};