/**
 * APLICACIÓN CORE - SIGAE v1.0 (CON RBAC Y DASHBOARDS DINÁMICOS)
 */

const ModulosSistema = {
    "Dirección y Sistema": {
        icono: "bi-bank", color: "#FF8D00", desc: "Gestión institucional, bienes y configuración.",
        items: [
            { vista: "Perfil de la Escuela", icono: "bi-building", roles: ["Directivo", "Administrador"] },
            { vista: "Configuración del Sistema", icono: "bi-sliders", roles: ["Directivo", "Administrador"] },
            { vista: "Administración Escolar", icono: "bi-briefcase", roles: ["Directivo", "Administrador", "RRHH"] },
            { vista: "Inventario y Bienes", icono: "bi-pc-display", roles: ["Directivo", "Administrador"] }
        ]
    },
    "Control de Estudios": {
        icono: "bi-folder-check", color: "#00C3FF", desc: "Matrículas, expedientes, notas y certificaciones.",
        items: [
            { vista: "Estudiantes", icono: "bi-mortarboard", roles: ["Directivo", "Administrador", "Docente", "Control de Estudios"] },
            { vista: "Representantes", icono: "bi-person-hearts", roles: ["Directivo", "Administrador", "Docente", "Control de Estudios"] },
            { vista: "Matrículas y Secciones", icono: "bi-people", roles: ["Directivo", "Administrador", "Control de Estudios"] },
            { vista: "Notas y Boletines", icono: "bi-file-earmark-text", roles: ["Directivo", "Administrador", "Docente", "Control de Estudios"] },
            { vista: "Títulos y Certificados", icono: "bi-patch-check", roles: ["Directivo", "Administrador", "Control de Estudios"] }
        ]
    },
    "Gestión Docente": {
        icono: "bi-person-workspace", color: "#00E676", desc: "Personal docente, horarios y formación.",
        items: [
            { vista: "Plantilla Docente", icono: "bi-person-vcard", roles: ["Directivo", "Administrador", "RRHH"] },
            { vista: "Horarios y Cargas", icono: "bi-calendar-week", roles: ["Directivo", "Administrador", "Docente", "RRHH"] },
            { vista: "Formación y Certificación", icono: "bi-award", roles: ["Directivo", "Administrador", "Docente"] }
        ]
    },
    "Área Pedagógica": {
        icono: "bi-book-half", color: "#8E24AA", desc: "Asignaturas, evaluaciones y planes de estudio.",
        items: [
            { vista: "Gestión Educativa", icono: "bi-journal-bookmark", roles: ["Directivo", "Docente", "Coordinador"] },
            { vista: "Gestión Académica", icono: "bi-journal-check", roles: ["Directivo", "Docente", "Coordinador"] },
            { vista: "Evaluación Educativa", icono: "bi-clipboard-data", roles: ["Directivo", "Docente", "Coordinador"] }
        ]
    },
    "Programas y Cultura": {
        icono: "bi-palette", color: "#E5007E", desc: "Recursos para el aprendizaje y actividades culturales.",
        items: [
            { vista: "Recursos C.R.A.", icono: "bi-bookshelf", roles: ["Directivo", "Docente", "Coordinador"] },
            { vista: "Proyectos G.C.R.P.", icono: "bi-lightbulb", roles: ["Directivo", "Docente", "Coordinador"] },
            { vista: "Cultura y Efemérides", icono: "bi-calendar-event", roles: ["Directivo", "Docente", "Coordinador"] }
        ]
    },
    "Servicios y Bienestar": {
        icono: "bi-heart-pulse", color: "#FF3D00", desc: "Salud, defensoría, transporte y alimentación.",
        items: [
            { vista: "Bienestar Estudiantil", icono: "bi-bandaid", roles: ["Directivo", "Docente", "Defensor"] },
            { vista: "Transporte Escolar", icono: "bi-bus-front", roles: ["Directivo", "Administrador", "Transporte"] },
            { vista: "Comedor P.A.E.", icono: "bi-cup-hot", roles: ["Directivo", "Administrador", "Coordinador"] }
        ]
    },
    "Comunicación y Ayuda": {
        icono: "bi-megaphone", color: "#1E88E5", desc: "Avisos, carteleras y soporte técnico.",
        items: [
            { vista: "Información y Comunicación", icono: "bi-info-circle", roles: ["ALL"] },
            { vista: "Ayuda y Soporte", icono: "bi-life-preserver", roles: ["ALL"] },
            { vista: "Créditos", icono: "bi-stars", roles: ["ALL"] }
        ]
    },
    "Seguridad y Usuarios": {
        icono: "bi-shield-lock", color: "#455A64", desc: "Privilegios, perfiles y auditoría del sistema.",
        items: [
            { vista: "Mi Perfil", icono: "bi-person-badge", roles: ["ALL"] },
            { vista: "Gestión de Usuarios", icono: "bi-people", roles: ["Directivo", "Administrador"] },
            { vista: "Roles y Privilegios", icono: "bi-key", roles: ["Directivo", "Administrador"] },
            { vista: "Bitácora y Respaldos", icono: "bi-database-down", roles: ["Directivo", "Administrador"] }
        ]
    }
};

const Aplicacion = {
    usuario: null,
    ModulosSistema: ModulosSistema,

    init: function() {
        const guardado = localStorage.getItem('sigae_usuario');
        if (guardado) {
            this.usuario = JSON.parse(guardado);
            this.prepararApp();
        } else {
            setTimeout(() => {
                document.getElementById('pantalla-carga').style.display = 'none';
                document.getElementById('vista-login').style.display = 'flex';
            }, 1000);
        }
    },

    peticion: function(payload, callback) {
        fetch(Configuracion.obtenerApiUrl(), { method: 'POST', body: JSON.stringify(payload) })
        .then(res => res.json())
        .then(data => callback(data))
        .catch(err => {
            console.error(err); this.ocultarCarga();
            Swal.fire('Error de Conexión', 'No se pudo contactar al servidor.', 'error');
        });
    },

    mostrarCarga: function() { document.getElementById('pantalla-carga').style.display = 'flex'; },
    ocultarCarga: function() { document.getElementById('pantalla-carga').style.display = 'none'; },

    verificarUsuario: function() {
        const c = document.getElementById('inputCedula').value;
        if(!c) return Swal.fire('Atención', 'Ingresa tu cédula', 'warning');
        this.mostrarCarga();
        this.peticion({ action: "verificar_usuario", cedula: c }, (res) => {
            if(res.found) {
                if(res.requiere_configuracion) {
                    document.getElementById('paso-cedula').style.display = 'none';
                    document.getElementById('pi-nombre').value = res.nombre; 
                    this.cargarPreguntasSeguridad(res.nombre);
                } else {
                    this.ocultarCarga(); document.getElementById('lbl-nombre-login').innerText = res.nombre;
                    document.getElementById('paso-cedula').style.display = 'none'; document.getElementById('paso-clave').style.display = 'block';
                }
            } else { this.ocultarCarga(); Swal.fire('No encontrado', 'Cédula no registrada.', 'error'); }
        });
    },

    cargarPreguntasSeguridad: function(nombreUsuario) {
        this.peticion({ action: "get_security_questions" }, (res) => {
            this.ocultarCarga();
            if(res.status === "success" && res.preguntas) {
                let opciones = '<option value="" disabled selected>-- Selecciona una pregunta --</option>';
                res.preguntas.forEach(p => { opciones += `<option value="${p}">${p}</option>`; });
                document.getElementById('pi-preg1').innerHTML = opciones; document.getElementById('pi-preg2').innerHTML = opciones;
                document.getElementById('paso-primer-ingreso').style.display = 'block';
                Swal.fire({toast: true, position: 'top-end', icon: 'info', title: '¡Hola ' + nombreUsuario + '! Configura tu cuenta.', showConfirmButton: false, timer: 3000});
            } else Swal.fire('Error', 'No se pudieron cargar las preguntas de seguridad.', 'error');
        });
    },

    iniciarSesion: function() {
        const c = document.getElementById('inputCedula').value, p = document.getElementById('inputClave').value;
        if (!p) return Swal.fire('Atención', 'Ingresa tu contraseña', 'warning');
        this.mostrarCarga();
        this.peticion({ action: "login", cedula: c, password: p }, (res) => {
            this.ocultarCarga();
            if(res.status === "success") { 
                this.usuario = res.user; this.usuario.token = res.token; 
                localStorage.setItem('sigae_usuario', JSON.stringify(this.usuario)); this.prepararApp(); 
            } 
            else if (res.status === "clave_vencida") Swal.fire('Clave Vencida', res.message, 'warning');
            else Swal.fire('Atención', res.message || 'Error de acceso', 'error');
        });
    },

    guardarPrimerIngreso: function() {
        const c = document.getElementById('inputCedula').value, nombre = document.getElementById('pi-nombre').value, email = document.getElementById('pi-email').value, telf = document.getElementById('pi-telefono').value, preg1 = document.getElementById('pi-preg1').value, resp1 = document.getElementById('pi-resp1').value, preg2 = document.getElementById('pi-preg2').value, resp2 = document.getElementById('pi-resp2').value, clave1 = document.getElementById('pi-clave1').value, clave2 = document.getElementById('pi-clave2').value;
        if(!email || !telf || !preg1 || !resp1 || !preg2 || !resp2 || !clave1 || !clave2) return Swal.fire('Campos vacíos', 'Por favor, completa todos los datos.', 'warning');
        if(clave1 !== clave2) return Swal.fire('Error', 'Las contraseñas no coinciden.', 'error');
        const regexClave = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#.])[A-Za-z\d@$!%*?&#.]{8,}$/;
        if(!regexClave.test(clave1)) return Swal.fire('Contraseña Débil', 'La clave debe tener mínimo 8 caracteres, 1 mayúscula, 1 número y 1 símbolo.', 'error');

        this.mostrarCarga();
        this.peticion({ action: "primer_ingreso", cedula: c, nombre: nombre, email: email, telefono: telf, preg_1: preg1, resp_1: resp1, preg_2: preg2, resp_2: resp2, nueva_clave: clave1 }, (res) => {
            this.ocultarCarga();
            if(res.status === "success") Swal.fire('¡Perfil Creado!', 'Tu cuenta está lista. Inicia sesión con tu nueva contraseña.', 'success').then(() => { location.reload(); });
            else Swal.fire('Error', res.message, 'error');
        });
    },

    accesoInvitado: function() { document.getElementById('paso-cedula').style.display = 'none'; document.getElementById('paso-invitado').style.display = 'block'; },
    
    enviarRegistroInvitado: function() {
        const nom = document.getElementById('inv-nombre').value, cor = document.getElementById('inv-correo').value, tel = document.getElementById('inv-telefono').value, mot = document.getElementById('inv-motivo').value;
        if(!nom || !cor || !tel || !mot) return Swal.fire('Atención', 'Llene todos los campos.', 'warning');
        this.mostrarCarga();
        this.peticion({ action: "registrar_invitado", nombre: nom, correo: cor, telefono: tel, motivo: mot }, (res) => {
            this.ocultarCarga();
            if(res.status === "success") {
                this.usuario = res.user; this.usuario.token = res.token; localStorage.setItem('sigae_usuario', JSON.stringify(this.usuario));
                Swal.fire({toast: true, position: 'top-end', icon: 'success', title: 'Acceso concedido', showConfirmButton: false, timer: 2000});
                setTimeout(() => this.prepararApp(), 1000);
            } else Swal.fire('Error', 'No se pudo registrar la visita.', 'error');
        });
    },
    
    cerrarSesion: function() {
        Swal.fire({ title: '¿Cerrar Sesión?', icon: 'question', showCancelButton: true, confirmButtonColor: '#FF3D00', confirmButtonText: 'Sí, salir' })
        .then((r) => { if (r.isConfirmed) { localStorage.clear(); location.reload(); } });
    },

    prepararApp: function() {
        document.getElementById('vista-login').style.display = 'none';
        document.getElementById('pantalla-carga').style.display = 'flex';
        
        setTimeout(() => {
            document.getElementById('pantalla-carga').style.display = 'none';
            document.getElementById('vista-app').style.display = 'block';
            document.getElementById('nombre-usuario-nav').innerText = this.usuario.nombre;
            document.getElementById('rol-usuario-nav').innerText = this.usuario.rol;
            
            this.dibujarMenuPrincipal();
            const ultimaVista = localStorage.getItem('sigae_ultima_vista') || 'Inicio';
            if(typeof Enrutador !== 'undefined') Enrutador.navegar(ultimaVista);
        }, 800);
    },

    dibujarMenuPrincipal: function() {
        const c = document.getElementById('contenedor-enlaces');
        let html = `
        <div class="px-4 mb-3">
            <button onclick="Enrutador.navegar('Inicio')" id="btn-menu-Inicio" class="btn-moderno btn-primario w-100 btn-inicio-sidebar text-start" style="padding: 12px; display:flex; align-items:center;">
                <i class="bi bi-house-door-fill me-3 fs-5"></i> <span class="texto-menu-ocultable fw-bold">Panel Principal</span>
            </button>
        </div>
        <div class="px-3">
            <div class="small text-muted fw-bold mb-2 px-3 texto-menu-ocultable" style="font-size:0.75rem; letter-spacing:1px;">MÓDULOS DEL SISTEMA</div>
        `;
        
        for (const [nombreCat, datos] of Object.entries(this.ModulosSistema)) {
            const idBtn = `btn-menu-${nombreCat.replace(/[\s/()]/g, '-')}`;
            html += `
            <a href="javascript:void(0)" onclick="Enrutador.navegar('${nombreCat}')" id="${idBtn}" class="menu-item d-flex align-items-center mb-1 rounded-3" style="padding: 12px 20px; text-decoration:none;">
                <i class="bi ${datos.icono} me-3 fs-5" style="color: ${datos.color};"></i>
                <span class="texto-menu-ocultable">${nombreCat}</span>
            </a>`;
        }
        
        c.innerHTML = html + `</div>`;
    },

    marcarMenuActivo: function(nombreVista) {
        document.querySelectorAll('.menu-item').forEach(el => {
            el.classList.remove('activo');
            el.style.background = 'transparent'; el.style.borderLeft = '4px solid transparent';
        });
        
        const btnInicio = document.getElementById('btn-menu-Inicio');
        if (btnInicio) btnInicio.classList.replace('btn-secundario', 'btn-primario');

        if (nombreVista === 'Inicio') return;
        
        if (btnInicio) {
            btnInicio.classList.replace('btn-primario', 'btn-secundario');
            btnInicio.style.background = 'transparent';
            btnInicio.style.color = 'var(--color-primario)';
            btnInicio.style.boxShadow = 'none';
            btnInicio.style.border = '2px solid var(--color-primario)';
        }

        let catPadre = nombreVista;
        for (const [padre, datos] of Object.entries(this.ModulosSistema)) {
            if (datos.items.some(i => i.vista === nombreVista)) { catPadre = padre; break; }
        }

        const itemActivo = document.getElementById(`btn-menu-${catPadre.replace(/[\s/()]/g, '-')}`);
        if (itemActivo) {
            itemActivo.classList.add('activo');
            itemActivo.style.background = 'rgba(0, 102, 255, 0.08)';
            itemActivo.style.borderLeft = '4px solid var(--color-primario)';
        }
    },

    tienePermiso: function(rolesPermitidos) {
        if(!this.usuario) return false;
        if(this.usuario.rol === "Directivo" || this.usuario.rol === "Administrador") return true; 
        if(rolesPermitidos.includes("ALL")) return true; 
        return rolesPermitidos.includes(this.usuario.rol);
    },

    generarDashboardModulo: function(nombreCategoria) {
        const modulo = this.ModulosSistema[nombreCategoria];
        if(!modulo) return "";

        let htmlTarjetas = '';
        
        modulo.items.forEach(item => {
            const acceso = this.tienePermiso(item.roles);
            const claseBorde = acceso ? 'border-primary border-bottom border-4 cursor-pointer hover-efecto' : 'border-secondary border-bottom border-4 bg-light';
            const onClickAttr = acceso ? `onclick="Enrutador.navegar('${item.vista}')"` : `onclick="Swal.fire('Acceso Denegado', 'Su rol no tiene permisos para este módulo.', 'error')"`;
            const opacityClass = acceso ? '' : 'opacity-75';

            htmlTarjetas += `
            <div class="col-md-6 col-xl-4 animate__animated animate__zoomIn">
                <div class="tarjeta-modulo p-4 h-100 shadow-sm bg-white ${claseBorde} ${opacityClass}" ${onClickAttr}>
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div class="bg-${acceso ? 'primary' : 'secondary'} bg-opacity-10 p-3 rounded-4 d-inline-flex">
                            <i class="bi ${item.icono} fs-2 text-${acceso ? 'primary' : 'secondary'}"></i>
                        </div>
                        ${!acceso ? '<i class="bi bi-lock-fill fs-4 text-danger" title="Módulo Bloqueado"></i>' : '<i class="bi bi-arrow-right-short fs-4 text-muted opacity-50"></i>'}
                    </div>
                    <h5 class="fw-bold text-dark mb-1">${item.vista}</h5>
                    <p class="small text-muted mb-0">${acceso ? 'Click para gestionar' : 'Requiere permisos nivel: ' + item.roles[0]}</p>
                </div>
            </div>`;
        });

        // NUEVO BANNER CON BURBUJAS Y LOGO BLANCO
        return `
        <div class="row mb-4 animate__animated animate__fadeInDown">
            <div class="col-12">
                <div class="banner-modulo p-4 p-md-5 text-white">
                    <div class="burbuja-3d burbuja-1"></div>
                    <div class="burbuja-3d burbuja-2"></div>
                    <div class="burbuja-3d burbuja-3"></div>
                    
                    <div class="row align-items-center position-relative z-1">
                        <div class="col-md-8 text-center text-md-start mb-4 mb-md-0">
                            <span class="badge bg-white text-primary mb-2 shadow-sm" style="font-weight: 800; letter-spacing: 1px;"><i class="bi ${modulo.icono} me-1"></i> CATEGORÍA</span>
                            <h2 class="fw-bolder mb-2 text-white" style="font-size: 2.2rem;">${nombreCategoria}</h2>
                            <p class="mb-0 text-white-50 fw-bold fs-5">${modulo.desc}</p>
                        </div>
                        <div class="col-md-4 text-center text-md-end">
                            <div class="fondo-logo-blanco">
                                <img src="assets/img/logo.png" alt="Logo" class="img-fluid logo-animado-banner" style="max-height: 100px;">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row g-4">${htmlTarjetas}</div>
        `;
    },

    alternarMenu: function() { document.body.classList.toggle('menu-colapsado'); },
    alternarMenuMovil: function() { document.body.classList.toggle('menu-abierto'); },

    alternarClave: function(idInput) {
        const input = document.getElementById(idInput); const icono = input.nextElementSibling.querySelector('i');
        if (input.type === 'password') { input.type = 'text'; icono.classList.replace('bi-eye', 'bi-eye-slash'); } 
        else { input.type = 'password'; icono.classList.replace('bi-eye-slash', 'bi-eye'); }
    }
};

document.addEventListener('DOMContentLoaded', () => { Aplicacion.init(); });