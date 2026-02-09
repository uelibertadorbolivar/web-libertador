/**
 * SIGAE - CORE UE LIBERTADOR BOLÍVAR
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
    }
];

const App = {
    user: null, schoolData: null, allRoles: {}, tempCedula: null,

    init: function() { this.checkSession(); Simon.init(); },

    showLoader: function() { document.getElementById('main-loader').style.display = 'flex'; },
    hideLoader: function() { document.getElementById('main-loader').style.display = 'none'; },

    toggleSidebar: function() { document.body.classList.toggle('sidebar-open'); },

    checkSession: function() {
        const stored = localStorage.getItem('schoolUser');
        if (stored) { this.user = JSON.parse(stored); this.loadAppData(); }
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
                    Simon.say("¡Hola! Por favor ingresa tu contraseña para acceder.");
                } else {
                    document.getElementById('step-register').style.display = 'block';
                    Simon.say("Veo que es tu primer acceso. Crea una contraseña segura.");
                }
            } else { Swal.fire('Error', 'Cédula no autorizada', 'error'); }
        });
    },

    login: function() {
        const pass = document.getElementById('inputPass').value;
        this.showLoader();
        App.sendRequest({ action: "login", cedula: this.tempCedula, password: pass }, (res) => {
            this.hideLoader();
            if(res.status === "success") {
                this.user = res.user;
                localStorage.setItem('schoolUser', JSON.stringify(this.user));
                this.loadAppData();
            } else { Swal.fire('Error', 'Contraseña incorrecta', 'error'); }
        });
    },

    registrarClave: function() {
        const data = {
            action: "registrar_clave",
            cedula: this.tempCedula,
            password: document.getElementById('regPass').value,
            pregunta: document.getElementById('regPregunta').value,
            respuesta: document.getElementById('regRespuesta').value
        };
        if(!data.password || !data.respuesta) return;
        this.showLoader();
        App.sendRequest(data, () => {
            this.hideLoader();
            Swal.fire('Éxito', 'Cuenta activada', 'success').then(() => location.reload());
        });
    },

    showForgot: function() {
        App.sendRequest({ action: "get_pregunta", cedula: this.tempCedula }, (res) => {
            document.getElementById('lbl-pregunta').innerText = res.pregunta;
            document.getElementById('step-login').style.display = 'none';
            document.getElementById('step-forgot').style.display = 'block';
            Simon.say("Responde tu pregunta de seguridad para crear una nueva clave.");
        });
    },

    recuperarClave: function() {
        const data = {
            action: "recuperar_clave",
            cedula: this.tempCedula,
            respuesta: document.getElementById('recRespuesta').value,
            newPassword: document.getElementById('recNewPass').value
        };
        this.showLoader();
        App.sendRequest(data, (res) => {
            this.hideLoader();
            if(res.status === "success") {
                Swal.fire('Listo', 'Contraseña restablecida', 'success').then(() => location.reload());
            } else { Swal.fire('Error', res.message, 'error'); }
        });
    },

    modalInvitado: async function() {
        const { value: nombre } = await Swal.fire({
            title: 'Acceso de Invitado',
            input: 'text', inputLabel: '¿Cuál es su nombre?',
            confirmButtonText: 'Ingresar', confirmButtonColor: '#1e2b5e'
        });
        if (nombre) {
            this.user = { name: nombre, role: "Visitante" };
            this.allRoles["Visitante"] = ["Solicitud de Cupos"];
            localStorage.setItem('schoolUser', JSON.stringify(this.user));
            this.loadAppData();
        }
    },

    showApp: function() {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app-wrapper').style.display = 'flex';
        document.getElementById('user-display-name').innerText = this.user.name;
        const avatar = document.querySelector('.avatar-circle');
        if(avatar) avatar.innerText = this.user.name.charAt(0).toUpperCase();
        this.renderMenu();
        this.showDashboard();
        Simon.say("¡Bienvenido, " + this.user.name.split(' ')[0] + "! ¿Qué módulo deseas revisar?");
    },

    renderMenu: function() {
        const container = document.getElementById('sidebar-menu');
        const userPerms = (this.user.role === 'Administrador' || this.user.role === 'Director') 
                          ? "all" : (this.allRoles[this.user.role] || []);
        
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
        document.getElementById('page-title').innerText = "Portal Educativo - Inicio";
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
                    <div class="col-md-4"><div class="card p-4 h-100 border-0 shadow-sm rounded-4"><h6 class="fw-bold text-primary">Misión</h6><p class="small text-muted">${res.mision || 'Excelencia educativa para todos.'}</p></div></div>
                    <div class="col-md-4"><div class="card p-4 h-100 border-0 shadow-sm rounded-4"><h6 class="fw-bold text-success">Visión</h6><p class="small text-muted">${res.vision || 'Líderes en formación integral.'}</p></div></div>
                    <div class="col-md-4"><div class="card p-4 h-100 border-0 shadow-sm rounded-4"><h6 class="fw-bold text-warning">Objetivo</h6><p class="small text-muted">${res.objetivo || 'Fomentar el aprendizaje dinámico.'}</p></div></div>
                </div>
            </div>`;
    },

    renderView: function(id, title) {
        if(window.innerWidth < 992) document.body.classList.remove('sidebar-open');
        if(id === 'Perfil de la Escuela') { ModuloEscuela.render(); return; }
        if(id === 'Roles y Privilegios') { ModuloSoftware.renderRoles(); return; }
        document.getElementById('dashboard-view').style.display = 'none';
        const div = document.getElementById('dynamic-view');
        div.style.display = 'block';
        document.getElementById('page-title').innerText = title;
        div.innerHTML = `<div class="p-5 text-center text-muted"><i class="bi bi-gear-wide fs-1 d-block mb-3 opacity-25"></i> Módulo <b>${title}</b> en construcción.</div>`;
    },

    sendRequest: function(data, callback) {
        fetch(AppConfig.getApiUrl(), { method: "POST", body: JSON.stringify(data) })
        .then(r => r.json()).then(res => callback(res)).catch(e => console.error(e));
    },

    logout: function() { localStorage.removeItem('schoolUser'); location.reload(); }
};

/** SIMÓN CHATBOT **/
const Simon = {
    init: function() {
        setTimeout(() => {
            this.say("¡Hola! Soy Simón, tu asistente virtual. ¿Necesitas ayuda para navegar en el sistema?");
        }, 1500);
    },
    toggle: function() {
        const chat = document.getElementById('simon-chat');
        if(chat.style.display === 'none') {
            chat.style.display = 'flex';
            chat.classList.remove('animate__fadeOutDown');
            chat.classList.add('animate__fadeInUp');
        } else {
            chat.classList.remove('animate__fadeInUp');
            chat.classList.add('animate__fadeOutDown');
            setTimeout(() => chat.style.display = 'none', 500);
        }
    },
    say: function(text) {
        const box = document.getElementById('simon-messages');
        if(!box) return;
        const div = document.createElement('div');
        div.className = "simon-msg bot animate__animated animate__fadeInLeft";
        div.innerHTML = text;
        box.appendChild(div);
        box.scrollTop = box.scrollHeight;
    },
    send: function() {
        const input = document.getElementById('simon-input');
        if(!input.value) return;
        const msg = input.value;
        input.value = "";
        const box = document.getElementById('simon-messages');
        const div = document.createElement('div');
        div.className = "simon-msg user";
        div.innerText = msg;
        box.appendChild(div);
        box.scrollTop = box.scrollHeight;
        setTimeout(() => this.process(msg.toLowerCase()), 600);
    },
    process: function(q) {
        if(q.includes("hola")) this.say("¡Hola! ¿Cómo puedo apoyarte hoy?");
        else if(q.includes("clave") || q.includes("contraseña")) this.say("Para cambiar tu clave, ve a Software > Cambio de Contraseñas.");
        else if(q.includes("cupo")) this.say("Las solicitudes de cupo se gestionan en el módulo Control de Estudios.");
        else this.say("Soy Simón y sigo aprendiendo. Prueba con palabras clave como 'clave', 'perfil' o 'cupo'.");
    },
    handleKey: function(e) { if(e.key === 'Enter') this.send(); }
};

/** MÓDULO PERFIL ESCUELA **/
const ModuloEscuela = {
    render: function() {
        document.getElementById('dashboard-view').style.display = 'none';
        const div = document.getElementById('dynamic-view');
        div.style.display = 'block';
        const d = App.schoolData;
        div.innerHTML = `
            <div class="p-4 animate__animated animate__fadeIn">
                <div class="card p-4 border-0 shadow-sm rounded-4 bg-white">
                    <h5 class="fw-bold mb-4 text-primary">Configuración Institucional</h5>
                    <div class="row g-3">
                        <div class="col-md-6"><label class="small fw-bold">Nombre</label><input type="text" id="esc-nom" class="form-control" value="${d.nombre||''}"></div>
                        <div class="col-md-3"><label class="small fw-bold">DEA</label><input type="text" id="esc-dea" class="form-control" value="${d.dea||''}"></div>
                        <div class="col-md-3"><label class="small fw-bold">RIF</label><input type="text" id="esc-rif" class="form-control" value="${d.rif||''}"></div>
                        <div class="col-12"><label class="small fw-bold">Dirección</label><input type="text" id="esc-dir" class="form-control" value="${d.direccion||''}"></div>
                        <div class="col-md-4"><label class="small fw-bold">Misión</label><textarea id="esc-mis" class="form-control" rows="4">${d.mision||''}</textarea></div>
                        <div class="col-md-4"><label class="small fw-bold">Visión</label><textarea id="esc-vis" class="form-control" rows="4">${d.vision||''}</textarea></div>
                        <div class="col-md-4"><label class="small fw-bold">Objetivo</label><textarea id="esc-obj" class="form-control" rows="4">${d.objetivo||''}</textarea></div>
                        <div class="col-12 text-end mt-4"><button onclick="ModuloEscuela.save()" class="btn btn-success px-5 rounded-pill shadow">Actualizar Portal</button></div>
                    </div>
                </div>
            </div>`;
    },
    save: function() {
        const data = { nombre: document.getElementById('esc-nom').value, dea: document.getElementById('esc-dea').value, rif: document.getElementById('esc-rif').value, direccion: document.getElementById('esc-dir').value, mision: document.getElementById('esc-mis').value, vision: document.getElementById('esc-vis').value, objetivo: document.getElementById('esc-obj').value };
        App.showLoader(); App.sendRequest({ action: "save_school_profile", data: data }, () => { App.loadAppData(); Swal.fire('Éxito', 'Fachada actualizada', 'success'); });
    }
};

/** MÓDULO ROLES **/
const ModuloSoftware = {
    renderRoles: function() {
        document.getElementById('dashboard-view').style.display = 'none';
        const div = document.getElementById('dynamic-view');
        div.style.display = 'block';
        let rolesHtml = "";
        for (let r in App.allRoles) {
            rolesHtml += `<div class="col-md-4 mb-3"><div class="card p-3 border-0 shadow-sm d-flex flex-row justify-content-between align-items-center rounded-4"><div><h6 class="fw-bold mb-0">${r}</h6><small class="text-muted">${App.allRoles[r].length} privilegios</small></div><div class="d-flex gap-2"><button onclick="ModuloSoftware.editRole('${r}')" class="btn btn-sm btn-light rounded-circle text-primary"><i class="bi bi-pencil"></i></button><button onclick="ModuloSoftware.deleteRole('${r}')" class="btn btn-sm btn-light rounded-circle text-danger"><i class="bi bi-trash"></i></button></div></div></div>`;
        }
        div.innerHTML = `<div class="p-4"><div class="d-flex justify-content-between align-items-center mb-4"><h5 class="fw-bold mb-0 text-primary">Gestión de Roles</h5><button onclick="ModuloSoftware.formRole()" class="btn btn-primary px-4 rounded-pill shadow">Nuevo Rol</button></div><div class="row">${rolesHtml}</div></div>`;
    },
    formRole: function(rolName = "", currentPerms = []) {
        let optionsHtml = "";
        systemStructure.forEach(cat => {
            optionsHtml += `<div class="col-12 mt-3 mb-2"><span class="badge bg-light text-dark border-0 shadow-sm p-2 px-3 rounded-pill">${cat.category}</span></div>`;
            cat.items.forEach(item => { optionsHtml += `<div class="col-md-6 mb-1"><div class="form-check"><input class="form-check-input role-check" type="checkbox" value="${item}" id="chk-${item}" ${currentPerms.includes(item) ? 'checked' : ''}><label class="form-check-label small" for="chk-${item}">${item}</label></div></div>`; });
        });
        Swal.fire({
            title: 'Configurar Privilegios', width: '850px',
            html: `<input type="text" id="role-name" class="form-control mb-4 rounded-pill px-4" placeholder="Nombre Rol" value="${rolName}" ${rolName ? 'disabled' : ''}><div class="row text-start" style="max-height: 400px; overflow-y: auto;">${optionsHtml}</div>`,
            showCancelButton: true, confirmButtonText: 'Guardar', confirmButtonColor: '#1e2b5e',
            preConfirm: () => {
                const name = document.getElementById('role-name').value;
                const checks = document.querySelectorAll('.role-check:checked');
                const permisos = Array.from(checks).map(c => c.value);
                if (!name || permisos.length === 0) { Swal.showValidationMessage('Complete los datos'); }
                return { nombre: name, permisos: permisos };
            }
        }).then((result) => { if (result.isConfirmed) { App.showLoader(); App.sendRequest({ action: "save_role", nombre: result.value.nombre, permisos: result.value.permisos }, () => { App.loadAppData(); }); } });
    },
    editRole: function(r) { this.formRole(r, App.allRoles[r]); },
    deleteRole: function(r) { Swal.fire({ title: '¿Eliminar Rol?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#F24444' }).then((res) => { if (res.isConfirmed) { App.showLoader(); App.sendRequest({ action: "delete_role", nombre: r }, () => { App.loadAppData(); }); } }); }
};

document.addEventListener("DOMContentLoaded", () => App.init());