/**
 * SIGAE v3.1 - UE Libertador Bolívar
 * ARCHIVO: app.js (NÚCLEO PRINCIPAL - CARGA MÓDULOS)
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

document.addEventListener("DOMContentLoaded", () => App.init());