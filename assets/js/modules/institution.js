/**
 * MÓDULO INSTITUCIONAL
 * Gestión de la configuración base, grados, cargos y jerarquías.
 */

const ModuloEscuela = {
    render: function(cont) { 
        const d = App.schoolData || {}; 
        cont.innerHTML = `
        <div class="col-12 card border-0 shadow-sm rounded-4 bg-white module-card anim-stagger-1 overflow-hidden">
            <div class="module-header bg-gradient-orange">
                <div class="d-flex align-items-center">
                    <div class="module-icon-box text-warning"><i class="bi bi-building fs-4"></i></div>
                    <div><h5 class="fw-bold mb-0 text-white">Perfil Institucional</h5><small class="opacity-75 text-white">Configuración base de la escuela</small></div>
                </div>
            </div>
            <div class="p-4 row g-4 pt-2">
                <div class="col-md-6"><label class="small fw-bold">Nombre</label><input type="text" id="esc-n" class="form-control input-interactive rounded-pill" value="${d.nombre||''}"></div>
                <div class="col-md-3"><label class="small fw-bold">DEA</label><input type="text" id="esc-d" class="form-control input-interactive rounded-pill" value="${d.dea||''}"></div>
                <div class="col-md-3"><label class="small fw-bold">RIF</label><input type="text" id="esc-r" class="form-control input-interactive rounded-pill" value="${d.rif||''}"></div>
                <div class="col-12"><label class="small fw-bold">Dirección</label><input type="text" id="esc-dir" class="form-control input-interactive rounded-pill" value="${d.direccion||''}"></div>
                <div class="col-md-3"><label class="small fw-bold">Misión</label><textarea id="esc-m" class="form-control input-interactive rounded-4" rows="4">${d.mision||''}</textarea></div>
                <div class="col-md-3"><label class="small fw-bold">Visión</label><textarea id="esc-v" class="form-control input-interactive rounded-4" rows="4">${d.vision||''}</textarea></div>
                <div class="col-md-3"><label class="small fw-bold">Objetivo</label><textarea id="esc-o" class="form-control input-interactive rounded-4" rows="4">${d.objetivo||''}</textarea></div>
                <div class="col-md-3"><label class="small fw-bold">PEIC</label><textarea id="esc-p" class="form-control input-interactive rounded-4" rows="4">${d.peic||''}</textarea></div>
                <div class="col-12 text-end mt-4"><button onclick="ModuloEscuela.save()" class="btn btn-success-vibrant px-5 py-2 rounded-pill shadow fw-bold btn-action"><i class="bi bi-floppy-fill me-2"></i> Guardar Cambios</button></div>
            </div>
        </div>`; 
    },
    save: function() { 
        const data = { nombre: document.getElementById('esc-n').value, dea: document.getElementById('esc-d').value, rif: document.getElementById('esc-r').value, direccion: document.getElementById('esc-dir').value, mision: document.getElementById('esc-m').value, vision: document.getElementById('esc-v').value, objetivo: document.getElementById('esc-o').value, peic: document.getElementById('esc-p').value }; 
        App.showLoader(); App.sendRequest({ action: "save_school_profile", data }, (res) => { App.hideLoader(); if(res.status==='success') { Swal.fire('Éxito','Datos actualizados','success'); App.sendRequest({ action: "get_school_profile" }, (resS) => { App.schoolData = resS; this.render(document.getElementById('module-content')); }); } }); 
    }
};

const ModuloConfiguracion = {
    anios:[], periodos:[],
    render: function(cont) {
        cont.innerHTML = `
        <div class="row g-4 w-100 m-0">
            <div class="col-lg-7 anim-stagger-1">
                <div class="card border-0 shadow-sm rounded-4 bg-white h-100 module-card overflow-hidden">
                    <div class="module-header bg-gradient-orange">
                        <div class="d-flex align-items-center">
                            <div class="module-icon-box text-warning"><i class="bi bi-calendar3 fs-4"></i></div>
                            <div><h6 class="fw-bold mb-0 text-white">Años Escolares</h6><small class="opacity-75 text-white">Periodos anuales</small></div>
                        </div>
                        <button onclick="ModuloConfiguracion.modalAnio()" class="btn btn-light btn-sm text-dark fw-bold rounded-pill px-3 shadow-sm btn-action"><i class="bi bi-plus-lg me-1"></i>Nuevo</button>
                    </div>
                    <div class="p-4 table-responsive pt-2"><table class="table table-interactive align-middle"><thead><tr class="table-light"><th>Nombre</th><th>Estado</th><th class="text-end">Acción</th></tr></thead><tbody id="tbl-anios"></tbody></table></div>
                </div>
            </div>
            <div class="col-lg-5 anim-stagger-2">
                <div class="card border-0 shadow-sm rounded-4 bg-white h-100 module-card overflow-hidden">
                    <div class="module-header bg-gradient-orange">
                        <div class="d-flex align-items-center">
                            <div class="module-icon-box text-warning"><i class="bi bi-clock-history fs-4"></i></div>
                            <div><h6 class="fw-bold mb-0 text-white">Lapsos / Fases</h6><small class="opacity-75 text-white">Momentos de evaluación</small></div>
                        </div>
                        <button onclick="ModuloConfiguracion.modalPeriodo()" class="btn btn-light btn-sm text-dark fw-bold rounded-pill px-3 shadow-sm btn-action"><i class="bi bi-plus-lg me-1"></i>Agregar</button>
                    </div>
                    <div class="p-4 d-flex flex-column gap-2 pt-2" id="list-periodos"></div>
                </div>
            </div>
        </div>`;
        this.load();
    },
    load: function() { App.showLoader(); App.sendRequest({ action: "get_school_config" }, (res) => { this.anios = res.anios || []; this.periodos = res.periodos || []; this.draw(); App.hideLoader(); }); },
    draw: function() {
        const t = document.getElementById('tbl-anios'); if(t) t.innerHTML = this.anios.map((a,i) => `<tr class="anim-stagger-${(i%5)+1}"><td class="fw-bold">${a.nombre}</td><td><div class="form-check form-switch"><input class="form-check-input input-interactive cursor-pointer" type="checkbox" onchange="ModuloConfiguracion.setActual('${a.id}')" ${a.estado === 'Actual' ? 'checked' : ''}> <small>${a.estado}</small></div></td><td class="text-end"><button onclick="ModuloConfiguracion.modalAnio('${a.id}')" class="btn btn-sm btn-light text-primary rounded-circle btn-action"><i class="bi bi-pencil"></i></button><button onclick="ModuloConfiguracion.delete('${a.id}','ANIO')" class="btn btn-sm btn-light text-danger rounded-circle ms-1 btn-action"><i class="bi bi-trash"></i></button></td></tr>`).join('');
        const l = document.getElementById('list-periodos'); if(l) l.innerHTML = this.periodos.map((p,i) => `<div class="d-flex justify-content-between align-items-center p-3 bg-light rounded-4 border-start border-4 border-warning shadow-sm anim-stagger-${(i%5)+1}"><span>${p.nombre}</span><div><button onclick="ModuloConfiguracion.modalPeriodo('${p.id}','${p.nombre}')" class="btn btn-sm btn-link p-0 me-2 btn-action"><i class="bi bi-pencil"></i></button><button onclick="ModuloConfiguracion.delete('${p.id}','PERIODO')" class="btn btn-sm btn-link text-danger p-0 btn-action"><i class="bi bi-trash"></i></button></div></div>`).join('');
    },
    modalAnio: function(id=null){ const d = id?this.anios.find(x=>x.id===id):{nombre:''}; Swal.fire({ title:'Año Escolar', input:'text', inputValue: d.nombre, showCancelButton:true, confirmButtonText:'Guardar' }).then(r=>{ if(r.isConfirmed){ App.showLoader(); App.sendRequest({ action:"save_school_year", year:{id, nombre:r.value}}, (res)=>{ App.hideLoader(); if(res.status==='success') { Swal.fire('Éxito','Año guardado','success'); this.load(); }}); }}); },
    modalPeriodo: function(id=null, n=''){ Swal.fire({ title:'Lapso', input:'text', inputValue:n, showCancelButton:true, confirmButtonText:'Guardar' }).then(r=>{ if(r.isConfirmed){ App.showLoader(); App.sendRequest({ action:"save_school_period", period:{id, nombre:r.value}}, (res)=>{ App.hideLoader(); if(res.status==='success') { Swal.fire('Éxito','Lapso guardado','success'); this.load(); }}); }}); },
    setActual: function(id){ App.showLoader(); App.sendRequest({ action:"set_current_year", id }, (res)=>{ App.hideLoader(); if(res.status==='success') { Swal.fire('Actualizado','Año activo cambiado','success'); App.loadAppData(); this.load(); }}); },
    delete: function(id, type){ Swal.fire({ title:'¿Eliminar?', icon:'warning', showCancelButton:true }).then(r=>{ if(r.isConfirmed){ App.showLoader(); App.sendRequest({ action:"delete_config_item", id, type }, (res)=>{ App.hideLoader(); if(res.status==='success') { this.load(); }}); }}); }
};

const ModuloNiveles = {
    niveles:[],
    render: function(cont) { 
        cont.innerHTML = `
        <div class="col-12 card border-0 shadow-sm rounded-4 bg-white w-100 module-card anim-stagger-1 overflow-hidden">
            <div class="module-header bg-gradient-orange">
                <div class="d-flex align-items-center">
                    <div class="module-icon-box text-warning"><i class="bi bi-layers-fill fs-4"></i></div>
                    <div><h5 class="fw-bold mb-0 text-white">Niveles Educativos</h5><small class="opacity-75 text-white">Ej: Inicial, Primaria, Media General</small></div>
                </div>
                <button onclick="ModuloNiveles.modal()" class="btn btn-light text-dark fw-bold rounded-pill px-4 shadow-sm btn-action"><i class="bi bi-plus-lg me-2"></i>Agregar Nivel</button>
            </div>
            <div class="p-4 table-responsive pt-2"><table class="table align-middle w-100 table-interactive"><thead><tr class="table-light"><th>Nombre</th><th class="text-end">Acción</th></tr></thead><tbody id="tbl-niveles"></tbody></table></div>
        </div>`; 
        this.load(); 
    },
    load: function() { App.showLoader(); App.sendRequest({ action: "get_school_config" }, (res) => { this.niveles = res.niveles || []; this.draw(); App.hideLoader(); }); },
    draw: function() { document.getElementById('tbl-niveles').innerHTML = this.niveles.map((n,i) => `<tr class="anim-stagger-${(i%5)+1}"><td class="fw-bold px-4">${n.nombre}</td><td class="text-end px-4"><button onclick="ModuloNiveles.modal('${n.id}', '${n.nombre}')" class="btn btn-sm btn-light text-primary rounded-circle btn-action"><i class="bi bi-pencil"></i></button><button onclick="ModuloNiveles.delete('${n.id}')" class="btn btn-sm btn-light text-danger rounded-circle ms-1 btn-action"><i class="bi bi-trash"></i></button></td></tr>`).join(''); },
    modal: function(id=null, n=''){ Swal.fire({ title:'Nivel', input:'text', inputValue:n, showCancelButton:true }).then(r=>{ if(r.isConfirmed){ App.showLoader(); App.sendRequest({ action:"save_school_level", level:{id, nombre:r.value}}, (res)=>{ App.hideLoader(); if(res.status==='success') { Swal.fire('Listo','Nivel guardado','success'); this.load(); }}); }}); },
    delete: function(id){ Swal.fire({ title:'¿Eliminar?', icon:'warning', showCancelButton:true }).then(r=>{ if(r.isConfirmed){ App.showLoader(); App.sendRequest({ action:"delete_config_item", id, type:"NIVEL" }, (res)=>{ App.hideLoader(); if(res.status==='success') { this.load(); }}); }}); }
};

const ModuloEscalas = {
    data:[],
    render: function(cont) { 
        cont.innerHTML = `
        <div class="col-12 card border-0 shadow-sm rounded-4 bg-white mb-4 module-card anim-stagger-1 overflow-hidden">
            <div class="module-header bg-gradient-orange mb-0">
                <div class="d-flex align-items-center">
                    <div class="module-icon-box text-warning"><i class="bi bi-bar-chart-fill fs-4"></i></div>
                    <div><h5 class="fw-bold mb-0 text-white">Escalas de Calificación</h5><small class="opacity-75 text-white">Sistemas de evaluación cualitativos/cuantitativos</small></div>
                </div>
                <button onclick="ModuloEscalas.modal()" class="btn btn-light text-dark fw-bold rounded-pill px-4 shadow-sm btn-action"><i class="bi bi-plus-lg me-2"></i>Nueva Escala</button>
            </div>
        </div>
        <div id="list-escalas" class="row g-4 w-100 m-0"></div>`; 
        this.load(); 
    },
    load: function() { App.showLoader(); App.sendRequest({ action: "get_scales" }, (res) => { this.data = res.escalas || []; this.draw(); App.hideLoader(); }); },
    draw: function() { 
        const div = document.getElementById('list-escalas'); if(!div) return;
        div.innerHTML = this.data.length === 0 ? `<div class="col-12 text-center text-muted py-5">Sin escalas</div>` : this.data.map((e,i) => `<div class="col-md-4 anim-stagger-${(i%5)+1}"><div class="card border-0 shadow-sm rounded-4 bg-white p-4 border-start border-5 border-magenta h-100 module-card"><h6>${e.nombre}</h6><div class="small text-muted mb-2">${e.tipo}</div><div class="d-flex flex-wrap gap-1 mt-2">${e.valores.map(v=>`<span class="badge bg-light text-dark border small shadow-sm">${v}</span>`).join('')}</div><div class="text-end mt-3"><button onclick="ModuloEscalas.modal('${e.id}')" class="btn btn-sm btn-light text-primary rounded-circle btn-action"><i class="bi bi-pencil"></i></button><button onclick="ModuloEscalas.delete('${e.id}')" class="btn btn-sm btn-light text-danger rounded-circle ms-1 btn-action"><i class="bi bi-trash"></i></button></div></div></div>`).join(''); 
    },
    modal: function(id=null){
        const d = id?this.data.find(x=>x.id===id):{nombre:'',tipo:'Literal',valores:[]};
        Swal.fire({ title:'Escala', html:`<input id="sw-e" class="form-control input-interactive rounded-pill mb-2" value="${d.nombre}" placeholder="Nombre"><select id="sw-t" class="form-select input-interactive rounded-pill mb-2"><option value="Literal" ${d.tipo==='Literal'?'selected':''}>Literal</option><option value="Numérica" ${d.tipo==='Numérica'?'selected':''}>Numérica</option></select><textarea id="sw-v" class="form-control input-interactive rounded-4" placeholder="Valores (A, B, C...)">${d.valores.join(', ')}</textarea>`, showCancelButton:true }).then(r=>{ if(r.isConfirmed){ 
            const n = document.getElementById('sw-e').value, t = document.getElementById('sw-t').value, v = document.getElementById('sw-v').value.split(',').map(x=>x.trim()).filter(x=>x!=='');
            if(!n || v.length===0) return;
            App.showLoader(); App.sendRequest({ action:"save_scale", scale:{id, nombre:n, tipo:t, valores:v}}, (res)=>{ App.hideLoader(); if(res.status==='success') { Swal.fire('Éxito','Escala guardada','success'); this.load(); }}); 
        }});
    },
    delete: function(id){ Swal.fire({ title:'¿Eliminar?', icon:'warning', showCancelButton:true }).then(r=>{ if(r.isConfirmed){ App.showLoader(); App.sendRequest({ action:"delete_scale", id }, (res)=>{ App.hideLoader(); if(res.status==='success') { this.load(); }}); }}); }
};

const ModuloGrados = {
    data:[],
    render: function(cont) { 
        cont.innerHTML = `
        <div class="col-12 card border-0 shadow-sm rounded-4 bg-white mb-4 module-card anim-stagger-1 overflow-hidden">
            <div class="module-header bg-gradient-orange mb-0">
                <div class="d-flex align-items-center">
                    <div class="module-icon-box text-warning"><i class="bi bi-mortarboard-fill fs-4"></i></div>
                    <div><h5 class="fw-bold mb-0 text-white">Grados / Años</h5><small class="opacity-75 text-white">Estructura académica de la institución</small></div>
                </div>
                <button onclick="ModuloGrados.modal()" class="btn btn-light text-dark fw-bold rounded-pill px-4 shadow-sm btn-action"><i class="bi bi-plus-lg me-2"></i>Nuevo Grado</button>
            </div>
        </div>
        <div id="list-grados" class="row g-4 w-100 m-0"></div>`; 
        this.load(); 
    },
    load: function() { App.showLoader(); App.sendRequest({ action: "get_grades" }, (res) => { this.data = res.grados || []; this.draw(); App.hideLoader(); }); },
    draw: function() { 
        const container = document.getElementById('list-grados'); if(!container) return;
        container.innerHTML = this.data.length === 0 ? `<div class="col-12 text-center text-muted py-5">Sin registros</div>` : this.data.map((g,i) => `<div class="col-md-4 col-xl-3 anim-stagger-${(i%5)+1}"><div class="card border-0 shadow-sm rounded-4 bg-white p-4 h-100 border-top border-4 border-primary module-card"><div><span class="badge bg-primary-subtle text-primary mb-1">${g.nivel}</span><h5 class="fw-bold mb-0">${g.nombre}</h5></div><div class="mt-3 d-flex flex-wrap gap-2">${g.secciones.map(s=>`<span class="badge bg-light text-dark border px-2 shadow-sm">Sec. ${s}</span>`).join('')}</div><div class="text-end mt-3"><button onclick="ModuloGrados.modal('${g.id}')" class="btn btn-sm btn-light text-primary rounded-circle btn-action"><i class="bi bi-pencil-fill"></i></button><button onclick="ModuloGrados.delete('${g.id}')" class="btn btn-sm btn-light text-danger rounded-circle ms-1 btn-action"><i class="bi bi-trash-fill"></i></button></div></div></div>`).join(''); 
    },
    modal: function(id=null){
        const d = id?this.data.find(x=>x.id===id):{nombre:'',nivel:'',secciones:[]};
        Swal.fire({ title:'Grado / Año', html:`<select id="sw-n" class="form-select input-interactive rounded-pill mb-2">${App.nivelesEducativos.map(n=>`<option ${d.nivel===n.nombre?'selected':''}>${n.nombre}</option>`).join('')}</select><input id="sw-g" class="form-control input-interactive rounded-pill mb-2" value="${d.nombre}" placeholder="Nombre"><input id="sw-s" class="form-control input-interactive rounded-pill" value="${d.secciones.join(', ')}" placeholder="Secciones">`, showCancelButton:true }).then(r=>{ if(r.isConfirmed){ 
            const v = {id, nivel:document.getElementById('sw-n').value, nombre:document.getElementById('sw-g').value, secciones:document.getElementById('sw-s').value.split(',').map(s=>s.trim().toUpperCase()).filter(s=>s!=='')};
            App.showLoader(); App.sendRequest({ action:"save_grade", grade:v}, (res)=>{ App.hideLoader(); if(res.status==='success') { Swal.fire('Éxito','Estructura guardada','success'); this.load(); }}); 
        }});
    },
    delete: function(id){ Swal.fire({ title:'¿Eliminar?', icon:'warning', showCancelButton:true }).then(r=>{ if(r.isConfirmed){ App.showLoader(); App.sendRequest({ action:"delete_grade", id }, (res)=>{ App.hideLoader(); if(res.status==='success') { this.load(); }}); }}); }
};

const ModuloCargos = {
    data:[],
    render: function(cont) { 
        cont.innerHTML = `
        <div class="col-12 card border-0 shadow-sm rounded-4 bg-white w-100 module-card anim-stagger-1 overflow-hidden">
            <div class="module-header bg-gradient-orange">
                <div class="d-flex align-items-center">
                    <div class="module-icon-box text-warning"><i class="bi bi-briefcase-fill fs-4"></i></div>
                    <div><h5 class="fw-bold mb-0 text-white">Cargos Institucionales</h5><small class="opacity-75 text-white">Tipos de roles laborales</small></div>
                </div>
                <button onclick="ModuloCargos.modal()" class="btn btn-light text-dark fw-bold rounded-pill px-4 shadow-sm btn-action"><i class="bi bi-plus-lg me-2"></i>Nuevo Cargo</button>
            </div>
            <div class="p-4 table-responsive pt-2"><table class="table align-middle w-100 table-interactive"><thead><tr class="table-light"><th>Cargo</th><th>Tipo</th><th class="text-end px-4">Acción</th></tr></thead><tbody id="tbl-cargos"></tbody></table></div>
        </div>`; 
        this.load(); 
    },
    load: function() { App.showLoader(); App.sendRequest({ action: "get_positions" }, (res) => { this.data = res.cargos || []; this.draw(); App.hideLoader(); }); },
    draw: function() { document.getElementById('tbl-cargos').innerHTML = this.data.map((c,i) => `<tr class="anim-stagger-${(i%5)+1}"><td class="fw-bold px-4">${c.nombre}</td><td><span class="badge bg-light text-primary border">${c.tipo}</span></td><td class="text-end px-4"><button onclick="ModuloCargos.modal('${c.id}')" class="btn btn-sm btn-light text-primary rounded-circle btn-action"><i class="bi bi-pencil"></i></button><button onclick="ModuloCargos.delete('${c.id}')" class="btn btn-sm btn-light text-danger rounded-circle ms-1 btn-action"><i class="bi bi-trash"></i></button></td></tr>`).join(''); },
    modal: function(id=null){
        const d = id?this.data.find(x=>x.id===id):{nombre:'',tipo:'Docente',descripcion:''};
        Swal.fire({ title:'Cargo', html:`<input id="sw-c" class="form-control input-interactive rounded-pill mb-2" value="${d.nombre}"><select id="sw-t" class="form-select input-interactive rounded-pill mb-2"><option ${d.tipo==='Docente'?'selected':''}>Docente</option><option ${d.tipo==='Directivo'?'selected':''}>Directivo</option><option ${d.tipo==='Administrativo'?'selected':''}>Administrativo</option></select><textarea id="sw-d" class="form-control input-interactive rounded-4">${d.descripcion}</textarea>`, showCancelButton:true }).then(r=>{ if(r.isConfirmed){ 
            App.showLoader(); App.sendRequest({ action:"save_position", position:{id, nombre:document.getElementById('sw-c').value, tipo:document.getElementById('sw-t').value, descripcion:document.getElementById('sw-d').value}}, (res)=>{ App.hideLoader(); if(res.status==='success') { Swal.fire('Éxito','Cargo guardado','success'); this.load(); }}); 
        }});
    },
    delete: function(id){ Swal.fire({ title:'¿Eliminar?', icon:'warning', showCancelButton:true }).then(r=>{ if(r.isConfirmed){ App.showLoader(); App.sendRequest({ action:"delete_position", id }, (res)=>{ App.hideLoader(); if(res.status==='success') { this.load(); }}); }}); }
};

const ModuloSupervision = {
    data:[],
    render: function(cont) { 
        cont.innerHTML = `
        <div class="col-12 card border-0 shadow-sm rounded-4 bg-white mb-4 module-card anim-stagger-1 overflow-hidden">
            <div class="module-header bg-gradient-orange mb-0">
                <div class="d-flex align-items-center">
                    <div class="module-icon-box text-warning"><i class="bi bi-diagram-3-fill fs-4"></i></div>
                    <div><h5 class="fw-bold mb-0 text-white">Cadena Supervisoria</h5><small class="opacity-75 text-white">Jerarquía y estructura organizacional</small></div>
                </div>
                <button onclick="ModuloSupervision.modal()" class="btn btn-light text-dark fw-bold rounded-pill px-4 shadow-sm btn-action"><i class="bi bi-plus-lg me-2"></i>Asignar</button>
            </div>
        </div>
        <div id="list-supervision" class="row g-4 w-100 m-0"></div>`; 
        this.load(); 
    },
    load: function() { App.showLoader(); App.sendRequest({ action: "get_supervision" }, (res) => { this.data = res.data || []; this.draw(); App.hideLoader(); }); },
    draw: function() { 
        const div = document.getElementById('list-supervision'); if(!div) return;
        div.innerHTML = this.data.length === 0 ? `<div class="col-12 text-center text-muted py-5">Sin jerarquías</div>` : this.data.map((s,i) => {
            const sup = App.allCargos.find(c=>String(c.id)===String(s.supervisorId));
            return `<div class="col-md-4 anim-stagger-${(i%5)+1}"><div class="card border-0 shadow-sm rounded-4 bg-white p-4 border-start border-5 border-primary h-100 module-card"><h6>${sup?sup.nombre:'ID:'+s.supervisorId}</h6><div class="d-flex flex-column gap-1 mt-2">${s.supervisadosIds.map(id=>{ const c=App.allCargos.find(x=>String(x.id)===String(id)); return `<div class="small bg-light p-2 rounded-3 shadow-sm">${c?c.nombre:id}</div>`}).join('')}</div><div class="text-end mt-3"><button onclick="ModuloSupervision.modal('${s.supervisorId}')" class="btn btn-sm btn-light text-primary rounded-circle btn-action"><i class="bi bi-pencil"></i></button><button onclick="ModuloSupervision.delete('${s.supervisorId}')" class="btn btn-sm btn-light text-danger ms-1 btn-action"><i class="bi bi-trash"></i></button></div></div></div>`;
        }).join('');
    },
    modal: function(supId=null){
        if(App.allCargos.length===0) return;
        const item = supId?this.data.find(x=>String(x.supervisorId)===String(supId)):{supervisorId:'',supervisadosIds:[]};
        let html = `<div class="text-start"><label class="small fw-bold">Supervisor</label><select id="sw-sup" class="form-select input-interactive rounded-pill mb-3" ${supId?'disabled':''}>${App.allCargos.map(c=>`<option value="${c.id}" ${String(item.supervisorId)===String(c.id)?'selected':''}>${c.nombre}</option>`).join('')}</select><label class="small fw-bold">Supervisados</label><div class="p-3 bg-light rounded-4 border overflow-auto" style="max-height:250px;">`;
        App.allCargos.forEach(c=>{ html+=`<div class="form-check mb-2"><input class="form-check-input chk-s input-interactive" type="checkbox" value="${c.id}" id="c-${c.id}" ${item.supervisadosIds.includes(String(c.id))?'checked':''}> <label class="form-check-label small fw-bold" for="c-${c.id}">${c.nombre}</label></div>`; });
        html += `</div></div>`;
        Swal.fire({ title:'Jerarquía', html, showCancelButton:true, width:'600px' }).then(r=>{ if(r.isConfirmed){
            const sId = document.getElementById('sw-sup').value, ch = Array.from(document.querySelectorAll('.chk-s:checked')).map(x=>x.value);
            if(!sId || ch.length===0) return;
            App.showLoader(); App.sendRequest({ action:"save_supervision", supervisorId:sId, supervisadosIds:ch }, (res)=>{ App.hideLoader(); if(res.status==='success') { this.load(); }});
        }});
    },
    delete: function(id){ Swal.fire({ title:'¿Eliminar?', showCancelButton:true }).then(r=>{ if(r.isConfirmed){ App.showLoader(); App.sendRequest({ action:"delete_supervision", supervisorId:id }, (res)=>{ App.hideLoader(); if(res.status==='success') { this.load(); }}); }}); }
};