/**
 * SIGAE v3.1 - UE Libertador Bolívar
 * ARCHIVO: app.js (Versión Consolidada - TRANSPORTE COMPLETO Y GUARDIAS)
 */

const systemStructure = [
    { category: "Escuela", icon: "bi-building", color: "#FF8D00", items: ["Perfil de la Escuela", "Fases y Periodos", "Niveles Educativos", "Escalas de Evaluación", "Gestión de Cargos", "Cadena Supervisoria", "Grado / Año"] },
    { category: "Docentes", icon: "bi-person-badge-fill", color: "#00D158", items: ["Agregar Docentes", "Asignar Cargos", "Registrar Tipos de Ausencias (Doc)", "Registrar Ausencias (Doc)", "Expediente Docente", "Condición Salud (Doc)", "Reporte Gestión Diaria (Doc)", "Planes de Evaluación"] },
    { category: "Estudiantes", icon: "bi-people-fill", color: "#00C3FF", items: ["Agregar Estudiante (Nuevo)", "Agregar Estudiante (Regular)", "Asignar Cargos (Est)", "Registrar Tipos de Ausencias (Est)", "Registrar Ausencias (Est)", "Expediente Estudiante", "Condición Salud (Est)", "Voceros Estudiantiles"] },
    { category: "Representantes", icon: "bi-person-heart", color: "#E5007E", items: ["Solicitudes (Retiro/Notas/Constancia)", "Actualización de Datos (Regular)", "Inscripciones (Nuevos)", "Ver Boleta", "Ver Corte de Calificaciones"] },
    { category: "Administrativo", icon: "bi-clipboard-check-fill", color: "#6f42c1", items: ["Accidentes/Casiaccidentes (Doc)", "Accidentes/Casiaccidentes (Est)", "Reporte Preliminar Asistencias", "Reporte Incidentes y Requerimientos", "Gestión Diaria (Revisada)", "Gestión Mensual (DEP/CDV)", "Requerimientos Anuales", "Registros de Espacios", "Asignación de Espacios", "Agregar Colectivos Docentes", "Asignación de Colectivos", "Crear Salones", "Estadísticas"] },
    { category: "Transporte Escolar", icon: "bi-bus-front-fill", color: "#FF8D00", items: ["Rutas y Paradas", "Asignación de Recorridos", "Rutogramas", "Guardias de Transporte", "Registro de Asistencias (Transp)", "Reporte Incidentes (Est/Transp)", "Reporte Incidentes (Servicio)"] },
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
            if(this.user && this.user.role === "Visitante" && !this.allRoles["Visitante"]) {
                this.allRoles["Visitante"] = ["Solicitud de Cupos", "Accesibilidad y Apariencia", "Manual de Usuario"];
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
            } else { this.hideLoader(); Swal.fire('Error', 'Cédula o clave incorrecta', 'error'); }
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

    registrarClave: function() {
        const p = document.getElementById('regPass').value, q = document.getElementById('regPregunta').value, r = document.getElementById('regRespuesta').value;
        if(!p || !q || !r) return Swal.fire('Atención','Llene todos los campos','warning');
        this.showLoader();
        App.sendRequest({ action: "registrar_clave", cedula: this.tempCedula, password: p, pregunta: q, respuesta: r }, (res) => {
            this.hideLoader();
            if(res.status === "success") { 
                Swal.fire('Éxito', 'Cuenta activada correctamente', 'success').then(() => location.reload()); 
            }
        });
    },

    modalInvitado: async function() {
        const { value: nombre } = await Swal.fire({ title: 'Acceso Invitado', input: 'text', inputLabel: '¿Su nombre?', confirmButtonText: 'Entrar', confirmButtonColor: '#0085FF', showCancelButton: true });
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
                html += `<div class="accordion-item bg-transparent border-0"><button class="nav-category-btn collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${id}"><span><i class="bi ${cat.icon} me-2" style="color:${cat.color}"></i> <span>${cat.category}</span></span><i class="bi bi-chevron-down small opacity-50"></i></button><div id="${id}" class="accordion-collapse collapse" data-bs-parent="#sidebar-menu"><div class="accordion-body p-0">${allowedItems.map(item => `<a href="javascript:void(0)" onclick="App.renderView('${item}','${item}')" class="nav-sub-item" data-id="${item}">${item}</a>`).join('')}</div></div></div>`;
            }
        });
        container.innerHTML = html;
    },

    setActiveMenuItem: function(id) {
        document.querySelectorAll('.nav-sub-item').forEach(el => el.classList.remove('active'));
        if(id !== 'Inicio') {
            const activeEl = document.querySelector(`.nav-sub-item[data-id="${id}"]`);
            if(activeEl) {
                activeEl.classList.add('active');
                const collapseEl = activeEl.closest('.accordion-collapse');
                if(collapseEl) {
                    collapseEl.classList.add('show');
                    const btn = collapseEl.parentElement.querySelector('.nav-category-btn');
                    if(btn) btn.classList.remove('collapsed');
                }
            }
        }
    },

    showDashboard: function() {
        this.currentView = 'Inicio'; localStorage.setItem('lastView', 'Inicio');
        this.setActiveMenuItem('Inicio');
        if(window.innerWidth < 992) document.body.classList.remove('sidebar-open');
        document.getElementById('dynamic-view').style.display = 'none';
        const dash = document.getElementById('dashboard-view'); dash.style.display = 'block';
        const res = this.schoolData || { nombre: "UE Libertador Bolívar" };
        
        dash.innerHTML = `
        <div class="p-4">
            <div class="row g-4">
                <div class="col-12 anim-stagger-1">
                    <div class="card p-5 text-white shadow-lg border-0 module-card position-relative overflow-hidden" style="background: linear-gradient(135deg, #00C3FF 0%, #0085FF 100%); border-radius: 30px;">
                        <div class="position-relative z-1">
                            <span class="badge bg-white text-primary mb-3 px-3 py-2 rounded-pill fw-bold shadow-sm">Año Escolar ${this.activeYear}</span>
                            <h2 class="fw-bold mb-1">${res.nombre}</h2>
                            <p class="opacity-75 mb-4"><i class="bi bi-geo-alt-fill me-1"></i> ${res.direccion || '---'}</p>
                            <button onclick="App.descargarOrganigramaPDF()" class="btn btn-light text-primary fw-bold rounded-pill px-4 shadow btn-action">
                                <i class="bi bi-file-earmark-pdf-fill me-2"></i> Descargar Organigrama (PDF)
                            </button>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 anim-stagger-2"><div class="dash-card border-left-blue"><h6>Misión</h6><p class="small text-muted mb-0 text-truncate-3">${res.mision || '--'}</p></div></div>
                <div class="col-md-3 anim-stagger-3"><div class="dash-card border-left-green"><h6>Visión</h6><p class="small text-muted mb-0 text-truncate-3">${res.vision || '--'}</p></div></div>
                <div class="col-md-3 anim-stagger-4"><div class="dash-card border-left-yellow"><h6>Objetivo</h6><p class="small text-muted mb-0 text-truncate-3">${res.objetivo || '--'}</p></div></div>
                <div class="col-md-3 anim-stagger-5"><div class="dash-card border-left-red"><h6>PEIC</h6><p class="small text-muted mb-0 text-truncate-3">${res.peic || '--'}</p></div></div>
            </div>
        </div>`;
    },

    renderView: function(id, title) {
        if(id === 'Inicio') { this.showDashboard(); return; }
        this.currentView = id; localStorage.setItem('lastView', id);
        this.setActiveMenuItem(id);
        
        if(window.innerWidth < 992) document.body.classList.remove('sidebar-open');
        document.getElementById('dashboard-view').style.display = 'none';
        const div = document.getElementById('dynamic-view'); 
        div.style.display = 'block';
        document.getElementById('page-title').innerText = title || id;
        
        div.innerHTML = `<div class="p-4"><button onclick="App.showDashboard()" class="btn btn-sm btn-light rounded-pill border shadow-sm px-4 mb-4 btn-action text-primary fw-bold"><i class="bi bi-arrow-left"></i> Volver al Inicio</button><div id="module-content" class="w-100"></div></div>`;
        const cont = document.getElementById('module-content');
        
        try {
            if(id === 'Perfil de la Escuela') ModuloEscuela.render(cont);
            else if(id === 'Fases y Periodos') ModuloConfiguracion.render(cont);
            else if(id === 'Niveles Educativos') ModuloNiveles.render(cont);
            else if(id === 'Escalas de Evaluación') ModuloEscalas.render(cont);
            else if(id === 'Grado / Año') ModuloGrados.render(cont);
            else if(id === 'Gestión de Cargos') ModuloCargos.render(cont);
            else if(id === 'Cadena Supervisoria') ModuloSupervision.render(cont);
            else if(id === 'Asignar Cargos') ModuloDocentes.renderAsignarCargo(cont);
            else if(id === 'Solicitud de Cupos') ModuloCupos.renderSolicitud(cont);
            else if(id === 'Gestión de Usuarios') ModuloUsuarios.render(cont);
            else if(id === 'Roles y Privilegios') ModuloSoftware.renderRoles(cont);
            else if(id === 'Cambio de Contraseñas') ModuloPerfil.render(cont);
            else if(id === 'Manual de Usuario' || id === 'Soporte Técnico') ModuloAyuda.render(cont);
            else if(id === 'Accesibilidad y Apariencia') Acc.render(cont);
            
            // --- MÓDULOS DE TRANSPORTE ---
            else if(id === 'Rutas y Paradas') ModuloRutasParadas.render(cont);
            else if(id === 'Asignación de Recorridos') ModuloRecorridos.render(cont);
            else if(id === 'Rutogramas') ModuloRutogramas.render(cont);
            else if(id === 'Guardias de Transporte') ModuloGuardiasTransporte.render(cont);
            
            else cont.innerHTML = `<div class="p-5 text-center text-muted anim-stagger-1"><i class="bi bi-gear-wide-connected fs-1 d-block mb-3 opacity-25"></i> Módulo <b>${id}</b> en desarrollo.</div>`;
        } catch (error) {
            console.error("Error al renderizar el módulo:", error);
            cont.innerHTML = `<div class="alert alert-danger border-0 rounded-4 shadow-sm p-4 anim-stagger-1"><h5 class="fw-bold"><i class="bi bi-exclamation-circle-fill me-2"></i>Error de Carga</h5><p class="mb-0">El módulo no se pudo inicializar. Detalles técnicos: ${error.message}</p></div>`;
        }
    },

    sendRequest: function(data, callback) { 
        fetch(AppConfig.getApiUrl(), { method: "POST", body: JSON.stringify(data) })
        .then(r => r.json()).then(res => {
            if (res.status === "error") {
                console.error("Error del backend:", res.message);
                App.hideLoader();
                Swal.fire('Error del Servidor', res.message, 'error');
            } else {
                callback(res);
            }
        })
        .catch(e => { console.error(e); this.hideLoader(); Swal.fire('Error', 'Fallo de conexión o el Backend no ha sido Implementado correctamente.', 'error'); }); 
    },

    descargarOrganigramaPDF: function() {
        const res = this.schoolData || { nombre: "UE Libertador Bolívar" };
        App.showLoader();
        App.sendRequest({ action: "get_supervision" }, (supRes) => {
            const data = supRes.data || [];
            const tempDiv = document.createElement('div');
            tempDiv.style.position = "absolute"; tempDiv.style.top = "-9999px"; tempDiv.style.left = "0";
            tempDiv.style.width = "auto"; tempDiv.style.display = "inline-block"; tempDiv.style.background = "#ffffff";
            tempDiv.style.padding = "60px";

            tempDiv.innerHTML = `
                <div style="text-align: center; font-family: 'Inter', sans-serif;">
                    <div style="background: #00A3FF; color: white; padding: 40px; border-radius: 35px; display: flex; align-items: center; justify-content: center; margin-bottom: 60px;">
                         <img src="assets/img/logo.png" width="100" style="background:white; border-radius:50%; padding:10px;">
                         <div style="text-align: left; margin-left: 30px;">
                            <h1 style="margin:0; font-size: 36px; font-weight:700;">${res.nombre}</h1>
                            <h3 style="margin:0; opacity:0.9;">Organigrama Estructural Institucional</h3>
                         </div>
                    </div>
                    <div id="pdf-tree-container" style="display:flex; flex-direction:column; align-items:center;"></div>
                </div>`;
            document.body.appendChild(tempDiv);
            
            const container = tempDiv.querySelector('#pdf-tree-container');
            const supervisadosIds = new Set();
            data.forEach(s => s.supervisadosIds.forEach(id => supervisadosIds.add(String(id))));
            const roots = this.allCargos.filter(c => !supervisadosIds.has(String(c.id)));
            
            const drawNodePDF = (cargo, parentNode) => {
                const nodeGroup = document.createElement('div');
                nodeGroup.innerHTML = `<div style="border-top: 6px solid #0085FF; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border-radius: 20px; padding: 20px; width: 220px; background: white; margin: 0 15px 40px 15px; text-align: center;"><div style="color: #0085FF; font-size: 10px; font-weight: 800; text-transform: uppercase;">${cargo.tipo}</div><div style="color: #1a202c; font-weight: 700; font-size: 14px;">${cargo.nombre}</div></div>`;
                parentNode.appendChild(nodeGroup);
                const rel = data.find(s => String(s.supervisorId) === String(cargo.id));
                if (rel && rel.supervisadosIds.length > 0) {
                    const childrenWrapper = document.createElement('div');
                    childrenWrapper.style.display = "flex"; childrenWrapper.style.justifyContent = "center";
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
                    pdf.save(`Organigrama_Institucional.pdf`);
                    document.body.removeChild(tempDiv);
                    App.hideLoader();
                    Swal.fire('Éxito', 'Organigrama descargado en PDF', 'success');
                });
            }, 1500);
        });
    },
    logout: function() { localStorage.clear(); location.reload(); }
};

// ==========================================
// --- MÓDULO SOLICITUD DE CUPOS ---
// ==========================================
const ModuloCupos = {
    renderSolicitud: function(cont) {
        cont.innerHTML = `
        <div class="col-12 card border-0 shadow-sm rounded-4 bg-white module-card anim-stagger-1 overflow-hidden mb-4">
            <div class="module-header bg-gradient-purple">
                <div class="d-flex align-items-center">
                    <div class="module-icon-box text-primary"><i class="bi bi-journal-bookmark-fill fs-4" style="color: #6f42c1;"></i></div>
                    <div><h5 class="fw-bold mb-0 text-white">Solicitud de Cupos</h5><small class="opacity-75 text-white">Formulario de registro institucional</small></div>
                </div>
            </div>
            <div class="p-4 p-md-5 pt-4">
                <div class="alert alert-warning border-0 rounded-4 mb-0 shadow-sm d-flex align-items-center">
                    <input class="form-check-input input-interactive me-3 fs-4 mt-0 cursor-pointer" type="checkbox" id="check-veracidad">
                    <label class="form-check-label small cursor-pointer" for="check-veracidad">
                        <strong>Términos y Condiciones:</strong> Declaro que la información aportada en este formulario es veraz y actualizada, comprendiendo la importancia de la misma para el control, gestión y administración por parte de la UE Libertador Bolívar. Soy consciente además de la responsabilidad civil relacionada con la calidad de los datos que aporto.
                    </label>
                </div>
            </div>
        </div>

        <form id="form-cupo" class="pb-5">
            <div class="card border-0 shadow-sm rounded-4 bg-white module-card anim-stagger-2 mb-4 overflow-hidden">
                <div class="bg-light p-3 border-bottom"><h6 class="text-primary fw-bold mb-0"><i class="bi bi-person-badge me-2"></i>Sección 2: Datos Representante Legal</h6></div>
                <div class="p-4 row g-4">
                    <div class="col-md-8"><label class="small fw-bold">Nombres y Apellidos (Representante) *</label><input type="text" id="rep_nombre" class="form-control input-interactive rounded-pill" required></div>
                    <div class="col-md-4"><label class="small fw-bold">Nacionalidad *</label><select id="rep_nacionalidad" class="form-select input-interactive rounded-pill" required><option value="">Seleccione...</option><option value="V">Venezolana (V)</option><option value="E">Extranjera (E)</option></select></div>
                    <div class="col-md-4"><label class="small fw-bold">N° de Cédula de Identidad *</label><input type="number" id="rep_cedula" class="form-control input-interactive rounded-pill" required></div>
                    <div class="col-md-4"><label class="small fw-bold">Correo Personal *</label><input type="email" id="rep_correo_p" class="form-control input-interactive rounded-pill" required></div>
                    <div class="col-md-4"><label class="small fw-bold">Correo de la Empresa</label><input type="email" id="rep_correo_e" class="form-control input-interactive rounded-pill"></div>
                    <div class="col-md-3"><label class="small fw-bold">Número de Teléfono 1 *</label><input type="text" id="rep_tel1" class="form-control input-interactive rounded-pill" placeholder="Ej: 0291-6510384 o 0416-6263890" required></div>
                    <div class="col-md-3"><label class="small fw-bold">Número de Teléfono 2</label><input type="text" id="rep_tel2" class="form-control input-interactive rounded-pill"></div>
                    <div class="col-md-3"><label class="small fw-bold">Tipo de Nómina *</label><select id="rep_nomina" class="form-select input-interactive rounded-pill" required><option value="">Seleccione...</option><option>Contractual</option><option>No Contractual</option><option>Jubilado</option></select></div>
                    <div class="col-md-3"><label class="small fw-bold">Negocio/Filial *</label><select id="rep_filial" class="form-select input-interactive rounded-pill" required><option value="">Seleccione...</option><option>Producción Oriente</option><option>PDVSA Servicios</option><option>CVP</option><option>PDVSA Gas</option><option>FAJA</option><option>Transporte Aéreo</option><option>Desarrollo Urbano</option><option>Auditoria Interna</option><option>BARIVEN</option><option>MINPET</option><option>OTROS</option></select></div>
                    <div class="col-md-6"><label class="small fw-bold">Organización/Gerencia *</label><input type="text" id="rep_gerencia" class="form-control input-interactive rounded-pill" required></div>
                    <div class="col-md-6"><label class="small fw-bold">Localidad de Trabajo *</label><input type="text" id="rep_localidad_t" class="form-control input-interactive rounded-pill" required></div>
                </div>
            </div>

            <div class="card border-0 shadow-sm rounded-4 bg-white module-card anim-stagger-3 mb-4 overflow-hidden">
                <div class="bg-light p-3 border-bottom"><h6 class="text-success fw-bold mb-0"><i class="bi bi-backpack me-2"></i>Sección 3: Datos del Estudiante</h6></div>
                <div class="p-4 row g-4">
                    <div class="col-md-8"><label class="small fw-bold">Nombres y Apellidos (Estudiante) *</label><input type="text" id="est_nombre" class="form-control input-interactive rounded-pill" required></div>
                    <div class="col-md-4"><label class="small fw-bold">N° de Cédula de Identidad o Escolar *</label><input type="text" id="est_id" class="form-control input-interactive rounded-pill" required></div>
                    <div class="col-md-3"><label class="small fw-bold">Género *</label><select id="est_genero" class="form-select input-interactive rounded-pill" required><option value="">Seleccione...</option><option>Masculino</option><option>Femenino</option></select></div>
                    <div class="col-md-3"><label class="small fw-bold">Fecha de Nacimiento *</label><input type="date" id="est_nacimiento" class="form-control input-interactive rounded-pill" required></div>
                    <div class="col-md-3"><label class="small fw-bold">Número de hijo en familia *</label><select id="est_hijo_num" class="form-select input-interactive rounded-pill" required><option value="">Seleccione...</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option><option>9</option><option>10</option></select></div>
                    <div class="col-md-3"><label class="small fw-bold">Parentesco *</label><select id="est_parentesco" class="form-select input-interactive rounded-pill" required><option value="">Seleccione...</option><option>Hijo o Hija</option><option>Sobrino o Sobrina</option><option>Nieto o Nieta</option><option>Hermano o Hermana</option></select></div>
                    <div class="col-md-6"><label class="small fw-bold">Grupo, Grado o Año a Cursar *</label><select id="est_grado" class="form-select input-interactive rounded-pill" required></select></div>
                    <div class="col-md-6"><label class="small fw-bold">Ruta y Parada Escolar *</label><input type="text" id="ruta_parada" class="form-control input-interactive rounded-pill" placeholder="Ej: Ruta 1 Puertas del Sur - Parada Doña Trina" required></div>
                    <div class="col-md-8"><label class="small fw-bold">Dirección de Habitación *</label><input type="text" id="dir_habitacion" class="form-control input-interactive rounded-pill" required></div>
                    <div class="col-md-4"><label class="small fw-bold">Localidad *</label><input type="text" id="localidad" class="form-control input-interactive rounded-pill" required></div>
                    
                    <div class="col-md-6">
                        <label class="small fw-bold d-block mb-2">Solicitudes realizadas en años anteriores</label>
                        <div id="container-prev-sol" class="bg-light p-3 rounded-4 border">
                            <span class="text-muted small">Cargando periodos...</span>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <label class="small fw-bold d-block mb-2">¿Tiene otro(a) representado(a) inscrito(a) en la UE Libertador Bolívar?</label>
                        <select id="prev_inscritos" class="form-select input-interactive rounded-pill"><option value="No">No</option><option value="Si">Sí</option></select>
                    </div>
                </div>
            </div>

            <div class="row g-4 mb-4">
                <div class="col-md-6 anim-stagger-4">
                    <div class="card border-0 shadow-sm rounded-4 bg-white module-card h-100 overflow-hidden">
                        <div class="bg-light p-3 border-bottom"><h6 class="text-magenta fw-bold mb-0" style="color: #E5007E;"><i class="bi bi-person-hearts me-2"></i>Sección 4: Datos de la Madre</h6></div>
                        <div class="p-4 row g-3">
                            <div class="col-12"><label class="small fw-bold">N° de Cédula de Identidad (Madre) *</label><input type="number" id="madre_id" class="form-control input-interactive rounded-pill" required></div>
                            <div class="col-12"><label class="small fw-bold">Nombres y Apellidos (Madre) *</label><input type="text" id="madre_nombre" class="form-control input-interactive rounded-pill" required></div>
                            <div class="col-12"><label class="small fw-bold">Número de Teléfono (Madre) *</label><input type="text" id="madre_tel" class="form-control input-interactive rounded-pill" required></div>
                            <div class="col-12"><label class="small fw-bold">Correo Electrónico (Madre) *</label><input type="email" id="madre_email" class="form-control input-interactive rounded-pill" required></div>
                            <div class="col-12"><label class="small fw-bold">¿Trabajadora de PDVSA? *</label><select id="madre_pdvsa" class="form-select input-interactive rounded-pill" required><option value="">Seleccione...</option><option value="No">No</option><option value="Si">Sí</option></select></div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 anim-stagger-4">
                    <div class="card border-0 shadow-sm rounded-4 bg-white module-card h-100 overflow-hidden">
                        <div class="bg-light p-3 border-bottom"><h6 class="text-info fw-bold mb-0" style="color: #0dcaf0;"><i class="bi bi-person-lines-fill me-2"></i>Sección 5: Datos del Padre</h6></div>
                        <div class="p-4 row g-3">
                            <div class="col-12"><label class="small fw-bold">N° de Cédula de Identidad (Padre) *</label><input type="number" id="padre_id" class="form-control input-interactive rounded-pill" required></div>
                            <div class="col-12"><label class="small fw-bold">Nombres y Apellidos (Padre) *</label><input type="text" id="padre_nombre" class="form-control input-interactive rounded-pill" required></div>
                            <div class="col-12"><label class="small fw-bold">Número de Teléfono (Padre) *</label><input type="text" id="padre_tel" class="form-control input-interactive rounded-pill" required></div>
                            <div class="col-12"><label class="small fw-bold">Correo Electrónico (Padre) *</label><input type="email" id="padre_email" class="form-control input-interactive rounded-pill" required></div>
                            <div class="col-12"><label class="small fw-bold">¿Trabajador de PDVSA? *</label><select id="padre_pdvsa" class="form-select input-interactive rounded-pill" required><option value="">Seleccione...</option><option value="No">No</option><option value="Si">Sí</option></select></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card border-0 shadow-sm rounded-4 bg-white module-card anim-stagger-5 overflow-hidden">
                <div class="p-4">
                    <label class="small fw-bold text-muted">Observaciones</label>
                    <textarea id="observaciones" class="form-control input-interactive rounded-4 mt-2" rows="3" placeholder="Texto de respuesta largo..."></textarea>
                    <div class="text-center mt-5 pt-3 border-top">
                        <button type="button" onclick="ModuloCupos.enviarSolicitud()" class="btn btn-primary-vibrant px-5 py-3 rounded-pill shadow-lg fw-bold btn-action" style="font-size:1.1rem; letter-spacing: 1px;">
                            <i class="bi bi-send-fill me-2"></i> ENVIAR SOLICITUD
                        </button>
                    </div>
                </div>
            </div>
        </form>`;
        this.cargarDatosDinamicos();
    },

    cargarDatosDinamicos: function() {
        const selGrado = document.getElementById('est_grado'); 
        if(selGrado) selGrado.innerHTML = '<option value="">Cargando grados...</option>';
        App.sendRequest({ action: "get_grades" }, (res) => { 
            if(res.grados && selGrado) {
                selGrado.innerHTML = '<option value="">Seleccione...</option>' + res.grados.map(g => `<option value="${g.nombre} (${g.nivel})">${g.nombre} (${g.nivel})</option>`).join('');
            }
        });

        const contPrevSol = document.getElementById('container-prev-sol');
        if(contPrevSol) contPrevSol.innerHTML = '<span class="text-muted small">Cargando periodos...</span>';
        App.sendRequest({ action: "get_school_config" }, (res) => {
            if(res.anios && contPrevSol) {
                let html = res.anios.map((a, i) => `
                    <div class="form-check mb-1">
                        <input class="form-check-input prev-sol cursor-pointer input-interactive" type="checkbox" value="${a.nombre}" id="ps${i}">
                        <label class="form-check-label small cursor-pointer" for="ps${i}">${a.nombre}</label>
                    </div>
                `).join('');
                html += `<div class="form-check mt-2 border-top pt-2"><input class="form-check-input prev-sol cursor-pointer input-interactive" type="checkbox" value="Ninguna" id="ps_none"><label class="form-check-label small cursor-pointer fw-bold" for="ps_none">Ninguna</label></div>`;
                contPrevSol.innerHTML = html;
            }
        });
    },

    enviarSolicitud: function() {
        if(!document.getElementById('check-veracidad').checked) return Swal.fire('Atención', 'Debe aceptar la declaración de veracidad al inicio del formulario.', 'warning');
        
        const inputs = document.querySelectorAll('#form-cupo input[type="text"], #form-cupo input[type="number"], #form-cupo input[type="email"], #form-cupo input[type="date"], #form-cupo select, #form-cupo textarea');
        const solicitud = {}; 
        let missing = false;
        
        inputs.forEach(i => { 
            if(i.required && !i.value) missing = true; 
            solicitud[i.id] = i.value; 
        });

        const prevSol = Array.from(document.querySelectorAll('.prev-sol:checked')).map(cb => cb.value).join(', ');
        solicitud['prev_solicitudes'] = prevSol || 'Ninguna';

        if(missing) return Swal.fire('Error', 'Complete todos los campos obligatorios marcados con (*).', 'error');
        
        App.showLoader();
        App.sendRequest({ action: "save_cupo_request", solicitud }, (res) => {
            App.hideLoader();
            if(res.status === "success") {
                Swal.fire('¡Recibido!', 'Su solicitud ha sido registrada exitosamente.', 'success').then(() => App.showDashboard());
            }
        });
    }
};

// ==========================================
// --- MÓDULOS DE ESCUELA Y CONFIGURACIÓN ---
// ==========================================

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

const ModuloDocentes = {
    assignments: [],
    renderAsignarCargo: function(cont) {
        cont.innerHTML = `
        <div class="col-12 card border-0 shadow-sm rounded-4 bg-white mb-4 module-card anim-stagger-1 overflow-hidden">
            <div class="module-header bg-gradient-green mb-0">
                <div class="d-flex align-items-center">
                    <div class="module-icon-box text-success"><i class="bi bi-person-vcard-fill fs-4"></i></div>
                    <div><h5 class="fw-bold mb-0 text-white">Asignación de Cargo</h5><small class="opacity-75 text-white">Vinculación de personal a roles específicos</small></div>
                </div>
            </div>
            <div class="p-4 pt-4 row g-3 align-items-end">
                <div class="col-md-5"><label class="small fw-bold text-muted ps-2">Personal Sin Cargo</label><select id="staff-select" class="form-select input-interactive rounded-pill shadow-none"></select></div>
                <div class="col-md-5"><label class="small fw-bold text-muted ps-2">Cargo</label><select id="cargo-select" class="form-select input-interactive rounded-pill shadow-none"></select></div>
                <div class="col-md-2"><button onclick="ModuloDocentes.saveAssignment()" class="btn btn-primary-vibrant w-100 rounded-pill fw-bold shadow-sm btn-action"><i class="bi bi-check-circle-fill me-2"></i>Asignar</button></div>
            </div>
        </div>
        <div class="col-12 card border-0 shadow-sm p-4 rounded-4 bg-white module-card anim-stagger-2">
            <div class="table-responsive"><table class="table table-interactive align-middle w-100"><thead class="table-light"><tr><th>Personal</th><th>Cédula</th><th>Cargo</th><th class="text-end px-4">Acción</th></tr></thead><tbody id="tbl-assignments"></tbody></table></div>
        </div>`;
        this.loadAssignments();
    },
    loadAssignments: function() { App.showLoader(); App.sendRequest({ action: "get_assigned_staff" }, (res) => { App.hideLoader(); this.assignments = res.assignments || []; this.drawAssignments(); this.updateSelectors(); }); },
    drawAssignments: function() { const tbody = document.getElementById('tbl-assignments'); if(!tbody) return; tbody.innerHTML = this.assignments.length === 0 ? '<tr><td colspan="4" class="text-center text-muted py-4">Sin asignaciones</td></tr>' : this.assignments.map((a,i) => `<tr class="anim-stagger-${(i%5)+1}"><td class="fw-bold">${a.nombre}</td><td>V-${a.cedula}</td><td><span class="badge bg-primary-subtle text-primary border px-3 shadow-sm">${a.cargoNombre}</span></td><td class="text-end px-4"><button onclick="ModuloDocentes.deleteAssignment('${a.cedula}')" class="btn btn-sm btn-light text-danger rounded-circle shadow-sm btn-action"><i class="bi bi-trash-fill"></i></button></td></tr>`).join(''); },
    updateSelectors: function() {
        const staffSel = document.getElementById('staff-select'), cargoSel = document.getElementById('cargo-select');
        if(!staffSel || !cargoSel) return;
        const assignedCedulas = this.assignments.map(a => String(a.cedula));
        const availableStaff = App.allUsers.filter(u => u.rol !== "Estudiante" && u.rol !== "Representante" && !assignedCedulas.includes(String(u.cedula)));
        staffSel.innerHTML = '<option value="">-- Seleccionar --</option>' + availableStaff.map(u => `<option value="${u.cedula}" data-name="${u.nombre}">${u.nombre} (V-${u.cedula})</option>`).join('');
        cargoSel.innerHTML = '<option value="">-- Seleccionar --</option>' + App.allCargos.map(c => `<option value="${c.id}" data-name="${c.nombre}">${c.nombre}</option>`).join('');
    },
    saveAssignment: function() {
        const staff = document.getElementById('staff-select'), cargo = document.getElementById('cargo-select');
        const cedula = staff.value, cargoId = cargo.value;
        if(!cedula || !cargoId) return Swal.fire('Error','Seleccione personal y cargo','warning');
        const nombre = staff.options[staff.selectedIndex].getAttribute('data-name'), cargoNombre = cargo.options[cargo.selectedIndex].getAttribute('data-name');
        App.showLoader(); App.sendRequest({ action: "save_staff_assignment", cedula, nombre, cargoId, cargoNombre }, (res) => { App.hideLoader(); if(res.status === "success") { Swal.fire('Éxito', 'Cargo asignado', 'success'); this.loadAssignments(); } });
    },
    deleteAssignment: function(cedula) {
        Swal.fire({ title: '¿Remover?', icon: 'warning', showCancelButton: true }).then(r => { if(r.isConfirmed) { App.showLoader(); App.sendRequest({ action: "delete_staff_assignment", cedula }, (res) => { App.hideLoader(); if(res.status === "success") { this.loadAssignments(); } }); } });
    }
};

const ModuloUsuarios = {
    data: [],
    render: function(cont) {
        cont.innerHTML = `
        <div class="col-12 card border-0 shadow-sm rounded-4 bg-white w-100 module-card anim-stagger-1 overflow-hidden">
            <div class="module-header bg-gradient-magenta">
                <div class="d-flex align-items-center">
                    <div class="module-icon-box text-danger"><i class="bi bi-people-fill fs-4"></i></div>
                    <div><h5 class="fw-bold mb-0 text-white">Gestión de Usuarios</h5><small class="opacity-75 text-white">Directorio de accesos al sistema</small></div>
                </div>
                <button onclick="ModuloUsuarios.modal()" class="btn btn-light text-dark fw-bold rounded-pill px-4 shadow-sm btn-action"><i class="bi bi-person-plus-fill me-2"></i>Nuevo Usuario</button>
            </div>
            <div class="p-4 pt-2 table-responsive">
                <table class="table align-middle w-100 table-interactive">
                    <thead class="table-light"><tr><th>Cédula</th><th>Nombre</th><th>Rol</th><th class="text-end px-4">Acción</th></tr></thead>
                    <tbody id="tbl-usuarios"></tbody>
                </table>
            </div>
        </div>`;
        this.load();
    },
    load: function() {
        App.showLoader();
        App.sendRequest({ action: "get_users" }, (res) => { this.data = res.users || []; this.draw(); App.hideLoader(); });
    },
    draw: function() {
        document.getElementById('tbl-usuarios').innerHTML = this.data.length === 0 ? '<tr><td colspan="4" class="text-center text-muted py-4">No hay usuarios registrados</td></tr>' : this.data.map((u, i) => `<tr class="anim-stagger-${(i%5)+1}">
            <td class="fw-bold px-4">V-${u.cedula}</td><td>${u.nombre}</td><td><span class="badge bg-primary-subtle text-primary border shadow-sm">${u.rol}</span></td>
            <td class="text-end px-4"><button onclick="ModuloUsuarios.modal('${u.cedula}')" class="btn btn-sm btn-light text-primary rounded-circle btn-action"><i class="bi bi-pencil"></i></button><button onclick="ModuloUsuarios.delete('${u.cedula}')" class="btn btn-sm btn-light text-danger rounded-circle ms-1 btn-action"><i class="bi bi-trash"></i></button></td>
        </tr>`).join('');
    },
    modal: function(cedula = null) {
        const d = cedula ? this.data.find(x => String(x.cedula) === String(cedula)) : {cedula: '', nombre: '', rol: ''};
        const rolesOptions = Object.keys(App.allRoles).length > 0 ? Object.keys(App.allRoles).map(r => `<option ${d.rol===r?'selected':''}>${r}</option>`).join('') : '<option>Administrador</option><option>Director</option><option>Docente</option>';
        Swal.fire({
            title: cedula ? 'Editar Usuario' : 'Nuevo Usuario',
            html: `<input id="sw-ced" type="number" class="form-control input-interactive rounded-pill mb-3" value="${d.cedula}" placeholder="Cédula" ${cedula ? 'disabled' : ''}><input id="sw-nom" type="text" class="form-control input-interactive rounded-pill mb-3" value="${d.nombre}" placeholder="Nombre Completo"><select id="sw-rol" class="form-select input-interactive rounded-pill mb-2"><option value="">-- Seleccionar Rol --</option>${rolesOptions}</select>`,
            showCancelButton: true, confirmButtonText: 'Guardar'
        }).then(r => {
            if (r.isConfirmed) {
                const c = document.getElementById('sw-ced').value, n = document.getElementById('sw-nom').value, ro = document.getElementById('sw-rol').value;
                if (!c || !n || !ro) return Swal.fire('Error', 'Todos los campos son obligatorios', 'warning');
                App.showLoader(); App.sendRequest({ action: "save_user", originalCedula: cedula, user: { cedula: c, nombre: n, rol: ro } }, (res) => {
                    App.hideLoader(); if (res.status === 'success') { Swal.fire('Éxito', 'Usuario guardado', 'success'); this.load(); } else Swal.fire('Error', res.message, 'error');
                });
            }
        });
    },
    delete: function(cedula) {
        Swal.fire({ title: '¿Eliminar usuario?', icon: 'warning', showCancelButton: true }).then(r => {
            if (r.isConfirmed) { App.showLoader(); App.sendRequest({ action: "delete_user", cedula: cedula }, (res) => { App.hideLoader(); if (res.status === 'success') this.load(); }); }
        });
    }
};

const ModuloSoftware = {
    renderRoles: function(cont) {
        cont.innerHTML = `
        <div class="col-12 card border-0 shadow-sm rounded-4 bg-white mb-4 w-100 module-card anim-stagger-1 overflow-hidden">
            <div class="module-header bg-gradient-magenta mb-0">
                <div class="d-flex align-items-center">
                    <div class="module-icon-box text-danger"><i class="bi bi-ui-checks-grid fs-4"></i></div>
                    <div><h5 class="fw-bold mb-0 text-white">Roles y Privilegios</h5><small class="opacity-75 text-white">Control de permisos por módulo</small></div>
                </div>
                <button onclick="ModuloSoftware.modalRole()" class="btn btn-light text-dark fw-bold rounded-pill px-4 shadow-sm btn-action"><i class="bi bi-shield-plus me-2"></i>Nuevo Rol</button>
            </div>
        </div>
        <div id="list-roles" class="row g-4 w-100 m-0"></div>`; 
        this.loadRoles();
    },
    loadRoles: function() { App.showLoader(); App.sendRequest({ action: "get_roles" }, (res) => { App.allRoles = res.roles || {}; this.drawRoles(); App.hideLoader(); }); },
    drawRoles: function() {
        const div = document.getElementById('list-roles'); if (!div) return; const rolesKeys = Object.keys(App.allRoles);
        div.innerHTML = rolesKeys.length === 0 ? `<div class="col-12 text-center text-muted py-5">Sin roles</div>` : rolesKeys.map((r, i) => `<div class="col-md-4 anim-stagger-${(i%5)+1}"><div class="card border-0 shadow-sm rounded-4 bg-white p-4 border-start border-5 border-cyan h-100 module-card"><h6>${r}</h6><div class="small text-muted mb-2">${App.allRoles[r].length} Privilegios asignados</div><div class="text-end mt-3"><button onclick="ModuloSoftware.modalRole('${r}')" class="btn btn-sm btn-light text-primary rounded-circle btn-action"><i class="bi bi-pencil"></i></button><button onclick="ModuloSoftware.deleteRole('${r}')" class="btn btn-sm btn-light text-danger rounded-circle ms-1 btn-action" ${r==='Administrador' || r==='Director' ? 'disabled' : ''}><i class="bi bi-trash"></i></button></div></div></div>`).join('');
    },
    modalRole: function(roleName = null) {
        const perms = roleName ? App.allRoles[roleName] : []; 
        let checkboxes = '<div class="form-check mb-3 border-bottom pb-2"><input class="form-check-input input-interactive cursor-pointer" type="checkbox" id="chk-all-perms" onchange="document.querySelectorAll(\'.perm-chk\').forEach(c => c.checked = this.checked)"><label class="form-check-label fw-bold text-primary cursor-pointer" for="chk-all-perms">Seleccionar Todos los Privilegios</label></div>';
        
        systemStructure.forEach(cat => { 
            checkboxes += `<div class="fw-bold mt-3 text-primary small border-bottom pb-1 mb-2">${cat.category}</div>`; 
            cat.items.forEach(item => { 
                const checked = perms.includes(item) ? 'checked' : ''; 
                checkboxes += `<div class="form-check"><input class="form-check-input perm-chk input-interactive cursor-pointer" type="checkbox" value="${item}" id="chk-${item.replace(/\s+/g, '')}" ${checked}><label class="form-check-label small cursor-pointer" for="chk-${item.replace(/\s+/g, '')}">${item}</label></div>`; 
            }); 
        });
        Swal.fire({ title: roleName ? 'Editar Rol' : 'Nuevo Rol', html: `<input id="sw-rolename" class="form-control input-interactive rounded-pill mb-3 fw-bold" value="${roleName || ''}" placeholder="Nombre del Rol" ${roleName === 'Administrador' || roleName === 'Director' ? 'disabled' : ''}><div class="text-start bg-light p-3 rounded-4 border overflow-auto" style="max-height: 300px;">${checkboxes}</div>`, showCancelButton: true, width: '600px' }).then(r => {
            if (r.isConfirmed) {
                const name = document.getElementById('sw-rolename').value, selectedPerms = Array.from(document.querySelectorAll('.perm-chk:checked')).map(cb => cb.value);
                if (!name) return Swal.fire('Error', 'Indique un nombre', 'warning');
                App.showLoader(); App.sendRequest({ action: "save_role", nombre: name, permisos: selectedPerms }, (res) => { App.hideLoader(); if (res.status === 'success') { Swal.fire('Éxito', 'Rol guardado', 'success'); this.loadRoles(); App.loadAppData(); } });
            }
        });
    },
    deleteRole: function(roleName) {
        if(roleName === 'Administrador' || roleName === 'Director') return;
        Swal.fire({ title: '¿Eliminar Rol?', text: roleName, icon: 'warning', showCancelButton: true }).then(r => { if (r.isConfirmed) { App.showLoader(); App.sendRequest({ action: "delete_role", nombre: roleName }, (res) => { App.hideLoader(); if (res.status === 'success') this.loadRoles(); }); } });
    }
};

const ModuloPerfil = {
    render: function(cont) { 
        if (App.user.role === "Visitante" || String(App.user.cedula) === "0") {
            cont.innerHTML = `
            <div class="col-12 card border-0 shadow-sm rounded-4 bg-white p-5 text-center w-100 module-card anim-stagger-1">
                <i class="bi bi-shield-lock-fill text-warning mb-3 d-block" style="font-size: 5rem;"></i>
                <h4 class="fw-bold text-dark">Acceso Restringido</h4>
                <p class="text-muted">Los usuarios que ingresan como <b>Invitado</b> no tienen permisos para cambiar contraseñas ni modificar datos de perfil.</p>
                <button onclick="App.showDashboard()" class="btn btn-light rounded-pill px-5 mt-4 border shadow-sm fw-bold btn-action">Volver al Inicio</button>
            </div>`;
            return;
        }

        App.showLoader(); 
        App.sendRequest({ action: "get_user_full_data", cedula: App.user.cedula }, (res) => { 
            App.hideLoader(); 
            if (res.status === "success") { 
                const u = res.user; 
                cont.innerHTML = `
                <div class="col-12 card border-0 shadow-sm rounded-4 bg-white overflow-hidden w-100 module-card anim-stagger-1">
                    <div class="module-header bg-gradient-magenta">
                        <div class="d-flex align-items-center">
                            <div class="module-icon-box fs-3 fw-bold text-danger">${u.nombre.charAt(0)}</div>
                            <div><h4 class="fw-bold mb-0 text-white">${u.nombre}</h4><span class="badge bg-white text-danger px-3 rounded-pill mt-1 shadow-sm">ROL: ${u.rol}</span></div>
                        </div>
                        <div class="text-white-50 small d-none d-md-block"><i class="bi bi-shield-check me-1"></i>Perfil de Seguridad</div>
                    </div>
                    <div class="p-4 p-md-5 pt-2">
                        <div class="row g-4">
                            <div class="col-md-6"><label class="small fw-bold text-muted">Cédula</label><input class="form-control input-interactive rounded-pill bg-light fw-bold" value="${u.cedula}" disabled></div>
                            <div class="col-md-6"><label class="small fw-bold text-muted">Nombre Completo</label><input id="p-n" class="form-control input-interactive rounded-pill" value="${u.nombre}"></div>
                            <div class="col-md-6"><label class="small fw-bold text-muted">Nueva Contraseña</label><div class="input-group"><input id="p-p" type="password" class="form-control input-interactive rounded-start-pill" placeholder="Dejar en blanco para no cambiar"><button class="btn btn-outline-secondary rounded-end-pill btn-action" type="button" onclick="App.togglePass('p-p')"><i class="bi bi-eye"></i></button></div></div>
                            <div class="col-md-6"><label class="small fw-bold text-muted">Respuesta Secreta</label><input id="p-r" class="form-control input-interactive rounded-pill" value="${u.respuesta || ''}" placeholder="Su respuesta secreta"></div>
                            <div class="col-12 text-end mt-5"><button onclick="ModuloPerfil.save()" class="btn btn-primary px-5 py-3 rounded-pill shadow fw-bold btn-action"><i class="bi bi-check2-circle me-2"></i> Actualizar Perfil</button></div>
                        </div>
                    </div>
                </div>`; 
            } else { Swal.fire('Error', res.message || 'No se pudieron cargar los datos del usuario', 'error'); }
        }); 
    },
    save: function() { 
        if (App.user.role === "Visitante" || String(App.user.cedula) === "0") return;
        const u = { cedula: App.user.cedula, nombre: document.getElementById('p-n').value, password: document.getElementById('p-p').value, respuesta: document.getElementById('p-r').value }; 
        if(!u.nombre || !u.respuesta) return Swal.fire('Atención','Nombre y respuesta son obligatorios','warning'); 
        App.showLoader(); 
        App.sendRequest({ action: "update_user_profile", user: u }, (res) => { 
            App.hideLoader(); 
            if(res.status==='success') { 
                App.user.name = u.nombre; localStorage.setItem('schoolUser', JSON.stringify(App.user)); 
                document.getElementById('user-display-name').innerText = u.nombre;
                Swal.fire('Éxito','Perfil actualizado correctamente','success'); this.render(document.getElementById('module-content')); 
            } 
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
        cont.innerHTML = `
        <div id="acc-panel" class="col-12 card border-0 shadow-sm rounded-4 bg-white overflow-hidden w-100 module-card anim-stagger-1">
            <div class="module-header bg-gradient-blue">
                <div class="d-flex align-items-center">
                    <div class="module-icon-box text-primary"><i class="bi bi-universal-access-circle fs-3"></i></div>
                    <div><h4 class="fw-bold mb-0 text-white">Accesibilidad y Apariencia</h4><small class="opacity-75 text-white">Personaliza tu experiencia visual en el sistema</small></div>
                </div>
            </div>
            <div class="p-4 p-md-5 pt-2 text-center">
                <div class="row g-4 mt-2">
                    <div class="col-md-6"><div class="d-flex justify-content-between p-4 bg-light rounded-4 border shadow-sm"><b>Modo Oscuro</b><input class="form-check-input fs-3 cursor-pointer input-interactive" type="checkbox" onchange="Acc.toggle('darkMode')" ${s.darkMode?'checked':''}></div></div>
                    <div class="col-md-6"><div class="d-flex justify-content-between p-4 bg-light rounded-4 border shadow-sm"><b>Modo Grises</b><input class="form-check-input fs-3 cursor-pointer input-interactive" type="checkbox" onchange="Acc.toggle('grayscale')" ${s.grayscale?'checked':''}></div></div>
                    <div class="col-md-6"><div class="d-flex justify-content-between p-4 bg-light rounded-4 border shadow-sm"><b>Fuente Legible</b><input class="form-check-input fs-3 cursor-pointer input-interactive" type="checkbox" onchange="Acc.toggle('readableFont')" ${s.readableFont?'checked':''}></div></div>
                    <div class="col-md-6"><div class="d-flex justify-content-between p-4 bg-light rounded-4 border shadow-sm"><b>Tamaño de Texto</b><button onclick="Acc.toggle('fontSize')" class="btn btn-primary rounded-pill px-4 btn-action fw-bold">${txt[s.fontSize]}</button></div></div>
                </div>
                <button onclick="Acc.reset()" class="btn btn-danger-vibrant rounded-pill px-5 py-3 mt-5 fw-bold shadow btn-action"><i class="bi bi-arrow-counterclockwise me-2"></i>Restablecer Valores</button>
            </div>
        </div>`;
    }
};

const ModuloAyuda = { 
    render: function(cont) { 
        cont.innerHTML = `
        <div class="row g-4 w-100 m-0">
            <div class="col-md-6 anim-stagger-1">
                <div class="card border-0 shadow-lg rounded-4 bg-gradient-blue text-white text-center h-100 module-card overflow-hidden" style="padding: 4rem 2rem;">
                    <div class="bg-white text-primary rounded-circle mx-auto d-flex align-items-center justify-content-center shadow-lg" style="width: 80px; height: 80px; margin-bottom: 2rem;">
                        <i class="bi bi-book-half fs-1"></i>
                    </div>
                    <h4 class="fw-bold mb-3">Manual de Usuario</h4>
                    <p class="opacity-75 mb-4">Guía paso a paso de todas las funciones operativas del sistema SIGAE.</p>
                    <button class="btn btn-light text-primary rounded-pill px-5 fw-bold btn-action shadow" disabled>Próximamente</button>
                </div>
            </div>
            <div class="col-md-6 anim-stagger-2">
                <div class="card border-0 shadow-lg rounded-4 text-white text-center h-100 module-card overflow-hidden" style="background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%); padding: 4rem 2rem;">
                    <div class="bg-white text-danger rounded-circle mx-auto d-flex align-items-center justify-content-center shadow-lg" style="width: 80px; height: 80px; margin-bottom: 2rem;">
                        <i class="bi bi-life-preserver fs-1"></i>
                    </div>
                    <h4 class="fw-bold mb-3">Soporte Técnico</h4>
                    <p class="opacity-75 mb-4">¿Tienes algún problema? Contáctanos para recibir asistencia inmediata.</p>
                    <a href="mailto:soporte@sigae.com" class="btn btn-danger-vibrant rounded-pill px-5 fw-bold btn-action shadow"><i class="bi bi-envelope-fill me-2"></i> soporte@sigae.com</a>
                </div>
            </div>
        </div>`; 
    } 
};

// ==========================================
// --- MÓDULOS DE TRANSPORTE ESCOLAR ---
// ==========================================

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
            <div class="p-4 pt-4 bg-light border-bottom d-flex align-items-center gap-3">
                <select id="rutograma-select" class="form-select input-interactive rounded-pill shadow-none fw-bold" style="max-width: 400px;" onchange="ModuloRutogramas.preview(this.value)"></select>
                <button onclick="ModuloRutogramas.descargarPDF()" class="btn btn-primary-vibrant rounded-pill px-4 shadow-sm btn-action fw-bold"><i class="bi bi-file-earmark-pdf-fill me-2"></i>Descargar PDF</button>
            </div>
            <div class="p-5 d-flex justify-content-center" style="background-color: #f0f2f5; min-height: 400px;" id="rutograma-preview-container">
                <div class="text-muted text-center pt-5 mt-5"><i class="bi bi-map fs-1 d-block mb-3 opacity-25"></i>Selecciona una ruta para previsualizar el rutograma</div>
            </div>
        </div>`;
        this.load();
    },
    load: function() { 
        App.showLoader(); 
        App.sendRequest({ action: "get_transporte" }, (res) => { 
            this.rutas = res.rutas || []; this.paradas = res.paradas || []; 
            const sel = document.getElementById('rutograma-select');
            if(sel) sel.innerHTML = '<option value="">-- Seleccione una Ruta --</option>' + this.rutas.map(r => `<option value="${r.id}">${r.nombre}</option>`).join('');
            App.hideLoader(); 
        }); 
    },
    preview: function(rutaId) {
        const cont = document.getElementById('rutograma-preview-container');
        if(!rutaId) { cont.innerHTML = '<div class="text-muted text-center pt-5 mt-5"><i class="bi bi-map fs-1 d-block mb-3 opacity-25"></i>Selecciona una ruta para previsualizar el rutograma</div>'; return; }
        
        const r = this.rutas.find(x => x.id === rutaId);
        if(!r || !r.recorrido || r.recorrido.length === 0) {
            cont.innerHTML = `<div class="alert alert-warning border-0 shadow-sm rounded-4"><i class="bi bi-exclamation-triangle-fill me-2"></i>La ruta <b>${r?r.nombre:''}</b> no tiene paradas asignadas aún. Ve a "Asignación de Recorridos" primero.</div>`;
            return;
        }

        let nodesHtml = '';
        r.recorrido.forEach((pId, idx) => {
            const p = this.paradas.find(x => x.id === pId);
            const isLast = idx === r.recorrido.length - 1;
            nodesHtml += `
            <div class="subway-node" style="position: relative; margin-bottom: 40px; display: flex; align-items: center; z-index: 2;">
                <div class="subway-dot" style="position: absolute; left: 3px; width: 34px; height: 34px; background: #ffffff; border: 8px solid ${isLast ? '#E5007E' : '#FF8D00'}; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.1);"></div>
                <div class="subway-label" style="margin-left: 60px; font-size: 1.1rem; font-weight: 700; color: #2d3748; background: #ffffff; padding: 12px 25px; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                    ${p ? p.nombre : 'Desconocida'}
                </div>
            </div>`;
        });

        cont.innerHTML = `
        <div id="rutograma-capture" class="bg-white rounded-4 shadow-lg overflow-hidden" style="width: 100%; max-width: 600px;">
            <div style="background: linear-gradient(135deg, #00C3FF 0%, #0085FF 100%); color: white; padding: 30px; text-align: center;">
                <h3 class="fw-bold mb-1 m-0">${r.nombre}</h3>
                <div class="opacity-75 small">Rutograma Oficial de Transporte Escolar</div>
            </div>
            <div style="padding: 40px 30px;">
                <div class="subway-line-wrapper" style="position: relative; margin-left: 20px;">
                    <div class="subway-line" style="position: absolute; top: 15px; bottom: 15px; left: 15px; width: 10px; background: linear-gradient(180deg, #FF8D00 0%, #E5007E 100%); border-radius: 10px; z-index: 1;"></div>
                    ${nodesHtml}
                </div>
            </div>
        </div>`;
    },
    descargarPDF: function() {
        const captureEl = document.getElementById('rutograma-capture');
        if(!captureEl) return Swal.fire('Atención', 'Debe generar la previsualización de una ruta primero.', 'warning');
        
        App.showLoader();
        setTimeout(() => {
            html2canvas(captureEl, { scale: 3, useCORS: true, backgroundColor: "#ffffff" }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfW = pdf.internal.pageSize.getWidth();
                const pdfH = pdf.internal.pageSize.getHeight();
                const ratio = canvas.width / canvas.height;
                let finalW = pdfW - 40, finalH = finalW / ratio;
                
                if (finalH > (pdfH - 40)) { finalH = pdfH - 40; finalW = finalH * ratio; }
                
                pdf.setFontSize(16);
                pdf.setTextColor(0, 133, 255);
                pdf.text("SIGAE - UE Libertador Bolívar", pdfW/2, 20, {align: 'center'});
                pdf.addImage(imgData, 'PNG', (pdfW-finalW)/2, 30, finalW, finalH);
                
                pdf.save(`Rutograma_Transporte.pdf`);
                App.hideLoader();
                Swal.fire('Éxito', 'Rutograma descargado en PDF', 'success');
            });
        }, 800);
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
                <div class="col-12">
                    <label class="small fw-bold text-muted">Período de Guardia (Semana correspondiente)</label>
                    <input type="text" id="guardia-periodo" class="form-control input-interactive rounded-pill mt-2" placeholder="Ej: Desde el 23 al 27 de febrero de 2026">
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
    generarReporte: function() {
        const periodo = document.getElementById('guardia-periodo').value;
        if(!periodo) return Swal.fire('Atención', 'Debe indicar el período de la semana.', 'warning');
        
        const seleccionadas = Array.from(document.querySelectorAll('.chk-ruta-guardia:checked')).map(cb => cb.value);
        if(seleccionadas.length === 0) return Swal.fire('Atención', 'Debe seleccionar al menos una ruta.', 'warning');

        const printCont = document.getElementById('print-guardias-container');
        let tableRows = '';
        
        seleccionadas.forEach(id => {
            const r = this.rutas.find(x => x.id === id);
            if(r) {
                tableRows += `
                <tr>
                    <td style="padding:12px; border:1px solid #cbd5e1; font-weight:bold; color:#0085FF;">${r.nombre}</td>
                    <td style="padding:12px; border:1px solid #cbd5e1;">${r.chofer || '---'}</td>
                    <td style="padding:12px; border:1px solid #cbd5e1; font-weight:bold;">${r.docente || '---'}</td>
                    <td style="padding:12px; border:1px solid #cbd5e1;">${r.telefono || '---'}</td>
                </tr>`;
            }
        });

        printCont.innerHTML = `
            <div style="font-family: 'Inter', sans-serif; color: #1a202c;">
                <div style="text-align: center; margin-bottom: 30px; border-bottom: 4px solid #FF8D00; padding-bottom: 20px;">
                    <h1 style="margin:0; font-size: 28px; color: #0085FF;">Unidad Educativa Libertador Bolívar</h1>
                    <h2 style="margin:5px 0 0 0; font-size: 20px; color: #4a5568;">Guardias de Transporte Escolar</h2>
                    <h4 style="margin:10px 0 0 0; font-weight: normal; color: #E5007E;">Período: ${periodo}</h4>
                </div>
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
                    <thead>
                        <tr style="background-color: #f8fafc;">
                            <th style="padding:12px; border:1px solid #cbd5e1; color:#4a5568;">RUTA</th>
                            <th style="padding:12px; border:1px solid #cbd5e1; color:#4a5568;">CHOFER</th>
                            <th style="padding:12px; border:1px solid #cbd5e1; color:#4a5568;">DOCENTE DE GUARDIA</th>
                            <th style="padding:12px; border:1px solid #cbd5e1; color:#4a5568;">TELÉFONO ENLACE</th>
                        </tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                </table>
            </div>`;

        App.showLoader();
        setTimeout(() => {
            html2canvas(printCont, { scale: 2, useCORS: true, backgroundColor: "#ffffff" }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfW = pdf.internal.pageSize.getWidth();
                const pdfH = pdf.internal.pageSize.getHeight();
                const ratio = canvas.width / canvas.height;
                let finalW = pdfW - 20, finalH = finalW / ratio;
                if (finalH > (pdfH - 20)) { finalH = pdfH - 20; finalW = finalH * ratio; }
                
                pdf.addImage(imgData, 'PNG', 10, 10, finalW, finalH);
                pdf.save(`Guardias_Transporte_${periodo.replace(/\s+/g, '_')}.pdf`);
                
                printCont.innerHTML = '';
                App.hideLoader();
                Swal.fire('Éxito', 'Reporte de Guardias generado exitosamente', 'success');
            });
        }, 1000);
    }
};

document.addEventListener("DOMContentLoaded", () => App.init());