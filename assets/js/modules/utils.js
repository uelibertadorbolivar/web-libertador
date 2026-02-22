/**
 * MÓDULO DE UTILIDADES
 * Gestión de perfil personal, accesibilidad y ayuda.
 */

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