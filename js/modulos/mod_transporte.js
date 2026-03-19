/**
 * MÓDULO: TRANSPORTE ESCOLAR 
 * ACTUALIZADO: BLINDAJE JSON PARA LECTURA SEGURA DE RUTAS Y TRACKING
 */

window.ModTransporte = {
    paradas: [], rutas: [], docentes: [], trackingHoy: [], paradasTemporalesRuta: [],
    editandoParadaId: null, editandoRutaId: null, vistaActualOculta: null,
    
    init: function() {
        this.dibujarDashboardTarjetas();
        this.cargarTodo();
    },

    dibujarDashboardTarjetas: function() {
        const estilos = `<style>.tarjeta-sub { background: #ffffff; border-radius: 20px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; overflow: hidden; position: relative; display: flex; flex-direction: column; text-align: left; }.tarjeta-sub:hover { transform: translateY(-8px); box-shadow: 0 15px 35px rgba(0,0,0,0.1) !important; }.tarjeta-sub .bg-icono-gigante { position: absolute; right: -20px; bottom: -20px; font-size: 8rem; opacity: 0.03; transition: transform 0.5s ease; pointer-events: none; }.tarjeta-sub:hover .bg-icono-gigante { transform: scale(1.2) rotate(-10deg); }.tarjeta-sub .icono-sub { width: 60px; height: 60px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin-bottom: 1.2rem; transition: transform 0.3s ease; }.tarjeta-sub:hover .icono-sub { transform: scale(1.1); }.tarjeta-sub.bloqueado { filter: grayscale(100%); opacity: 0.7; cursor: not-allowed; }
        @keyframes pulso-vivo { 0% { box-shadow: 0 0 0 0 rgba(13, 202, 240, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(13, 202, 240, 0); } 100% { box-shadow: 0 0 0 0 rgba(13, 202, 240, 0); } }
        .nodo-activo .timeline-icon { animation: pulso-vivo 2s infinite; border-color: #0dcaf0; background-color: #e0f2fe; }
        .nodo-completado .timeline-icon { border-color: #198754; color: white; background-color: #198754; }
        .nodo-completado .timeline-content { border-color: #198754; background-color: #f0fdf4; }
        .nodo-pendiente .timeline-icon { border-color: #cbd5e1; color: #cbd5e1; }
        .nodo-pendiente .timeline-content { opacity: 0.7; }
        </style>`;
        
        let cNara = { bg: 'linear-gradient(135deg, #ffffff 0%, #fff5f2 100%)', b: '#ffdac2', t: '#f97316' };
        let cAmar = { bg: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)', b: '#fde68a', t: '#d97706' };
        let cPurp = { bg: 'linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%)', b: '#ddd6fe', t: '#6d28d9' };
        let cVerd = { bg: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)', b: '#bbf7d0', t: '#198754' };

        let pParadas = window.Aplicacion.permiso('Transporte: Paradas', 'ver');
        let pRutas = window.Aplicacion.permiso('Transporte: Rutas', 'ver');
        
        let miRol = window.Aplicacion.usuario ? window.Aplicacion.usuario.rol : '';
        let pOperacion = ['Administrador', 'Directivo', 'Coordinador', 'Transporte', 'Docente'].includes(miRol);
        let pVisor = true; 

        let crearTarjeta = (tit, desc, ico, acc, c, px, col) => {
            if(!px) return `<div class="${col}"><div class="tarjeta-sub p-4 h-100 shadow-sm bloqueado" style="background:#f8fafc; border:1px solid #e2e8f0;" onclick="Swal.fire('Bloqueado','Módulo exclusivo para Coordinación o Docentes asignados.','error')"><i class="bi ${ico} text-muted bg-icono-gigante"></i><div class="icono-sub shadow-sm" style="color:#64748b; background:white; border:1px solid #e2e8f0;"><i class="bi bi-lock-fill"></i></div><h5 class="fw-bold text-muted mb-2" style="position:relative; z-index:2;">${tit}</h5><p class="small text-muted mb-0" style="position:relative; z-index:2;">${desc}</p></div></div>`;
            return `<div class="${col} animate__animated animate__fadeInUp"><div class="tarjeta-sub p-4 h-100 shadow-sm" style="background:${c.bg}; border:1px solid ${c.b};" onclick="${acc}"><i class="bi ${ico} text-dark bg-icono-gigante"></i><div class="icono-sub shadow-sm" style="color:${c.t}; background:white; border:1px solid ${c.b};"><i class="bi ${ico}"></i></div><h5 class="fw-bold text-dark mb-2" style="position:relative; z-index:2;">${tit}</h5><p class="small text-muted mb-0" style="position:relative; z-index:2;">${desc}</p><div class="mt-auto pt-3 d-flex align-items-center fw-bold" style="color:${c.t}; font-size:0.9rem; position:relative; z-index:2;">Entrar <i class="bi bi-arrow-right ms-2"></i></div></div></div>`;
        };

        let html = estilos + 
            crearTarjeta('Paradas de Control', 'Crear puntos de recogida.', 'bi-geo-alt-fill', "window.ModTransporte.abrirVistaSegura('Paradas')", cNara, pParadas, 'col-md-6 col-xl-3') + 
            crearTarjeta('Diseño de Rutas', 'Armar secuencias.', 'bi-sign-turn-right-fill', "window.ModTransporte.abrirVistaSegura('Rutas')", cAmar, pRutas, 'col-md-6 col-xl-3') + 
            crearTarjeta('Operación de Ruta', 'Marcar hora y salida.', 'bi-broadcast', "window.ModTransporte.abrirVistaSegura('Operacion')", cPurp, pOperacion, 'col-md-6 col-xl-3') +
            crearTarjeta('Visor de Recorrido', 'Seguimiento para padres.', 'bi-eye-fill', "window.ModTransporte.abrirVistaSegura('Visor')", cVerd, pVisor, 'col-md-6 col-xl-3');
        
        document.getElementById('transporte-dashboard').innerHTML = html;

        if(!window.Aplicacion.permiso('Transporte: Paradas', 'crear')) { let fp = document.getElementById('form-paradas-area'); if(fp) fp.innerHTML = `<div class="text-center py-4"><i class="bi bi-lock fs-1 text-muted"></i><p class="mt-2 text-muted small">Sin permiso</p></div>`; }
        if(!window.Aplicacion.permiso('Transporte: Rutas', 'crear')) { let fr = document.getElementById('form-rutas-area'); if(fr) fr.innerHTML = `<div class="text-center py-4"><i class="bi bi-lock fs-1 text-muted"></i><p class="mt-2 text-muted small">Sin permiso</p></div>`; }
    },

    abrirVistaSegura: function(vista) {
        let dash = document.getElementById('transporte-dashboard'); dash.classList.add('animate__fadeOutLeft');
        setTimeout(() => {
            dash.classList.add('d-none'); dash.classList.remove('animate__fadeOutLeft');
            let panel = document.getElementById(`vista-${vista.toLowerCase()}`); 
            panel.classList.remove('d-none'); panel.classList.add('animate__fadeInRight');
            document.getElementById('btn-volver-dashboard').classList.remove('d-none'); document.getElementById('btn-volver-dashboard').classList.add('animate__fadeIn');
            
            let tituloModulo = `Gestión de ${vista}`;
            if(vista === 'Paradas' && window.Aplicacion.permiso('Transporte: Paradas', 'crear')) { tituloModulo += ` <button class="btn btn-sm btn-dark shadow-sm ms-3" onclick="window.ModTransporte.cargaMasivaParadas()"><i class="bi bi-cloud-arrow-up-fill me-1"></i> Importar CSV</button>`; }
            let elTitulo = document.getElementById('titulo-pagina'); if(elTitulo) elTitulo.innerHTML = tituloModulo;
            
            this.vistaActualOculta = vista;
            if(vista === 'Rutas') this.dibujarRutogramaVivo();
            if(vista === 'Operacion') { this.dibujarBotonMasivo(); this.cargarOperacion(); }
            if(vista === 'Visor') this.cargarVisor(); 
        }, 300);
    },

    volverDashboard: function() {
        if(!this.vistaActualOculta) return;
        let panel = document.getElementById(`vista-${this.vistaActualOculta.toLowerCase()}`); panel.classList.replace('animate__fadeInRight', 'animate__fadeOutRight');
        document.getElementById('btn-volver-dashboard').classList.add('d-none');
        setTimeout(() => {
            panel.classList.add('d-none'); panel.classList.remove('animate__fadeOutRight');
            let dash = document.getElementById('transporte-dashboard'); dash.classList.remove('d-none'); dash.classList.add('animate__fadeInLeft');
            let elTitulo = document.getElementById('titulo-pagina'); if(elTitulo) elTitulo.innerText = "Transporte Escolar"; 
            this.vistaActualOculta = null;
        }, 300);
    },

    obtenerFechaHoy: function() { const hoy = new Date(); return `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`; },

    cargarTodo: function(silencioso = false) {
        if(!silencioso && typeof window.Aplicacion !== 'undefined') window.Aplicacion.mostrarCarga();
        window.Aplicacion.peticion({ action: "get_transporte_data", fecha_hoy: this.obtenerFechaHoy() }, (res) => {
            if(!silencioso && typeof window.Aplicacion !== 'undefined') window.Aplicacion.ocultarCarga(); 
            if (res && res.status === "success") {
                this.paradas = res.paradas || []; this.rutas = res.rutas || []; this.docentes = res.docentes || []; this.trackingHoy = res.tracking || [];
                this.dibujarTablaParadas(); this.dibujarTarjetasRutas(); this.llenarSelectores();
                if(this.vistaActualOculta === 'Operacion') this.cargarOperacion();
                if(this.vistaActualOculta === 'Visor') this.reRenderVisorSilencioso(); 
            }
        });
    },

    // ==========================================
    // PARADAS Y RUTAS (BÁSICOS)
    // ==========================================
    dibujarTablaParadas: function() { const tbody = document.getElementById('tabla-paradas'); if(!tbody) return; let html = ''; let pe = window.Aplicacion.permiso('Transporte: Paradas', 'editar'); let peL = window.Aplicacion.permiso('Transporte: Paradas', 'eliminar'); this.paradas.forEach(p => { let btnE = pe ? `<button class="btn btn-sm btn-light border text-primary me-1 shadow-sm" onclick="window.ModTransporte.cargarParaEditarParada('${p.id_parada}')"><i class="bi bi-pencil-fill"></i></button>` : ''; let btnL = peL ? `<button class="btn btn-sm btn-light border text-danger shadow-sm" onclick="window.ModTransporte.eliminarParada('${p.id_parada}')"><i class="bi bi-trash-fill"></i></button>` : ''; html += `<tr><td class="fw-bold text-dark ps-3"><i class="bi bi-geo-alt-fill text-danger me-2"></i>${p.nombre_parada}</td><td class="text-muted small">${p.referencia}</td><td class="text-end pe-3 text-nowrap">${btnE}${btnL}</td></tr>`; }); tbody.innerHTML = html || `<tr><td colspan="3" class="text-center py-4 text-muted"><i class="bi bi-signpost-split fs-1 d-block mb-3"></i>No hay paradas.</td></tr>`; },
    guardarParada: function() { let nombre = document.getElementById('txt-parada-nombre').value.trim(); let ref = document.getElementById('txt-parada-ref').value.trim(); if(!nombre) return Swal.fire('Atención', 'El nombre es obligatorio', 'warning'); let p = { action: 'save_parada', nombre_parada: nombre, referencia: ref }; if(this.editandoParadaId) p.id_parada = this.editandoParadaId; window.Aplicacion.mostrarCarga(); window.Aplicacion.peticion(p, (res) => { window.Aplicacion.ocultarCarga(); if(res && res.status === 'success') { this.cancelarEdicionParada(); Swal.fire({toast:true, position:'top-end', icon:'success', title:'Guardado.', showConfirmButton:false, timer:2000}); this.cargarTodo(true); } }); },
    eliminarParada: function(id) { Swal.fire({title:'¿Borrar parada?', icon:'warning', showCancelButton:true, confirmButtonColor: '#dc3545', confirmButtonText: 'Sí, borrar'}).then((r) => { if(r.isConfirmed) { window.Aplicacion.peticion({action:'delete_parada', id_parada: id}, () => this.cargarTodo(true)); } }); },
    cargarParaEditarParada: function(id) { let p = this.paradas.find(x => x.id_parada === id); if(p) { this.editandoParadaId = id; document.getElementById('txt-parada-nombre').value = p.nombre_parada; document.getElementById('txt-parada-ref').value = p.referencia; document.getElementById('btn-guardar-parada').innerText = "Actualizar"; document.getElementById('btn-cancelar-parada').classList.remove('d-none'); } },
    cancelarEdicionParada: function() { this.editandoParadaId = null; document.getElementById('txt-parada-nombre').value = ''; document.getElementById('txt-parada-ref').value = ''; document.getElementById('btn-guardar-parada').innerHTML = 'Guardar'; document.getElementById('btn-cancelar-parada').classList.add('d-none'); },
    cargaMasivaParadas: function() { Swal.fire({ title: 'Importar Paradas', html: `<div class="text-start"><p class="text-muted small mb-3">Sube un archivo <b>.CSV</b>.</p><input type="file" id="archivo-csv-paradas" class="form-control mb-3" accept=".csv"><div class="mt-3 text-center"><a href="javascript:void(0)" onclick="window.ModTransporte.descargarPlantillaCSV()" class="small text-primary fw-bold text-decoration-none"><i class="bi bi-download me-1"></i> Descargar plantilla</a></div></div>`, showCancelButton: true, confirmButtonText: '<i class="bi bi-cloud-upload me-1"></i> Procesar', confirmButtonColor: '#0066FF', preConfirm: () => { let file = document.getElementById('archivo-csv-paradas').files[0]; if (!file) { Swal.showValidationMessage('Seleccione archivo'); return false; } return file; } }).then((res) => { if(res.isConfirmed && res.value) { let reader = new FileReader(); reader.onload = (e) => { this.procesarYEnviarCSV(e.target.result); }; reader.readAsText(res.value, 'UTF-8'); } }); },
    procesarYEnviarCSV: function(textoCSV) { let lineas = textoCSV.split(/\r\n|\n/).filter(l => l.trim() !== ""); let paradasMasivas = []; for(let i = 1; i < lineas.length; i++) { let separador = lineas[i].includes(';') ? ';' : ','; let cols = lineas[i].split(separador); if(cols.length >= 1) { let nombre = cols[0] ? cols[0].trim() : ""; let referencia = cols[1] ? cols[1].trim() : ""; if(nombre) paradasMasivas.push({ nombre_parada: nombre, referencia: referencia }); } } if(paradasMasivas.length === 0) return Swal.fire('Error', 'Archivo sin datos', 'error'); window.Aplicacion.mostrarCarga(); window.Aplicacion.peticion({ action: 'save_paradas_bulk', paradas: paradasMasivas }, (res) => { window.Aplicacion.ocultarCarga(); if(res && res.status === 'success') { Swal.fire('¡Éxito!', res.message, 'success'); this.cargarTodo(true); } else { Swal.fire('Error', res.message, 'error'); } }); },
    descargarPlantillaCSV: function() { let csvContent = "Nombre_Parada;Referencia\nParada Centro;Plaza\n"; let blob = new Blob(["\uFEFF"+csvContent], { type: 'text/csv;charset=utf-8;' }); let link = document.createElement("a"); link.setAttribute("href", URL.createObjectURL(blob)); link.setAttribute("download", "Plantilla_Paradas.csv"); document.body.appendChild(link); link.click(); document.body.removeChild(link); },

    // ==========================================
    // SELECTORES Y DIBUJO DE RUTAS
    // ==========================================
    llenarSelectores: function() {
        let docentesOcupados = this.rutas.filter(r => r.id_ruta !== this.editandoRutaId).map(r => String(r.cedula_docente));
        let selDoc = document.getElementById('sel-ruta-docente'); let htmlDoc = '<option value="">-- Sin Asignar --</option>'; 
        this.docentes.forEach(d => { if(!docentesOcupados.includes(String(d.cedula))) htmlDoc += `<option value="${d.cedula}">${d.nombre_completo || d.nombre} (${d.rol})</option>`; }); 
        if(selDoc) selDoc.innerHTML = htmlDoc;

        let paradasOcupadas = [];
        this.rutas.forEach(r => { 
            if(r.id_ruta !== this.editandoRutaId) { 
                try { 
                    // ✨ BLINDAJE JSON ✨
                    let arr = typeof r.paradas_json === 'string' ? JSON.parse(r.paradas_json || "[]") : (r.paradas_json || []); 
                    paradasOcupadas = paradasOcupadas.concat(arr); 
                } catch(e){} 
            } 
        });
        
        let paradasActualesBorrador = this.paradasTemporalesRuta.map(p => p.id_parada);
        let selPar = document.getElementById('sel-add-parada'); let htmlPar = '<option value="">-- Seleccione parada --</option>'; 
        this.paradas.forEach(p => { if(!paradasOcupadas.includes(p.id_parada) && !paradasActualesBorrador.includes(p.id_parada)) htmlPar += `<option value="${p.id_parada}">${p.nombre_parada}</option>`; }); 
        if(selPar) selPar.innerHTML = htmlPar;

        let htmlMon = '<option value="">-- Seleccione Ruta --</option>'; 
        this.rutas.forEach(r => htmlMon += `<option value="${r.id_ruta}">${r.nombre_ruta}</option>`); 
        
        let sOp = document.getElementById('op-sel-ruta'); if(sOp) { let vO = sOp.value; sOp.innerHTML = htmlMon; sOp.value = vO; }
        let sVis = document.getElementById('vis-sel-ruta'); if(sVis) { let vV = sVis.value; sVis.innerHTML = htmlMon; sVis.value = vV; }
    },

    agregarParadaARuta: function() { let sel = document.getElementById('sel-add-parada'); let id = sel.value; if(!id) return; let p = this.paradas.find(x => x.id_parada === id); if(p) { this.paradasTemporalesRuta.push(p); this.dibujarRutogramaVivo(); this.llenarSelectores(); } },
    quitarParadaDeRuta: function(index) { this.paradasTemporalesRuta.splice(index, 1); this.dibujarRutogramaVivo(); this.llenarSelectores(); },
    dibujarRutogramaVivo: function() { let visor = document.getElementById('visor-rutograma-vivo'); if(!visor) return; if(this.paradasTemporalesRuta.length === 0) { visor.innerHTML = '<div class="text-center text-muted small border rounded-3 p-4 bg-light shadow-sm">Añada paradas en la parte superior.</div>'; return; } let html = '<div class="timeline-rutograma"><div class="timeline-node animate__animated animate__fadeInDown"><div class="timeline-icon start"><i class="bi bi-bus-front-fill"></i></div><div class="timeline-content border-warning border-2 shadow-sm"><span class="fw-bold text-dark mb-0">Inicio del Recorrido</span></div></div>'; this.paradasTemporalesRuta.forEach((p, idx) => { html += `<div class="timeline-node animate__animated animate__fadeInLeft" style="animation-delay: 0.${idx}s"><div class="timeline-icon stop"><i class="bi bi-signpost-fill"></i></div><div class="timeline-content shadow-sm"><div><span class="badge bg-info text-dark me-2">${idx+1}</span><span class="fw-bold text-dark">${p.nombre_parada}</span></div><button class="btn btn-sm text-danger p-0 ms-2 hover-efecto" title="Remover de la ruta" onclick="window.ModTransporte.quitarParadaDeRuta(${idx})"><i class="bi bi-x-circle-fill fs-5"></i></button></div></div>`; }); html += `<div class="timeline-node animate__animated animate__fadeInUp" style="animation-delay: 0.${this.paradasTemporalesRuta.length}s"><div class="timeline-icon end"><i class="bi bi-building-fill"></i></div><div class="timeline-content border-success border-2 shadow-sm"><span class="fw-bold text-success mb-0">U.E. Libertador Bolívar</span></div></div></div>`; visor.innerHTML = html; },
    verDetalleRuta: function(idRuta) { 
        let r = this.rutas.find(x => x.id_ruta === idRuta); if(!r) return; 
        let doc = this.docentes.find(d => String(d.cedula) === String(r.cedula_docente)); 
        let nombreDoc = doc ? (doc.nombre_completo || doc.nombre) : 'Sin asignar'; 
        let telDoc = doc && doc.telefono ? doc.telefono : 'No registrado'; 
        
        // ✨ BLINDAJE JSON ✨
        let idArr = []; 
        try { idArr = typeof r.paradas_json === 'string' ? JSON.parse(r.paradas_json || "[]") : (r.paradas_json || []); } catch(e){} 
        
        let html = `<div class="text-start"><div class="mb-4 text-center"><span class="badge bg-warning text-dark shadow-sm me-2 py-2 px-3 mb-2"><i class="bi bi-person-vcard me-1"></i> Chofer: ${r.chofer}</span><span class="badge bg-primary shadow-sm py-2 px-3 mb-2"><i class="bi bi-person-video3 me-1"></i> Guía: ${nombreDoc}</span><div class="mt-2 text-muted small"><i class="bi bi-telephone-fill me-1 text-success"></i> Teléfono del Guía: <span class="fw-bold">${telDoc}</span></div></div><div class="timeline-rutograma mt-3 pt-2"><div class="timeline-node"><div class="timeline-icon start"><i class="bi bi-bus-front-fill"></i></div><div class="timeline-content border-warning border-2 shadow-sm"><span class="fw-bold text-dark mb-0">Inicio del Recorrido</span></div></div>`; 
        idArr.forEach((pid, idx) => { let p = this.paradas.find(x => x.id_parada === pid); if(p) { html += `<div class="timeline-node"><div class="timeline-icon stop"><i class="bi bi-signpost-fill"></i></div><div class="timeline-content shadow-sm"><div><span class="badge bg-info text-dark me-2">${idx+1}</span><span class="fw-bold text-dark">${p.nombre_parada}</span></div>${p.referencia ? `<div class="small text-muted fst-italic ms-2">${p.referencia}</div>` : ''}</div></div>`; } }); 
        html += `<div class="timeline-node"><div class="timeline-icon end"><i class="bi bi-building-fill"></i></div><div class="timeline-content border-success border-2 shadow-sm"><span class="fw-bold text-success mb-0">Llegada U.E. Libertador Bolívar</span></div></div></div></div>`; 
        Swal.fire({ title: `<div class="text-primary fw-bold fs-3"><i class="bi bi-map-fill me-2"></i>${r.nombre_ruta}</div>`, html: html, confirmButtonText: 'Cerrar Visor', confirmButtonColor: '#0066FF', width: '600px' }); 
    },
    guardarRuta: function() { let n = document.getElementById('txt-ruta-nombre').value.trim(); let c = document.getElementById('txt-ruta-chofer').value.trim(); let d = document.getElementById('sel-ruta-docente').value; if(!n || !c) return Swal.fire('Atención', 'Faltan datos.', 'warning'); if(this.paradasTemporalesRuta.length === 0) return Swal.fire('Atención', 'Añada al menos una parada.', 'warning'); let ids = this.paradasTemporalesRuta.map(p => p.id_parada); window.Aplicacion.mostrarCarga(); window.Aplicacion.peticion({ action: 'save_ruta', id_ruta: this.editandoRutaId, nombre_ruta: n, chofer: c, cedula_docente: d, paradas_array: ids }, (res) => { window.Aplicacion.ocultarCarga(); if(res && res.status === 'success') { Swal.fire({toast:true, position:'top-end', icon:'success', title:'Guardado', showConfirmButton:false, timer:2000}); this.cancelarEdicionRuta(); this.cargarTodo(true); } }); },
    editarRuta: function(id) { 
        let r = this.rutas.find(x => x.id_ruta === id); if(!r) return; 
        this.editandoRutaId = id; document.getElementById('txt-ruta-nombre').value = r.nombre_ruta; document.getElementById('txt-ruta-chofer').value = r.chofer; 
        this.paradasTemporalesRuta = []; 
        try { 
            // ✨ BLINDAJE JSON ✨
            let idArr = typeof r.paradas_json === 'string' ? JSON.parse(r.paradas_json || "[]") : (r.paradas_json || []); 
            idArr.forEach(pid => { let pObj = this.paradas.find(p => p.id_parada === pid); if(pObj) this.paradasTemporalesRuta.push(pObj); }); 
        } catch(e){} 
        this.llenarSelectores(); document.getElementById('sel-ruta-docente').value = r.cedula_docente || ""; this.dibujarRutogramaVivo(); document.getElementById('btn-guardar-ruta').innerText = "Actualizar Ruta"; document.getElementById('btn-cancelar-ruta').classList.remove('d-none'); 
    },
    eliminarRuta: function(id) { Swal.fire({title:'¿Borrar Ruta?', icon:'warning', showCancelButton:true, confirmButtonColor: '#dc3545'}).then(r => { if(r.isConfirmed) { window.Aplicacion.peticion({action:'delete_ruta', id_ruta: id}, () => this.cargarTodo(true)); } }); },
    cancelarEdicionRuta: function() { this.editandoRutaId = null; document.getElementById('txt-ruta-nombre').value = ''; document.getElementById('txt-ruta-chofer').value = ''; document.getElementById('sel-ruta-docente').value = ''; this.paradasTemporalesRuta = []; this.dibujarRutogramaVivo(); this.llenarSelectores(); document.getElementById('btn-guardar-ruta').innerText = "Guardar Ruta"; document.getElementById('btn-cancelar-ruta').classList.add('d-none'); },

    dibujarTarjetasRutas: function() {
        let tituloActivas = document.querySelector('#vista-rutas .col-xl-7 h5');
        if(tituloActivas && !document.getElementById('btn-batch-pdf')) {
            tituloActivas.innerHTML = `<div class="d-flex justify-content-between align-items-center flex-wrap"><div class="fw-bold mb-2 mb-md-0"><i class="bi bi-signpost-split-fill text-success me-2"></i>Rutas Activas</div><button id="btn-batch-pdf" class="btn btn-sm btn-danger shadow-sm hover-efecto rounded-pill px-3 fw-bold" onclick="window.ModTransporte.abrirSelectorLotePDF()"><i class="bi bi-file-earmark-pdf-fill me-1"></i> Descargar Rutogramas</button></div>`;
        }

        let tbody = document.getElementById('tabla-rutas'); if(!tbody) return;
        if(this.rutas.length === 0) { tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted">No hay rutas.</td></tr>'; return; }
        let html = ''; let pEL = window.Aplicacion.permiso('Transporte: Rutas', 'eliminar'); let pED = window.Aplicacion.permiso('Transporte: Rutas', 'editar');
        this.rutas.forEach(r => {
            let doc = this.docentes.find(d => String(d.cedula) === String(r.cedula_docente)); 
            
            // ✨ BLINDAJE JSON ✨
            let idArr = []; try { idArr = typeof r.paradas_json === 'string' ? JSON.parse(r.paradas_json || "[]") : (r.paradas_json || []); } catch(e){}
            
            let btnV = `<button class="btn btn-sm btn-light border text-success shadow-sm me-1" title="Ver Recorrido" onclick="window.ModTransporte.verDetalleRuta('${r.id_ruta}')"><i class="bi bi-eye-fill"></i></button>`;
            let btnE = pED ? `<button class="btn btn-sm btn-light border text-primary shadow-sm me-1" onclick="window.ModTransporte.editarRuta('${r.id_ruta}')"><i class="bi bi-pencil-fill"></i></button>` : '';
            let btnL = pEL ? `<button class="btn btn-sm btn-light border text-danger shadow-sm" onclick="window.ModTransporte.eliminarRuta('${r.id_ruta}')"><i class="bi bi-trash-fill"></i></button>` : '';
            html += `<tr><td class="ps-3 fw-bold text-primary">${r.nombre_ruta}</td><td class="small"><div class="text-muted"><i class="bi bi-person-vcard me-1"></i>Chofer: <span class="fw-bold text-dark">${r.chofer}</span></div><div><i class="bi bi-person-video3 me-1"></i>Guía: <span class="fw-bold text-dark">${doc ? doc.nombre_completo || doc.nombre : 'N/A'}</span></div></td><td class="text-center"><span class="badge bg-success rounded-pill px-2 py-1">${idArr.length}</span></td><td class="text-end pe-3 text-nowrap">${btnV}${btnE}${btnL}</td></tr>`;
        }); tbody.innerHTML = html;
    },

    // ==========================================
    // ✨ SISTEMA DUAL: OPERACIÓN Y VISOR ✨
    // ==========================================
    dibujarBotonMasivo: function() {
        let area = document.getElementById('area-btn-masivo');
        if(!area) return;
        let rol = window.Aplicacion.usuario ? window.Aplicacion.usuario.rol : '';
        let esCoordinador = ["Administrador", "Directivo", "Transporte", "Coordinador"].includes(rol);
        if(esCoordinador) { area.innerHTML = `<button class="btn btn-warning text-dark fw-bold shadow-sm rounded-pill hover-efecto px-4" onclick="window.ModTransporte.marcarSalidaMasivaRetorno()"><i class="bi bi-megaphone-fill text-danger me-2"></i>Despacho Masivo</button>`; } 
        else { area.innerHTML = ''; }
    },
    
    refrescarVisor: function() {
        let idRuta = document.getElementById('vis-sel-ruta').value;
        if(!idRuta) return; 
        this.cargarTodo(false); 
    },

    reRenderVisorSilencioso: function() {
        let divArea = document.getElementById('vis-recorrido-area');
        if(!divArea || divArea.classList.contains('d-none')) return; 
        this.renderizarLineaTiempo('vis-sel-ruta', 'vis-sel-momento', 'vis-recorrido-area', false);
    },

    formatearHoraAMPM: function(time24) {
        let parts = time24.split(':');
        let h = parseInt(parts[0]); let m = parts[1];
        let ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12; h = h ? h : 12;
        return `${String(h).padStart(2,'0')}:${m} ${ampm}`;
    },

    cargarOperacion: function() { this.renderizarLineaTiempo('op-sel-ruta', 'op-sel-momento', 'op-recorrido-area', true); },
    cargarVisor: function() { this.renderizarLineaTiempo('vis-sel-ruta', 'vis-sel-momento', 'vis-recorrido-area', false); },

    renderizarLineaTiempo: function(idSelectRuta, idSelectMomento, idDivArea, esOperacion) {
        let idRuta = document.getElementById(idSelectRuta).value; 
        let tipo = document.getElementById(idSelectMomento).value;
        let divArea = document.getElementById(idDivArea);
        
        if(!idRuta) { divArea.classList.add('d-none'); return; }

        let ruta = this.rutas.find(r => r.id_ruta === idRuta); if(!ruta) return;
        divArea.classList.remove('d-none');

        let trackActual = this.trackingHoy.find(t => t.id_ruta === idRuta && t.tipo_recorrido === tipo);
        
        // ✨ BLINDAJE JSON PARA ESTADO ✨
        let marcadas = {}; 
        if(trackActual) { 
            try { marcadas = typeof trackActual.estado_json === 'string' ? JSON.parse(trackActual.estado_json || "{}") : (trackActual.estado_json || {}); } catch(e){} 
        }
        
        // ✨ BLINDAJE JSON PARA PARADAS ✨
        let rutaIds = []; 
        try { rutaIds = typeof ruta.paradas_json === 'string' ? JSON.parse(ruta.paradas_json || "[]") : (ruta.paradas_json || []); } catch(e){}
        
        let puntosRecorrido = [];
        
        if (tipo === 'Ida') {
            rutaIds.forEach(id => { let p = this.paradas.find(x => x.id_parada === id); if(p) puntosRecorrido.push({id: p.id_parada, nombre: p.nombre_parada, ref: p.referencia, tipo: 'parada'}); });
            puntosRecorrido.push({id: 'escuela', nombre: 'U.E. Libertador Bolívar', ref: 'Llegada a la Institución', tipo: 'llegada'});
        } else {
            puntosRecorrido.push({id: 'escuela', nombre: 'U.E. Libertador Bolívar', ref: 'Salida de la Institución', tipo: 'salida'});
            let reversa = [...rutaIds].reverse();
            reversa.forEach(id => { let p = this.paradas.find(x => x.id_parada === id); if(p) puntosRecorrido.push({id: p.id_parada, nombre: p.nombre_parada, ref: p.referencia, tipo: 'parada'}); });
        }

        let rol = window.Aplicacion.usuario ? window.Aplicacion.usuario.rol : '';
        let miCedula = window.Aplicacion.usuario ? String(window.Aplicacion.usuario.cedula) : '';
        let esCoordinador = ["Administrador", "Directivo", "Transporte", "Coordinador"].includes(rol);
        let esDocenteRuta = (miCedula === String(ruta.cedula_docente));
        
        let puedeMarcar = esOperacion && (esCoordinador || esDocenteRuta);

        let btnMasivo = '';
        if (esOperacion && tipo === 'Retorno' && esCoordinador) {
            btnMasivo = `<div class="mb-4 text-center border-bottom border-2 pb-3 animate__animated animate__fadeIn">
                            <button class="btn btn-warning text-dark fw-bold shadow-sm rounded-pill px-4 hover-efecto" onclick="window.ModTransporte.marcarSalidaMasivaRetorno()">
                                <i class="bi bi-megaphone-fill me-2 text-danger"></i>Marcar Salida Masiva de la Escuela
                            </button>
                            <p class="small text-muted mt-2 mb-0">Asigna la hora de salida oficial a TODAS las rutas activas simultáneamente.</p>
                         </div>`;
        }

        let infoVisor = '';
        if(!esOperacion) {
            let doc = this.docentes.find(d => String(d.cedula) === String(ruta.cedula_docente));
            let nombreDoc = doc ? (doc.nombre_completo || doc.nombre) : 'Sin asignar';
            let telDoc = doc && doc.telefono ? doc.telefono : 'No registrado';
            infoVisor = `<div class="mb-4 p-3 bg-white border border-success rounded-4 shadow-sm text-center">
                            <div class="row">
                                <div class="col-6 border-end"><span class="small text-muted d-block">Chofer</span><span class="fw-bold text-dark"><i class="bi bi-person-vcard me-1 text-warning"></i>${ruta.chofer}</span></div>
                                <div class="col-6"><span class="small text-muted d-block">Docente Guía</span><span class="fw-bold text-dark"><i class="bi bi-person-video3 me-1 text-primary"></i>${nombreDoc}</span><br><span class="small text-success fw-bold"><i class="bi bi-telephone-fill me-1"></i>${telDoc}</span></div>
                            </div>
                         </div>`;
        }

        let htmlTimeline = infoVisor + btnMasivo + '<div class="timeline-rutograma mt-2">';
        let nodoAnteriorCompletado = true;
        let todosMarcados = true; 

        puntosRecorrido.forEach((pto) => {
            let horaPaso = marcadas[pto.id];
            
            if(!horaPaso) todosMarcados = false; 

            let estadoClase = '';
            if (horaPaso) { estadoClase = 'nodo-completado'; nodoAnteriorCompletado = true; } 
            else if (nodoAnteriorCompletado) { estadoClase = 'nodo-activo'; nodoAnteriorCompletado = false; } 
            else { estadoClase = 'nodo-pendiente'; }

            let icono = 'bi-signpost-fill';
            if(pto.tipo === 'salida') icono = 'bi-building-fill-up';
            if(pto.tipo === 'llegada') icono = 'bi-building-fill-down';

            let iconBusVisor = '';
            if(!esOperacion && estadoClase === 'nodo-activo') {
                iconBusVisor = `<span class="badge bg-primary rounded-pill position-absolute shadow-sm" style="right: -10px; top: -10px; font-size: 1rem; animation: flotar-suave 2s infinite;"><i class="bi bi-bus-front-fill me-1"></i> Aquí viene</span>`;
            }

            let botonMarcar = '';
            if (puedeMarcar && !horaPaso) {
                let textoBtn = pto.tipo === 'salida' ? 'Marcar Salida' : (pto.tipo === 'llegada' ? 'Marcar Llegada' : 'Pasó el Bus');
                botonMarcar = `<button class="btn btn-sm btn-info text-white fw-bold shadow-sm rounded-pill px-3 ms-auto hover-efecto" onclick="window.ModTransporte.preguntarHoraCheckPoint('${idRuta}', '${tipo}', '${pto.id}')"><i class="bi bi-clock-history me-1"></i> ${textoBtn}</button>`;
            }

            let badgeHora = horaPaso ? `<span class="badge bg-success ms-2 shadow-sm"><i class="bi bi-check2-all me-1"></i>${horaPaso}</span>` : '';

            htmlTimeline += `
                <div class="timeline-node ${estadoClase} animate__animated animate__fadeInLeft position-relative">
                    ${iconBusVisor}
                    <div class="timeline-icon"><i class="bi ${icono}"></i></div>
                    <div class="timeline-content">
                        <div>
                            <div class="fw-bold fs-6">${pto.nombre} ${badgeHora}</div>
                            <div class="small text-muted fst-italic">${pto.ref || ''}</div>
                        </div>
                        ${botonMarcar}
                    </div>
                </div>
            `;
        });
        
        htmlTimeline += '</div>';

        if(todosMarcados && puntosRecorrido.length > 0) {
            htmlTimeline += `
                <div class="mt-4 p-3 bg-success bg-opacity-10 border border-success rounded-4 text-center animate__animated animate__tada shadow-sm">
                    <i class="bi bi-flag-fill text-success fs-1 d-block mb-2"></i>
                    <h5 class="fw-bold text-success mb-0">¡Fin de la Ruta!</h5>
                    <p class="text-success small mb-0 mt-1">El recorrido ha concluido exitosamente.</p>
                </div>
            `;
        }

        divArea.innerHTML = htmlTimeline;
    },

    preguntarHoraCheckPoint: function(idRuta, tipo, idParada) {
        let d = new Date(); let defaultTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        Swal.fire({
            title: 'Marcar Hora de Paso',
            html: `<label class="fw-bold text-muted small mb-2">Confirme o ajuste la hora en la que el bus pasó por este punto:</label>
                   <input type="time" id="hora-manual-track" class="form-control text-center fs-3 fw-bold text-primary" value="${defaultTime}">`,
            showCancelButton: true, confirmButtonText: '<i class="bi bi-save me-1"></i> Registrar Hora', confirmButtonColor: '#0066FF',
            preConfirm: () => document.getElementById('hora-manual-track').value
        }).then(res => {
            if(res.isConfirmed && res.value) {
                let horaFinal = this.formatearHoraAMPM(res.value);
                this.enviarCheckPoint(idRuta, tipo, idParada, horaFinal);
            }
        });
    },

    marcarSalidaMasivaRetorno: function() {
        if(this.rutas.length === 0) return Swal.fire('Error', 'No hay rutas operativas.', 'error');
        let d = new Date(); let defaultTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        Swal.fire({
            title: 'Despacho Masivo (Retorno)',
            text: 'Se registrará la Salida Oficial desde la Institución para TODAS las rutas activas.',
            html: `<label class="fw-bold text-danger small mb-2 mt-3">Confirme la hora oficial de salida:</label>
                   <input type="time" id="hora-masiva-track" class="form-control border-danger text-center fs-2 fw-bold text-danger" value="${defaultTime}">`,
            showCancelButton: true, confirmButtonText: '<i class="bi bi-megaphone-fill me-1"></i> Procesar Salida Masiva', confirmButtonColor: '#d97706',
            preConfirm: () => document.getElementById('hora-masiva-track').value
        }).then(res => {
            if(res.isConfirmed && res.value) {
                let horaFinal = this.formatearHoraAMPM(res.value);
                window.Aplicacion.mostrarCarga();
                
                let promesas = this.rutas.map(r => {
                    let trackActual = this.trackingHoy.find(t => t.id_ruta === r.id_ruta && t.tipo_recorrido === 'Retorno');
                    
                    // ✨ BLINDAJE JSON PARA ESTADO MASIVO ✨
                    let marcadas = {}; 
                    if(trackActual) { 
                        try { marcadas = typeof trackActual.estado_json === 'string' ? JSON.parse(trackActual.estado_json || "{}") : (trackActual.estado_json || {}); } catch(e){} 
                    }
                    
                    marcadas['escuela'] = horaFinal;
                    return new Promise((resolve) => {
                        window.Aplicacion.peticion({ action: 'update_tracking', fecha_str: this.obtenerFechaHoy(), id_ruta: r.id_ruta, tipo_recorrido: 'Retorno', estado_json: marcadas }, () => resolve(true));
                    });
                });

                Promise.all(promesas).then(() => {
                    window.Aplicacion.ocultarCarga();
                    Swal.fire({toast:true, position:'top-end', icon:'success', title:'Salida Masiva Completada', showConfirmButton:false, timer:2000});
                    this.cargarTodo(true);
                });
            }
        });
    },

    enviarCheckPoint: function(idRuta, tipo, idParada, horaFinal) {
        let trackActual = this.trackingHoy.find(t => t.id_ruta === idRuta && t.tipo_recorrido === tipo);
        
        // ✨ BLINDAJE JSON PARA ACTUALIZAR TRACKING ✨
        let marcadas = {}; 
        if(trackActual) { 
            try { marcadas = typeof trackActual.estado_json === 'string' ? JSON.parse(trackActual.estado_json || "{}") : (trackActual.estado_json || {}); } catch(e){} 
        }
        
        marcadas[idParada] = horaFinal;
        window.Aplicacion.mostrarCarga();
        window.Aplicacion.peticion({ action: 'update_tracking', fecha_str: this.obtenerFechaHoy(), id_ruta: idRuta, tipo_recorrido: tipo, estado_json: marcadas }, (res) => {
            window.Aplicacion.ocultarCarga(); if(res && res.status === 'success') { this.cargarTodo(true); } 
        });
    },

    // ==========================================
    // EXPORTACIÓN PDF (MULTIPÁGINA EN LOTE)
    // ==========================================
    obtenerImagenBase64: function(url) { return new Promise((resolve) => { let img = new Image(); img.crossOrigin = 'Anonymous'; img.onload = () => { let canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height; let ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0); resolve(canvas.toDataURL('image/png')); }; img.onerror = () => resolve(null); img.src = url; }); },
    abrirSelectorLotePDF: function() { if(this.rutas.length === 0) return Swal.fire('Atención', 'No hay rutas registradas para exportar.', 'warning'); let html = `<div class="text-start"><div class="form-check mb-3 border-bottom pb-3"><input class="form-check-input" type="checkbox" id="chk-all-rutas" onchange="document.querySelectorAll('.chk-export-ruta').forEach(c => c.checked = this.checked)" checked><label class="form-check-label fw-bold text-primary" for="chk-all-rutas">Seleccionar Todo el Lote</label></div><div style="max-height: 250px; overflow-y: auto;" class="px-2">`; this.rutas.forEach(r => { html += `<div class="form-check mb-2 bg-light p-2 rounded border border-light"><input class="form-check-input ms-1 chk-export-ruta" type="checkbox" value="${r.id_ruta}" id="chk-exp-${r.id_ruta}" checked><label class="form-check-label ms-2 w-100" for="chk-exp-${r.id_ruta}" style="cursor:pointer;"><i class="bi bi-bus-front me-2 text-muted"></i>${r.nombre_ruta}</label></div>`; }); html += `</div></div>`; Swal.fire({ title: 'Descargar Rutogramas', html: html, showCancelButton: true, confirmButtonText: '<i class="bi bi-file-earmark-pdf-fill me-1"></i> Generar Documento', confirmButtonColor: '#dc3545', preConfirm: () => { let seleccionados = []; document.querySelectorAll('.chk-export-ruta:checked').forEach(c => seleccionados.push(c.value)); if(seleccionados.length === 0) { Swal.showValidationMessage('Seleccione al menos una ruta'); return false; } return seleccionados; } }).then(res => { if(res.isConfirmed) { this.exportarMultiplesRutogramas(res.value); } }); },
    exportarMultiplesRutogramas: async function(idsArray) { Swal.fire({ title: 'Generando Documento...', text: 'Construyendo Rutogramas. Por favor espere.', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); }}); try { let base64LogoEscuela = null; let base64CintilloMPPE = null; try { base64LogoEscuela = await this.obtenerImagenBase64('assets/img/logo.png'); } catch(e){} try { base64CintilloMPPE = await this.obtenerImagenBase64('assets/img/logoMPPE.png'); } catch(e){} const jsPDF = window.jspdf.jsPDF; const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' }); const margin = 20; const pageWidth = doc.internal.pageSize.getWidth(); const pageHeight = doc.internal.pageSize.getHeight(); for(let idx = 0; idx < idsArray.length; idx++) { let idRuta = idsArray[idx]; let ruta = this.rutas.find(r => r.id_ruta === idRuta); if(!ruta) continue; if(idx > 0) doc.addPage(); let docPerfil = this.docentes.find(d => String(d.cedula) === String(ruta.cedula_docente)); let nombreDoc = docPerfil ? docPerfil.nombre_completo || docPerfil.nombre : 'Sin asignar'; let telDoc = docPerfil ? docPerfil.telefono || 'N/A' : 'N/A'; 
        
        // ✨ BLINDAJE JSON PDF ✨
        let rutaIds = []; try { rutaIds = typeof ruta.paradas_json === 'string' ? JSON.parse(ruta.paradas_json || "[]") : (ruta.paradas_json || []); } catch(e){} 
        
        let textX = margin; if (base64LogoEscuela) { doc.addImage(base64LogoEscuela, 'PNG', margin, margin, 16, 16); textX = margin + 20; } doc.setTextColor(30, 41, 59); doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.text("República Bolivariana de Venezuela", textX, margin + 5); doc.text("Ministerio del Poder Popular para la Educación", textX, margin + 10); doc.setFont("helvetica", "bold"); doc.text("Unidad Educativa Libertador Bolívar", textX, margin + 15); doc.setTextColor(0, 102, 255); doc.setFontSize(14); doc.text("RUTOGRAMA DE TRANSPORTE ESCOLAR", pageWidth / 2, margin + 28, { align: "center" }); let anioEscolar = (window.Aplicacion && window.Aplicacion.momentoActual) ? window.Aplicacion.momentoActual.anioEscolar : "2025 - 2026"; doc.setTextColor(100, 116, 139); doc.setFontSize(10); doc.text(`Período Escolar: ${anioEscolar}`, pageWidth / 2, margin + 33, { align: "center" }); doc.setDrawColor(0, 102, 255); doc.setLineWidth(1.5); doc.line(margin, margin + 36, pageWidth - margin, margin + 36); doc.setTextColor(50, 50, 50); doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.text(`Ruta Identificada:`, margin, margin + 45); doc.setFont("helvetica", "normal"); doc.text(`${ruta.nombre_ruta}`, margin + 35, margin + 45); doc.setFont("helvetica", "bold"); doc.text(`Chofer Asignado:`, margin, margin + 52); doc.setFont("helvetica", "normal"); doc.text(`${ruta.chofer}`, margin + 35, margin + 52); doc.setFont("helvetica", "bold"); doc.text(`Docente Guía:`, margin, margin + 59); doc.setFont("helvetica", "normal"); doc.text(`${nombreDoc} (Tel: ${telDoc})`, margin + 30, margin + 59); doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.setTextColor(0,0,0); doc.text("Secuencia de Recorrido (Entrada a la Institución):", margin, margin + 75); doc.setFontSize(11); doc.setFont("helvetica", "normal"); let startY = margin + 85; rutaIds.forEach((id, indexParada) => { let p = this.paradas.find(x => x.id_parada === id); if(p) { if (startY > pageHeight - 30) { doc.addPage(); startY = margin; } doc.setDrawColor(0, 102, 255); doc.setFillColor(255, 255, 255); doc.circle(margin + 5, startY, 2, 'FD'); doc.text(`${indexParada + 1}. ${p.nombre_parada}`, margin + 10, startY + 1); doc.setFontSize(9); doc.setTextColor(100,100,100); doc.text(`Ref: ${p.referencia || 'N/A'}`, margin + 10, startY + 5); doc.setFontSize(11); doc.setTextColor(0,0,0); if (indexParada < rutaIds.length - 1) { doc.setDrawColor(200, 200, 200); doc.line(margin + 5, startY + 2, margin + 5, startY + 13); } startY += 15; } }); if (startY > pageHeight - 30) { doc.addPage(); startY = margin; } doc.setDrawColor(0, 230, 118); doc.setFillColor(0, 230, 118); doc.circle(margin + 5, startY, 2, 'FD'); doc.setFont("helvetica", "bold"); doc.setTextColor(0, 150, 50); doc.text(`LLEGADA: U.E. Libertador Bolívar`, margin + 10, startY + 1); } const pgs = doc.internal.getNumberOfPages(); for(let i=1; i<=pgs; i++) { doc.setPage(i); doc.setDrawColor(220, 38, 38); doc.setLineWidth(0.5); doc.line(margin, pageHeight - margin - 8, pageWidth - margin, pageHeight - margin - 8); if (base64CintilloMPPE) { doc.addImage(base64CintilloMPPE, 'PNG', margin, pageHeight - margin - 6, 35, 6); } doc.setTextColor(100, 116, 139); doc.setFontSize(8); doc.setFont("helvetica", "normal"); const fechaHoy = new Date().toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }); doc.text(`Generado: ${fechaHoy}`, margin + 40, pageHeight - margin - 1.5); doc.text(`Página ${i} de ${pgs}`, pageWidth - margin, pageHeight - margin - 1.5, { align: "right" }); } let nombreArchivo = idsArray.length === 1 ? `Rutograma_${this.rutas.find(r => r.id_ruta === idsArray[0]).nombre_ruta.replace(/\s/g, '_')}` : `Lote_Rutogramas_${new Date().getTime()}`; doc.save(`${nombreArchivo}.pdf`); Swal.close(); Swal.fire({toast:true, position:'top-end', icon:'success', title:'Documento Generado', showConfirmButton:false, timer:2000}); } catch(error) { console.error("Error al generar PDF Múltiple: ", error); Swal.close(); Swal.fire('Error', 'No se pudo generar el documento PDF.', 'error'); } },
    exportarRutograma: function(idRuta) { this.exportarMultiplesRutogramas([idRuta]); }
};

window.init_Transporte_Escolar = function() { window.ModTransporte.init(); };