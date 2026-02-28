/**
 * MÓDULO: ESCUELA (Versión Final Completa y Estable)
 */

const ModEscuela = {
    datosAnios:[], datosLapsos:[], datosNiveles:[], 
    datosGrados:[], datosEscalas:[], datosCargos:[], datosSupervision:[],
    datosHorarios: [], bloquesTemp: [], nivelSeleccionadoHorario: null, datosPerfil: {},
    listaDocentes: [],
    datosAsignaturas: [],

    // ==========================================
    // 1. PERFIL
    // ==========================================
    cargarPerfil: function() {
        Aplicacion.peticion({ action: "get_school_profile" }, (res) => {
            this.datosPerfil = res;
            if(document.getElementById('esc-nombre')) {
                document.getElementById('esc-nombre').value = res.nombre || "";
                document.getElementById('esc-dea').value = res.dea || "";
                document.getElementById('esc-rif').value = res.rif || "";
                document.getElementById('esc-direccion').value = res.direccion || "";
                document.getElementById('esc-mision').value = res.mision || "";
                document.getElementById('esc-vision').value = res.vision || "";
                document.getElementById('esc-objetivo').value = res.objetivo || "";
                document.getElementById('esc-peic').value = res.peic || "";
            }
        });
    },
    guardarPerfil: function() {
        const datos = {
            nombre: document.getElementById('esc-nombre').value, dea: document.getElementById('esc-dea').value,
            rif: document.getElementById('esc-rif').value, direccion: document.getElementById('esc-direccion').value,
            mision: document.getElementById('esc-mision').value, vision: document.getElementById('esc-vision').value,
            objetivo: document.getElementById('esc-objetivo').value, peic: document.getElementById('esc-peic').value
        };
        Aplicacion.peticion({ action: "save_school_profile", data: datos }, (res) => {
            if(res.status === 'success') { Swal.fire('¡Éxito!', 'Perfil actualizado.', 'success'); this.cargarPerfil(); }
        });
    },

    // ==========================================
    // 2. FASES Y PERÍODOS
    // ==========================================
    cargarPeriodos: function() { Aplicacion.peticion({ action: "get_school_config" }, (res) => { this.datosAnios = res.anios ||[]; this.datosLapsos = res.periodos ||[]; this.dibujarPeriodos(); }); },
    dibujarPeriodos: function() {
        const tAnios = document.getElementById('tabla-anios');
        if(tAnios) tAnios.innerHTML = this.datosAnios.length===0 ? '<tr><td colspan="3" class="text-center text-muted">Vacío</td></tr>' : this.datosAnios.map(a => `<tr><td class="fw-bold text-primary">${a.nombre}</td><td><div class="form-check form-switch"><input class="form-check-input" type="checkbox" onchange="ModEscuela.setAnioActual('${a.id}')" ${a.estado==='Actual'?'checked':''}><label class="form-check-label small ms-1 ${a.estado==='Actual'?'text-success fw-bold':'text-muted'}">${a.estado}</label></div></td><td class="text-end"><button onclick="ModEscuela.modalAnio('${a.id}')" class="btn-circulo me-1 bg-light"><i class="bi bi-pencil text-primary"></i></button><button onclick="ModEscuela.eliminarData('${a.id}','delete_config_item','ANIO')" class="btn-circulo btn-peligro"><i class="bi bi-trash"></i></button></td></tr>`).join('');
        const cLapsos = document.getElementById('lista-periodos');
        if(cLapsos) cLapsos.innerHTML = this.datosLapsos.length===0 ? '<div class="text-center text-muted">Vacío</div>' : this.datosLapsos.map(p => `<div class="d-flex justify-content-between align-items-center p-3 mb-2 rounded-4 bg-light border border-start border-4 border-warning"><span class="fw-bold text-dark">${p.nombre}</span><div><button onclick="ModEscuela.modalPeriodo('${p.id}','${p.nombre}')" class="btn btn-sm btn-link"><i class="bi bi-pencil"></i></button><button onclick="ModEscuela.eliminarData('${p.id}','delete_config_item','PERIODO')" class="btn btn-sm btn-link text-danger"><i class="bi bi-trash"></i></button></div></div>`).join('');
    },
    modalAnio: function(id=null) { const d = id ? this.datosAnios.find(x=>x.id===id) : {nombre:''}; Swal.fire({ title: id?'Editar Año':'Nuevo Año', input:'text', inputValue:d.nombre, showCancelButton:true, confirmButtonText:'Guardar' }).then(r=>{ if(r.isConfirmed && r.value) Aplicacion.peticion({action:"save_school_year", year:{id, nombre:r.value}}, ()=>{this.cargarPeriodos();}); }); },
    modalPeriodo: function(id=null, nombre='') { Swal.fire({ title: id?'Editar Lapso':'Nuevo Lapso', input:'text', inputValue:nombre, showCancelButton:true, confirmButtonText:'Guardar' }).then(r=>{ if(r.isConfirmed && r.value) Aplicacion.peticion({action:"save_school_period", period:{id, nombre:r.value}}, ()=>{this.cargarPeriodos();}); }); },
    setAnioActual: function(id) { Aplicacion.peticion({action:"set_current_year", id}, ()=>{ this.cargarPeriodos(); }); },

    // ==========================================
    // 3. NIVELES
    // ==========================================
    cargarNiveles: function() { Aplicacion.peticion({ action: "get_school_config" }, (res) => { this.datosNiveles = res.niveles ||[]; this.dibujarNiveles(); }); },
    dibujarNiveles: function() {
        const t = document.getElementById('tabla-niveles');
        if(t) t.innerHTML = this.datosNiveles.length===0 ? '<tr><td colspan="2" class="text-center text-muted">Vacío</td></tr>' : this.datosNiveles.map(n => `<tr><td class="fw-bold px-4 text-primary"><i class="bi bi-caret-right-fill text-warning me-2"></i> ${n.nombre}</td><td class="text-end px-4"><button onclick="ModEscuela.modalNivel('${n.id}','${n.nombre}')" class="btn-circulo me-1 bg-light"><i class="bi bi-pencil text-primary"></i></button><button onclick="ModEscuela.eliminarData('${n.id}','delete_config_item','NIVEL')" class="btn-circulo btn-peligro"><i class="bi bi-trash"></i></button></td></tr>`).join('');
    },
    modalNivel: function(id=null, nombre='') { Swal.fire({ title: id?'Editar Nivel':'Nuevo Nivel', input:'text', inputValue:nombre, showCancelButton:true, confirmButtonText:'Guardar' }).then(r=>{ if(r.isConfirmed && r.value) Aplicacion.peticion({action:"save_school_level", level:{id, nombre:r.value}}, ()=>{this.cargarNiveles();}); }); },

    // ==========================================
    // 4. GRADOS
    // ==========================================
    cargarGrados: function() { Aplicacion.peticion({ action: "get_school_config" }, (res) => { this.datosNiveles = res.niveles ||[]; Aplicacion.peticion({ action: "get_users" }, (resU) => { this.listaDocentes = resU.users.filter(u => u.rol === 'Docente' || u.rol === 'Director') || []; Aplicacion.peticion({ action: "get_grades" }, (resG) => { this.datosGrados = resG.grados ||[]; this.dibujarGrados(); }); }); }); },
    dibujarGrados: function() {
        const div = document.getElementById('lista-grados');
        if(!div) return;
        div.innerHTML = this.datosGrados.length === 0 ? '<div class="col-12 text-center text-muted py-5">No hay grados registrados</div>' :
        this.datosGrados.map((g, i) => `<div class="col-md-6 col-xl-4 animate__animated animate__zoomIn"><div class="tarjeta-modulo p-4 border-top border-5" style="border-color: var(--color-primario) !important; height: 100%;"><div class="d-flex justify-content-between align-items-start mb-3"><div><span class="badge mb-2" style="background: rgba(0, 195, 255, 0.1); color: var(--color-secundario);">${g.nivel}</span><h4 class="fw-bold mb-0" style="color: var(--color-primario);">${g.nombre}</h4></div><div class="text-end"><button onclick="ModEscuela.modalGrado('${g.id}')" class="btn btn-sm btn-link text-muted p-0 me-2"><i class="bi bi-pencil-fill fs-5"></i></button><button onclick="ModEscuela.eliminarData('${g.id}', 'delete_grade')" class="btn btn-sm btn-link text-danger p-0"><i class="bi bi-trash-fill fs-5"></i></button></div></div><div class="bg-light p-3 rounded-3 mb-3 border"><div class="small fw-bold text-muted mb-2"><i class="bi bi-person-badge me-1"></i> Docentes Guía</div><div class="d-flex align-items-center mb-1"><span class="badge bg-primary me-2">1</span><span class="small text-dark">${g.guia1_nombre || '---'}</span></div><div class="d-flex align-items-center"><span class="badge bg-secondary me-2">2</span><span class="small text-dark">${g.guia2_nombre || '---'}</span></div></div><div class="d-flex flex-wrap gap-2">${g.secciones.map(s => `<span class="badge bg-white text-dark border px-2 py-1 shadow-sm">Sec. ${s}</span>`).join('')}</div></div></div>`).join('');
    },
    modalGrado: function(id = null) {
        if(this.datosNiveles.length === 0) return Swal.fire('Aviso', 'Cree Niveles primero.', 'warning');
        const d = id ? this.datosGrados.find(x => x.id === id) : { nombre:'', nivel:'', secciones:[], guia1_id:'', guia2_id:'' };
        let optNiv = this.datosNiveles.map(n => `<option value="${n.nombre}" ${d.nivel===n.nombre?'selected':''}>${n.nombre}</option>`).join('');
        let optDoc = '<option value="">-- Sin Asignar --</option>' + this.listaDocentes.map(doc => `<option value="${doc.cedula}" data-nom="${doc.nombre}">${doc.nombre}</option>`).join('');
        
        Swal.fire({
            title: id ? 'Editar Grado' : 'Nuevo Grado',
            html: `<div class="text-start mt-2"><label class="small fw-bold text-muted">Nivel</label><select id="sw-nivel" class="input-moderno mb-2">${optNiv}</select><label class="small fw-bold text-muted">Nombre</label><input id="sw-grado" class="input-moderno mb-2" value="${d.nombre}"><label class="small fw-bold text-muted">Secciones</label><input id="sw-secciones" class="input-moderno mb-3" value="${d.secciones.join(', ')}"><div class="border-top pt-2"><label class="small fw-bold text-primary">Guía 1</label><select id="sw-guia1" class="input-moderno mb-2">${optDoc}</select><label class="small fw-bold text-muted">Guía 2</label><select id="sw-guia2" class="input-moderno">${optDoc}</select></div></div>`,
            didOpen:()=>{if(d.guia1_id)document.getElementById('sw-guia1').value=d.guia1_id;if(d.guia2_id)document.getElementById('sw-guia2').value=d.guia2_id;}, showCancelButton:true
        }).then(r=>{ if(r.isConfirmed){
            const g1=document.getElementById('sw-guia1'), g2=document.getElementById('sw-guia2');
            const pl={id, nivel:document.getElementById('sw-nivel').value, nombre:document.getElementById('sw-grado').value, secciones:document.getElementById('sw-secciones').value.split(',').map(s=>s.trim()).filter(s=>s), guia1_id:g1.value, guia1_nombre:g1.value?g1.options[g1.selectedIndex].getAttribute('data-nom'):'', guia2_id:g2.value, guia2_nombre:g2.value?g2.options[g2.selectedIndex].getAttribute('data-nom'):''};
            Aplicacion.peticion({action:"save_grade", grade:pl}, ()=>{this.cargarGrados()});
        }});
    },

    // ==========================================
    // 5. ESTRUCTURA DE HORARIOS
    // ==========================================
    cargarHorarios: function() { this.nivelSeleccionadoHorario = null; this.bloquesTemp = []; this.cargarPerfil(); Aplicacion.peticion({ action: "get_school_config" }, (res) => { this.datosNiveles = res.niveles || []; Aplicacion.peticion({ action: "get_schedules" }, (resH) => { this.datosHorarios = resH.horarios || []; this.renderizarNivelesHorario(); this.renderizarVistaPrevia(); }); }); },
    renderizarNivelesHorario: function() { const div = document.getElementById('lista-niveles-horario'); if(!div) return; div.innerHTML = this.datosNiveles.map(n => `<button onclick="ModEscuela.seleccionarNivelHorario('${n.id}', '${n.nombre}')" class="btn btn-outline-primary w-100 text-start py-3 px-4 rounded-4 mb-2 shadow-sm border-0 bg-white hover-efecto"><div class="d-flex justify-content-between align-items-center"><span class="fw-bold">${n.nombre}</span><i class="bi bi-chevron-right small"></i></div></button>`).join(''); },
    seleccionarNivelHorario: function(id, nombre) { this.nivelSeleccionadoHorario = { id, nombre }; document.getElementById('titulo-bloques').innerText = `2. Bloques: ${nombre}`; document.getElementById('btn-add-bloque').disabled = false; document.getElementById('btn-save-horario').disabled = false; document.getElementById('btn-pdf-horario').disabled = false; document.getElementById('pdf-nombre-nivel').innerText = nombre; document.getElementById('pdf-nombre-escuela').innerText = this.datosPerfil.nombre || "UE Libertador Bolívar"; const guardado = this.datosHorarios.find(h => String(h.nivel_id) === String(id)); this.bloquesTemp = guardado ? guardado.bloques : []; this.renderizarEditorBloques(); this.renderizarVistaPrevia(); },
    renderizarEditorBloques: function() { 
        const div = document.getElementById('contenedor-bloques'); 
        if(!div) return;
        if(this.bloquesTemp.length === 0) { div.innerHTML = '<div class="text-center text-muted py-4 small">No hay bloques.</div>'; return; }
        this.bloquesTemp.sort((a,b) => a.inicio.localeCompare(b.inicio));
        div.innerHTML = this.bloquesTemp.map((b, i) => `<div class="d-flex gap-2 align-items-center bg-white p-2 rounded-3 border mb-2 shadow-sm"><span class="badge bg-light text-dark border me-2">${i+1}</span><select class="form-select form-select-sm" onchange="ModEscuela.updateBloque(${i}, 'tipo', this.value)" style="width: 120px; font-weight:bold; color: ${b.tipo==='Receso'?'#FF8D00':'#0066FF'};"><option value="Clase" ${b.tipo==='Clase'?'selected':''}>Clase</option><option value="Receso" ${b.tipo==='Receso'?'selected':''}>Receso</option><option value="Entrada" ${b.tipo==='Entrada'?'selected':''}>Entrada</option><option value="Salida" ${b.tipo==='Salida'?'selected':''}>Salida</option></select><input type="time" class="form-control form-control-sm" value="${b.inicio}" onchange="ModEscuela.updateBloque(${i}, 'inicio', this.value)"><span class="small text-muted">-</span><input type="time" class="form-control form-control-sm" value="${b.fin}" onchange="ModEscuela.updateBloque(${i}, 'fin', this.value)"><button onclick="ModEscuela.eliminarBloqueTemp(${i})" class="btn btn-sm text-danger"><i class="bi bi-trash"></i></button></div>`).join('');
    },
    renderizarVistaPrevia: function() {
        const tbody = document.getElementById('cuerpo-horario-visual');
        if(!tbody) return;
        if(!this.nivelSeleccionadoHorario || this.bloquesTemp.length === 0) { tbody.innerHTML = '<tr><td colspan="6" class="text-center py-5 text-muted">Configure los bloques.</td></tr>'; return; }
        const formatHora = (h) => { if(!h) return ""; let [hh, mm] = h.split(':'); let ampm = hh >= 12 ? 'pm' : 'am'; hh = hh % 12; hh = hh ? hh : 12; return `${hh}:${mm} ${ampm}`; };
        tbody.innerHTML = this.bloquesTemp.map(b => {
            const rango = `${formatHora(b.inicio)} - ${formatHora(b.fin)}`;
            if (b.tipo === 'Receso') return `<tr><td class="text-center fw-bold small text-muted align-middle bg-light rounded-start">${rango}</td><td colspan="5" class="text-center fw-bold text-white align-middle rounded-end" style="background: #FF8D00; letter-spacing: 5px; height: 40px; font-size: 1.1rem; text-shadow: 1px 1px 0 rgba(0,0,0,0.2);">R E C E S O</td></tr>`;
            else if (b.tipo === 'Entrada' || b.tipo === 'Salida') return `<tr><td class="text-center fw-bold small text-muted align-middle">${rango}</td><td colspan="5" class="text-center fw-bold text-white align-middle rounded-3" style="background: #2b3674; height: 35px; font-size: 0.9rem;">${b.tipo.toUpperCase()}</td></tr>`;
            else { const celdaClase = `<td class="border border-2 border-light bg-light rounded-3 shadow-sm" style="height: 60px;"></td>`; return `<tr><td class="text-center fw-bold small text-dark bg-white border border-light rounded-3 shadow-sm align-middle">${rango}</td>${celdaClase.repeat(5)}</tr>`; }
        }).join('');
    },
    agregarBloqueTemp: function() { this.bloquesTemp.push({ tipo: 'Clase', inicio: '07:00', fin: '07:45' }); this.renderizarEditorBloques(); this.renderizarVistaPrevia(); },
    eliminarBloqueTemp: function(index) { this.bloquesTemp.splice(index, 1); this.renderizarEditorBloques(); this.renderizarVistaPrevia(); },
    updateBloque: function(index, campo, valor) { this.bloquesTemp[index][campo] = valor; this.renderizarVistaPrevia(); },
    guardarHorarioNivel: function() { if(!this.nivelSeleccionadoHorario) return; Aplicacion.peticion({ action: "save_schedule", nivel_id: this.nivelSeleccionadoHorario.id, bloques: this.bloquesTemp }, (res) => { if(res.status === 'success') Swal.fire({toast:true, icon:'success', title:'Guardado', position:'top-end', showConfirmButton:false, timer:1500}); }); },
    descargarHorarioPDF: async function() {
        const elemento = document.getElementById('lienzo-horario'); Aplicacion.mostrarCarga();
        await new Promise(r => setTimeout(r, 500));
        const canvas = await html2canvas(elemento, { scale: 2, backgroundColor: "#ffffff" });
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf; const pdf = new jsPDF('l', 'mm', 'a4');
        const pdfW = pdf.internal.pageSize.getWidth(); const pdfH = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData); const ratio = imgProps.width / imgProps.height;
        let w = pdfW - 20; let h = w / ratio; if (h > pdfH - 20) { h = pdfH - 20; w = h * ratio; }
        pdf.addImage(imgData, 'PNG', (pdfW - w)/2, (pdfH - h)/2, w, h);
        pdf.save(`Horario_${this.nivelSeleccionadoHorario.nombre}.pdf`); Aplicacion.ocultarCarga(); Swal.fire('Descargado', '', 'success');
    },

    // ==========================================
    // 6. ASIGNATURAS
    // ==========================================
    cargarAsignaturas: function() {
        Aplicacion.peticion({ action: "get_school_config" }, (res) => {
            this.datosNiveles = res.niveles || [];
            const sel = document.getElementById('asig-nivel');
            if(sel) {
                sel.innerHTML = '<option value="">-- Seleccione Nivel --</option>' + this.datosNiveles.map(n => `<option value="${n.id}">${n.nombre}</option>`).join('');
            }
            Aplicacion.peticion({ action: "get_subjects" }, (resS) => { this.datosAsignaturas = resS.asignaturas || []; this.filtrarAsignaturas(); });
        });
    },
    filtrarAsignaturas: function() {
        const nivelSelect = document.getElementById('asig-nivel');
        const div = document.getElementById('lista-asignaturas');
        if (!nivelSelect || !div) return; 
        const nivelId = nivelSelect.value;
        if (!nivelId) { div.innerHTML = '<div class="text-center text-muted w-100 py-4">Seleccione un nivel para ver sus asignaturas.</div>'; return; }
        const filtradas = this.datosAsignaturas.filter(a => String(a.nivel_id) === String(nivelId));
        if (filtradas.length === 0) { div.innerHTML = '<div class="text-center text-muted w-100 py-4">No hay asignaturas registradas.</div>'; }
        else { div.innerHTML = filtradas.map(a => `<div class="badge bg-white text-dark border p-2 shadow-sm d-flex align-items-center gap-2 animate__animated animate__zoomIn"><span class="fw-bold" style="font-size: 0.95rem;">${a.nombre}</span><button onclick="ModEscuela.editarAsignatura('${a.id}')" class="btn btn-sm btn-link p-0 text-primary"><i class="bi bi-pencil-square"></i></button><button onclick="ModEscuela.eliminarData('${a.id}', 'delete_subject')" class="btn btn-sm btn-link p-0 text-danger"><i class="bi bi-x-circle-fill"></i></button></div>`).join(''); }
    },
    guardarAsignatura: function() {
        const id = document.getElementById('asig-id').value;
        const nivelSelect = document.getElementById('asig-nivel');
        const nivelId = nivelSelect.value;
        const nivelNombre = nivelSelect.options[nivelSelect.selectedIndex].text;
        const nombre = document.getElementById('asig-nombre').value;
        if (!nivelId || !nombre) return Swal.fire('Error', 'Complete todos los campos', 'warning');
        Aplicacion.peticion({ action: "save_subject", subject: { id, nivel_id: nivelId, nivel_nombre: nivelNombre, nombre } }, (res) => {
            if(res.status === 'success') { Swal.fire({toast:true, icon:'success', title:'Guardado', position:'top-end', showConfirmButton:false, timer:1500}); this.limpiarAsignatura(); this.cargarAsignaturas(); }
        });
    },
    editarAsignatura: function(id) {
        const a = this.datosAsignaturas.find(x => x.id === id);
        if (a) { document.getElementById('asig-id').value = a.id; document.getElementById('asig-nivel').value = a.nivel_id; document.getElementById('asig-nombre').value = a.nombre; this.filtrarAsignaturas(); }
    },
    limpiarAsignatura: function() { document.getElementById('asig-id').value = ""; document.getElementById('asig-nombre').value = ""; },

    // ==========================================
    // 7. CARGOS Y SUPERVISIÓN (CORREGIDO)
    // ==========================================
    cargarEscalas: function() {
        Aplicacion.peticion({ action: "get_scales" }, (res) => {
            this.datosEscalas = res.escalas || [];
            this.dibujarEscalas();
        });
    },
    dibujarEscalas: function() {
        const div = document.getElementById('lista-escalas');
        if (!div) return;
        div.innerHTML = this.datosEscalas.length === 0 ? '<div class="col-12 text-center text-muted">Vacío</div>' : this.datosEscalas.map((e, i) => `<div class="col-md-6 col-xl-4"><div class="tarjeta-modulo p-3 border-start border-5 border-info"><div class="d-flex justify-content-between"><h5 class="fw-bold mb-0 text-truncate">${e.nombre}</h5><div><button onclick="ModEscuela.modalEscala('${e.id}')" class="btn btn-sm text-muted"><i class="bi bi-pencil"></i></button><button onclick="ModEscuela.eliminarData('${e.id}','delete_scale')" class="btn btn-sm text-danger"><i class="bi bi-trash"></i></button></div></div><div class="mt-2 small text-muted">${e.valores.join(', ')}</div></div></div>`).join('');
    },
    modalEscala: function(id = null) {
        const d = id ? this.datosEscalas.find(x => x.id === id) : { nombre: '', tipo: 'Literal', valores: [] };
        Swal.fire({
            title: id ? 'Editar' : 'Nueva Escala',
            html: `<input id="sw-en" class="input-moderno mb-2" value="${d.nombre}" placeholder="Nombre"><input id="sw-ev" class="input-moderno" value="${d.valores.join(', ')}" placeholder="Valores separados por coma">`,
            showCancelButton: true
        }).then(r => {
            if (r.isConfirmed) {
                const n = document.getElementById('sw-en').value;
                const v = document.getElementById('sw-ev').value.split(',').map(s => s.trim());
                Aplicacion.peticion({ action: "save_scale", scale: { id, nombre: n, tipo: 'Literal', valores: v } }, () => { this.cargarEscalas() });
            }
        });
    },
    
    cargarCargos: function() { Aplicacion.peticion({ action: "get_positions" }, (res) => { this.datosCargos = res.cargos ||[]; this.dibujarCargos(); }); },
    dibujarCargos: function() {
        const t = document.getElementById('tabla-cargos');
        if(!t) return;
        t.innerHTML = this.datosCargos.length===0?'<tr><td colspan="3" class="text-center">Vacío</td></tr>':this.datosCargos.map(c=>`<tr><td>${c.nombre}</td><td><span class="badge bg-light text-dark border">${c.tipo}</span></td><td class="text-end"><button onclick="ModEscuela.modalCargo('${c.id}')" class="btn-circulo bg-light me-1"><i class="bi bi-pencil text-primary"></i></button><button onclick="ModEscuela.eliminarData('${c.id}','delete_position')" class="btn-circulo btn-peligro"><i class="bi bi-trash"></i></button></td></tr>`).join('');
    },
    modalCargo: function(id=null) { const d = id ? this.datosCargos.find(x=>x.id===id) : {nombre:'', tipo:'Docente'}; Swal.fire({ title:id?'Editar':'Nuevo Cargo', html:`<input id="sw-cn" class="input-moderno mb-2" value="${d.nombre}" placeholder="Nombre del Cargo"><select id="sw-ct" class="input-moderno"><option ${d.tipo==='Docente'?'selected':''}>Docente</option><option ${d.tipo==='Directivo'?'selected':''}>Directivo</option><option ${d.tipo==='Administrativo'?'selected':''}>Administrativo</option><option ${d.tipo==='Obrero'?'selected':''}>Obrero</option></select>`, showCancelButton:true }).then(r=>{ if(r.isConfirmed){ Aplicacion.peticion({action:"save_position", position:{id, nombre:document.getElementById('sw-cn').value, tipo:document.getElementById('sw-ct').value}}, ()=>{this.cargarCargos()}); }}); },
    
    cargarSupervision: function() { 
        Aplicacion.peticion({ action: "get_positions" }, (resC) => { 
            this.datosCargos = resC.cargos ||[]; 
            Aplicacion.peticion({ action: "get_supervision" }, (resS) => { 
                this.datosSupervision = resS.data ||[]; 
                this.dibujarSupervision(); 
            }); 
        }); 
    },
    dibujarSupervision: function() {
        const div = document.getElementById('lista-supervision');
        if(!div) return;
        
        if(this.datosSupervision.length === 0) {
            div.innerHTML = '<div class="col-12 text-center text-muted py-5">Sin jerarquías asignadas. Use el botón "+ Nueva Relación".</div>';
            return;
        }

        div.innerHTML = this.datosSupervision.map((s, i) => {
            const supervisor = this.datosCargos.find(c => String(c.id) === String(s.supervisorId));
            const listaHijos = s.supervisadosIds.map(id => {
                const cargo = this.datosCargos.find(c => String(c.id) === String(id));
                return `<div class="d-flex align-items-center mb-1 ps-2 border-start border-3 border-primary"><span class="small text-dark">${cargo ? cargo.nombre : '...'}</span></div>`;
            }).join('');

            return `
            <div class="col-md-6 col-xl-4 animate__animated animate__zoomIn" style="animation-delay: ${i * 0.1}s;">
                <div class="tarjeta-modulo p-4 border-start border-5 h-100" style="border-color: var(--color-acento) !important;">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <span class="badge bg-danger-subtle text-danger mb-2 border shadow-sm"><i class="bi bi-star-fill me-1"></i> Supervisor</span>
                            <h5 class="fw-bold mb-3 text-dark">${supervisor ? supervisor.nombre : 'ID: ' + s.supervisorId}</h5>
                        </div>
                        <div class="d-flex gap-1">
                            <button onclick="ModEscuela.modalSupervision('${s.supervisorId}')" class="btn btn-sm btn-light border text-primary" title="Editar"><i class="bi bi-pencil-fill"></i></button>
                            <button onclick="ModEscuela.eliminarData('${s.supervisorId}', 'delete_supervision', true)" class="btn btn-sm btn-light border text-danger" title="Eliminar"><i class="bi bi-trash-fill"></i></button>
                        </div>
                    </div>
                    
                    <div class="bg-light rounded-3 p-3 mt-2" style="max-height: 150px; overflow-y: auto;">
                        <small class="fw-bold text-muted d-block mb-2">A su mando (${s.supervisadosIds.length}):</small>
                        ${listaHijos || '<span class="text-muted fst-italic small">Ninguno</span>'}
                    </div>
                </div>
            </div>`;
        }).join('');
    },
    modalSupervision: function(supId = null) {
        if(this.datosCargos.length === 0) return Swal.fire('Aviso', 'Cree cargos primero.', 'warning');
        
        const relacion = supId ? this.datosSupervision.find(s => String(s.supervisorId) === String(supId)) : null;
        const idsMarcados = relacion ? relacion.supervisadosIds : [];

        let opts = `<option value="">-- Seleccione Supervisor --</option>` + 
            this.datosCargos.map(c => `<option value="${c.id}" ${relacion && String(c.id)===String(supId) ? 'selected' : ''}>${c.nombre}</option>`).join('');
        
        let chks = this.datosCargos.map(c => {
            const isChecked = idsMarcados.includes(String(c.id)) ? 'checked' : '';
            return `
            <div class="form-check p-2 bg-white rounded-3 mb-2 shadow-sm border d-flex align-items-center">
                <input class="form-check-input chk-sup me-2" type="checkbox" value="${c.id}" id="c-${c.id}" ${isChecked}> 
                <label class="form-check-label small fw-bold w-100 cursor-pointer" for="c-${c.id}">${c.nombre}</label>
            </div>`;
        }).join('');

        Swal.fire({
            title: supId ? 'Editar Relación' : 'Nueva Relación',
            html: `
                <div class="text-start mt-3">
                    <label class="small fw-bold text-muted mb-1">Jefe / Supervisor</label>
                    <select id="sw-sup" class="input-moderno mb-3" ${supId ? 'disabled' : ''}>${opts}</select>
                    
                    <label class="small fw-bold text-muted mb-1">Cargos a su mando</label>
                    <div class="p-3 bg-light rounded-4 border overflow-auto" style="max-height:250px;">${chks}</div>
                </div>`,
            showCancelButton:true, confirmButtonText:'Guardar'
        }).then(r=>{ if(r.isConfirmed){
            const sId = document.getElementById('sw-sup').value;
            const ch = Array.from(document.querySelectorAll('.chk-sup:checked')).map(x=>x.value);
            
            if(sId && ch.length > 0) {
                Aplicacion.peticion({action:"save_supervision", supervisorId:sId, supervisadosIds:ch}, ()=>{
                    this.cargarSupervision();
                    Swal.fire('Guardado', 'Relación jerárquica actualizada.', 'success');
                });
            } else {
                Swal.fire('Error','Seleccione supervisor y subordinados','error');
            }
        }});
    },

    eliminarData: function(id, actionCode, paramKey) {
        Swal.fire({title:'¿Eliminar?', icon:'warning', showCancelButton:true}).then(r=>{ if(r.isConfirmed){
            let p = {action:actionCode}; if(paramKey===true) p.supervisorId=id; else if(typeof paramKey==='string'){p.id=id; p.type=paramKey;} else p.id=id;
            Aplicacion.peticion(p, (res)=>{ if(res.status==='success'){ 
                if(actionCode.includes('grade')) this.cargarGrados(); 
                else if(actionCode.includes('scale')) this.cargarEscalas(); 
                else if(actionCode.includes('position')) this.cargarCargos(); 
                else if(actionCode.includes('supervision')) this.cargarSupervision(); 
                else if(actionCode.includes('subject')) this.cargarAsignaturas(); 
                else if(actionCode.includes('config')) { this.cargarPeriodos(); this.cargarNiveles(); } 
            }});
        }});
    }
};

// INICIALIZADORES
window.init_Perfil_de_la_Escuela = function() { ModEscuela.cargarPerfil(); };
window.init_Fases_y_Periodos = function() { ModEscuela.cargarPeriodos(); };
window.init_Niveles_Educativos = function() { ModEscuela.cargarNiveles(); };
window.init_Grado___Año = function() { ModEscuela.cargarGrados(); };
window.init_Estructura_de_Horarios = function() { ModEscuela.cargarHorarios(); };
window.init_Gestión_de_Asignaturas = function() { ModEscuela.cargarAsignaturas(); };
window.init_Escalas_de_Evaluación = function() { ModEscuela.cargarEscalas(); };
window.init_Gestión_de_Cargos = function() { ModEscuela.cargarCargos(); };
window.init_Cadena_Supervisoria = function() { ModEscuela.cargarSupervision(); };