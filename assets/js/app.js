/**
 * SIGAE v3.1 - UE Libertador Bolívar
 * CORE SPA - Javascript Principal
 */

const systemStructure = [
    { category: "Escuela", icon: "bi-building", color: "#FF8D00", items: ["Perfil de la Escuela", "Fases y Periodos", "Niveles Educativos", "Escalas de Evaluación", "Gestión de Cargos", "Cadena Supervisoria", "Grado / Año"] },
    { category: "Docentes", icon: "bi-person-badge-fill", color: "#00D158", items: ["Agregar Docentes", "Asignar Cargos", "Registrar Tipos de Ausencias (Doc)", "Registrar Ausencias (Doc)", "Expediente Docente", "Condición Salud (Doc)", "Reporte Gestión Diaria (Doc)", "Planes de Evaluación"] },
    { category: "Estudiantes", icon: "bi-people-fill", color: "#00C3FF", items: ["Agregar Estudiante (Nuevo)", "Agregar Estudiante (Regular)", "Asignar Cargos (Est)", "Registrar Tipos de Ausencias (Est)", "Registrar Ausencias (Est)", "Expediente Estudiante", "Condición Salud (Est)", "Voceros Estudiantiles"] },
    { category: "Representantes", icon: "bi-person-heart", color: "#E5007E", items: ["Solicitudes (Retiro/Notas/Constancia)", "Actualización de Datos (Regular)", "Inscripciones (Nuevos)", "Ver Boleta", "Ver Corte de Calificaciones"] },
    { category: "Administrativo", icon: "bi-clipboard-check-fill", color: "#6f42c1", items: ["Accidentes/Casiaccidentes (Doc)", "Accidentes/Casiaccidentes (Est)", "Reporte Preliminar Asistencias", "Reporte Incidentes y Requerimientos", "Gestión Diaria (Revisada)", "Gestión Mensual (DEP/CDV)", "Requerimientos Anuales", "Registros de Espacios", "Asignación de Espacios", "Agregar Colectivos Docentes", "Asignación de Colectivos", "Crear Salones", "Estadísticas"] },
    { category: "Transporte Escolar", icon: "bi-bus-front-fill", color: "#FF8D00", items: ["Agregar Rutas", "Agregar Paradas", "Asignación de Recorridos", "Registro de Asistencias (Transp)", "Reporte Incidentes (Est/Transp)", "Reporte Incidentes (Servicio)"] },
    { category: "Pedagogía", icon: "bi-journal-bookmark-fill", color: "#00D158", items: ["Agregar PA", "Perfil del Aula", "Calendario Escolar"] },
    { category: "Control de Estudios", icon: "bi-shield-lock-fill", color: "#6f42c1", items: ["Solicitud de Cupos", "Carnet Estudiantil", "Calificaciones", "Matrículas", "Boletas", "Retiros", "Notas Certificadas", "Certificación Títulos", "Constancias de Estudio", "Cortes de Notas", "Sábanas", "Resúmenes Finales"] },
    { category: "C.R.A.", icon: "bi-book-fill", color: "#00C3FF", items: ["Ubicaciones CRA", "Recursos Educativos CRA", "Préstamos"] },
    { category: "Formaciones", icon: "bi-patch-check-fill", color: "#00D158", items: ["Planificación de Formación", "Recursos Educativos Formación", "Descarga de Certificados"] },
    { category: "Software", icon: "bi-gear-wide-connected", color: "#E5007E", items: ["Gestión de Usuarios", "Roles y Privilegios", "Cambio de Contraseñas"] },
    { category: "Ayuda", icon: "bi-question-circle-fill", color: "#FF8D00", items: ["Manual de Usuario", "Soporte Técnico"] },
    { category: "Diseño Web", icon: "bi-palette-fill", color: "#0085FF", items: ["Accesibilidad y Apariencia"] }
];

const App = {
    user: null, schoolData: null, activeYear: "No Definido", allRoles: {}, tempCedula: null, currentView: 'Inicio', allUsers: [], allCargos: [], nivelesEducativos: [],

    init: function() { this.checkSession(); Acc.init(); },
    showLoader: function() { document.getElementById('main-loader').style.display = 'flex'; },
    hideLoader: function() { document.getElementById('main-loader').style.display = 'none'; },
    toggleSidebar: function() { document.body.classList.toggle('sidebar-open'); },
    toggleCollapse: function() { document.body.classList.toggle('collapsed'); },
    togglePass: function(id) { const i = document.getElementById(id); i.type = i.type === 'password' ? 'text' : 'password'; },

    checkSession: function() {
        const stored = localStorage.getItem('schoolUser');
        if (stored) { this.user = JSON.parse(stored); this.currentView = localStorage.getItem('lastView') || 'Inicio'; this.loadAppData(); } 
        else { document.getElementById('login-screen').style.display = 'flex'; this.hideLoader(); }
    },

    loadAppData: function() {
        this.showLoader();
        App.sendRequest({ action: "get_roles" }, (resRoles) => {
            this.allRoles = resRoles.roles || {};
            // Privilegios para Invitado si no existen en BD
            if(this.user && this.user.role === "Visitante") {
                if (!this.allRoles["Visitante"]) this.allRoles["Visitante"] = ["Solicitud de Cupos", "Accesibilidad y Apariencia", "Manual de Usuario"];
            }
            App.sendRequest({ action: "get_users" }, (resU) => {
                this.allUsers = resU.users || [];
                App.sendRequest({ action: "get_positions" }, (resC) => {
                    this.allCargos = resC.cargos || [];
                    App.sendRequest({ action: "get_school_profile" }, (resSchool) => {
                        this.schoolData = resSchool;
                        App.sendRequest({ action: "get_school_config" }, (resConfig) => {
                            const actual = (resConfig.anios || []).find(a => a.estado === 'Actual');
                            this.activeYear = actual ? actual.nombre : 'No Definido';
                            this.nivelesEducativos = resConfig.niveles || [];
                            this.showApp();
                            this.hideLoader();
                        });
                    });
                });
            });
        });
    },

    login: function() {
        const ced = document.getElementById('inputCedula').value, pass = document.getElementById('inputPass').value;
        if(!ced || !pass) return;
        this.showLoader();
        App.sendRequest({ action: "login", cedula: ced, password: pass }, (res) => {
            if(res.status === "success") { 
                this.user = res.user; 
                localStorage.setItem('schoolUser', JSON.stringify(this.user)); 
                this.loadAppData(); 
            } else { this.hideLoader(); Swal.fire('Acceso Error', 'Cédula o clave incorrecta', 'error'); }
        });
    },

    verificarUsuario: function() {
        const ced = document.getElementById('inputCedula').value; if(!ced) return;
        this.showLoader();
        App.sendRequest({ action: "verificar_usuario", cedula: ced }, (res) => {
            this.hideLoader();
            if(res.found) {
                this.tempCedula = ced; document.getElementById('step-cedula').style.display = 'none';
                if(res.hasPassword) { document.getElementById('lbl-nombre-login').innerText = res.nombre; document.getElementById('step-login').style.display = 'block'; }
                else { document.getElementById('step-register').style.display = 'block'; }
            } else { Swal.fire('No Autorizado', 'La cédula no figura en los registros.', 'error'); }
        });
    },

    modalInvitado: async function() {
        const { value: nombre } = await Swal.fire({ 
            title: 'Acceso Invitado', input: 'text', 
            inputLabel: '¿Cuál es su nombre?', confirmButtonText: 'Entrar', confirmButtonColor: '#0085FF', showCancelButton: true 
        });
        if (nombre) {
            this.user = { name: nombre, role: "Visitante", cedula: "0" };
            localStorage.setItem('schoolUser', JSON.stringify(this.user));
            this.loadAppData();
        }
    },

    showApp: function() {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app-wrapper').style.display = 'flex';
        document.getElementById('user-display-name').innerText = this.user.name;
        this.renderMenu();
        if(this.currentView === 'Inicio') this.showDashboard();
        else this.renderView(this.currentView, this.currentView);
    },

    renderMenu: function() {
        const container = document.getElementById('sidebar-menu');
        const userPerms = (this.user.role === 'Administrador' || this.user.role === 'Director') ? "all" : (this.allRoles[this.user.role] || []);
        let html = `<div class="px-3 mb-2"><button onclick="App.showDashboard()" class="nav-category-btn rounded-pill border-0 w-100 shadow-sm" style="background: #eef7ff; color: #0085FF;"><span><i class="bi bi-house-door-fill me-2"></i> <span>Inicio</span></span></button></div>`;
        systemStructure.forEach((cat, index) => {
            const allowedItems = cat.items.filter(item => userPerms === "all" || userPerms.includes(item));
            if (allowedItems.length > 0) {
                const id = `m-${index}`;
                html += `<div class="accordion-item bg-transparent border-0"><button class="nav-category-btn collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${id}"><span><i class="bi ${cat.icon} me-2" style="color:${cat.color}"></i> <span>${cat.category}</span></span><i class="bi bi-chevron-down small opacity-50"></i></button><div id="${id}" class="accordion-collapse collapse" data-bs-parent="#sidebar-menu"><div class="accordion-body p-0">${allowedItems.map(item => `<a href="javascript:void(0)" onclick="App.renderView('${item}','${item}')" class="nav-sub-item">${item}</a>`).join('')}</div></div></div>`;
            }
        });
        container.innerHTML = html;
    },

    showDashboard: function() {
        this.currentView = 'Inicio'; localStorage.setItem('lastView', 'Inicio');
        if(window.innerWidth < 992) document.body.classList.remove('sidebar-open');
        document.getElementById('dynamic-view').style.display = 'none';
        const dash = document.getElementById('dashboard-view'); dash.style.display = 'block';
        document.getElementById('page-title').innerText = "Inicio";
        const res = this.schoolData || { nombre: "UE Libertador Bolívar" };
        
        dash.innerHTML = `
        <div class="p-4 animate__animated animate__fadeIn">
            <div class="row g-4">
                <div class="col-12">
                    <div class="card p-5 text-white shadow-lg border-0 position-relative overflow-hidden" style="background: linear-gradient(135deg, #00C3FF 0%, #0085FF 100%); border-radius: 30px;">
                        <div class="position-relative z-1">
                            <span class="badge bg-white text-primary mb-3 px-3 py-2 rounded-pill fw-bold">Año Escolar ${this.activeYear}</span>
                            <h2 class="fw-bold mb-1">${res.nombre}</h2>
                            <p class="opacity-75 mb-4"><i class="bi bi-geo-alt-fill me-1"></i> ${res.direccion || '---'}</p>
                            <button onclick="App.descargarOrganigramaPDF()" class="btn btn-light text-primary fw-bold rounded-pill px-4 shadow shadow-hover">
                                <i class="bi bi-file-earmark-pdf-fill me-2"></i> Descargar Organigrama (PDF)
                            </button>
                        </div>
                    </div>
                </div>
                <div class="col-md-3"><div class="dash-card border-left-blue"><h6>Misión</h6><p class="small text-muted mb-0">${res.mision || '--'}</p></div></div>
                <div class="col-md-3"><div class="dash-card border-left-green"><h6>Visión</h6><p class="small text-muted mb-0">${res.vision || '--'}</p></div></div>
                <div class="col-md-3"><div class="dash-card border-left-yellow"><h6>Objetivo</h6><p class="small text-muted mb-0">${res.objetivo || '--'}</p></div></div>
                <div class="col-md-3"><div class="dash-card border-left-red"><h6>PEIC</h6><p class="small text-muted mb-0">${res.peic || '--'}</p></div></div>
            </div>
        </div>`;
    },

    renderView: function(id, title) {
        if(id === 'Inicio') { this.showDashboard(); return; }
        this.currentView = id; localStorage.setItem('lastView', id);
        if(window.innerWidth < 992) document.body.classList.remove('sidebar-open');
        document.getElementById('dashboard-view').style.display = 'none';
        const div = document.getElementById('dynamic-view'); div.style.display = 'block';
        document.getElementById('page-title').innerText = title || id;
        div.innerHTML = `<div class="p-4"><button onclick="App.showDashboard()" class="btn btn-sm btn-light rounded-pill border shadow-sm px-4 mb-4"><i class="bi bi-arrow-left"></i> Volver al Inicio</button><div id="module-content" class="w-100"></div></div>`;
        const cont = document.getElementById('module-content');
        
        if(id === 'Perfil de la Escuela') ModuloEscuela.render(cont);
        else if(id === 'Fases y Periodos') ModuloConfiguracion.render(cont);
        else if(id === 'Niveles Educativos') ModuloNiveles.render(cont);
        else if(id === 'Escalas de Evaluación') ModuloEscalas.render(cont);
        else if(id === 'Grado / Año') ModuloGrados.render(cont);
        else if(id === 'Gestión de Cargos') ModuloCargos.render(cont);
        else if(id === 'Cadena Supervisoria') ModuloSupervision.render(cont);
        else if(id === 'Gestión de Usuarios') ModuloUsuarios.render(cont);
        else if(id === 'Roles y Privilegios') ModuloSoftware.renderRoles(cont);
        else if(id === 'Cambio de Contraseñas') ModuloPerfil.render(cont);
        else if(id === 'Manual de Usuario' || id === 'Soporte Técnico') ModuloAyuda.render(cont);
        else if(id === 'Accesibilidad y Apariencia') Acc.render(cont);
        else cont.innerHTML = `<div class="p-5 text-center text-muted"><i class="bi bi-gear-wide-connected fs-1 d-block mb-3 opacity-25"></i> Módulo <b>${id}</b> en desarrollo.</div>`;
    },

    sendRequest: function(data, callback) { 
        fetch(AppConfig.getApiUrl(), { method: "POST", body: JSON.stringify(data) })
        .then(r => r.json()).then(res => callback(res))
        .catch(e => { console.error(e); this.hideLoader(); Swal.fire('Error', 'Fallo de red o servidor.', 'error'); }); 
    },

    descargarOrganigramaPDF: function() {
        const res = this.schoolData || { nombre: "UE Libertador Bolívar" };
        App.showLoader();
        App.sendRequest({ action: "get_supervision" }, (supRes) => {
            const data = supRes.data || [];
            const tempDiv = document.createElement('div');
            tempDiv.style.position = "absolute"; tempDiv.style.top = "-9999px"; tempDiv.style.left = "0";
            tempDiv.style.width = "auto"; tempDiv.style.display = "inline-block"; tempDiv.style.background = "#ffffff";
            tempDiv.style.padding = "80px";

            tempDiv.innerHTML = `
                <div style="width: 100%; text-align: center; font-family: 'Inter', sans-serif;">
                    <div style="background: #00A3FF; color: white; padding: 50px; border-radius: 35px; display: flex; align-items: center; justify-content: center; margin-bottom: 80px; width: 100%;">
                         <img src="assets/img/logo.png" width="110" style="background:white; border-radius:50%; padding:10px; border: 4px solid #fff;">
                         <div style="text-align: left; margin-left: 35px;">
                            <h1 style="margin:0; font-size: 38px;">${res.nombre}</h1>
                            <h3 style="margin:0; opacity:0.9;">Organigrama Estructural Institucional</h3>
                         </div>
                    </div>
                    <div id="pdf-tree-container" class="org-tree-wrapper" style="display: flex; flex-direction: column; align-items: center;"></div>
                </div>`;
            document.body.appendChild(tempDiv);
            
            const container = tempDiv.querySelector('#pdf-tree-container');
            const supervisadosIds = new Set();
            data.forEach(s => s.supervisadosIds.forEach(id => supervisadosIds.add(String(id))));
            const roots = this.allCargos.filter(c => !supervisadosIds.has(String(c.id)));
            
            const drawNodePDF = (cargo, parentNode) => {
                const nodeGroup = document.createElement('div');
                nodeGroup.className = 'org-node-group';
                nodeGroup.style.display = "flex"; nodeGroup.style.flexDirection = "column"; nodeGroup.style.alignItems = "center";
                nodeGroup.innerHTML = `
                    <div style="border-top: 6px solid #0085FF; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border-radius: 20px; padding: 25px; width: 250px; background: white; margin: 0 20px 40px 20px; text-align: center;">
                        <div style="color: #0085FF; font-size: 11px; font-weight: 800; text-transform: uppercase;">${cargo.tipo}</div>
                        <div style="color: #1a202c; font-weight: 700; font-size: 16px;">${cargo.nombre}</div>
                    </div>`;
                parentNode.appendChild(nodeGroup);
                const rel = data.find(s => String(s.supervisorId) === String(cargo.id));
                if (rel && rel.supervisadosIds.length > 0) {
                    const childrenWrapper = document.createElement('div');
                    childrenWrapper.className = 'org-children'; childrenWrapper.style.display = "flex"; childrenWrapper.style.justifyContent = "center";
                    nodeGroup.appendChild(childrenWrapper);
                    rel.supervisadosIds.forEach(id => {
                        const child = this.allCargos.find(c => String(c.id) === String(id));
                        if (child) drawNodePDF(child, childrenWrapper);
                    });
                }
            };
            if (roots.length === 0 && this.allCargos.length > 0) drawNodePDF(this.allCargos[0], container);
            else roots.forEach(root => drawNodePDF(root, container));

            setTimeout(() => {
                html2canvas(tempDiv, { scale: 2, useCORS: true, width: tempDiv.scrollWidth, height: tempDiv.scrollHeight }).then(canvas => {
                    const imgData = canvas.toDataURL('image/png');
                    const { jsPDF } = window.jspdf;
                    const orientation = canvas.width > canvas.height ? 'l' : 'p';
                    const pdf = new jsPDF(orientation, 'mm', 'a4');
                    const pdfW = pdf.internal.pageSize.getWidth();
                    const pdfH = pdf.internal.pageSize.getHeight();
                    const ratio = canvas.width / canvas.height;
                    let finalW = pdfW - 20, finalH = finalW / ratio;
                    if (finalH > (pdfH - 20)) { finalH = pdfH - 20; finalW = finalH * ratio; }
                    pdf.addImage(imgData, 'PNG', (pdfW-finalW)/2, 10, finalW, finalH);
                    pdf.save(`Organigrama_${res.nombre}.pdf`);
                    document.body.removeChild(tempDiv);
                    App.hideLoader();
                    Swal.fire('Éxito', 'Organigrama descargado en PDF', 'success');
                });
            }, 1200);
        });
    },
    logout: function() { localStorage.clear(); location.reload(); }
};

// --- MÓDULOS DE CONFIGURACIÓN Y GESTIÓN ---

const ModuloConfiguracion = {
    anios:[], periodos:[],
    render: function(cont) {
        cont.innerHTML = `<div class="row g-4 animate__animated animate__fadeIn w-100 m-0"><div class="col-lg-7"><div class="card border-0 shadow-sm p-4 rounded-4 bg-white h-100 w-100"><div class="d-flex justify-content-between mb-4"><h6>Años Escolares</h6><button onclick="ModuloConfiguracion.modalAnio()" class="btn btn-sm btn-primary-vibrant rounded-pill px-3 shadow-sm">+ Nuevo</button></div><div class="table-responsive"><table class="table table-hover align-middle"><thead><tr><th>Nombre</th><th>Estado</th><th class="text-end">Acción</th></tr></thead><tbody id="tbl-anios"></tbody></table></div></div></div><div class="col-lg-5"><div class="card border-0 shadow-sm p-4 rounded-4 bg-white h-100 w-100"><div class="d-flex justify-content-between mb-4"><h6>Lapsos / Fases</h6><button onclick="ModuloConfiguracion.modalPeriodo()" class="btn btn-sm btn-warning-vibrant rounded-pill px-3 shadow-sm">+ Agregar</button></div><div id="list-periodos" class="d-flex flex-column gap-2"></div></div></div></div>`;
        this.load();
    },
    load: function() { App.showLoader(); App.sendRequest({ action: "get_school_config" }, (res) => { this.anios = res.anios || []; this.periodos = res.periodos || []; this.draw(); App.hideLoader(); }); },
    draw: function() {
        const t = document.getElementById('tbl-anios'); if(t) t.innerHTML = this.anios.map(a => `<tr><td class="fw-bold">${a.nombre}</td><td><div class="form-check form-switch"><input class="form-check-input" type="checkbox" onchange="ModuloConfiguracion.setActual('${a.id}')" ${a.estado === 'Actual' ? 'checked' : ''}></div></td><td class="text-end"><button onclick="ModuloConfiguracion.modalAnio('${a.id}')" class="btn btn-sm btn-light text-primary rounded-circle"><i class="bi bi-pencil"></i></button><button onclick="ModuloConfiguracion.delete('${a.id}','ANIO')" class="btn btn-sm btn-light text-danger rounded-circle ms-1"><i class="bi bi-trash"></i></button></td></tr>`).join('');
        const l = document.getElementById('list-periodos'); if(l) l.innerHTML = this.periodos.map(p => `<div class="d-flex justify-content-between align-items-center p-3 bg-light rounded-4 border-start border-4 border-warning shadow-sm"><span class="fw-bold">${p.nombre}</span><div><button onclick="ModuloConfiguracion.modalPeriodo('${p.id}','${p.nombre}')" class="btn btn-sm btn-link text-primary"><i class="bi bi-pencil"></i></button><button onclick="ModuloConfiguracion.delete('${p.id}','PERIODO')" class="btn btn-sm btn-link text-danger"><i class="bi bi-trash"></i></button></div></div>`).join('');
    },
    modalAnio: function(id=null){ 
        const d = id?this.anios.find(x=>x.id===id):{}; 
        Swal.fire({ title:'Año Escolar', html:`<input id="sw-a" class="form-control rounded-pill mb-2" value="${d.nombre||''}">`, showCancelButton:true, confirmButtonText:'Guardar' })
        .then(r=>{ if(r.isConfirmed){ App.showLoader(); App.sendRequest({ action:"save_school_year", year:{id, nombre:document.getElementById('sw-a').value}}, (res)=>{ if(res.status==='success') { Swal.fire('Éxito','Año guardado','success'); ModuloConfiguracion.load(); }}); }});
    },
    modalPeriodo: function(id=null, n=''){ Swal.fire({ title:'Lapso', input:'text', inputValue:n, showCancelButton:true, confirmButtonText:'Guardar' }).then(r=>{ if(r.isConfirmed){ App.showLoader(); App.sendRequest({ action:"save_school_period", period:{id, nombre:r.value}}, (res)=>{ if(res.status==='success') { Swal.fire('Éxito','Lapso guardado','success'); ModuloConfiguracion.load(); }}); }}); },
    setActual: function(id){ App.showLoader(); App.sendRequest({ action:"set_current_year", id }, (res)=>{ if(res.status==='success') { Swal.fire('Actualizado','Año activo cambiado','success'); App.loadAppData(); ModuloConfiguracion.load(); }}); },
    delete: function(id, type){ Swal.fire({ title:'¿Eliminar?', icon:'warning', showCancelButton:true }).then(r=>{ if(r.isConfirmed){ App.showLoader(); App.sendRequest({ action:"delete_config_item", id, type }, (res)=>{ if(res.status==='success') { Swal.fire('Eliminado','','success'); ModuloConfiguracion.load(); }}); }}); }
};

const ModuloNiveles = {
    niveles:[],
    render: function(cont) { cont.innerHTML = `<div class="col-12 card border-0 shadow-sm p-4 rounded-4 bg-white w-100"><div class="d-flex justify-content-between mb-4 flex-wrap gap-2"><h6>Niveles Educativos</h6><button onclick="ModuloNiveles.modal()" class="btn btn-sm btn-primary-vibrant rounded-pill px-4 shadow-sm">+ Nuevo Nivel</button></div><div class="table-responsive"><table class="table align-middle w-100"><thead><tr class="table-light"><th>Nombre</th><th class="text-end">Acción</th></tr></thead><tbody id="tbl-niveles"></tbody></table></div></div>`; this.load(); },
    load: function() { App.showLoader(); App.sendRequest({ action: "get_school_config" }, (res) => { this.niveles = res.niveles || []; this.draw(); App.hideLoader(); }); },
    draw: function() { document.getElementById('tbl-niveles').innerHTML = this.niveles.map(n => `<tr><td class="fw-bold px-4">${n.nombre}</td><td class="text-end px-4"><button onclick="ModuloNiveles.modal('${n.id}', '${n.nombre}')" class="btn btn-sm btn-light text-primary rounded-circle shadow-sm"><i class="bi bi-pencil-fill"></i></button><button onclick="ModuloNiveles.delete('${n.id}')" class="btn btn-sm btn-light text-danger rounded-circle ms-1"><i class="bi bi-trash-fill"></i></button></td></tr>`).join(''); },
    modal: function(id=null, n=''){ Swal.fire({ title:'Nivel', input:'text', inputValue:n, showCancelButton:true }).then(r=>{ if(r.isConfirmed){ App.showLoader(); App.sendRequest({ action:"save_school_level", level:{id, nombre:r.value}}, (res)=>{ if(res.status==='success') { Swal.fire('Listo','','success'); ModuloNiveles.load(); }}); }}); },
    delete: function(id){ Swal.fire({ title:'¿Eliminar?', icon:'warning', showCancelButton:true }).then(r=>{ if(r.isConfirmed){ App.showLoader(); App.sendRequest({ action:"delete_config_item", id, type:"NIVEL" }, (res)=>{ if(res.status==='success') { Swal.fire('Eliminado','','success'); ModuloNiveles.load(); }}); }}); }
};

const ModuloEscalas = {
    data:[],
    render: function(cont) { cont.innerHTML = `<div class="col-12 card border-0 shadow-sm p-4 rounded-4 bg-white mb-4 d-flex flex-row justify-content-between align-items-center w-100 flex-wrap gap-2"><h6>Escalas de Calificación</h6><button onclick="ModuloEscalas.modal()" class="btn btn-primary-vibrant rounded-pill px-4 shadow-sm">+ Nueva Escala</button></div><div id="list-escalas" class="row g-4 w-100 m-0"></div>`; this.load(); },
    load: function() { App.showLoader(); App.sendRequest({ action: "get_scales" }, (res) => { this.data = res.escalas || []; this.draw(); App.hideLoader(); }); },
    draw: function() { 
        const div = document.getElementById('list-escalas'); if(!div) return;
        div.innerHTML = this.data.length === 0 ? `<div class="col-12 text-center text-muted py-5">Sin escalas</div>` : this.data.map(e => `<div class="col-md-4"><div class="card border-0 shadow-sm rounded-4 bg-white p-4 border-start border-5 border-magenta h-100"><h6>${e.nombre}</h6><div class="small text-muted mb-2">${e.tipo}</div><div class="d-flex flex-wrap gap-1 mt-2">${e.valores.map(v=>`<span class="badge bg-light text-dark border small">${v}</span>`).join('')}</div><div class="text-end mt-3"><button onclick="ModuloEscalas.modal('${e.id}')" class="btn btn-sm btn-light text-primary rounded-circle shadow-sm"><i class="bi bi-pencil-fill"></i></button><button onclick="ModuloEscalas.delete('${e.id}')" class="btn btn-sm btn-light text-danger rounded-circle ms-1 shadow-sm"><i class="bi bi-trash-fill"></i></button></div></div></div>`).join(''); 
    },
    modal: function(id=null){
        const d = id?this.data.find(x=>x.id===id):{nombre:'',tipo:'Literal',valores:[]};
        Swal.fire({ title:'Escala', html:`<input id="sw-e" class="form-control rounded-pill mb-2" value="${d.nombre}" placeholder="Nombre"><select id="sw-t" class="form-select rounded-pill mb-2"><option value="Literal" ${d.tipo==='Literal'?'selected':''}>Literal</option><option value="Numérica" ${d.tipo==='Numérica'?'selected':''}>Numérica</option></select><textarea id="sw-v" class="form-control rounded-4" placeholder="Valores (Separados por coma)">${d.valores.join(', ')}</textarea>`, showCancelButton:true }).then(r=>{ if(r.isConfirmed){ 
            const n = document.getElementById('sw-e').value, t = document.getElementById('sw-t').value, v = document.getElementById('sw-v').value.split(',').map(x=>x.trim()).filter(x=>x!=='');
            if(!n || v.length===0) return;
            App.showLoader(); App.sendRequest({ action:"save_scale", scale:{id, nombre:n, tipo:t, valores:v}}, (res)=>{ if(res.status==='success') { Swal.fire('Éxito','Escala guardada','success'); ModuloEscalas.load(); }}); 
        }});
    },
    delete: function(id){ Swal.fire({ title:'¿Eliminar?', icon:'warning', showCancelButton:true }).then(r=>{ if(r.isConfirmed){ App.showLoader(); App.sendRequest({ action:"delete_scale", id }, (res)=>{ if(res.status==='success') { Swal.fire('Eliminado','','success'); ModuloEscalas.load(); }}); }}); }
};

const ModuloGrados = {
    data:[],
    render: function(cont) { cont.innerHTML = `<div class="col-12 card border-0 shadow-sm p-4 rounded-4 bg-white mb-4 d-flex flex-row justify-content-between align-items-center w-100 flex-wrap gap-2"><h6>Gestión de Grados / Años</h6><button onclick="ModuloGrados.modal()" class="btn btn-primary-vibrant rounded-pill px-4 shadow-sm">+ Nuevo Grado</button></div><div id="list-grados" class="row g-4 w-100 m-0"></div>`; this.load(); },
    load: function() { App.showLoader(); App.sendRequest({ action: "get_grades" }, (res) => { this.data = res.grados || []; this.draw(); App.hideLoader(); }); },
    draw: function() { 
        const container = document.getElementById('list-grados'); if(!container) return;
        container.innerHTML = this.data.length === 0 ? `<div class="col-12 text-center text-muted py-5">Sin registros</div>` : this.data.map(g => `<div class="col-md-4 col-xl-3"><div class="card border-0 shadow-sm rounded-4 bg-white p-4 h-100 border-top border-4 border-primary"><div><span class="badge bg-primary-subtle text-primary mb-1">${g.nivel}</span><h5 class="fw-bold mb-0">${g.nombre}</h5></div><div class="mt-3 d-flex flex-wrap gap-2">${g.secciones.map(s=>`<span class="badge bg-light text-dark border px-2">Sec. ${s}</span>`).join('')}</div><div class="text-end mt-3"><button onclick="ModuloGrados.modal('${g.id}')" class="btn btn-sm btn-light text-primary rounded-circle"><i class="bi bi-pencil-fill"></i></button><button onclick="ModuloGrados.delete('${g.id}')" class="btn btn-sm btn-light text-danger rounded-circle ms-1"><i class="bi bi-trash-fill"></i></button></div></div></div>`).join(''); 
    },
    modal: function(id=null){
        const d = id?this.data.find(x=>x.id===id):{nombre:'',nivel:'',secciones:[]};
        Swal.fire({ title:'Grado', html:`<select id="sw-n" class="form-select rounded-pill mb-2">${App.nivelesEducativos.map(n=>`<option ${d.nivel===n.nombre?'selected':''}>${n.nombre}</option>`).join('')}</select><input id="sw-g" class="form-control rounded-pill mb-2" value="${d.nombre}" placeholder="Nombre"><input id="sw-s" class="form-control rounded-pill" value="${d.secciones.join(', ')}" placeholder="Secciones">`, showCancelButton:true }).then(r=>{ if(r.isConfirmed){ 
            const v = {id, nivel:document.getElementById('sw-n').value, nombre:document.getElementById('sw-g').value, secciones:document.getElementById('sw-s').value.split(',').map(s=>s.trim().toUpperCase()).filter(s=>s!=='')};
            App.showLoader(); App.sendRequest({ action:"save_grade", grade:v}, (res)=>{ if(res.status==='success') { Swal.fire('Éxito','Grado guardado','success'); ModuloGrados.load(); }}); 
        }});
    },
    delete: function(id){ Swal.fire({ title:'¿Eliminar?', icon:'warning', showCancelButton:true }).then(r=>{ if(r.isConfirmed){ App.showLoader(); App.sendRequest({ action:"delete_grade", id }, (res)=>{ if(res.status==='success') { Swal.fire('Eliminado','','success'); ModuloGrados.load(); }}); }}); }
};

const ModuloCargos = {
    data:[],
    render: function(cont) { cont.innerHTML = `<div class="col-12 card border-0 shadow-sm p-4 rounded-4 bg-white w-100"><div class="d-flex justify-content-between mb-4 flex-wrap gap-2"><h6>Cargos Institucionales</h6><button onclick="ModuloCargos.modal()" class="btn btn-sm btn-primary-vibrant rounded-pill px-4 shadow-sm">+ Nuevo</button></div><div class="table-responsive"><table class="table align-middle w-100"><thead><tr class="table-light"><th>Cargo</th><th>Tipo</th><th class="text-end px-4">Acción</th></tr></thead><tbody id="tbl-cargos"></tbody></table></div></div>`; this.load(); },
    load: function() { App.showLoader(); App.sendRequest({ action: "get_positions" }, (res) => { this.data = res.cargos || []; this.draw(); App.hideLoader(); }); },
    draw: function() { document.getElementById('tbl-cargos').innerHTML = this.data.map(c => `<tr><td class="fw-bold px-4">${c.nombre}</td><td><span class="badge bg-light text-primary border">${c.tipo}</span></td><td class="text-end px-4"><button onclick="ModuloCargos.modal('${c.id}')" class="btn btn-sm btn-light text-primary rounded-circle"><i class="bi bi-pencil"></i></button><button onclick="ModuloCargos.delete('${c.id}')" class="btn btn-sm btn-light text-danger ms-1 rounded-circle"><i class="bi bi-trash"></i></button></td></tr>`).join(''); },
    modal: function(id=null){
        const d = id?this.data.find(x=>x.id===id):{nombre:'',tipo:'Docente',descripcion:''};
        Swal.fire({ title:'Cargo', html:`<input id="sw-c" class="form-control rounded-pill mb-2" value="${d.nombre}"><select id="sw-t" class="form-select rounded-pill mb-2"><option ${d.tipo==='Docente'?'selected':''}>Docente</option><option ${d.tipo==='Directivo'?'selected':''}>Directivo</option><option ${d.tipo==='Administrativo'?'selected':''}>Administrativo</option></select><textarea id="sw-d" class="form-control rounded-4">${d.descripcion}</textarea>`, showCancelButton:true }).then(r=>{ if(r.isConfirmed){ 
            App.showLoader(); App.sendRequest({ action:"save_position", position:{id, nombre:document.getElementById('sw-c').value, tipo:document.getElementById('sw-t').value, descripcion:document.getElementById('sw-d').value}}, (res)=>{ if(res.status==='success') { Swal.fire('Éxito','Cargo guardado','success'); ModuloCargos.load(); }}); 
        }});
    },
    delete: function(id){ Swal.fire({ title:'¿Eliminar?', icon:'warning', showCancelButton:true }).then(r=>{ if(r.isConfirmed){ App.showLoader(); App.sendRequest({ action:"delete_position", id }, (res)=>{ if(res.status==='success') { Swal.fire('Borrado','','success'); ModuloCargos.load(); }}); }}); }
};

const ModuloSupervision = {
    data:[],
    render: function(cont) { cont.innerHTML = `<div class="col-12 card border-0 shadow-sm p-4 rounded-4 bg-white mb-4 d-flex flex-row justify-content-between align-items-center w-100 flex-wrap gap-2"><h6>Cadena Supervisoria</h6><button onclick="ModuloSupervision.modal()" class="btn btn-primary-vibrant rounded-pill px-4 shadow-sm">+ Asignar</button></div><div id="list-supervision" class="row g-4 w-100 m-0"></div>`; this.load(); },
    load: function() { App.showLoader(); App.sendRequest({ action: "get_supervision" }, (res) => { this.data = res.data || []; this.draw(); App.hideLoader(); }); },
    draw: function() { 
        const div = document.getElementById('list-supervision'); if(!div) return;
        div.innerHTML = this.data.length === 0 ? `<div class="col-12 text-center text-muted py-5">Sin jerarquías</div>` : this.data.map(s => {
            const sup = App.allCargos.find(c=>String(c.id)===String(s.supervisorId));
            return `<div class="col-md-4"><div class="card border-0 shadow-sm rounded-4 bg-white p-4 border-start border-5 border-primary h-100"><h6>${sup?sup.nombre:'ID:'+s.supervisorId}</h6><div class="d-flex flex-column gap-1 mt-2">${s.supervisadosIds.map(id=>{ const c=App.allCargos.find(x=>String(x.id)===String(id)); return `<div class="small bg-light p-2 rounded-3">${c?c.nombre:id}</div>`}).join('')}</div><div class="text-end mt-3"><button onclick="ModuloSupervision.modal('${s.supervisorId}')" class="btn btn-sm btn-light text-primary rounded-circle"><i class="bi bi-pencil"></i></button><button onclick="ModuloSupervision.delete('${s.supervisorId}')" class="btn btn-sm btn-light text-danger ms-1"><i class="bi bi-trash"></i></button></div></div></div>`;
        }).join('');
    },
    modal: function(supId=null){
        if(App.allCargos.length===0) return Swal.fire('Error','Registre cargos primero','error');
        const item = supId?this.data.find(x=>String(x.supervisorId)===String(supId)):{supervisorId:'',supervisadosIds:[]};
        let html = `<div class="text-start"><label class="small fw-bold">Supervisor</label><select id="sw-sup" class="form-select rounded-pill mb-3" ${supId?'disabled':''}>${App.allCargos.map(c=>`<option value="${c.id}" ${String(item.supervisorId)===String(c.id)?'selected':''}>${c.nombre}</option>`).join('')}</select><label class="small fw-bold">Supervisados</label><div class="p-3 bg-light rounded-4 border overflow-auto" style="max-height:250px;">`;
        App.allCargos.forEach(c=>{ html+=`<div class="form-check mb-2"><input class="form-check-input chk-s" type="checkbox" value="${c.id}" id="c-${c.id}" ${item.supervisadosIds.includes(String(c.id))?'checked':''}> <label class="form-check-label small fw-bold" for="c-${c.id}">${c.nombre}</label></div>`; });
        html += `</div></div>`;
        Swal.fire({ title:'Jerarquía', html, showCancelButton:true, width:'600px' }).then(r=>{ if(r.isConfirmed){
            const sId = document.getElementById('sw-sup').value, ch = Array.from(document.querySelectorAll('.chk-s:checked')).map(x=>x.value);
            if(!sId || ch.length===0) return;
            App.showLoader(); App.sendRequest({ action:"save_supervision", supervisorId:sId, supervisadosIds:ch }, (res)=>{ if(res.status==='success') { Swal.fire('Listo','','success'); ModuloSupervision.load(); }});
        }});
    },
    delete: function(id){ Swal.fire({ title:'¿Eliminar?', showCancelButton:true }).then(r=>{ if(r.isConfirmed){ App.showLoader(); App.sendRequest({ action:"delete_supervision", supervisorId:id }, (res)=>{ if(res.status==='success') { Swal.fire('Eliminado','','success'); ModuloSupervision.load(); }}); }}); }
};

const ModuloUsuarios = {
    data:[],
    render: function(cont) { cont.innerHTML = `<div class="col-12 card border-0 shadow-sm p-4 rounded-4 bg-white mb-4 w-100"><h6>Autorización de Usuarios</h6><div class="row g-3 mt-1"><div class="col-md-3"><input id="u-c" type="number" class="form-control rounded-pill" placeholder="Cédula"></div><div class="col-md-4"><input id="u-n" type="text" class="form-control rounded-pill" placeholder="Nombre"></div><div class="col-md-3"><select id="u-r" class="form-select rounded-pill">${Object.keys(App.allRoles).map(r=>`<option>${r}</option>`).join('')}<option>Administrador</option></select></div><div class="col-md-2"><button onclick="ModuloUsuarios.save()" class="btn btn-primary-vibrant w-100 rounded-pill shadow-sm">Autorizar</button></div></div></div><div class="col-12 card border-0 shadow-sm p-4 rounded-4 bg-white w-100"><div class="table-responsive"><table class="table table-hover align-middle w-100"><thead><tr class="table-light"><th>Cédula</th><th>Nombre</th><th>Rol</th><th class="text-end">Acción</th></tr></thead><tbody id="tbl-u"></tbody></table></div></div>`; this.load(); },
    load: function() { App.showLoader(); App.sendRequest({ action:"get_users" }, (res)=>{ this.data = res.users || []; this.draw(); App.hideLoader(); }); },
    draw: function() { document.getElementById('tbl-u').innerHTML = this.data.map(u=>`<tr><td class="px-4 fw-bold">V-${u.cedula}</td><td>${u.nombre}</td><td><span class="badge bg-light text-primary border">${u.rol}</span></td><td class="text-end px-4"><button onclick="ModuloUsuarios.edit('${u.cedula}','${u.nombre}','${u.rol}')" class="btn btn-sm btn-light text-primary rounded-circle"><i class="bi bi-pencil-fill"></i></button><button onclick="ModuloUsuarios.delete('${u.cedula}')" class="btn btn-sm btn-light text-danger ms-1 rounded-circle"><i class="bi bi-trash-fill"></i></button></td></tr>`).join(''); },
    save: function(){ 
        const u={cedula:document.getElementById('u-c').value, nombre:document.getElementById('u-n').value, rol:document.getElementById('u-r').value};
        if(!u.cedula || !u.nombre) return;
        App.showLoader(); App.sendRequest({action:"save_user", user:u}, (res)=>{ if(res.status==='success') { Swal.fire('Éxito','Usuario autorizado','success'); ModuloUsuarios.load(); } else { Swal.fire('Error',res.message,'error'); App.hideLoader(); }}); 
    },
    edit: function(c, n, r){ Swal.fire({ title:'Editar', html:`<input id="sw-c" class="form-control mb-2" value="${c}"><input id="sw-n" class="form-control mb-2" value="${n}"><select id="sw-r" class="form-select">${Object.keys(App.allRoles).map(rol=>`<option ${r===rol?'selected':''}>${rol}</option>`).join('')}</select>`, showCancelButton:true }).then(res=>{ if(res.isConfirmed){ App.showLoader(); App.sendRequest({action:"save_user", originalCedula:c, user:{cedula:document.getElementById('sw-c').value, nombre:document.getElementById('sw-n').value, rol:document.getElementById('sw-r').value}}, (res)=>{ if(res.status==='success') { Swal.fire('Éxito','','success'); ModuloUsuarios.load(); }}); }}); },
    delete: function(c){ Swal.fire({ title:'¿Eliminar?', icon:'warning', showCancelButton:true }).then(res=>{ if(res.isConfirmed){ App.showLoader(); App.sendRequest({action:"delete_user", cedula:c}, (res)=>{ if(res.status==='success') { Swal.fire('Eliminado','','success'); ModuloUsuarios.load(); }}); }}); }
};

const ModuloSoftware = {
    renderRoles: function(cont) { 
        let h = ""; for (let r in App.allRoles) { h += `<div class="col-md-6 col-xl-4 mb-3"><div class="card p-3 border-0 shadow-sm d-flex flex-row justify-content-between align-items-center rounded-4 bg-white border-start border-5 border-magenta h-100"><div><h6 class="fw-bold mb-0">${r}</h6><small class="text-muted">${App.allRoles[r].length} permisos</small></div><div class="d-flex gap-1"><button onclick="ModuloSoftware.editRole('${r}')" class="btn btn-sm btn-light text-primary"><i class="bi bi-pencil"></i></button><button onclick="ModuloSoftware.deleteRole('${r}')" class="btn btn-sm btn-light text-danger"><i class="bi bi-trash"></i></button></div></div></div>`; } 
        cont.innerHTML = `<div class="d-flex justify-content-between mb-4 flex-wrap gap-2 w-100"><h5>Roles y Privilegios</h5><button onclick="ModuloSoftware.formRole()" class="btn btn-primary px-4 rounded-pill shadow-sm">Nuevo Rol</button></div><div class="row w-100 m-0">${h}</div>`; 
    },
    formRole: function(n="", p=[]) {
        let o = ""; systemStructure.forEach((c, idx) => { o += `<div class="col-12 mt-3 mb-2 d-flex align-items-center"><span class="badge bg-light text-dark me-3">${c.category}</span><div class="form-check"><input class="form-check-input" type="checkbox" id="cat-${idx}" onchange="ModuloSoftware.toggleCat(this, ${idx})"><label class="form-check-label small" for="cat-${idx}">Todo</label></div></div>`; c.items.forEach(i => { o += `<div class="col-md-6 mb-1"><div class="form-check"><input class="form-check-input r-chk cat-g-${idx}" type="checkbox" value="${i}" id="chk-${i}" ${p.includes(i)?'checked' :''}> <label class="form-check-label small" for="chk-${i}">${i}</label></div></div>`; }); });
        Swal.fire({ title:'Permisos', width:'850px', html: `<input id="r-n" class="form-control rounded-pill mb-3" placeholder="Nombre Rol" value="${n}" ${n?'disabled':''}><div class="row text-start" style="max-height:400px; overflow-y:auto;">${o}</div>`, showCancelButton:true }).then(res => { if(res.isConfirmed){ 
            const nV = document.getElementById('r-n').value, pV = Array.from(document.querySelectorAll('.r-chk:checked')).map(c=>c.value);
            App.showLoader(); App.sendRequest({ action:"save_role", nombre:nV, permisos:pV}, (res)=>{ if(res.status==='success') { Swal.fire('Éxito','Rol configurado','success'); App.loadAppData(); }}); 
        }});
    },
    toggleCat: function(s, idx){ document.querySelectorAll(`.cat-g-${idx}`).forEach(cb=>cb.checked=s.checked); },
    editRole: function(r){ this.formRole(r, App.allRoles[r]); },
    deleteRole: function(r){ Swal.fire({ title:'¿Eliminar?', showCancelButton:true }).then(res => { if(res.isConfirmed){ App.showLoader(); App.sendRequest({ action:"delete_role", nombre:r }, (res)=>{ if(res.status==='success') { Swal.fire('Eliminado','','success'); App.loadAppData(); }}); }}); }
};

const ModuloEscuela = {
    render: function(cont) { const d = App.schoolData || {}; cont.innerHTML = `<div class="col-12 card border-0 shadow-sm p-5 rounded-4 bg-white w-100 animate__animated animate__fadeIn"><h5 class="fw-bold text-primary mb-4">Perfil Institucional</h5><div class="row g-4"><div class="col-md-6"><label class="small fw-bold">Nombre</label><input type="text" id="esc-n" class="form-control rounded-pill" value="${d.nombre||''}"></div><div class="col-md-3"><label class="small fw-bold">DEA</label><input type="text" id="esc-d" class="form-control rounded-pill" value="${d.dea||''}"></div><div class="col-md-3"><label class="small fw-bold">RIF</label><input type="text" id="esc-r" class="form-control rounded-pill" value="${d.rif||''}"></div><div class="col-12"><label class="small fw-bold">Dirección</label><input type="text" id="esc-dir" class="form-control rounded-pill" value="${d.direccion||''}"></div><div class="col-md-3"><label class="small fw-bold">Misión</label><textarea id="esc-m" class="form-control rounded-4" rows="4">${d.mision||''}</textarea></div><div class="col-md-3"><label class="small fw-bold">Visión</label><textarea id="esc-v" class="form-control rounded-4" rows="4">${d.vision||''}</textarea></div><div class="col-md-3"><label class="small fw-bold">Objetivo</label><textarea id="esc-o" class="form-control rounded-4" rows="4">${d.objetivo||''}</textarea></div><div class="col-md-3"><label class="small fw-bold">PEIC</label><textarea id="esc-p" class="form-control rounded-4" rows="4">${d.peic||''}</textarea></div><div class="col-12 text-end"><button onclick="ModuloEscuela.save()" class="btn btn-success-vibrant px-5 rounded-pill shadow">Guardar</button></div></div></div>`; },
    save: function() { const data = { nombre: document.getElementById('esc-n').value, dea: document.getElementById('esc-d').value, rif: document.getElementById('esc-r').value, direccion: document.getElementById('esc-dir').value, mision: document.getElementById('esc-m').value, vision: document.getElementById('esc-v').value, objetivo: document.getElementById('esc-o').value, peic: document.getElementById('esc-p').value }; App.showLoader(); App.sendRequest({ action: "save_school_profile", data }, (res) => { if(res.status==='success') { App.sendRequest({ action: "get_school_profile" }, (resS) => { App.schoolData = resS; Swal.fire('Éxito','Perfil actualizado','success'); this.render(document.getElementById('module-content')); App.hideLoader(); }); }}); }
};

const ModuloPerfil = {
    render: function(cont) { 
        App.showLoader(); 
        App.sendRequest({ action: "get_user_full_data", cedula: App.user.cedula }, (res) => { 
            App.hideLoader(); 
            if (res.status === "success") { 
                const u = res.user; 
                cont.innerHTML = `<div class="col-12 card border-0 shadow-sm rounded-4 bg-white overflow-hidden w-100 animate__animated animate__fadeIn"><div class="p-4 bg-light border-bottom d-flex align-items-center"><div style="width:70px; height:70px; background:#0085FF; color:white; border-radius:50%;" class="d-flex align-items-center justify-content-center me-4 fs-2 fw-bold text-uppercase shadow-sm">${u.nombre.charAt(0)}</div><div><h4 class="fw-bold mb-0 text-dark">${u.nombre}</h4><span class="badge bg-primary px-3 rounded-pill">ROL: ${u.rol}</span></div></div><div class="card-body p-5"><div class="row g-4"><div class="col-md-6"><label class="small fw-bold text-muted">Cédula</label><input class="form-control rounded-pill bg-light fw-bold" value="${u.cedula}" disabled></div><div class="col-md-6"><label class="small fw-bold text-muted">Nombre Completo</label><input id="p-n" class="form-control rounded-pill border-primary-subtle" value="${u.nombre}"></div><div class="col-md-6"><label class="small fw-bold text-muted">Nueva Contraseña</label><div class="input-group"><input id="p-p" type="password" class="form-control rounded-start-pill border-primary-subtle" placeholder="Dejar en blanco para no cambiar"><button class="btn btn-outline-secondary rounded-end-pill" type="button" onclick="App.togglePass('p-p')"><i class="bi bi-eye"></i></button></div></div><div class="col-md-6"><label class="small fw-bold text-muted">Respuesta Secreta</label><input id="p-r" class="form-control rounded-pill border-primary-subtle" value="${u.respuesta || ''}"></div><div class="col-12 text-end mt-4"><button onclick="ModuloPerfil.save()" class="btn btn-primary px-5 py-3 rounded-pill shadow fw-bold">Actualizar Mis Datos</button></div></div></div></div>`; 
            }
        }); 
    },
    save: function() { 
        const u = { cedula: App.user.cedula, nombre: document.getElementById('p-n').value, password: document.getElementById('p-p').value, respuesta: document.getElementById('p-r').value }; 
        if(!u.nombre || !u.respuesta) return Swal.fire('Atención','Nombre y respuesta son obligatorios','warning'); 
        App.showLoader(); App.sendRequest({ action: "update_user_profile", user: u }, (res) => { 
            App.hideLoader();
            if(res.status==='success') { App.user.name = u.nombre; localStorage.setItem('schoolUser', JSON.stringify(App.user)); Swal.fire('Éxito','Perfil actualizado','success'); this.render(document.getElementById('module-content')); }
        }); 
    }
};

const Acc = {
    settings: { darkMode: false, grayscale: false, readableFont: false, fontSize: 0 },
    init: function() { const s = localStorage.getItem('sigae_acc'); if (s) this.settings = JSON.parse(s); this.apply(); },
    apply: function() { const b = document.body.classList; b.toggle('dark-mode', this.settings.darkMode); b.toggle('acc-grayscale', this.settings.grayscale); b.toggle('readable-font', this.settings.readableFont); document.documentElement.style.fontSize = ['16px','18px','20px'][this.settings.fontSize]; },
    toggle: function(p) { if(p==='fontSize') this.settings.fontSize=(this.settings.fontSize+1)%3; else this.settings[p]=!this.settings[p]; this.save(); this.apply(); if(document.getElementById('acc-panel')) this.render(document.getElementById('module-content')); },
    reset: function() { this.settings={darkMode:false,grayscale:false,readableFont:false,fontSize:0}; this.save(); this.apply(); if(document.getElementById('acc-panel')) this.render(document.getElementById('module-content')); },
    save: function() { localStorage.setItem('sigae_acc', JSON.stringify(this.settings)); },
    render: function(cont) { 
        const s = this.settings, txt = ['Normal','Grande','Extra']; 
        cont.innerHTML = `<div id="acc-panel" class="col-12 card border-0 shadow-sm rounded-4 bg-white p-5 text-center w-100 animate__animated animate__fadeIn"><i class="bi bi-universal-access-circle fs-1 text-primary mb-3"></i><h4>Configuración de Apariencia</h4><div class="row g-4 mt-2"><div class="col-md-6"><div class="d-flex justify-content-between p-4 bg-light rounded-4 border"><b>Modo Oscuro</b><input class="form-check-input fs-3" type="checkbox" onchange="Acc.toggle('darkMode')" ${s.darkMode?'checked':''}></div></div><div class="col-md-6"><div class="d-flex justify-content-between p-4 bg-light rounded-4 border"><b>Escala Grises</b><input class="form-check-input fs-3" type="checkbox" onchange="Acc.toggle('grayscale')" ${s.grayscale?'checked':''}></div></div><div class="col-md-6"><div class="d-flex justify-content-between p-4 bg-light rounded-4 border"><b>Fuente Simple</b><input class="form-check-input fs-3" type="checkbox" onchange="Acc.toggle('readableFont')" ${s.readableFont?'checked':''}></div></div><div class="col-md-6"><div class="d-flex justify-content-between p-4 bg-light rounded-4 border"><b>Tamaño Texto</b><button onclick="Acc.toggle('fontSize')" class="btn btn-primary rounded-pill px-4">${txt[s.fontSize]}</button></div></div></div><button onclick="Acc.reset()" class="btn btn-danger-vibrant rounded-pill px-5 py-2 mt-5 fw-bold">Restablecer</button></div>`;
    }
};

const ModuloAyuda = { render: function(cont) { cont.innerHTML = `<div class="row g-4 w-100 m-0"><div class="col-md-6"><div class="card border-0 shadow-sm p-5 rounded-4 bg-white text-center h-100"><i class="bi bi-book-half fs-1 text-primary mb-3"></i><h5>Manual</h5><button class="btn btn-outline-primary rounded-pill mt-3" disabled>Próximamente</button></div></div><div class="col-md-6"><div class="card border-0 shadow-sm p-5 rounded-4 bg-white text-center h-100"><i class="bi bi-life-preserver fs-1 text-danger mb-3"></i><h5>Soporte</h5><p class="small text-muted mt-3">Email: soporte@sigae.com</p></div></div></div>`; } };

document.addEventListener("DOMContentLoaded", () => App.init());