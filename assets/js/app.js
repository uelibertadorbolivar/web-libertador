const systemStructure = [
    { category: "Escuela", icon: "bi-building", color: "#FF8D00", items: ["Perfil de la Escuela", "Fases y Periodos", "Niveles Educativos", "Escalas de Evaluación", "Gestión de Cargos", "Organigrama Institucional", "Grado / Año", "Secciones"] },
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
    user: null, schoolData: null, activeYear: "No Definido", allRoles: {}, tempCedula: null, currentView: 'Inicio',

    init: function() { this.checkSession(); Acc.init(); },
    showLoader: function() { document.getElementById('main-loader').style.display = 'flex'; },
    hideLoader: function() { document.getElementById('main-loader').style.display = 'none'; },
    toggleSidebar: function() { document.body.classList.toggle('sidebar-open'); },
    toggleCollapse: function() { document.body.classList.toggle('collapsed'); },
    togglePass: function(id) { const i = document.getElementById(id); i.type = i.type === 'password' ? 'text' : 'password'; },

    checkSession: function() {
        const stored = localStorage.getItem('schoolUser');
        if (stored) { this.user = JSON.parse(stored); this.currentView = localStorage.getItem('lastView') || 'Inicio'; this.loadAppData(); }
        else { document.getElementById('login-screen').style.display = 'block'; this.hideLoader(); }
    },

    loadAppData: function() {
        this.showLoader();
        App.sendRequest({ action: "get_roles" }, (resRoles) => {
            this.allRoles = resRoles.roles || {};
            App.sendRequest({ action: "get_school_profile" }, (resSchool) => {
                this.schoolData = resSchool;
                App.sendRequest({ action: "get_school_config" }, (resConfig) => {
                    const anios = resConfig.anios || [];
                    const actual = anios.find(a => a.estado === 'Actual');
                    this.activeYear = actual ? actual.nombre : 'No Definido';
                    this.showApp();
                    this.hideLoader();
                });
            });
        });
    },

    verificarUsuario: function() {
        const ced = document.getElementById('inputCedula').value; if(!ced) return;
        this.showLoader();
        App.sendRequest({ action: "verificar_usuario", cedula: ced }, (res) => {
            this.hideLoader();
            if(res.found) {
                this.tempCedula = ced; document.getElementById('step-cedula').style.display = 'none';
                if(res.hasPassword) {
                    document.getElementById('lbl-nombre-login').innerText = res.nombre;
                    document.getElementById('step-login').style.display = 'block';
                } else { document.getElementById('step-register').style.display = 'block'; }
            } else { Swal.fire('Error', 'Cédula no autorizada', 'error'); }
        });
    },

    login: function() {
        const pass = document.getElementById('inputPass').value; this.showLoader();
        App.sendRequest({ action: "login", cedula: this.tempCedula, password: pass }, (res) => {
            if(res.status === "success") { this.user = res.user; localStorage.setItem('schoolUser', JSON.stringify(this.user)); this.loadAppData(); }
            else { this.hideLoader(); Swal.fire('Error', 'Clave incorrecta', 'error'); }
        });
    },

    modalInvitado: async function() {
        const { value: nombre } = await Swal.fire({ title: 'Acceso Invitado', input: 'text', inputLabel: '¿Su nombre?', confirmButtonText: 'Entrar', confirmButtonColor: '#0085FF' });
        if (nombre) {
            this.user = { name: nombre, role: "Visitante", cedula: "0" };
            this.allRoles["Visitante"] = ["Solicitud de Cupos", "Accesibilidad y Apariencia"];
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
                html += `<div class="accordion-item bg-transparent border-0"><button class="nav-category-btn collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${id}"><span><i class="bi ${cat.icon} me-2" style="color:${cat.color}"></i> <span>${cat.category}</span></span><i class="bi bi-chevron-down small opacity-50"></i></button><div id="${id}" class="accordion-collapse collapse" data-bs-parent="#sidebar-menu"><div class="accordion-body p-0">${allowedItems.map(item => `<a href="#${item}" onclick="App.renderView('${item}','${item}')" class="nav-sub-item">${item}</a>`).join('')}</div></div></div>`;
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
                        <div class="card p-4 p-md-5 text-white shadow-lg border-0 position-relative overflow-hidden" style="background: linear-gradient(135deg, #00C3FF 0%, #0085FF 100%); border-radius: 30px;">
                            <div style="position:absolute; top:-20px; right:-20px; width:150px; height:150px; background:rgba(255,255,255,0.1); border-radius:50%;"></div>
                            <div style="position:absolute; bottom:-40px; left:-20px; width:200px; height:200px; background:rgba(255,255,255,0.05); border-radius:50%;"></div>
                            
                            <div class="position-relative z-1">
                                <span class="badge bg-white text-primary mb-3 shadow-sm px-3 py-2 rounded-pill fw-bold">Año Escolar ${this.activeYear}</span>
                                <h2 class="fw-bold mb-1">${res.nombre}</h2>
                                <div class="mt-3 small opacity-90 fw-medium">RIF: ${res.rif || '---'} | DEA: ${res.dea || '---'}</div>
                                <p class="opacity-75 mb-0 small mt-2"><i class="bi bi-geo-alt-fill me-1"></i> ${res.direccion || '---'}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3"><div class="dash-card border-left-blue"><div class="icon-circle" style="background: #0085FF"><i class="bi bi-flag-fill"></i></div><h6>Misión</h6><p class="small text-muted mb-0">${res.mision || 'No definida'}</p></div></div>
                    <div class="col-md-3"><div class="dash-card border-left-green"><div class="icon-circle" style="background: #00D158"><i class="bi bi-eye-fill"></i></div><h6>Visión</h6><p class="small text-muted mb-0">${res.vision || 'No definida'}</p></div></div>
                    <div class="col-md-3"><div class="dash-card border-left-yellow"><div class="icon-circle" style="background: #FF8D00"><i class="bi bi-target"></i></div><h6>Objetivo</h6><p class="small text-muted mb-0">${res.objetivo || 'No definido'}</p></div></div>
                    <div class="col-md-3"><div class="dash-card border-left-red"><div class="icon-circle" style="background: #E5007E"><i class="bi bi-journal-text"></i></div><h6>PEIC</h6><p class="small text-muted mb-0">${res.peic || 'No definido'}</p></div></div>
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
        div.innerHTML = `<div class="p-3"><button onclick="App.showDashboard()" class="btn btn-sm btn-light rounded-pill border shadow-sm px-3 mb-3"><i class="bi bi-arrow-left"></i> Volver</button><div id="module-content"></div></div>`;
        const cont = document.getElementById('module-content');
        
        if(id === 'Perfil de la Escuela') { ModuloEscuela.render(cont); }
        else if(id === 'Fases y Periodos') { ModuloConfiguracion.render(cont); }
        else if(id === 'Niveles Educativos') { ModuloNiveles.render(cont); }
        else if(id === 'Roles y Privilegios') { ModuloSoftware.renderRoles(cont); }
        else if(id === 'Gestión de Usuarios') { ModuloUsuarios.render(cont); }
        else if(id === 'Cambio de Contraseñas') { ModuloPerfil.render(cont); }
        else if(id === 'Manual de Usuario' || id === 'Soporte Técnico') { ModuloAyuda.render(cont); }
        else if(id === 'Accesibilidad y Apariencia') { Acc.render(cont); }
        else { cont.innerHTML = `<div class="p-5 text-center text-muted"><i class="bi bi-gear-wide-connected fs-1 d-block mb-3 opacity-25"></i> Módulo <b>${id}</b> en desarrollo técnico.</div>`; }
    },

    sendRequest: function(data, callback) { fetch(AppConfig.getApiUrl(), { method: "POST", body: JSON.stringify(data) }).then(r => r.json()).then(res => callback(res)).catch(() => this.hideLoader()); },
    logout: function() { localStorage.clear(); location.reload(); },
    showForgot: function() { App.sendRequest({ action: "get_pregunta", cedula: this.tempCedula }, (res) => { document.getElementById('lbl-pregunta').innerText = res.pregunta; document.getElementById('step-login').style.display = 'none'; document.getElementById('step-forgot').style.display = 'block'; }); },
    recuperarClave: function() { const r = document.getElementById('recRespuesta').value; const p = document.getElementById('recNewPass').value; App.sendRequest({ action: "recuperar_clave", cedula: this.tempCedula, respuesta: r, newPassword: p }, (res) => { if(res.status === "success") { Swal.fire('Listo', 'Recuperado', 'success').then(() => location.reload()); } else { Swal.fire('Error', res.message, 'error'); } }); },
    registrarClave: function() { const p = document.getElementById('regPass').value; const q = document.getElementById('regPregunta').value; const r = document.getElementById('regRespuesta').value; App.sendRequest({ action: "registrar_clave", cedula: this.tempCedula, password: p, pregunta: q, respuesta: r }, () => { Swal.fire('Éxito', 'Seguridad configurada', 'success').then(() => location.reload()); }); }
};

/** MÓDULO: USUARIOS (CRUD Actualizado) **/
const ModuloUsuarios = {
    render: function(cont) { 
        cont.innerHTML = `
        <div class="card p-4 border-0 shadow-sm rounded-4 mb-4 bg-white">
            <h6 class="fw-bold mb-3" style="color:#0085FF">Personal</h6>
            <div class="row g-3">
                <div class="col-md-3"><input type="number" id="u-ced" class="form-control rounded-pill px-4" placeholder="Cédula"></div>
                <div class="col-md-4"><input type="text" id="u-nom" class="form-control rounded-pill px-4" placeholder="Nombre Completo"></div>
                <div class="col-md-3">
                    <select id="u-rol" class="form-select rounded-pill px-4 shadow-none">
                        <option value="">Seleccione Rol</option>
                        ${Object.keys(App.allRoles).map(r => `<option value="${r}">${r}</option>`).join('')}
                        <option value="Administrador">Administrador</option>
                    </select>
                </div>
                <div class="col-md-2"><button onclick="ModuloUsuarios.save()" class="btn btn-primary-vibrant w-100 rounded-pill">Guardar</button></div>
            </div>
        </div>
        <div class="card p-4 border-0 shadow-sm rounded-4 bg-white">
            <div class="d-flex justify-content-between mb-3 gap-2">
                <input type="text" id="u-busq" class="form-control w-50 rounded-pill px-4 shadow-none" placeholder="Buscar..." onkeyup="ModuloUsuarios.filter()">
                <select id="u-filt-rol" class="form-select w-25 rounded-pill px-4 shadow-none" onchange="ModuloUsuarios.filter()"><option value="">Todos los Roles</option>${Object.keys(App.allRoles).map(r => `<option value="${r}">${r}</option>`).join('')}</select>
            </div>
            <div class="table-responsive"><table class="table table-hover small"><thead><tr><th>Fecha</th><th>Cédula</th><th>Nombre</th><th>Rol</th><th class="text-end">Acción</th></tr></thead><tbody id="u-tabla"></tbody></table></div>
        </div>`; 
        this.load(); 
    },
    load: function() { App.showLoader(); App.sendRequest({ action: "get_users" }, (res) => { App.allUsers = res.users; this.draw(App.allUsers); App.hideLoader(); }); },
    draw: function(data) { 
        const t = document.getElementById('u-tabla'); 
        if(t) t.innerHTML = data.map(u => `
            <tr>
                <td>${new Date(u.fecha).toLocaleDateString()}</td>
                <td class="fw-bold">${u.cedula}</td>
                <td>${u.nombre}</td>
                <td><span class="badge bg-light text-dark border-0 shadow-sm">${u.rol}</span></td>
                <td class="text-end">
                    <button class="btn btn-sm btn-light text-primary rounded-circle" onclick="ModuloUsuarios.edit('${u.cedula}', '${u.nombre}', '${u.rol}')"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-light text-danger rounded-circle" onclick="ModuloUsuarios.delete('${u.cedula}')"><i class="bi bi-trash"></i></button>
                </td>
            </tr>`).join(''); 
    },
    filter: function() { const val = document.getElementById('u-busq').value.toLowerCase(); const rol = document.getElementById('u-filt-rol').value; const f = App.allUsers.filter(u => (u.nombre.toLowerCase().includes(val) || String(u.cedula).includes(val)) && (rol === "" || u.rol === rol)); this.draw(f); },
    save: function() { 
        const user = { cedula: document.getElementById('u-ced').value, nombre: document.getElementById('u-nom').value, rol: document.getElementById('u-rol').value }; 
        if(!user.cedula || !user.nombre || !user.rol) return; 
        App.showLoader(); 
        App.sendRequest({ action: "save_user", user: user }, (res) => { 
            if(res.status === 'success') {
                ModuloUsuarios.render(document.getElementById('module-content')); 
                Swal.fire("Éxito", "Usuario guardado", "success"); 
            } else { Swal.fire("Error", res.message, "error"); }
        }); 
    },
    edit: function(ced, nom, rol) {
        Swal.fire({
            title: 'Editar Usuario',
            html: `
                <label class="small text-muted w-100 text-start ps-3">Cédula</label>
                <input id="sw-ced" class="form-control rounded-pill mb-2 shadow-none" value="${ced}">
                <label class="small text-muted w-100 text-start ps-3">Nombre Completo</label>
                <input id="sw-nom" class="form-control rounded-pill mb-2 shadow-none" value="${nom}">
                <label class="small text-muted w-100 text-start ps-3">Rol</label>
                <select id="sw-rol" class="form-select rounded-pill shadow-none">
                    ${Object.keys(App.allRoles).map(r => `<option value="${r}" ${r === rol ? 'selected' : ''}>${r}</option>`).join('')}
                    <option value="Administrador" ${rol === 'Administrador' ? 'selected' : ''}>Administrador</option>
                </select>
            `,
            showCancelButton: true,
            confirmButtonText: 'Actualizar',
            confirmButtonColor: '#0085FF',
            preConfirm: () => {
                const newCed = document.getElementById('sw-ced').value;
                const newNom = document.getElementById('sw-nom').value;
                const newRol = document.getElementById('sw-rol').value;
                if(!newCed || !newNom || !newRol) { Swal.showValidationMessage("Todos los campos son requeridos"); return false; }
                return { cedula: newCed, nombre: newNom, rol: newRol };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                App.showLoader();
                App.sendRequest({ action: "save_user", user: result.value, originalCedula: ced }, () => {
                    this.load(); App.hideLoader();
                    Swal.fire('Actualizado', 'Datos de usuario modificados', 'success');
                });
            }
        });
    },
    delete: function(ced) { 
        Swal.fire({ title: '¿Eliminar?', icon: 'warning', showCancelButton: true }).then(r => { 
            if(r.isConfirmed) { App.showLoader(); App.sendRequest({ action: "delete_user", cedula: ced }, () => ModuloUsuarios.render(document.getElementById('module-content'))); } 
        }); 
    }
};

/** MÓDULOS DE CONFIGURACIÓN (NIVELES, PERIODOS) **/
const ModuloNiveles = {
    niveles: [],
    render: function(cont) {
        cont.innerHTML = `<div class="row g-4 animate__animated animate__fadeIn"><div class="col-md-8 mx-auto"><div class="card border-0 shadow-sm p-4 rounded-4 bg-white h-100"><div class="d-flex justify-content-between align-items-center mb-4"><div><h6 class="fw-bold mb-0" style="color:#0085FF"><i class="bi bi-ladder me-2"></i>Niveles Educativos</h6><small class="text-muted">Etapas académicas impartidas</small></div><button onclick="ModuloNiveles.modal()" class="btn btn-sm btn-primary-vibrant rounded-pill px-3 shadow-sm"><i class="bi bi-plus-lg"></i> Agregar</button></div><div class="table-responsive"><table class="table table-hover align-middle"><thead class="table-light"><tr><th>Nombre del Nivel</th><th class="text-end">Acción</th></tr></thead><tbody id="tbl-niveles"></tbody></table></div></div></div></div>`;
        this.load();
    },
    load: function() { App.sendRequest({ action: "get_school_config" }, (res) => { this.niveles = res.niveles || []; this.draw(); }); },
    draw: function() {
        const t = document.getElementById('tbl-niveles');
        if(!t) return;
        t.innerHTML = this.niveles.length === 0 ? `<tr><td colspan="2" class="text-center text-muted py-3">Sin niveles registrados</td></tr>` : this.niveles.map(n => `<tr><td class="fw-medium text-dark">${n.nombre}</td><td class="text-end"><button class="btn btn-sm btn-light text-primary rounded-circle" onclick="ModuloNiveles.modal('${n.id}', '${n.nombre}')"><i class="bi bi-pencil"></i></button><button class="btn btn-sm btn-light text-danger rounded-circle" onclick="ModuloNiveles.delete('${n.id}')"><i class="bi bi-trash"></i></button></td></tr>`).join('');
    },
    modal: function(id = null, nombre = '') {
        Swal.fire({ title: id ? 'Editar Nivel' : 'Nuevo Nivel', input: 'text', inputValue: nombre, inputPlaceholder: 'Ej: Educación Primaria', showCancelButton: true, confirmButtonColor: '#0085FF', confirmButtonText: 'Guardar', inputValidator: (val) => { if(!val) return 'Escriba el nombre'; } }).then((r) => {
            if(r.isConfirmed) { App.showLoader(); App.sendRequest({ action: "save_school_level", level: { id: id, nombre: r.value } }, () => { this.load(); App.hideLoader(); }); }
        });
    },
    delete: function(id) { Swal.fire({ title: '¿Eliminar?', text: "Se borrará del sistema", icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, borrar' }).then((r) => { if(r.isConfirmed) { App.showLoader(); App.sendRequest({ action: "delete_config_item", id: id }, () => { this.load(); App.hideLoader(); }); } }); }
};

const ModuloConfiguracion = {
    anios: [], periodos: [],
    render: function(cont) {
        cont.innerHTML = `<div class="row g-4 animate__animated animate__fadeIn"><div class="col-lg-7"><div class="card border-0 shadow-sm p-4 rounded-4 bg-white h-100"><div class="d-flex justify-content-between align-items-center mb-4"><div><h6 class="fw-bold mb-0" style="color:#0085FF"><i class="bi bi-calendar-range-fill me-2"></i>Años Escolares</h6><small class="text-muted">Gestiona el ciclo vigente</small></div><button onclick="ModuloConfiguracion.modalAnio()" class="btn btn-sm btn-primary-vibrant rounded-pill px-3 shadow-sm"><i class="bi bi-plus-lg"></i> Nuevo Año</button></div><div class="table-responsive"><table class="table table-hover align-middle small"><thead class="table-light"><tr><th>Nombre</th><th>Duración</th><th>Estado</th><th class="text-end">Acción</th></tr></thead><tbody id="tbl-anios"></tbody></table></div></div></div><div class="col-lg-5"><div class="card border-0 shadow-sm p-4 rounded-4 bg-white h-100"><div class="d-flex justify-content-between align-items-center mb-4"><div><h6 class="fw-bold mb-0" style="color:#FF8D00"><i class="bi bi-hourglass-split me-2"></i>Fases / Lapsos</h6><small class="text-muted">Divisiones del año actual</small></div><button onclick="ModuloConfiguracion.modalPeriodo()" class="btn btn-sm btn-warning-vibrant rounded-pill px-3 shadow-sm text-white"><i class="bi bi-plus-lg"></i> Agregar</button></div><div class="d-flex flex-column gap-2" id="list-periodos"></div><div class="alert alert-light border mt-3 small text-muted"><i class="bi bi-info-circle me-1"></i> Estos periodos estarán disponibles para los docentes.</div></div></div></div>`;
        this.load();
    },
    load: function() { App.sendRequest({ action: "get_school_config" }, (res) => { this.anios = res.anios || []; this.periodos = res.periodos || []; this.draw(); }); },
    draw: function() {
        const tAnios = document.getElementById('tbl-anios');
        if(tAnios) tAnios.innerHTML = this.anios.length === 0 ? `<tr><td colspan="4" class="text-center text-muted py-3">Sin registros</td></tr>` : this.anios.map(a => { const isActual = a.estado === 'Actual'; return `<tr class="${isActual ? 'bg-light' : ''}"><td class="fw-bold text-dark">${a.nombre}</td><td class="text-muted" style="font-size:0.75rem">${new Date(a.inicio).toLocaleDateString()} <br> ${new Date(a.fin).toLocaleDateString()}</td><td><div class="form-check form-switch"><input class="form-check-input" type="checkbox" onchange="ModuloConfiguracion.setActual('${a.id}')" ${isActual ? 'checked' : ''}><label class="form-check-label small ${isActual ? 'text-success fw-bold' : 'text-muted'}">${isActual ? 'Actual' : 'Histórico'}</label></div></td><td class="text-end"><button class="btn btn-sm btn-light text-primary rounded-circle" onclick="ModuloConfiguracion.modalAnio('${a.id}')"><i class="bi bi-pencil"></i></button>${!isActual ? `<button class="btn btn-sm btn-light text-danger rounded-circle" onclick="ModuloConfiguracion.delete('${a.id}')"><i class="bi bi-trash"></i></button>` : ''}</td></tr>`; }).join('');
        const cPeriodos = document.getElementById('list-periodos');
        if(cPeriodos) cPeriodos.innerHTML = this.periodos.length === 0 ? `<div class="text-center text-muted py-3 small">No hay fases registradas</div>` : this.periodos.map(p => `<div class="d-flex justify-content-between align-items-center p-3 rounded-3 bg-light border-start border-4 border-warning"><span class="fw-medium text-dark">${p.nombre}</span><div><button class="btn btn-sm btn-link text-primary p-0 me-2" onclick="ModuloConfiguracion.modalPeriodo('${p.id}', '${p.nombre}')"><i class="bi bi-pencil"></i></button><button class="btn btn-sm btn-link text-danger p-0" onclick="ModuloConfiguracion.delete('${p.id}')"><i class="bi bi-trash"></i></button></div></div>`).join('');
    },
    modalAnio: function(id = null) {
        const data = id ? this.anios.find(a => a.id === id) : {};
        const ini = data.inicio ? new Date(data.inicio).toISOString().split('T')[0] : '';
        const fin = data.fin ? new Date(data.fin).toISOString().split('T')[0] : '';
        Swal.fire({ title: id ? 'Editar Año Escolar' : 'Nuevo Año Escolar', html: `<input id="sw-anio" class="form-control rounded-pill mb-2 shadow-none" placeholder="Nombre (Ej: 2024-2025)" value="${data.nombre || ''}"><div class="row"><div class="col-6"><label class="small text-muted">Inicio</label><input type="date" id="sw-ini" class="form-control rounded-pill shadow-none" value="${ini}"></div><div class="col-6"><label class="small text-muted">Fin</label><input type="date" id="sw-fin" class="form-control rounded-pill shadow-none" value="${fin}"></div></div>`, showCancelButton: true, confirmButtonColor: '#0085FF', confirmButtonText: 'Guardar', preConfirm: () => { const n = document.getElementById('sw-anio').value, i = document.getElementById('sw-ini').value, f = document.getElementById('sw-fin').value; if(!n || !i || !f) Swal.showValidationMessage('Complete todos los campos'); return { id, nombre: n, inicio: i, fin: f }; } }).then((r) => {
            if(r.isConfirmed) { App.showLoader(); App.sendRequest({ action: "save_school_year", year: r.value }, () => { this.load(); App.hideLoader(); Swal.fire('Guardado', '', 'success'); }); }
        });
    },
    modalPeriodo: function(id = null, nombre = '') { Swal.fire({ title: id ? 'Editar Fase/Lapso' : 'Nueva Fase/Lapso', input: 'text', inputValue: nombre, inputPlaceholder: 'Ej: I Momento Pedagógico', showCancelButton: true, confirmButtonColor: '#FF8D00', confirmButtonText: 'Guardar', inputValidator: (val) => { if (!val) return 'Escriba el nombre'; } }).then((r) => { if(r.isConfirmed) { App.showLoader(); App.sendRequest({ action: "save_school_period", period: { id: id, nombre: r.value } }, () => { this.load(); App.hideLoader(); }); } }); },
    setActual: function(id) { App.showLoader(); App.sendRequest({ action: "set_current_year", id: id }, () => { this.load(); App.hideLoader(); const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 }); Toast.fire({ icon: 'success', title: 'Año Escolar Actualizado' }); }); },
    delete: function(id) { Swal.fire({ title: '¿Eliminar?', text: "Se borrará del sistema", icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, borrar' }).then((r) => { if(r.isConfirmed) { App.showLoader(); App.sendRequest({ action: "delete_config_item", id: id }, () => { this.load(); App.hideLoader(); }); } }); }
};

/** MÓDULO AYUDA **/
const ModuloAyuda = { render: function(cont) { cont.innerHTML = `<div class="row g-4 animate__animated animate__fadeIn"><div class="col-md-6"><div class="card border-0 shadow-sm p-4 h-100 rounded-4 bg-white text-center"><div class="text-primary mb-3"><i class="bi bi-book-half fs-1"></i></div><h5 class="fw-bold">Manual de Usuario</h5><p class="text-muted small">Guía detallada sobre el uso del sistema SIGAE.</p><button class="btn btn-outline-primary rounded-pill px-4" disabled>Descargar PDF (Próximamente)</button></div></div><div class="col-md-6"><div class="card border-0 shadow-sm p-4 h-100 rounded-4 bg-white text-center"><div class="text-danger mb-3"><i class="bi bi-life-preserver fs-1"></i></div><h5 class="fw-bold">Soporte Técnico</h5><p class="text-muted small">Contacte al departamento de tecnología.</p><ul class="list-unstyled small text-muted text-start d-inline-block mx-auto mt-2"><li><i class="bi bi-envelope me-2"></i> soporte@sigae-libertador.edu.ve</li><li><i class="bi bi-whatsapp me-2"></i> +58 (412) 000-0000</li></ul></div></div></div>`; } };

/** MÓDULO DISEÑO WEB **/
const Acc = {
    currentSize: 16,
    init: function() { if(localStorage.getItem('acc-dark') === 'true') document.body.classList.add('dark-mode'); if(localStorage.getItem('acc-gray') === 'true') document.body.classList.add('acc-grayscale'); if(localStorage.getItem('acc-font') === 'true') document.body.classList.add('readable-font'); const size = localStorage.getItem('acc-size'); if(size) { this.currentSize = parseInt(size); this.applySize(); } },
    render: function(cont) { cont.innerHTML = `<div class="card p-4 border-0 shadow-sm rounded-4 bg-white"><h5 class="fw-bold mb-4" style="color:#0085FF">Accesibilidad</h5><div class="row g-3"><div class="col-md-4"><button onclick="Acc.darkMode()" class="btn btn-outline-dark w-100 p-3 rounded-4 shadow-sm">Modo Oscuro</button></div><div class="col-md-4"><button onclick="Acc.changeFont(1)" class="btn btn-outline-primary w-100 p-3 rounded-4 shadow-sm">Aumentar Texto</button></div><div class="col-md-4"><button onclick="Acc.changeFont(-1)" class="btn btn-outline-primary w-100 p-3 rounded-4 shadow-sm">Disminuir Texto</button></div><div class="col-md-4"><button onclick="Acc.grayscale()" class="btn btn-outline-secondary w-100 p-3 rounded-4 shadow-sm">Escala Grises</button></div><div class="col-md-4"><button onclick="Acc.readableFont()" class="btn btn-outline-secondary w-100 p-3 rounded-4 shadow-sm">Fuente Legible</button></div><div class="col-12 mt-4 text-center"><button onclick="Acc.reset()" class="btn btn-danger rounded-pill px-5 shadow">Restablecer</button></div></div></div>`; },
    darkMode: function() { const v = document.body.classList.toggle('dark-mode'); localStorage.setItem('acc-dark', v); },
    grayscale: function() { const v = document.body.classList.toggle('acc-grayscale'); localStorage.setItem('acc-gray', v); },
    readableFont: function() { const v = document.body.classList.toggle('readable-font'); localStorage.setItem('acc-font', v); },
    changeFont: function(dir) { this.currentSize += (dir * 2); if(this.currentSize < 12) this.currentSize=12; if(this.currentSize > 24) this.currentSize=24; this.applySize(); },
    applySize: function() { document.documentElement.style.setProperty('--base-font-size', this.currentSize + 'px'); localStorage.setItem('acc-size', this.currentSize); },
    reset: function() { document.body.classList.remove('dark-mode','acc-grayscale','readable-font'); this.currentSize = 16; this.applySize(); localStorage.clear(); Swal.fire("Restablecido", "Diseño original cargado", "info"); }
};

/** OTROS MÓDULOS (ANTIGUOS) **/
const ModuloEscuela = { render: function(cont) { const d = App.schoolData || {}; cont.innerHTML = `<div class="card p-4 border-0 shadow-sm rounded-4 bg-white"><h5 class="fw-bold mb-4" style="color:#0085FF">Institución</h5><div class="row g-3"><div class="col-md-6"><label class="small fw-bold">Nombre</label><input type="text" id="esc-nom" class="form-control rounded-pill px-4" value="${d.nombre||''}"></div><div class="col-md-3"><label class="small fw-bold">DEA</label><input type="text" id="esc-dea" class="form-control rounded-pill px-4" value="${d.dea||''}"></div><div class="col-md-3"><label class="small fw-bold">RIF</label><input type="text" id="esc-rif" class="form-control rounded-pill px-4" value="${d.rif||''}"></div><div class="col-12"><label class="small fw-bold">Dirección</label><input type="text" id="esc-dir" class="form-control rounded-pill px-4" value="${d.direccion||''}"></div><div class="col-md-3"><label class="small fw-bold">Misión</label><textarea id="esc-mis" class="form-control rounded-4" rows="4">${d.mision||''}</textarea></div><div class="col-md-3"><label class="small fw-bold">Visión</label><textarea id="esc-vis" class="form-control rounded-4" rows="4">${d.vision||''}</textarea></div><div class="col-md-3"><label class="small fw-bold">Objetivo</label><textarea id="esc-obj" class="form-control rounded-4" rows="4">${d.objetivo||''}</textarea></div><div class="col-md-3"><label class="small fw-bold">PEIC</label><textarea id="esc-peic" class="form-control rounded-4" rows="4">${d.peic||''}</textarea></div><div class="col-12 text-end mt-4"><button onclick="ModuloEscuela.save()" class="btn btn-success px-5 rounded-pill shadow">Guardar</button></div></div></div>`; }, save: function() { const data = { nombre: document.getElementById('esc-nom').value, dea: document.getElementById('esc-dea').value, rif: document.getElementById('esc-rif').value, direccion: document.getElementById('esc-dir').value, mision: document.getElementById('esc-mis').value, vision: document.getElementById('esc-vis').value, objetivo: document.getElementById('esc-obj').value, peic: document.getElementById('esc-peic').value }; App.showLoader(); App.sendRequest({ action: "save_school_profile", data: data }, () => { App.sendRequest({ action: "get_school_profile" }, (resSchool) => { App.schoolData = resSchool; ModuloEscuela.render(document.getElementById('module-content')); App.hideLoader(); Swal.fire("Éxito", "Actualizado", "success"); }); }); } };
const ModuloPerfil = { render: function(cont) { App.showLoader(); App.sendRequest({ action: "get_user_full_data", cedula: App.user.cedula }, (res) => { App.hideLoader(); if(res.status === "success") { const u = res.user; cont.innerHTML = `<div class="row"><div class="col-md-8 mx-auto"><div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white"><div class="p-4 bg-light border-bottom d-flex align-items-center"><div class="avatar-circle me-3" style="width:60px; height:60px; font-size:1.5rem">${u.nombre.charAt(0)}</div><div><h5 class="fw-bold mb-0">${u.nombre}</h5><span class="badge bg-primary rounded-pill">${u.rol}</span></div></div><div class="card-body p-4"><div class="row g-3"><div class="col-md-6"><label class="small fw-bold text-muted">Cédula</label><input type="text" class="form-control rounded-pill bg-light px-4" value="${u.cedula}" disabled></div><div class="col-md-6"><label class="small fw-bold text-muted">Nombre Completo</label><input type="text" id="prof-nom" class="form-control rounded-pill px-4" value="${u.nombre}"></div><hr class="my-4 opacity-5"><h6 class="fw-bold" style="color:#0085FF"><i class="bi bi-shield-lock me-2"></i>Seguridad</h6><div class="col-12"><label class="small fw-bold text-muted">Pregunta Secreta: <b>${u.pregunta}</b></label></div><div class="col-md-6"><label class="small fw-bold text-muted">Nueva Clave (Opcional)</label><input type="password" id="prof-pass" class="form-control rounded-pill px-4"></div><div class="col-md-6"><label class="small fw-bold text-muted">Respuesta Secreta</label><input type="text" id="prof-resp" class="form-control rounded-pill px-4" value="${u.respuesta}"></div><div class="col-12 text-end mt-4"><button onclick="ModuloPerfil.save()" class="btn btn-primary px-5 rounded-pill shadow">Guardar</button></div></div></div></div></div></div>`; } }); }, save: function() { const nom = document.getElementById('prof-nom').value; const pass = document.getElementById('prof-pass').value; const resp = document.getElementById('prof-resp').value; if(!nom || !resp) return; App.showLoader(); App.sendRequest({ action: "update_user_profile", user: { cedula: App.user.cedula, nombre: nom, password: pass, respuesta: resp } }, (res) => { App.user.name = nom; localStorage.setItem('schoolUser', JSON.stringify(App.user)); ModuloPerfil.render(document.getElementById('module-content')); App.hideLoader(); Swal.fire("Listo", "Perfil actualizado", "success"); }); } };
const ModuloSoftware = {
    renderRoles: function(cont) {
        let rolesHtml = ""; for (let r in App.allRoles) { rolesHtml += `<div class="col-md-4 mb-3"><div class="card p-3 border-0 shadow-sm d-flex flex-row justify-content-between align-items-center rounded-4 bg-white"><div><h6 class="fw-bold mb-0">${r}</h6><small class="text-muted">${App.allRoles[r].length} privilegios</small></div><div class="d-flex gap-2"><button onclick="ModuloSoftware.editRole('${r}')" class="btn btn-sm btn-light rounded-circle text-primary shadow-sm"><i class="bi bi-pencil"></i></button><button onclick="ModuloSoftware.deleteRole('${r}')" class="btn btn-sm btn-light rounded-circle text-danger shadow-sm"><i class="bi bi-trash"></i></button></div></div></div>`; }
        cont.innerHTML = `<div class="d-flex justify-content-between align-items-center mb-4"><h5 class="fw-bold mb-0 text-primary">Gestión de Roles</h5><button onclick="ModuloSoftware.formRole()" class="btn btn-primary px-4 rounded-pill shadow-sm">Nuevo Rol</button></div><div class="row">${rolesHtml}</div>`;
    },
    formRole: function(rolName = "", currentPerms = []) {
        let o = "";
        systemStructure.forEach((cat, idx) => {
            o += `<div class="col-12 mt-3 mb-2 d-flex align-items-center"><span class="badge bg-light text-dark border-0 shadow-sm p-2 px-3 rounded-pill me-3">${cat.category}</span><div class="form-check"><input class="form-check-input" type="checkbox" id="cat-all-${idx}" onchange="ModuloSoftware.toggleCategory(this, ${idx})"><label class="form-check-label small text-muted" for="cat-all-${idx}">Seleccionar todo</label></div></div>`;
            cat.items.forEach(i => { o += `<div class="col-md-6 mb-1"><div class="form-check"><input class="form-check-input role-check cat-group-${idx}" type="checkbox" value="${i}" id="chk-${i}" ${currentPerms.includes(i) ? 'checked' : ''}><label class="form-check-label small" for="chk-${i}">${i}</label></div></div>`; });
        });
        Swal.fire({ title: 'Privilegios', width: '850px', html: `<input type="text" id="role-name" class="form-control mb-4 rounded-pill px-4 shadow-none" placeholder="Nombre Rol" value="${rolName}" ${rolName ? 'disabled' : ''}><div class="row text-start" style="max-height: 400px; overflow-y: auto;">${o}</div>`, showCancelButton: true, confirmButtonText: 'Guardar', preConfirm: () => { const name = document.getElementById('role-name').value; const perms = Array.from(document.querySelectorAll('.role-check:checked')).map(c => c.value); if (!name || perms.length === 0) { Swal.showValidationMessage('Datos incompletos'); } return { nombre: name, permisos: perms }; } }).then((result) => { if (result.isConfirmed) { App.showLoader(); App.sendRequest({ action: "save_role", nombre: result.value.nombre, permisos: result.value.permisos }, () => { App.sendRequest({ action: "get_roles" }, (resRoles) => { App.allRoles = resRoles.roles || {}; ModuloSoftware.renderRoles(document.getElementById('module-content')); App.hideLoader(); Swal.fire("Éxito", "Actualizado", "success"); }); }); } });
    },
    toggleCategory: function(source, idx) { const checkboxes = document.querySelectorAll(`.cat-group-${idx}`); checkboxes.forEach(cb => cb.checked = source.checked); },
    editRole: function(r) { this.formRole(r, App.allRoles[r]); },
    deleteRole: function(r) { Swal.fire({ title: '¿Eliminar?', icon: 'warning', showCancelButton: true }).then((res) => { if (res.isConfirmed) { App.showLoader(); App.sendRequest({ action: "delete_role", nombre: r }, () => { App.sendRequest({ action: "get_roles" }, (resRoles) => { App.allRoles = resRoles.roles || {}; ModuloSoftware.renderRoles(document.getElementById('module-content')); App.hideLoader(); }); }); } }); }
};

document.addEventListener("DOMContentLoaded", () => App.init());