/**
 * SIGAE - CORE UE LIBERTADOR BOLÍVAR
 */

const systemStructure = [
    {
        category: "Escuela", icon: "bi-building", color: "#FFB81D",
        items: ["Perfil de la Escuela", "Fases y Periodos", "Niveles Educativos", "Escalas de Evaluación", "Cargos", "Organigrama", "PEIC", "Grado / Año", "Secciones"]
    },
    {
        category: "Docentes", icon: "bi-person-badge-fill", color: "#56B458",
        items: ["Agregar Docentes", "Asignar Cargos", "Tipos de Ausencias", "Registrar Ausencias", "Expediente Docente", "Condición Salud", "Reporte Gestión Diaria", "Planes de Evaluación"]
    },
    {
        category: "Estudiantes", icon: "bi-people-fill", color: "#5D86E6",
        items: ["Agregar Estudiante (Nuevo)", "Agregar Estudiante (Regular)", "Asignar Cargos Est.", "Tipos de Ausencias Est.", "Registrar Ausencias Est.", "Expediente Estudiante", "Condición Salud Est.", "Voceros Estudiantiles"]
    },
    {
        category: "Representantes", icon: "bi-person-heart", color: "#F24444",
        items: ["Solicitudes y Trámites", "Actualización de Datos", "Inscripciones Nuevos Ingresos", "Ver Boleta", "Ver Corte de Calificaciones"]
    },
    {
        category: "Administrativo", icon: "bi-clipboard-check-fill", color: "#8D24AA",
        items: ["Accidentes Docentes", "Accidentes Estudiantes", "Reporte Asistencias", "Incidentes y Requerimientos", "Gestión Diaria Revisada", "Gestión Mensual", "Requerimientos Anuales", "Registros de Espacios", "Asignación de Espacios", "Colectivos Docentes", "Asignación de Colectivos", "Crear Salones", "Estadísticas"]
    },
    {
        category: "Transporte Escolar", icon: "bi-bus-front-fill", color: "#FFB81D",
        items: ["Agregar Rutas", "Agregar Paradas", "Asignación Recorridos", "Registro Asistencia", "Incidentes Estudiantes", "Incidentes Servicio"]
    },
    {
        category: "Pedagogía", icon: "bi-journal-bookmark-fill", color: "#56B458",
        items: ["Agregar PA", "Perfil Aula", "Calendario Escolar"]
    },
    {
        category: "Control de Estudios", icon: "bi-shield-lock-fill", color: "#8D24AA",
        items: ["Solicitud de Cupos", "Carnet Estudiantil", "Calificaciones", "Matrículas", "Boletas", "Retiros", "Notas Certificadas", "Certificación Títulos", "Constancias de Estudio", "Sábanas y Resúmenes"]
    },
    {
        category: "C.R.A.", icon: "bi-book-fill", color: "#5D86E6",
        items: ["Ubicaciones CRA", "Recursos Educativos", "Prestamos CRA"]
    },
    {
        category: "Formaciones", icon: "bi-patch-check-fill", color: "#56B458",
        items: ["Planificación Formación", "Recursos Formación", "Certificados"]
    },
    {
        category: "Software", icon: "bi-gear-wide-connected", color: "#F24444",
        items: ["Gestión de Usuarios", "Roles y Privilegios", "Cambio de Contraseñas"]
    }
];

const App = {
    user: null, schoolData: null, allRoles: {},

    init: function() { this.checkSession(); },

    showLoader: function() { document.getElementById('main-loader').style.display = 'flex'; },
    hideLoader: function() { document.getElementById('main-loader').style.display = 'none'; },

    checkSession: function() {
        const stored = localStorage.getItem('schoolUser');
        if (stored) { this.user = JSON.parse(stored); this.loadAppData(); }
        else { document.getElementById('login-screen').style.display = 'flex'; }
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

    modalInvitado: async function() {
        const { value: nombre } = await Swal.fire({
            title: 'Acceso de Invitado',
            input: 'text', inputLabel: 'Nombre del Visitante',
            confirmButtonText: 'Ingresar', confirmButtonColor: '#5D86E6'
        });
        if (nombre) {
            this.user = { name: nombre, role: "Visitante" };
            this.allRoles["Visitante"] = ["Solicitud de Cupos"];
            localStorage.setItem('schoolUser', JSON.stringify(this.user));
            this.loadAppData();
        }
    },

    verificarUsuario: function() {
        const ced = document.getElementById('inputCedula').value;
        if(!ced) return;
        this.showLoader();
        App.sendRequest({ action: "verificar_usuario", cedula: ced }, (res) => {
            this.hideLoader();
            if(res.found) {
                document.getElementById('step-cedula').style.display = 'none';
                document.getElementById('lbl-nombre-login').innerText = res.nombre;
                document.getElementById('step-login').style.display = 'block';
                this.tempCedula = ced;
            } else { Swal.fire('Error', 'No registrado', 'error'); }
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
            } else { Swal.fire('Error', 'Clave incorrecta', 'error'); }
        });
    },

    showApp: function() {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app-wrapper').style.display = 'flex';
        document.getElementById('user-display-name').innerText = this.user.name;
        document.querySelector('.avatar-circle').innerText = this.user.name.charAt(0).toUpperCase();
        this.renderMenu();
        this.showDashboard();
    },

    renderMenu: function() {
        const container = document.getElementById('sidebar-menu');
        const userPerms = (this.user.role === 'Administrador' || this.user.role === 'Director') 
                          ? "all" : (this.allRoles[this.user.role] || []);
        let html = "";
        systemStructure.forEach((cat, index) => {
            const allowedItems = cat.items.filter(item => userPerms === "all" || userPerms.includes(item));
            if (allowedItems.length > 0) {
                const id = `m-${index}`;
                html += `
                <div class="accordion-item bg-transparent border-0">
                    <button class="nav-category-btn collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${id}">
                        <span><i class="bi ${cat.icon} me-2" style="color:${cat.color}"></i> ${cat.category}</span>
                        <i class="bi bi-chevron-down small"></i>
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
        document.getElementById('dynamic-view').style.display = 'none';
        const dash = document.getElementById('dashboard-view');
        dash.style.display = 'block';
        document.getElementById('page-title').innerText = "Panel de Control Principal";
        const res = this.schoolData;
        dash.innerHTML = `
            <div class="p-4 animate__animated animate__fadeIn">
                <div class="row g-4">
                    <div class="col-12">
                        <div class="card border-0 shadow-sm p-4 rounded-4 bg-white" style="border-left: 6px solid #FFB81D;">
                            <h3 class="fw-bold mb-1">${res.nombre || 'UE Libertador Bolívar'}</h3>
                            <p class="small text-muted mb-0"><i class="bi bi-geo-alt-fill me-1"></i> ${res.direccion || 'Ubicación no establecida'}</p>
                        </div>
                    </div>
                    <div class="col-md-4"><div class="card border-0 shadow-sm p-4 h-100 rounded-4 bg-white"><h6 class="fw-bold text-primary">Misión</h6><p class="small text-muted">${res.mision || 'No definida'}</p></div></div>
                    <div class="col-md-4"><div class="card border-0 shadow-sm p-4 h-100 rounded-4 bg-white"><h6 class="fw-bold text-success">Visión</h6><p class="small text-muted">${res.vision || 'No definida'}</p></div></div>
                    <div class="col-md-4"><div class="card border-0 shadow-sm p-4 h-100 rounded-4 bg-white"><h6 class="fw-bold text-warning">Objetivo</h6><p class="small text-muted">${res.objetivo || 'No definido'}</p></div></div>
                </div>
            </div>`;
    },

    renderView: function(id, title) {
        if(id === 'Perfil de la Escuela') { ModuloEscuela.render(); return; }
        if(id === 'Roles y Privilegios') { ModuloSoftware.renderRoles(); return; }
        document.getElementById('dashboard-view').style.display = 'none';
        const div = document.getElementById('dynamic-view');
        div.style.display = 'block';
        document.getElementById('page-title').innerText = title;
        div.innerHTML = `<div class="p-5 text-center text-muted">Módulo <b>${title}</b> en construcción.</div>`;
    },

    sendRequest: function(data, callback) {
        fetch(AppConfig.getApiUrl(), { method: "POST", body: JSON.stringify(data) })
        .then(r => r.json()).then(res => callback(res)).catch(e => console.error(e));
    },

    logout: function() { localStorage.removeItem('schoolUser'); location.reload(); }
};

/** MÓDULO: PERFIL ESCUELA (FILA ÚNICA) **/
const ModuloEscuela = {
    render: function() {
        document.getElementById('dashboard-view').style.display = 'none';
        const div = document.getElementById('dynamic-view');
        div.style.display = 'block';
        const d = App.schoolData;
        div.innerHTML = `
            <div class="p-4 animate__animated animate__fadeIn">
                <div class="card border-0 shadow-sm p-4 rounded-4 bg-white">
                    <h5 class="fw-bold mb-4">Información Institucional UE Libertador Bolívar</h5>
                    <div class="row g-3">
                        <div class="col-md-6"><label class="small fw-bold">Nombre</label><input type="text" id="esc-nom" class="form-control" value="${d.nombre||''}"></div>
                        <div class="col-md-3"><label class="small fw-bold">DEA</label><input type="text" id="esc-dea" class="form-control" value="${d.dea||''}"></div>
                        <div class="col-md-3"><label class="small fw-bold">RIF</label><input type="text" id="esc-rif" class="form-control" value="${d.rif||''}"></div>
                        <div class="col-12"><label class="small fw-bold">Dirección</label><input type="text" id="esc-dir" class="form-control" value="${d.direccion||''}"></div>
                        <div class="col-md-4"><label class="small fw-bold">Misión</label><textarea id="esc-mis" class="form-control" rows="4">${d.mision||''}</textarea></div>
                        <div class="col-md-4"><label class="small fw-bold">Visión</label><textarea id="esc-vis" class="form-control" rows="4">${d.vision||''}</textarea></div>
                        <div class="col-md-4"><label class="small fw-bold">Objetivo</label><textarea id="esc-obj" class="form-control" rows="4">${d.objetivo||''}</textarea></div>
                        <div class="col-12 text-end mt-4"><button onclick="ModuloEscuela.save()" class="btn btn-success px-5 rounded-pill shadow">Actualizar Información</button></div>
                    </div>
                </div>
            </div>`;
    },
    save: function() {
        const data = {
            nombre: document.getElementById('esc-nom').value, dea: document.getElementById('esc-dea').value,
            rif: document.getElementById('esc-rif').value, direccion: document.getElementById('esc-dir').value,
            mision: document.getElementById('esc-mis').value, vision: document.getElementById('esc-vis').value,
            objetivo: document.getElementById('esc-obj').value
        };
        App.showLoader();
        App.sendRequest({ action: "save_school_profile", data: data }, () => {
            App.loadAppData();
            Swal.fire('Éxito', 'Información Institucional Actualizada', 'success');
        });
    }
};

/** MÓDULO: ROLES Y PRIVILEGIOS DETALLADOS **/
const ModuloSoftware = {
    renderRoles: function() {
        document.getElementById('dashboard-view').style.display = 'none';
        const div = document.getElementById('dynamic-view');
        div.style.display = 'block';
        let rolesHtml = "";
        for (let r in App.allRoles) {
            rolesHtml += `
                <div class="col-md-4 mb-3">
                    <div class="card border-0 shadow-sm p-3 rounded-4 bg-white d-flex flex-row justify-content-between align-items-center">
                        <div><h6 class="fw-bold mb-0">${r}</h6><small class="text-muted">${App.allRoles[r].length} permisos</small></div>
                        <div class="d-flex gap-2">
                            <button onclick="ModuloSoftware.editRole('${r}')" class="btn btn-sm btn-light rounded-circle text-primary shadow-sm"><i class="bi bi-pencil"></i></button>
                            <button onclick="ModuloSoftware.deleteRole('${r}')" class="btn btn-sm btn-light rounded-circle text-danger shadow-sm"><i class="bi bi-trash"></i></button>
                        </div>
                    </div>
                </div>`;
        }
        div.innerHTML = `
            <div class="p-4 animate__animated animate__fadeIn">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h5 class="fw-bold mb-0">Gestión de Roles y Privilegios</h5>
                    <button onclick="ModuloSoftware.formRole()" class="btn btn-primary rounded-pill px-4 btn-sm shadow">Crear Nuevo Rol</button>
                </div>
                <div class="row">${rolesHtml}</div>
            </div>`;
    },

    formRole: function(rolName = "", currentPerms = []) {
        let optionsHtml = "";
        systemStructure.forEach(cat => {
            optionsHtml += `<div class="col-12 mt-3 mb-2"><span class="badge bg-light text-dark border">${cat.category}</span></div>`;
            cat.items.forEach(item => {
                optionsHtml += `
                    <div class="col-md-6 mb-1">
                        <div class="form-check">
                            <input class="form-check-input role-check" type="checkbox" value="${item}" id="chk-${item}" ${currentPerms.includes(item) ? 'checked' : ''}>
                            <label class="form-check-label small" for="chk-${item}">${item}</label>
                        </div>
                    </div>`;
            });
        });

        Swal.fire({
            title: 'Configurar Privilegios Detallados', width: '850px',
            html: `
                <input type="text" id="role-name" class="form-control mb-4" placeholder="Nombre del Rol" value="${rolName}" ${rolName ? 'disabled' : ''}>
                <div class="row text-start" style="max-height: 400px; overflow-y: auto;">${optionsHtml}</div>`,
            showCancelButton: true, confirmButtonText: 'Guardar Privilegios',
            preConfirm: () => {
                const name = document.getElementById('role-name').value;
                const checks = document.querySelectorAll('.role-check:checked');
                const permisos = Array.from(checks).map(c => c.value);
                if (!name || permisos.length === 0) { Swal.showValidationMessage('Complete los datos'); }
                return { nombre: name, permisos: permisos };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                App.showLoader();
                App.sendRequest({ action: "save_role", nombre: result.value.nombre, permisos: result.value.permisos }, () => {
                    App.loadAppData();
                    Swal.fire('Éxito', 'Rol actualizado', 'success');
                });
            }
        });
    },

    editRole: function(r) { this.formRole(r, App.allRoles[r]); },

    deleteRole: function(r) {
        Swal.fire({
            title: '¿Eliminar Rol?', text: "Se borrarán sus privilegios permanentemente.",
            icon: 'warning', showCancelButton: true, confirmButtonColor: '#F24444'
        }).then((res) => {
            if (res.isConfirmed) {
                App.showLoader();
                App.sendRequest({ action: "delete_role", nombre: r }, () => {
                    App.loadAppData();
                });
            }
        });
    }
};

document.addEventListener("DOMContentLoaded", () => App.init());