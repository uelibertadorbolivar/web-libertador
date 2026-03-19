window.ModulosSistema = {
    "Dirección y Sistema": { 
        icono: "bi-bank", color: "#FF8D00", desc: "Gestión institucional, calendario y configuración.", 
        items: [
            { vista: "Perfil de la Escuela", icono: "bi-building" }, 
            { vista: "Espacios Escolares", icono: "bi-door-open" },
            { vista: "Configuración del Sistema", icono: "bi-sliders" }, 
            { vista: "Calendario Escolar", icono: "bi-calendar-range" }
        ] 
    },
    "Organización Escolar": { 
        icono: "bi-diagram-3", color: "#e11d48", desc: "Cargos, organigrama, colectivos y estructura.", 
        items: [
            { vista: "Cargos Institucionales", icono: "bi-briefcase-fill" }, 
            { vista: "Cadena Supervisoria", icono: "bi-diagram-2" },
            { vista: "Gestión de Colectivos", icono: "bi-people-fill" },
            { vista: "Estructura Empresa", icono: "bi-buildings-fill" }
        ] 
    },
    "Control de Estudios": { 
        icono: "bi-folder-check", color: "#00C3FF", desc: "Estructura académica de la institución.", 
        items: [
            { vista: "Grados y Salones", icono: "bi-grid-3x3-gap-fill" }
        ] 
    },
    "Gestión Estudiantil": { 
        icono: "bi-mortarboard-fill", color: "#8B5CF6", desc: "Inscripciones, expedientes y actualización de datos.", 
        items: [
            { vista: "Matrículas", icono: "bi-person-plus-fill" },
            { vista: "Expediente Estudiantil", icono: "bi-person-vcard" },
            { vista: "Actualización de Datos", icono: "bi-arrow-repeat" },
            { vista: "Solicitud de Cupos", icono: "bi-envelope-paper-fill" },
            { vista: "Verificaciones", icono: "bi-shield-check" } 
        ] 
    },
    "Gestión Docente": { 
        icono: "bi-person-workspace", color: "#00E676", desc: "Administración del personal docente.", 
        items: [
            { vista: "Asignar Guiaturas", icono: "bi-person-video3" }
        ] 
    },
    "Servicios y Bienestar": { 
        icono: "bi-heart-pulse", color: "#FF3D00", desc: "Rutas y monitoreo de transporte escolar.", 
        items: [
            { vista: "Transporte Escolar", icono: "bi-bus-front" }
        ] 
    },
    "Seguridad y Accesos": { 
        icono: "bi-shield-lock", color: "#455A64", desc: "Usuarios, contraseñas y permisos del sistema.", 
        items: [
            { vista: "Mi Perfil", icono: "bi-person-badge" }, 
            { vista: "Gestión de Usuarios", icono: "bi-people" }, 
            { vista: "Roles y Privilegios", icono: "bi-key" }
        ] 
    }
};

window.Aplicacion = {
    usuario: null, 
    ModulosSistema: window.ModulosSistema, 
    momentoActual: null, 
    rolesDelSistema: [], 
    permisosActuales: {}, 
    tiempoInactividad: 30 * 60 * 1000, 
    tiempoAdvertencia: 60 * 1000, 
    temporizadorInactivo: null, 
    temporizadorCierre: null,
    diferenciaTiempoMs: 0,

    // ✨ CORRECCIÓN: El sistema AHORA ESPERA la hora de internet antes de arrancar ✨
    init: async function() { 
        await this.sincronizarRelojInternet(); 
        
        const guardado = localStorage.getItem('sigae_usuario'); 
        if (guardado) { 
            this.usuario = JSON.parse(guardado); 
            this.prepararApp(false); 
        } else { 
            setTimeout(() => { 
                document.getElementById('pantalla-carga').style.display = 'none'; 
                document.getElementById('vista-login').style.display = 'flex'; 
                let inputCedula = document.getElementById('inputCedula');
                if(inputCedula) inputCedula.addEventListener('keypress', function(e) { if (e.key === 'Enter') window.Aplicacion.verificarUsuario(); });
                let inputClave = document.getElementById('inputClave');
                if(inputClave) inputClave.addEventListener('keypress', function(e) { if (e.key === 'Enter') window.Aplicacion.iniciarSesion(); });
            }, 1000); 
        } 
    },

    // ✨ CORRECCIÓN: Función asíncrona segura con TimeAPI y Plan B (GitHub) ✨
    sincronizarRelojInternet: async function() {
        try {
            const r = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=America/Caracas', { cache: 'no-store' });
            const d = await r.json();
            const horaInternet = new Date(d.dateTime + "-04:00").getTime();
            this.diferenciaTiempoMs = horaInternet - new Date().getTime();
        } catch (e) {
            console.warn("TimeAPI falló, usando Plan B (Servidores de GitHub)...");
            try {
                const r2 = await fetch('https://api.github.com/', { method: 'HEAD', cache: 'no-store' });
                const fechaHeaders = r2.headers.get('Date');
                if (fechaHeaders) {
                    this.diferenciaTiempoMs = new Date(fechaHeaders).getTime() - new Date().getTime();
                } else {
                    this.diferenciaTiempoMs = 0; 
                }
            } catch (e2) {
                this.diferenciaTiempoMs = 0;
            }
        }
    },

    obtenerFechaReal: function() { return new Date(new Date().getTime() + this.diferenciaTiempoMs); },
    
    peticion: function(payload, callback) { 
        fetch(Configuracion.obtenerApiUrl(), { method: 'POST', body: JSON.stringify(payload) })
        .then(res => res.json())
        .then(data => { try { callback(data); } catch(e) {} })
        .catch(err => { this.ocultarCarga(); if(typeof Swal !== 'undefined') Swal.fire('Error', 'Falla de conexión al servidor.', 'error'); }); 
    },
    mostrarCarga: function() { const el = document.getElementById('pantalla-carga'); if(el) { el.style.opacity = '1'; el.style.display = 'flex'; } }, 
    ocultarCarga: function() { const el = document.getElementById('pantalla-carga'); if(el) el.style.display = 'none'; },
    
    prepararApp: function(esLoginNuevo = false) {
        if (!esLoginNuevo) {
            document.getElementById('vista-login').style.display = 'none'; 
            this.mostrarCarga();
        }

        this.peticion({ action: "get_current_moment" }, (resM) => {
            if(resM && resM.status === "success") {
                this.momentoActual = { anioEscolar: resM.anioEscolar, lapso: resM.faseActual };
                const elAnio = document.getElementById('global-anio-escolar'); const elLapso = document.getElementById('global-lapso-escolar');
                if(elAnio) elAnio.innerHTML = `<i class="bi bi-calendar3 me-1"></i> Año Escolar: ${this.momentoActual.anioEscolar}`;
                if(elLapso) { let claseColor = this.momentoActual.lapso.includes('Fuera') ? 'text-danger' : 'text-success'; elLapso.innerHTML = `<i class="bi bi-clock-history me-1"></i> Fase Actual: <span class="${claseColor}">${this.momentoActual.lapso}</span>`; }
            }
            this.peticion({ action: "get_roles" }, (resR) => {
                if(resR && resR.status === "success") {
                    this.rolesDelSistema = resR.roles;
                    let miRol = this.rolesDelSistema.find(r => r.nombre === this.usuario.rol);
                    this.permisosActuales = (miRol && miRol.permisos && !Array.isArray(miRol.permisos)) ? miRol.permisos : {};
                }
                
                this.ocultarCarga(); 
                
                if(this.usuario) { 
                    const navNombre = document.getElementById('nombre-usuario-nav'); const navRol = document.getElementById('rol-usuario-nav'); 
                    if(navNombre) navNombre.innerText = this.usuario.nombre; if(navRol) navRol.innerText = this.usuario.rol; 
                }
                
                this.dibujarMenuPrincipal(); 
                this.iniciarControlSesion();
                
                const ultimaVista = localStorage.getItem('sigae_ultima_vista') || 'Inicio'; 
                
                if (esLoginNuevo && typeof window.ejecutarTransicionDigital === 'function') {
                    window.ejecutarTransicionDigital(() => {
                        document.getElementById('vista-login').style.display = 'none';
                        document.getElementById('vista-app').style.display = 'block';
                        if(typeof Enrutador !== 'undefined') Enrutador.navegar(ultimaVista);
                    });
                } else {
                    document.getElementById('vista-login').style.display = 'none';
                    document.getElementById('vista-app').style.display = 'block';
                    if(typeof Enrutador !== 'undefined') Enrutador.navegar(ultimaVista);
                }
            });
        });
    },

    permiso: function(modulo, accion = 'ver') {
        if(!this.usuario) return false; let r = this.usuario.rol;
        if(modulo === "Mi Perfil" || r === "Administrador" || r === "Directivo") return true; 
        if(!this.permisosActuales || !this.permisosActuales[modulo]) return false;
        return this.permisosActuales[modulo][accion] === true;
    },
    verificarUsuario: function() { const c = document.getElementById('inputCedula').value; if(!c) return Swal.fire('Atención', 'Ingrese cédula.', 'warning'); this.mostrarCarga(); this.peticion({ action: "verificar_usuario", cedula: c }, (res) => { if(res && res.found) { if(res.requiere_configuracion) { document.getElementById('paso-cedula').style.display = 'none'; document.getElementById('pi-nombre').value = res.nombre; this.cargarPreguntasSeguridad(res.nombre); } else { this.ocultarCarga(); document.getElementById('lbl-nombre-login').innerText = res.nombre; document.getElementById('paso-cedula').style.display = 'none'; document.getElementById('paso-clave').style.display = 'block'; setTimeout(() => document.getElementById('inputClave').focus(), 100); } } else { this.ocultarCarga(); Swal.fire('No encontrado', 'Cédula no registrada.', 'error'); } }); },
    
    iniciarSesion: function() { 
        const c = document.getElementById('inputCedula').value; const p = document.getElementById('inputClave').value; 
        if (!p) return Swal.fire('Atención', 'Ingrese contraseña.', 'warning'); 
        this.mostrarCarga(); 
        this.peticion({ action: "login", cedula: c, password: p }, (res) => { 
            if(res && res.status === "success") { 
                this.usuario = res.user; this.usuario.token = res.token; 
                localStorage.setItem('sigae_usuario', JSON.stringify(this.usuario)); 
                this.prepararApp(true); 
            } else { 
                this.ocultarCarga();
                Swal.fire('Atención', res.message || 'Error.', 'error'); 
            } 
        }); 
    },
    
    iniciarRecuperacion: function() { const cedulaEntrada = document.getElementById('inputCedula').value; if(!cedulaEntrada) return Swal.fire('Error', 'Debe ingresar su cédula primero.', 'error'); this.mostrarCarga(); this.peticion({ action: "get_recovery_question", cedula: cedulaEntrada }, (res) => { this.ocultarCarga(); if(res && res.status === "success") { document.getElementById('paso-clave').style.display = 'none'; document.getElementById('lbl-pregunta-recuperacion').innerText = res.pregunta; this.preguntaRecuperacionActiva = res.num_preg; document.getElementById('rec-respuesta').value = ''; document.getElementById('rec-clave1').value = ''; document.getElementById('rec-clave2').value = ''; document.getElementById('paso-recuperacion').style.display = 'block'; } else { Swal.fire('Atención', res ? res.message : 'Error al recuperar.', 'warning'); } }); },
    cancelarRecuperacion: function() { document.getElementById('paso-recuperacion').style.display = 'none'; document.getElementById('paso-clave').style.display = 'block'; },
    procesarRecuperacion: function() { const cedulaUsuario = document.getElementById('inputCedula').value; const respuestaIngresada = document.getElementById('rec-respuesta').value; const claveNueva1 = document.getElementById('rec-clave1').value; const claveNueva2 = document.getElementById('rec-clave2').value; if(!respuestaIngresada || !claveNueva1 || !claveNueva2) return Swal.fire('Datos Incompletos', 'Complete su respuesta y contraseña.', 'warning'); if(claveNueva1 !== claveNueva2) return Swal.fire('Error', 'Las contraseñas no coinciden.', 'error'); if(!/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#.])[A-Za-z\d@$!%*?&#.]{8,}$/.test(claveNueva1)) return Swal.fire('Contraseña Débil', 'Mínimo 8 caracteres, 1 mayúscula, 1 número y 1 símbolo.', 'error'); this.mostrarCarga(); this.peticion({ action: "reset_forgotten_password", cedula: cedulaUsuario, num_preg: this.preguntaRecuperacionActiva, respuesta: respuestaIngresada, nueva_clave: claveNueva1 }, (res) => { this.ocultarCarga(); if(res && res.status === "success") { Swal.fire('¡Éxito!', res.message, 'success').then(() => { this.cancelarRecuperacion(); document.getElementById('inputClave').value = ''; }); } else { Swal.fire('Error', res ? res.message : 'Falla de servidor.', 'error'); } }); },
    accesoInvitado: function() { document.getElementById('paso-cedula').style.display = 'none'; document.getElementById('paso-invitado').style.display = 'block'; },
    
    enviarRegistroInvitado: function() { 
        const nombreInv = document.getElementById('inv-nombre').value; const correoInv = document.getElementById('inv-correo').value; const telefonoInv = document.getElementById('inv-telefono').value; const motivoInv = document.getElementById('inv-motivo').value; 
        if(!nombreInv || !correoInv || !telefonoInv || !motivoInv) return Swal.fire('Campos Incompletos', 'Debe llenar todos los datos.', 'warning'); 
        this.mostrarCarga(); 
        this.peticion({ action: "registrar_invitado", nombre: nombreInv, correo: correoInv, telefono: telefonoInv, motivo: motivoInv }, (res) => { 
            if(res && res.status === "success") { 
                this.usuario = res.user; this.usuario.token = res.token; 
                localStorage.setItem('sigae_usuario', JSON.stringify(this.usuario)); 
                this.prepararApp(true); 
            } else { 
                this.ocultarCarga();
                Swal.fire('Error', 'Falla en el registro.', 'error'); 
            } 
        }); 
    },
    
    cerrarSesion: function() { Swal.fire({ title: '¿Cerrar Sesión?', icon: 'question', showCancelButton: true, confirmButtonColor: '#FF3D00', confirmButtonText: 'Sí, salir', cancelButtonText: 'Cancelar' }).then((result) => { if (result.isConfirmed) { localStorage.clear(); location.reload(); } }); },
    iniciarControlSesion: function() { if(!localStorage.getItem('sigae_usuario')) return; const resetearTiempo = () => { if(typeof Swal !== 'undefined' && Swal.isVisible() && Swal.getTitle().textContent === '¿Sigues ahí?') return; clearTimeout(this.temporizadorInactivo); clearTimeout(this.temporizadorCierre); this.temporizadorInactivo = setTimeout(() => { this.mostrarAdvertenciaSesion(); }, this.tiempoInactividad); }; window.addEventListener('mousemove', resetearTiempo); window.addEventListener('keypress', resetearTiempo); window.addEventListener('click', resetearTiempo); window.addEventListener('scroll', resetearTiempo); resetearTiempo(); },
    mostrarAdvertenciaSesion: function() { Swal.fire({ title: '¿Sigues ahí?', text: 'Cerraremos la sesión en 1 minuto por inactividad.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#0066FF', cancelButtonColor: '#FF3D00', confirmButtonText: 'Seguir activo', cancelButtonText: 'Cerrar sesión', allowOutsideClick: false, allowEscapeKey: false }).then((result) => { clearTimeout(this.temporizadorCierre); if (result.isConfirmed) { this.iniciarControlSesion(); } else { this.cerrarSesionSilenciosa(); } }); this.temporizadorCierre = setTimeout(() => { this.cerrarSesionSilenciosa(); }, this.tiempoAdvertencia); },
    cerrarSesionSilenciosa: function() { localStorage.clear(); location.reload(); },
    dibujarMenuPrincipal: function() { const contenedorEnlaces = document.getElementById('contenedor-enlaces'); if(!contenedorEnlaces) return; let htmlMenu = `<div class="px-4 mb-3"><button onclick="Enrutador.navegar('Inicio')" id="btn-menu-Inicio" class="btn-moderno btn-primario w-100 btn-inicio-sidebar text-start" style="padding: 12px; display:flex; align-items:center;"><i class="bi bi-house-door-fill me-3 fs-5"></i> <span class="texto-menu-ocultable fw-bold">Panel Principal</span></button></div><div class="px-3"><div class="small text-muted fw-bold mb-2 px-3 texto-menu-ocultable" style="font-size:0.75rem; letter-spacing:1px;">MÓDULOS DEL SISTEMA</div>`; for (const [nombreCategoria, datosModulo] of Object.entries(this.ModulosSistema)) { const idBoton = `btn-menu-${nombreCategoria.replace(/[\s/()]/g, '-')}`; htmlMenu += `<a href="javascript:void(0)" onclick="Enrutador.navegar('${nombreCategoria}')" id="${idBoton}" class="menu-item d-flex align-items-center mb-1 rounded-3" style="padding: 12px 20px; text-decoration:none;"><i class="bi ${datosModulo.icono} me-3 fs-5" style="color: ${datosModulo.color};"></i><span class="texto-menu-ocultable">${nombreCategoria}</span></a>`; } htmlMenu += `</div>`; contenedorEnlaces.innerHTML = htmlMenu; },
    marcarMenuActivo: function(nombreVista) { document.querySelectorAll('.menu-item').forEach(el => { el.classList.remove('activo'); el.style.background = 'transparent'; el.style.borderLeft = '4px solid transparent'; }); const btnInicio = document.getElementById('btn-menu-Inicio'); if (btnInicio) { btnInicio.classList.replace('btn-secundario', 'btn-primario'); } if (nombreVista === 'Inicio') return; if (btnInicio) { btnInicio.classList.replace('btn-primario', 'btn-secundario'); btnInicio.style.background = 'transparent'; btnInicio.style.color = 'var(--color-primario)'; btnInicio.style.boxShadow = 'none'; btnInicio.style.border = '2px solid var(--color-primario)'; } let categoriaPadre = nombreVista; for (const [padre, datos] of Object.entries(this.ModulosSistema)) { if (datos.items.some(i => i.vista === nombreVista)) { categoriaPadre = padre; break; } } const itemActivo = document.getElementById(`btn-menu-${categoriaPadre.replace(/[\s/()]/g, '-')}`); if (itemActivo) { itemActivo.classList.add('activo'); itemActivo.style.background = 'rgba(0, 102, 255, 0.08)'; itemActivo.style.borderLeft = '4px solid var(--color-primario)'; } },
    generarDashboardModulo: function(nombreCategoria) { const modulo = this.ModulosSistema[nombreCategoria]; if(!modulo) return ""; let htmlTarjetas = ''; const estilos = `<style>.tarjeta-cat { background: #ffffff; border-radius: 20px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; overflow: hidden; position: relative; display: flex; flex-direction: column; }.tarjeta-cat:hover { transform: translateY(-8px); box-shadow: 0 15px 35px rgba(0,0,0,0.1) !important; }.tarjeta-cat .bg-icono-gigante { position: absolute; right: -20px; bottom: -20px; font-size: 8rem; opacity: 0.03; transition: transform 0.5s ease; }.tarjeta-cat:hover .bg-icono-gigante { transform: scale(1.2) rotate(-10deg); }.tarjeta-cat .icono-cat { width: 70px; height: 70px; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; margin-bottom: 1.5rem; transition: transform 0.3s ease; }.tarjeta-cat:hover .icono-cat { transform: scale(1.1); }.banner-padre { border-radius: 24px; position: relative; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); } @keyframes flotar-suave { 0% { transform: translateY(0) translateX(0) scale(1); } 33% { transform: translateY(-15px) translateX(10px) scale(1.02); } 66% { transform: translateY(10px) translateX(-10px) scale(0.98); } 100% { transform: translateY(0) translateX(0) scale(1); } } .burbuja-3d { position: absolute; border-radius: 50%; background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%); box-shadow: inset -15px -15px 30px rgba(0, 0, 0, 0.15), inset 15px 15px 30px rgba(255, 255, 255, 0.3), 0 15px 35px rgba(0, 0, 0, 0.1); backdrop-filter: blur(4px); border: 1px solid rgba(255, 255, 255, 0.15); pointer-events: none; } .burbuja-1 { width: 300px; height: 300px; top: -100px; right: -50px; animation: flotar-suave 8s infinite ease-in-out; } .burbuja-2 { width: 200px; height: 200px; bottom: -50px; right: 150px; animation: flotar-suave 12s infinite ease-in-out reverse; } .burbuja-3 { width: 150px; height: 150px; top: 50px; left: 15%; animation: flotar-suave 10s infinite ease-in-out 1s; }</style>`; const paleta = [ { bg: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)', border: '#bfdbfe', text: '#0066FF' }, { bg: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)', border: '#bbf7d0', text: '#198754' }, { bg: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)', border: '#fde68a', text: '#d97706' }, { bg: 'linear-gradient(135deg, #ffffff 0%, #ecfeff 100%)', border: '#a5f3fc', text: '#0dcaf0' }, { bg: 'linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%)', border: '#ddd6fe', text: '#6d28d9' }, { bg: 'linear-gradient(135deg, #ffffff 0%, #fff1f2 100%)', border: '#fecdd3', text: '#e11d48' } ]; modulo.items.forEach((item, index) => { const tieneAcceso = this.permiso(item.vista, 'ver'); const color = paleta[index % paleta.length]; if(tieneAcceso) { htmlTarjetas += `<div class="col-12 col-md-6 col-xl-4 animate__animated animate__fadeInUp" style="animation-delay: ${index * 0.1}s"><div class="tarjeta-cat p-4 h-100 shadow-sm" style="background: ${color.bg}; border: 1px solid ${color.border};" onclick="Enrutador.navegar('${item.vista}')"><i class="bi ${item.icono} text-dark bg-icono-gigante"></i><div class="icono-cat shadow-sm" style="color: ${color.text}; background: white; border: 1px solid ${color.border};"><i class="bi ${item.icono}"></i></div><h4 class="fw-bold text-dark mb-2" style="position: relative; z-index: 2;">${item.vista}</h4><div class="mt-auto pt-3 d-flex align-items-center fw-bold" style="color: ${color.text}; font-size: 0.9rem; position: relative; z-index: 2;">Entrar al submódulo <i class="bi bi-arrow-right ms-2 transition-transform"></i></div></div></div>`; } else { htmlTarjetas += `<div class="col-12 col-md-6 col-xl-4 animate__animated animate__fadeInUp" style="animation-delay: ${index * 0.1}s"><div class="tarjeta-cat p-4 h-100 shadow-sm bg-light opacity-75" style="border: 1px solid #e2e8f0; cursor: not-allowed;" onclick="Swal.fire('Acceso Denegado', 'Su rol no tiene permisos para este submódulo.', 'error')"><i class="bi ${item.icono} text-muted bg-icono-gigante"></i><div class="icono-cat bg-secondary bg-opacity-10 text-secondary border-0"><i class="bi bi-lock-fill"></i></div><h4 class="fw-bold text-muted mb-2" style="position: relative; z-index: 2;">${item.vista}</h4><div class="mt-auto pt-3 d-flex align-items-center fw-bold text-danger" style="font-size: 0.9rem; position: relative; z-index: 2;"><i class="bi bi-shield-lock-fill me-2"></i> Acceso Restringido</div></div></div>`; } }); return `${estilos}<div class="row mb-5 animate__animated animate__fadeInDown"><div class="col-12"><div class="banner-padre p-4 p-md-5 text-white" style="background: linear-gradient(135deg, ${modulo.color} 0%, rgba(0,0,0,0.4) 150%);"><div class="burbuja-3d burbuja-1"></div><div class="burbuja-3d burbuja-2"></div><div class="burbuja-3d burbuja-3"></div><div class="row align-items-center position-relative z-1"><div class="col-md-9 text-center text-md-start mb-3 mb-md-0"><span class="badge bg-white shadow-sm mb-3 px-3 py-2 fw-bold" style="color: ${modulo.color}; letter-spacing: 1px; font-size: 0.85rem;"><i class="bi ${modulo.icono} me-1"></i> CATEGORÍA DEL SISTEMA</span><h1 class="fw-bolder mb-2 text-white" style="font-size: 2.8rem; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">${nombreCategoria}</h1><p class="mb-0 fw-bold fs-5" style="color: rgba(255,255,255,0.9);">${modulo.desc}</p></div><div class="col-md-3 text-center text-md-end d-none d-md-block"><img src="assets/img/logo.png" alt="Logo Escuela" style="max-height: 130px; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.3));"></div></div></div></div></div><div class="row g-4">${htmlTarjetas}</div>`; },
    alternarMenu: function() { document.body.classList.toggle('menu-colapsado'); }, 
    alternarMenuMovil: function() { document.body.classList.toggle('menu-abierto'); },
    alternarClave: function(idInput) { const input = document.getElementById(idInput); const icono = input.nextElementSibling.querySelector('i'); if (input.type === 'password') { input.type = 'text'; icono.classList.replace('bi-eye', 'bi-eye-slash'); } else { input.type = 'password'; icono.classList.replace('bi-eye-slash', 'bi-eye'); } }
};

document.addEventListener('DOMContentLoaded', () => { if(window.Aplicacion) window.Aplicacion.init(); });