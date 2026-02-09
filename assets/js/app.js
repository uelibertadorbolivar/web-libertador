/**
 * SIGAE - CORE UE LIBERTADOR BOLÍVAR
 * Versión Final: Mensajes de éxito y permanencia en vista
 */

const systemStructure = [
    {
        category: "Escuela", icon: "bi-building", color: "#FFB81D",
        items: ["Perfil de la Escuela", "Fases y Periodos", "Niveles Educativos", "Escalas de Evaluación", "Gestión de Cargos", "Organigrama Institucional", "Proyecto PEIC", "Grado / Año", "Secciones"]
    },
    {
        category: "Docentes", icon: "bi-person-badge-fill", color: "#56B458",
        items: ["Agregar Docentes", "Asignar Cargos", "Registrar Tipos de Ausencias (Doc)", "Registrar Ausencias (Doc)", "Expediente Docente", "Condición Salud (Doc)", "Reporte Gestión Diaria (Doc)", "Planes de Evaluación"]
    },
    {
        category: "Estudiantes", icon: "bi-people-fill", color: "#5D86E6",
        items: ["Agregar Estudiante (Nuevo)", "Agregar Estudiante (Regular)", "Asignar Cargos (Est)", "Registrar Tipos de Ausencias (Est)", "Registrar Ausencias (Est)", "Expediente Estudiante", "Condición Salud (Est)", "Voceros Estudiantiles"]
    },
    {
        category: "Representantes", icon: "bi-person-heart", color: "#F24444",
        items: ["Solicitudes (Retiro/Notas/Constancia)", "Actualización de Datos (Regular)", "Inscripciones (Nuevos)", "Ver Boleta", "Ver Corte de Calificaciones"]
    },
    {
        category: "Administrativo", icon: "bi-clipboard-check-fill", color: "#8D24AA",
        items: ["Accidentes/Casiaccidentes (Doc)", "Accidentes/Casiaccidentes (Est)", "Reporte Preliminar Asistencias", "Reporte Incidentes y Requerimientos", "Gestión Diaria (Revisada)", "Gestión Mensual (DEP/CDV)", "Requerimientos Anuales", "Registros de Espacios", "Asignación de Espacios", "Agregar Colectivos Docentes", "Asignación de Colectivos", "Crear Salones", "Estadísticas"]
    },
    {
        category: "Transporte Escolar", icon: "bi-bus-front-fill", color: "#FFB81D",
        items: ["Agregar Rutas", "Agregar Paradas", "Asignación de Recorridos", "Registro de Asistencias (Transp)", "Reporte Incidentes (Est/Transp)", "Reporte Incidentes (Servicio)"]
    },
    {
        category: "Pedagogía", icon: "bi-journal-bookmark-fill", color: "#56B458",
        items: ["Agregar PA", "Perfil del Aula", "Calendario Escolar"]
    },
    {
        category: "Control de Estudios", icon: "bi-shield-lock-fill", color: "#8D24AA",
        items: ["Solicitud de Cupos", "Carnet Estudiantil", "Calificaciones", "Matrículas", "Boletas", "Retiros", "Notas Certificadas", "Certificación Títulos", "Constancias de Estudio", "Cortes de Notas", "Sábanas", "Resúmenes Finales"]
    },
    {
        category: "C.R.A.", icon: "bi-book-fill", color: "#5D86E6",
        items: ["Ubicaciones CRA", "Recursos Educativos CRA", "Préstamos"]
    },
    {
        category: "Formaciones", icon: "bi-patch-check-fill", color: "#56B458",
        items: ["Planificación de Formación", "Recursos Educativos Formación", "Descarga de Certificados"]
    },
    {
        category: "Software", icon: "bi-gear-wide-connected", color: "#F24444",
        items: ["Gestión de Usuarios", "Roles y Privilegios", "Cambio de Contraseñas"]
    },
    {
        category: "Diseño Web", icon: "bi-palette-fill", color: "#1e2b5e",
        items: ["Accesibilidad y Apariencia"]
    }
];

const App = {
    user: null, schoolData: null, allRoles: {}, tempCedula: null,

    init: function() { this.checkSession(); Simon.init(); Acc.init(); },

    showLoader: function() { document.getElementById('main-loader').style.display = 'flex'; },
    hideLoader: function() { document.getElementById('main-loader').style.display = 'none'; },
    toggleSidebar: function() { document.body.classList.toggle('sidebar-open'); },

    checkSession: function() {
        const stored = localStorage.getItem('schoolUser');
        if (stored) { this.user = JSON.parse(stored); this.loadAppData(); }
        else { this.hideLoader(); }
    },

    loadAppData: function() {
        this.showLoader();
        App.sendRequest({ action: "get_roles" }, (resRoles) => {
            this.allRoles = resRoles.roles || {};
            App.sendRequest({ action: "get_school_profile" }, (resSchool) => {
                this.schoolData = resSchool;
                this.showApp();
                this.hideLoader();
            });
        });
    },

    verificarUsuario: function() {
        const ced = document.getElementById('inputCedula').value;
        if(!ced) return;
        this.showLoader();
        App.sendRequest({ action: "verificar_usuario", cedula: ced }, (res) => {
            this.hideLoader();
            if(res.found) {
                this.tempCedula = ced;
                document.getElementById('step-cedula').style.display = 'none';
                if(res.hasPassword) {
                    document.getElementById('lbl-nombre-login').innerText = res.nombre;
                    document.getElementById('step-login').style.display = 'block';
                } else { document.getElementById('step-register').style.display = 'block'; }
            } else { Swal.fire('Error', 'Cédula no autorizada', 'error'); }
        });
    },

    login: function() {
        const pass = document.getElementById('inputPass').value;
        this.showLoader();
        App.sendRequest({ action: "login", cedula: this.tempCedula, password: pass }, (res) => {
            if(res.status === "success") {
                this.user = res.user;
                localStorage.setItem('schoolUser', JSON.stringify(this.user));
                this.loadAppData();
            } else { this.hideLoader(); Swal.fire('Error', 'Clave incorrecta', 'error'); }
        });
    },

    showApp: function() {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app-wrapper').style.display = 'flex';
        document.getElementById('user-display-name').innerText = this.user.name;
        this.renderMenu();
        this.showDashboard();
    },

    renderMenu: function() {
        const container = document.getElementById('sidebar-menu');
        const userPerms = (this.user.role === 'Administrador' || this.user.role === 'Director') ? "all" : (this.allRoles[this.user.role] || []);
        let html = `<div class="px-3 mb-2"><button onclick="App.showDashboard()" class="nav-category-btn rounded-pill border-0 w-100" style="background: #ebf4ff; color: #1e2b5e;"><span><i class="bi bi-house-door-fill me-2"></i> Inicio</span></button></div>`;
        systemStructure.forEach((cat, index) => {
            const allowedItems = cat.items.filter(item => userPerms === "all" || userPerms.includes(item));
            if (allowedItems.length > 0) {
                const id = `m-${index}`;
                html += `
                <div class="accordion-item bg-transparent border-0">
                    <button class="nav-category-btn collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${id}">
                        <span><i class="bi ${cat.icon} me-2" style="color:${cat.color}"></i> ${cat.category}</span>
                        <i class="bi bi-chevron-down small opacity-50"></i>
                    </button>
                    <div id="${id}" class="accordion-collapse collapse" data-bs-parent="#sidebar-menu">
                        <div class="accordion-body p-0">
                            ${allowedItems.map(item => `<a href="#${item}" onclick="App.renderView('${item}','${item}')" class="nav-sub-item">${item}</a>`).join('')}
                        </div>
                    </div>
                </div>`;
            }
        });
        container.innerHTML = html;
    },

    showDashboard: function() {
        if(window.innerWidth < 992) document.body.classList.remove('sidebar-open');
        document.getElementById('dynamic-view').style.display = 'none';
        const dash = document.getElementById('dashboard-view');
        dash.style.display = 'block';
        document.getElementById('page-title').innerText = "Panel de Control";
        const res = this.schoolData || { nombre: "UE Libertador Bolívar", direccion: "Sede Principal" };
        dash.innerHTML = `
            <div class="p-4 animate__animated animate__fadeIn">
                <div class="row g-4">
                    <div class="col-12">
                        <div class="card p-5 text-white shadow-lg border-0" style="background: linear-gradient(135deg, #1e2b5e 0%, #2a3b7a 100%); border-radius: 30px;">
                            <h2 class="fw-bold mb-1">${res.nombre}</h2>
                            <p class="opacity-75 mb-0"><i class="bi bi-geo-alt-fill me-1"></i> ${res.direccion}</p>
                        </div>
                    </div>
                    <div class="col-md-4"><div class="card p-4 h-100 border-0 shadow-sm rounded-4"><h6 class="fw-bold text-primary">Misión</h6><p class="small text-muted">${res.mision || 'No definida'}</p></div></div>
                    <div class="col-md-4"><div class="card p-4 h-100 border-0 shadow-sm rounded-4"><h6 class="fw-bold text-success">Visión</h6><p class="small text-muted">${res.vision || 'No definida'}</p></div></div>
                    <div class="col-md-4"><div class="card p-4 h-100 border-0 shadow-sm rounded-4"><h6 class="fw-bold text-warning">Objetivo</h6><p class="small text-muted">${res.objetivo || 'No definido'}</p></div></div>
                </div>
            </div>`;
    },

    renderView: function(id, title) {
        if(window.innerWidth < 992) document.body.classList.remove('sidebar-open');
        if(id === 'Perfil de la Escuela') { ModuloEscuela.render(); return; }
        if(id === 'Roles y Privilegios') { ModuloSoftware.renderRoles(); return; }
        if(id === 'Gestión de Usuarios') { ModuloUsuarios.render(); return; }
        if(id === 'Accesibilidad y Apariencia') { Acc.render(); return; }
        document.getElementById('dashboard-view').style.display = 'none';
        const div = document.getElementById('dynamic-view');
        div.style.display = 'block';
        document.getElementById('page-title').innerText = title;
        div.innerHTML = `<div class="p-5 text-center text-muted"><i class="bi bi-gear-wide-connected fs-1 d-block mb-3 opacity-25"></i> Módulo <b>${title}</b> en desarrollo.</div>`;
    },

    sendRequest: function(data, callback) {
        fetch(AppConfig.getApiUrl(), { method: "POST", body: JSON.stringify(data) })
        .then(r => r.json()).then(res => callback(res)).catch(e => { this.hideLoader(); console.error(e); });
    },

    logout: function() { localStorage.removeItem('schoolUser'); location.reload(); }
};

/** MÓDULO GESTIÓN DE USUARIOS (CORREGIDO) **/
const ModuloUsuarios = {
    render: function() {
        document.getElementById('dashboard-view').style.display = 'none';
        const div = document.getElementById('dynamic-view');
        div.style.display = 'block';
        div.innerHTML = `
            <div class="p-4 animate__animated animate__fadeIn">
                <div class="card p-4 border-0 shadow-sm rounded-4 mb-4 bg-white">
                    <h6 class="fw-bold mb-3 text-primary">Registrar Personal</h6>
                    <div class="row g-3">
                        <div class="col-md-3"><input type="number" id="u-ced" class="form-control rounded-pill px-4" placeholder="Cédula"></div>
                        <div class="col-md-4"><input type="text" id="u-nom" class="form-control rounded-pill px-4" placeholder="Nombre Completo"></div>
                        <div class="col-md-3">
                            <select id="u-rol" class="form-select rounded-pill px-4 shadow-none">
                                <option value="">Seleccione Rol</option>
                                <option value="Administrador">Administrador</option>
                                <option value="Director">Director</option>
                                ${Object.keys(App.allRoles).map(r => `<option value="${r}">${r}</option>`).join('')}
                            </select>
                        </div>
                        <div class="col-md-2"><button onclick="ModuloUsuarios.save()" class="btn btn-primary w-100 rounded-pill">Guardar</button></div>
                    </div>
                </div>
                <div class="card p-4 border-0 shadow-sm rounded-4 bg-white">
                    <div class="d-flex justify-content-between mb-3 gap-2">
                        <input type="text" id="u-busq" class="form-control w-50 rounded-pill px-4 shadow-none" placeholder="Buscar..." onkeyup="ModuloUsuarios.filter()">
                        <select id="u-filt-rol" class="form-select w-25 rounded-pill px-4 shadow-none" onchange="ModuloUsuarios.filter()">
                            <option value="">Todos los Roles</option>
                            ${Object.keys(App.allRoles).map(r => `<option value="${r}">${r}</option>`).join('')}
                        </select>
                    </div>
                    <div class="table-responsive"><table class="table table-hover small"><thead class="table-light"><tr><th>Fecha</th><th>Cédula</th><th>Nombre</th><th>Rol</th><th>Acción</th></tr></thead><tbody id="u-tabla"></tbody></table></div>
                </div>
            </div>`;
        this.load();
    },
    load: function() {
        App.showLoader();
        App.sendRequest({ action: "get_users" }, (res) => {
            App.allUsers = res.users;
            this.draw(App.allUsers);
            App.hideLoader();
        });
    },
    draw: function(data) {
        const t = document.getElementById('u-tabla');
        t.innerHTML = data.map(u => `<tr><td>${new Date(u.fecha).toLocaleDateString()}</td><td class="fw-bold">${u.cedula}</td><td>${u.nombre}</td><td><span class="badge bg-light text-dark border-0 shadow-sm">${u.rol}</span></td><td><button class="btn btn-sm btn-light text-danger rounded-circle" onclick="ModuloUsuarios.delete(${u.cedula})"><i class="bi bi-trash"></i></button></td></tr>`).join('');
    },
    filter: function() {
        const val = document.getElementById('u-busq').value.toLowerCase();
        const rol = document.getElementById('u-filt-rol').value;
        const filtered = App.allUsers.filter(u => (u.nombre.toLowerCase().includes(val) || String(u.cedula).includes(val)) && (rol === "" || u.rol === rol));
        this.draw(filtered);
    },
    save: function() {
        const user = { cedula: document.getElementById('u-ced').value, nombre: document.getElementById('u-nom').value, rol: document.getElementById('u-rol').value };
        if(!user.cedula || !user.nombre || !user.rol) return Swal.fire("Error", "Complete los campos", "warning");
        App.showLoader();
        App.sendRequest({ action: "save_user", user: user }, () => {
            Swal.fire("Éxito", "Usuario guardado correctamente", "success");
            this.render(); // Refresca la vista de usuarios sin ir al inicio
        });
    },
    delete: function(ced) {
        Swal.fire({ title: '¿Eliminar usuario?', icon: 'warning', showCancelButton: true }).then(r => {
            if(r.isConfirmed) { 
                App.showLoader(); 
                App.sendRequest({ action: "delete_user", cedula: ced }, () => {
                    Swal.fire("Eliminado", "El usuario ha sido removido", "success");
                    this.render();
                }); 
            }
        });
    }
};

/** MÓDULO ROLES (CORREGIDO - PERMANECE EN VISTA) **/
const ModuloSoftware = {
    renderRoles: function() {
        document.getElementById('dashboard-view').style.display = 'none';
        const div = document.getElementById('dynamic-view');
        div.style.display = 'block';
        let rolesHtml = "";
        for (let r in App.allRoles) {
            rolesHtml += `<div class="col-md-4 mb-3"><div class="card p-3 border-0 shadow-sm d-flex flex-row justify-content-between align-items-center rounded-4 bg-white"><div><h6 class="fw-bold mb-0">${r}</h6><small class="text-muted">${App.allRoles[r].length} permisos</small></div><div class="d-flex gap-2"><button onclick="ModuloSoftware.editRole('${r}')" class="btn btn-sm btn-light rounded-circle text-primary shadow-sm"><i class="bi bi-pencil"></i></button><button onclick="ModuloSoftware.deleteRole('${r}')" class="btn btn-sm btn-light rounded-circle text-danger shadow-sm"><i class="bi bi-trash"></i></button></div></div></div>`;
        }
        div.innerHTML = `<div class="p-4 animate__animated animate__fadeIn"><div class="d-flex justify-content-between align-items-center mb-4"><h5 class="fw-bold mb-0 text-primary">Gestión de Roles</h5><button onclick="ModuloSoftware.formRole()" class="btn btn-primary px-4 rounded-pill shadow-sm">Nuevo Rol</button></div><div class="row">${rolesHtml}</div></div>`;
    },
    formRole: function(rolName = "", currentPerms = []) {
        let optionsHtml = "";
        systemStructure.forEach(cat => {
            optionsHtml += `<div class="col-12 mt-3 mb-2"><span class="badge bg-light text-dark border-0 shadow-sm p-2 px-3 rounded-pill">${cat.category}</span></div>`;
            cat.items.forEach(item => { optionsHtml += `<div class="col-md-6 mb-1"><div class="form-check"><input class="form-check-input role-check" type="checkbox" value="${item}" id="chk-${item}" ${currentPerms.includes(item) ? 'checked' : ''}><label class="form-check-label small" for="chk-${item}">${item}</label></div></div>`; });
        });
        Swal.fire({
            title: 'Configurar Privilegios', width: '850px',
            html: `<input type="text" id="role-name" class="form-control mb-4 rounded-pill px-4 shadow-none" placeholder="Nombre Rol" value="${rolName}" ${rolName ? 'disabled' : ''}><div class="row text-start" style="max-height: 400px; overflow-y: auto;">${optionsHtml}</div>`,
            showCancelButton: true, confirmButtonText: 'Guardar Privilegios', confirmButtonColor: '#1e2b5e',
            preConfirm: () => {
                const name = document.getElementById('role-name').value;
                const checks = document.querySelectorAll('.role-check:checked');
                const permisos = Array.from(checks).map(c => c.value);
                if (!name || permisos.length === 0) { Swal.showValidationMessage('Datos incompletos'); }
                return { nombre: name, permisos: permisos };
            }
        }).then((result) => { 
            if (result.isConfirmed) { 
                App.showLoader(); 
                App.sendRequest({ action: "save_role", nombre: result.value.nombre, permisos: result.value.permisos }, () => { 
                    // RECARGA SOLO ROLES Y RE-RENDERIZA LA VISTA ACTUAL
                    App.sendRequest({ action: "get_roles" }, (resRoles) => {
                        App.allRoles = resRoles.roles || {};
                        this.renderRoles();
                        App.hideLoader();
                        Swal.fire("Éxito", "Rol guardado y privilegios actualizados", "success");
                    });
                }); 
            } 
        });
    },
    editRole: function(r) { this.formRole(r, App.allRoles[r]); },
    deleteRole: function(r) {
        Swal.fire({ title: '¿Eliminar Rol?', text: "Los usuarios con este rol perderán sus accesos", icon: 'warning', showCancelButton: true, confirmButtonColor: '#F24444' }).then((res) => {
            if (res.isConfirmed) { 
                App.showLoader(); 
                App.sendRequest({ action: "delete_role", nombre: r }, () => {
                    App.sendRequest({ action: "get_roles" }, (resRoles) => {
                        App.allRoles = resRoles.roles || {};
                        this.renderRoles();
                        App.hideLoader();
                        Swal.fire("Eliminado", "Rol removido del sistema", "success");
                    });
                }); 
            } 
        });
    }
};

/** MÓDULO DISEÑO WEB **/
const Acc = {
    currentSize: 16,
    init: function() {
        if(localStorage.getItem('acc-dark') === 'true') document.body.classList.add('dark-mode');
        const size = localStorage.getItem('acc-size'); if(size) { this.currentSize = parseInt(size); this.applySize(); }
    },
    render: function() {
        document.getElementById('dashboard-view').style.display = 'none';
        const div = document.getElementById('dynamic-view');
        div.style.display = 'block';
        div.innerHTML = `
            <div class="p-4 animate__animated animate__fadeIn">
                <div class="card p-4 border-0 shadow-sm rounded-4 bg-white">
                    <h5 class="fw-bold mb-4">Ajustes de Apariencia</h5>
                    <div class="row g-3">
                        <div class="col-md-4"><button onclick="Acc.darkMode()" class="btn btn-outline-dark w-100 p-3 rounded-4">Modo Oscuro</button></div>
                        <div class="col-md-4"><button onclick="Acc.changeFont(1)" class="btn btn-outline-primary w-100 p-3 rounded-4">Aumentar Texto</button></div>
                        <div class="col-md-4"><button onclick="Acc.changeFont(-1)" class="btn btn-outline-primary w-100 p-3 rounded-4">Disminuir Texto</button></div>
                        <div class="col-12 mt-4 text-center"><button onclick="Acc.reset()" class="btn btn-danger rounded-pill px-5">Restablecer Todo</button></div>
                    </div>
                </div>
            </div>`;
    },
    darkMode: function() { const v = document.body.classList.toggle('dark-mode'); localStorage.setItem('acc-dark', v); },
    changeFont: function(dir) { this.currentSize += (dir * 2); this.applySize(); },
    applySize: function() { document.documentElement.style.setProperty('--base-font-size', this.currentSize + 'px'); localStorage.setItem('acc-size', this.currentSize); },
    reset: function() { document.body.className = ''; this.currentSize = 16; this.applySize(); localStorage.clear(); this.render(); }
};

/** MÓDULO PERFIL ESCUELA **/
const ModuloEscuela = {
    render: function() {
        document.getElementById('dashboard-view').style.display = 'none';
        const div = document.getElementById('dynamic-view');
        div.style.display = 'block';
        const d = App.schoolData || {};
        div.innerHTML = `
            <div class="p-4 animate__animated animate__fadeIn">
                <div class="card p-4 border-0 shadow-sm rounded-4 bg-white">
                    <h5 class="fw-bold mb-4 text-primary">Información Institucional</h5>
                    <div class="row g-3">
                        <div class="col-md-6"><label class="small fw-bold text-muted">Nombre Escuela</label><input type="text" id="esc-nom" class="form-control rounded-pill px-4" value="${d.nombre||''}"></div>
                        <div class="col-md-3"><label class="small fw-bold text-muted">DEA</label><input type="text" id="esc-dea" class="form-control rounded-pill px-4" value="${d.dea||''}"></div>
                        <div class="col-md-3"><label class="small fw-bold text-muted">RIF</label><input type="text" id="esc-rif" class="form-control rounded-pill px-4" value="${d.rif||''}"></div>
                        <div class="col-12"><label class="small fw-bold text-muted">Dirección</label><input type="text" id="esc-dir" class="form-control rounded-pill px-4" value="${d.direccion||''}"></div>
                        <div class="col-md-4"><label class="small fw-bold text-muted">Misión</label><textarea id="esc-mis" class="form-control rounded-4" rows="3">${d.mision||''}</textarea></div>
                        <div class="col-md-4"><label class="small fw-bold text-muted">Visión</label><textarea id="esc-vis" class="form-control rounded-4" rows="3">${d.vision||''}</textarea></div>
                        <div class="col-md-4"><label class="small fw-bold text-muted">Objetivo</label><textarea id="esc-obj" class="form-control rounded-4" rows="3">${d.objetivo||''}</textarea></div>
                        <div class="col-12 text-end mt-4"><button onclick="ModuloEscuela.save()" class="btn btn-success px-5 rounded-pill shadow">Actualizar Portal</button></div>
                    </div>
                </div>
            </div>`;
    },
    save: function() {
        const data = { nombre: document.getElementById('esc-nom').value, dea: document.getElementById('esc-dea').value, rif: document.getElementById('esc-rif').value, direccion: document.getElementById('esc-dir').value, mision: document.getElementById('esc-mis').value, vision: document.getElementById('esc-vis').value, objetivo: document.getElementById('esc-obj').value };
        App.showLoader(); 
        App.sendRequest({ action: "save_school_profile", data: data }, () => { 
            Swal.fire("Éxito", "Perfil institucional actualizado", "success");
            App.sendRequest({ action: "get_school_profile" }, (resSchool) => {
                App.schoolData = resSchool;
                this.render();
                App.hideLoader();
            });
        });
    }
};

const Simon = {
    init: function() { setTimeout(() => this.say("¡Hola! Soy Simón. Estoy aquí para guiarte."), 2000); },
    toggle: function() { const c = document.getElementById('simon-chat'); c.style.display = (c.style.display === 'none' ? 'flex' : 'none'); },
    say: function(t) { const b = document.getElementById('simon-messages'); if(!b) return; const d = document.createElement('div'); d.className = "simon-msg bot p-2 bg-light rounded shadow-sm small mb-2"; d.innerHTML = t; b.appendChild(d); b.scrollTop = b.scrollHeight; }
};

document.addEventListener("DOMContentLoaded", () => App.init());