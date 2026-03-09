/**
 * APLICACIÓN CORE - SIGAE v1.0
 * BLINDADO: Prevención de errores de sintaxis y variables globales
 */

window.ModulosSistema = {
    "Dirección y Sistema": { 
        icono: "bi-bank", color: "#FF8D00", desc: "Gestión institucional, bienes y configuración.", 
        items: [
            { vista: "Perfil de la Escuela", icono: "bi-building", roles: ["Directivo", "Administrador"] }, 
            { vista: "Configuración del Sistema", icono: "bi-sliders", roles: ["Directivo", "Administrador"] }, 
            { vista: "Calendario Escolar", icono: "bi-calendar-range", roles: ["Directivo", "Administrador", "Coordinador"] }, 
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
            { vista: "Cargos Institucionales", icono: "bi-diagram-3-fill", roles: ["Directivo", "Administrador", "RRHH"] }, 
            
            // EL NUEVO MÓDULO DE JERARQUÍAS
            { vista: "Cadena Supervisoria", icono: "bi-diagram-2", roles: ["Directivo", "Administrador", "RRHH"] }, 
            
            { vista: "Bitácora y Respaldos", icono: "bi-database-down", roles: ["Directivo", "Administrador"] }
        ] 
    }
};

window.Aplicacion = {
    usuario: null, ModulosSistema: window.ModulosSistema, preguntaRecuperacionActiva: null, momentoActual: null,
    tiempoInactividad: 30 * 60 * 1000, tiempoAdvertencia: 60 * 1000, temporizadorInactivo: null, temporizadorCierre: null,

    init: function() { 
        const guardado = localStorage.getItem('sigae_usuario'); 
        if (guardado) { this.usuario = JSON.parse(guardado); this.prepararApp(); } 
        else { setTimeout(() => { document.getElementById('pantalla-carga').style.display = 'none'; document.getElementById('vista-login').style.display = 'flex'; }, 1000); } 
    },

    peticion: function(payload, callback) { 
        fetch(Configuracion.obtenerApiUrl(), { method: 'POST', body: JSON.stringify(payload) })
        .then(res => res.json()).then(data => callback(data))
        .catch(err => { console.error("Error en petición:", err); this.ocultarCarga(); if(typeof Swal !== 'undefined') { Swal.fire('Error de Conexión', 'No se pudo contactar al servidor. Verifique su internet.', 'error'); } }); 
    },

    mostrarCarga: function() { const el = document.getElementById('pantalla-carga'); if(el) el.style.display = 'flex'; }, 
    ocultarCarga: function() { const el = document.getElementById('pantalla-carga'); if(el) el.style.display = 'none'; },

    prepararApp: function() {
        document.getElementById('vista-login').style.display = 'none'; this.mostrarCarga();
        this.peticion({ action: "get_current_moment" }, (res) => {
            if(res && res.status === "success") {
                this.momentoActual = { anioEscolar: res.anioEscolar, lapso: res.faseActual };
                const elAnio = document.getElementById('global-anio-escolar'); const elLapso = document.getElementById('global-lapso-escolar');
                if(elAnio) elAnio.innerHTML = `<i class="bi bi-calendar3 me-1"></i> Año Escolar: ${this.momentoActual.anioEscolar}`;
                if(elLapso) { let claseColor = this.momentoActual.lapso.includes('Fuera') ? 'text-danger' : 'text-success'; elLapso.innerHTML = `<i class="bi bi-clock-history me-1"></i> Fase Actual: <span class="${claseColor}">${this.momentoActual.lapso}</span>`; }
            }
            this.ocultarCarga(); document.getElementById('vista-app').style.display = 'block'; 
            if(this.usuario) {
                const navNombre = document.getElementById('nombre-usuario-nav'); const navRol = document.getElementById('rol-usuario-nav');
                if(navNombre) navNombre.innerText = this.usuario.nombre; if(navRol) navRol.innerText = this.usuario.rol;
            }
            this.dibujarMenuPrincipal(); this.iniciarControlSesion();
            const ultimaVista = localStorage.getItem('sigae_ultima_vista') || 'Inicio'; 
            if(typeof Enrutador !== 'undefined') Enrutador.navegar(ultimaVista);
        });
    },

    verificarUsuario: function() { 
        const cedulaEntrada = document.getElementById('inputCedula').value; 
        if(!cedulaEntrada) return Swal.fire('Atención', 'Debe ingresar su número de cédula.', 'warning'); 
        this.mostrarCarga(); 
        this.peticion({ action: "verificar_usuario", cedula: cedulaEntrada }, (res) => { 
            if(res && res.found) { 
                if(res.requiere_configuracion) { document.getElementById('paso-cedula').style.display = 'none'; document.getElementById('pi-nombre').value = res.nombre; this.cargarPreguntasSeguridad(res.nombre); } 
                else { this.ocultarCarga(); document.getElementById('lbl-nombre-login').innerText = res.nombre; document.getElementById('paso-cedula').style.display = 'none'; document.getElementById('paso-clave').style.display = 'block'; } 
            } else { this.ocultarCarga(); Swal.fire('No encontrado', 'Cédula no registrada en el sistema.', 'error'); } 
        }); 
    },

    cargarPreguntasSeguridad: function(nombreUsuario) { 
        this.peticion({ action: "get_security_questions" }, (res) => { 
            this.ocultarCarga(); 
            if(res && res.status === "success" && res.preguntas) { 
                let opcionesHTML = '<option value="" disabled selected>-- Seleccione una pregunta --</option>'; 
                res.preguntas.forEach(pregunta => { opcionesHTML += `<option value="${pregunta}">${pregunta}</option>`; }); 
                document.getElementById('pi-preg1').innerHTML = opcionesHTML; document.getElementById('pi-preg2').innerHTML = opcionesHTML; document.getElementById('paso-primer-ingreso').style.display = 'block'; 
                Swal.fire({ toast: true, position: 'top-end', icon: 'info', title: `¡Hola ${nombreUsuario}! Por favor configura tu cuenta.`, showConfirmButton: false, timer: 4000 }); 
            } else { Swal.fire('Error', 'Falla de conexión al cargar preguntas de seguridad.', 'error'); }
        }); 
    },

    iniciarSesion: function() { 
        const cedulaEntrada = document.getElementById('inputCedula').value; const claveEntrada = document.getElementById('inputClave').value; 
        if (!claveEntrada) return Swal.fire('Atención', 'Debe ingresar su contraseña.', 'warning'); 
        this.mostrarCarga(); 
        this.peticion({ action: "login", cedula: cedulaEntrada, password: claveEntrada }, (res) => { 
            this.ocultarCarga(); 
            if(res && res.status === "success") { this.usuario = res.user; this.usuario.token = res.token; localStorage.setItem('sigae_usuario', JSON.stringify(this.usuario)); this.prepararApp(); } 
            else if (res && res.status === "clave_vencida") { Swal.fire('Clave Vencida', res.message, 'warning'); } 
            else { Swal.fire('Atención', (res && res.message) ? res.message : 'Error de acceso al sistema.', 'error'); }
        }); 
    },

    iniciarRecuperacion: function() { 
        const cedulaEntrada = document.getElementById('inputCedula').value; 
        if(!cedulaEntrada) return Swal.fire('Error', 'Debe ingresar su cédula en el paso anterior.', 'error'); 
        this.mostrarCarga(); 
        this.peticion({ action: "get_recovery_question", cedula: cedulaEntrada }, (res) => { 
            this.ocultarCarga(); 
            if(res && res.status === "success") { 
                document.getElementById('paso-clave').style.display = 'none'; document.getElementById('lbl-pregunta-recuperacion').innerText = res.pregunta; this.preguntaRecuperacionActiva = res.num_preg; 
                document.getElementById('rec-respuesta').value = ''; document.getElementById('rec-clave1').value = ''; document.getElementById('rec-clave2').value = ''; document.getElementById('paso-recuperacion').style.display = 'block'; 
            } else { Swal.fire('Atención', res ? res.message : 'Error al recuperar.', 'warning'); }
        }); 
    },

    cancelarRecuperacion: function() { document.getElementById('paso-recuperacion').style.display = 'none'; document.getElementById('paso-clave').style.display = 'block'; },

    procesarRecuperacion: function() { 
        const cedulaUsuario = document.getElementById('inputCedula').value; const respuestaIngresada = document.getElementById('rec-respuesta').value;
        const claveNueva1 = document.getElementById('rec-clave1').value; const claveNueva2 = document.getElementById('rec-clave2').value; 
        if(!respuestaIngresada || !claveNueva1 || !claveNueva2) return Swal.fire('Datos Incompletos', 'Complete su respuesta de seguridad y nueva contraseña.', 'warning'); 
        if(claveNueva1 !== claveNueva2) return Swal.fire('Error', 'Las contraseñas no coinciden.', 'error'); 
        if(!/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#.])[A-Za-z\d@$!%*?&#.]{8,}$/.test(claveNueva1)) return Swal.fire('Contraseña Débil', 'Mínimo 8 caracteres, 1 mayúscula, 1 número y 1 símbolo.', 'error'); 
        
        this.mostrarCarga(); 
        this.peticion({ action: "reset_forgotten_password", cedula: cedulaUsuario, num_preg: this.preguntaRecuperacionActiva, respuesta: respuestaIngresada, nueva_clave: claveNueva1 }, (res) => { 
            this.ocultarCarga(); 
            if(res && res.status === "success") { Swal.fire('¡Éxito!', res.message, 'success').then(() => { this.cancelarRecuperacion(); document.getElementById('inputClave').value = ''; }); } 
            else { Swal.fire('Error', res ? res.message : 'Falla de servidor.', 'error'); }
        }); 
    },

    guardarPrimerIngreso: function() { 
        const cedulaUsuario = document.getElementById('inputCedula').value; const nombreUsuario = document.getElementById('pi-nombre').value;
        const emailUsuario = document.getElementById('pi-email').value; const telefonoUsuario = document.getElementById('pi-telefono').value;
        const pregunta1 = document.getElementById('pi-preg1').value; const respuesta1 = document.getElementById('pi-resp1').value;
        const pregunta2 = document.getElementById('pi-preg2').value; const respuesta2 = document.getElementById('pi-resp2').value;
        const claveNueva1 = document.getElementById('pi-clave1').value; const claveNueva2 = document.getElementById('pi-clave2').value; 
        if(!emailUsuario || !telefonoUsuario || !pregunta1 || !respuesta1 || !pregunta2 || !respuesta2 || !claveNueva1 || !claveNueva2) return Swal.fire('Datos Incompletos', 'Complete todos los datos requeridos.', 'warning'); 
        if(claveNueva1 !== claveNueva2) return Swal.fire('Error', 'Las contraseñas no coinciden.', 'error'); 
        if(!/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#.])[A-Za-z\d@$!%*?&#.]{8,}$/.test(claveNueva1)) return Swal.fire('Contraseña Débil', 'Mínimo 8 caracteres, 1 mayúscula, 1 número y 1 símbolo.', 'error'); 
        
        this.mostrarCarga(); 
        this.peticion({ action: "primer_ingreso", cedula: cedulaUsuario, nombre: nombreUsuario, email: emailUsuario, telefono: telefonoUsuario, preg_1: pregunta1, resp_1: respuesta1, preg_2: pregunta2, resp_2: respuesta2, nueva_clave: claveNueva1 }, (res) => { 
            this.ocultarCarga(); 
            if(res && res.status === "success") { Swal.fire('¡Perfil Creado!', 'Su cuenta ha sido configurada. Por favor inicie sesión.', 'success').then(() => { location.reload(); }); } 
            else { Swal.fire('Error', res ? res.message : 'Error en configuración.', 'error'); }
        }); 
    },

    accesoInvitado: function() { document.getElementById('paso-cedula').style.display = 'none'; document.getElementById('paso-invitado').style.display = 'block'; },

    enviarRegistroInvitado: function() { 
        const nombreInv = document.getElementById('inv-nombre').value; const correoInv = document.getElementById('inv-correo').value;
        const telefonoInv = document.getElementById('inv-telefono').value; const motivoInv = document.getElementById('inv-motivo').value; 
        if(!nombreInv || !correoInv || !telefonoInv || !motivoInv) return Swal.fire('Campos Incompletos', 'Debe llenar todos los datos.', 'warning'); 
        
        this.mostrarCarga(); 
        this.peticion({ action: "registrar_invitado", nombre: nombreInv, correo: correoInv, telefono: telefonoInv, motivo: motivoInv }, (res) => { 
            this.ocultarCarga(); 
            if(res && res.status === "success") { 
                this.usuario = res.user; this.usuario.token = res.token; localStorage.setItem('sigae_usuario', JSON.stringify(this.usuario)); 
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Acceso concedido como Invitado', showConfirmButton: false, timer: 2000 }); 
                setTimeout(() => { this.prepararApp(); }, 1000); 
            } else { Swal.fire('Error', 'Falla en el registro de invitado.', 'error'); }
        }); 
    },

    cerrarSesion: function() { 
        Swal.fire({ title: '¿Cerrar Sesión?', icon: 'question', showCancelButton: true, confirmButtonColor: '#FF3D00', confirmButtonText: 'Sí, salir', cancelButtonText: 'Cancelar' }).then((result) => { 
            if (result.isConfirmed) { localStorage.clear(); location.reload(); } 
        }); 
    },

    iniciarControlSesion: function() { 
        if(!localStorage.getItem('sigae_usuario')) return; 
        const resetearTiempo = () => { 
            if(typeof Swal !== 'undefined' && Swal.isVisible() && Swal.getTitle().textContent === '¿Sigues ahí?') return; 
            clearTimeout(this.temporizadorInactivo); clearTimeout(this.temporizadorCierre); 
            this.temporizadorInactivo = setTimeout(() => { this.mostrarAdvertenciaSesion(); }, this.tiempoInactividad); 
        }; 
        window.addEventListener('mousemove', resetearTiempo); window.addEventListener('keypress', resetearTiempo); window.addEventListener('click', resetearTiempo); window.addEventListener('scroll', resetearTiempo); 
        resetearTiempo(); 
    },

    mostrarAdvertenciaSesion: function() { 
        Swal.fire({ title: '¿Sigues ahí?', text: 'Cerraremos la sesión en 1 minuto por inactividad.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#0066FF', cancelButtonColor: '#FF3D00', confirmButtonText: 'Seguir activo', cancelButtonText: 'Cerrar sesión', allowOutsideClick: false, allowEscapeKey: false }).then((result) => { 
            clearTimeout(this.temporizadorCierre); 
            if (result.isConfirmed) { this.iniciarControlSesion(); } else { this.cerrarSesionSilenciosa(); } 
        }); 
        this.temporizadorCierre = setTimeout(() => { this.cerrarSesionSilenciosa(); }, this.tiempoAdvertencia); 
    },

    cerrarSesionSilenciosa: function() { localStorage.clear(); location.reload(); },

    dibujarMenuPrincipal: function() { 
        const contenedorEnlaces = document.getElementById('contenedor-enlaces'); 
        if(!contenedorEnlaces) return;
        
        let htmlMenu = `
        <div class="px-4 mb-3">
            <button onclick="Enrutador.navegar('Inicio')" id="btn-menu-Inicio" class="btn-moderno btn-primario w-100 btn-inicio-sidebar text-start" style="padding: 12px; display:flex; align-items:center;">
                <i class="bi bi-house-door-fill me-3 fs-5"></i> <span class="texto-menu-ocultable fw-bold">Panel Principal</span>
            </button>
        </div>
        <div class="px-3"><div class="small text-muted fw-bold mb-2 px-3 texto-menu-ocultable" style="font-size:0.75rem; letter-spacing:1px;">MÓDULOS DEL SISTEMA</div>`; 
            
        for (const [nombreCategoria, datosModulo] of Object.entries(this.ModulosSistema)) { 
            const idBoton = `btn-menu-${nombreCategoria.replace(/[\s/()]/g, '-')}`; 
            htmlMenu += `
            <a href="javascript:void(0)" onclick="Enrutador.navegar('${nombreCategoria}')" id="${idBoton}" class="menu-item d-flex align-items-center mb-1 rounded-3" style="padding: 12px 20px; text-decoration:none;">
                <i class="bi ${datosModulo.icono} me-3 fs-5" style="color: ${datosModulo.color};"></i>
                <span class="texto-menu-ocultable">${nombreCategoria}</span>
            </a>`; 
        } 
        htmlMenu += `</div>`;
        contenedorEnlaces.innerHTML = htmlMenu; 
    },

    marcarMenuActivo: function(nombreVista) { 
        document.querySelectorAll('.menu-item').forEach(el => { el.classList.remove('activo'); el.style.background = 'transparent'; el.style.borderLeft = '4px solid transparent'; }); 
        const btnInicio = document.getElementById('btn-menu-Inicio'); 
        if (btnInicio) { btnInicio.classList.replace('btn-secundario', 'btn-primario'); }
        if (nombreVista === 'Inicio') return; 
        if (btnInicio) { btnInicio.classList.replace('btn-primario', 'btn-secundario'); btnInicio.style.background = 'transparent'; btnInicio.style.color = 'var(--color-primario)'; btnInicio.style.boxShadow = 'none'; btnInicio.style.border = '2px solid var(--color-primario)'; } 
        
        let categoriaPadre = nombreVista; 
        for (const [padre, datos] of Object.entries(this.ModulosSistema)) { if (datos.items.some(i => i.vista === nombreVista)) { categoriaPadre = padre; break; } } 
        const itemActivo = document.getElementById(`btn-menu-${categoriaPadre.replace(/[\s/()]/g, '-')}`); 
        if (itemActivo) { itemActivo.classList.add('activo'); itemActivo.style.background = 'rgba(0, 102, 255, 0.08)'; itemActivo.style.borderLeft = '4px solid var(--color-primario)'; } 
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
            const tieneAcceso = this.tienePermiso(item.roles); 
            const claseBorde = tieneAcceso ? 'border-primary border-bottom border-4 cursor-pointer hover-efecto' : 'border-secondary border-bottom border-4 bg-light'; 
            const onClickAttr = tieneAcceso ? `onclick="Enrutador.navegar('${item.vista}')"` : `onclick="Swal.fire('Acceso Denegado', 'Su rol no tiene permisos.', 'error')"`; 
            
            htmlTarjetas += `
            <div class="col-md-6 col-xl-4 animate__animated animate__zoomIn">
                <div class="tarjeta-modulo p-4 h-100 shadow-sm bg-white ${claseBorde} ${tieneAcceso ? '' : 'opacity-75'}" ${onClickAttr}>
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div class="bg-${tieneAcceso ? 'primary' : 'secondary'} bg-opacity-10 p-3 rounded-4 d-inline-flex">
                            <i class="bi ${item.icono} fs-2 text-${tieneAcceso ? 'primary' : 'secondary'}"></i>
                        </div>
                        ${!tieneAcceso ? '<i class="bi bi-lock-fill fs-4 text-danger"></i>' : '<i class="bi bi-arrow-right-short fs-4 text-muted opacity-50"></i>'}
                    </div>
                    <h5 class="fw-bold text-dark mb-1">${item.vista}</h5>
                    <p class="small text-muted mb-0">${tieneAcceso ? 'Click para gestionar' : 'Requiere permisos: ' + item.roles[0]}</p>
                </div>
            </div>`; 
        }); 
        
        return `
        <div class="row mb-4 animate__animated animate__fadeInDown">
            <div class="col-12">
                <div class="banner-modulo p-4 p-md-5 text-white">
                    <div class="burbuja-3d burbuja-1"></div><div class="burbuja-3d burbuja-2"></div><div class="burbuja-3d burbuja-3"></div>
                    <div class="row align-items-center position-relative z-1">
                        <div class="col-md-8 text-center text-md-start mb-4 mb-md-0">
                            <span class="badge bg-white text-primary mb-2 shadow-sm" style="font-weight: 800; letter-spacing: 1px;">
                                <i class="bi ${modulo.icono} me-1"></i> CATEGORÍA
                            </span>
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
        <div class="row g-4">${htmlTarjetas}</div>`; 
    },

    alternarMenu: function() { document.body.classList.toggle('menu-colapsado'); }, 
    alternarMenuMovil: function() { document.body.classList.toggle('menu-abierto'); },
    alternarClave: function(idInput) { 
        const input = document.getElementById(idInput); const icono = input.nextElementSibling.querySelector('i'); 
        if (input.type === 'password') { input.type = 'text'; icono.classList.replace('bi-eye', 'bi-eye-slash'); } 
        else { input.type = 'password'; icono.classList.replace('bi-eye-slash', 'bi-eye'); } 
    }
};

document.addEventListener('DOMContentLoaded', () => { 
    if(window.Aplicacion) { window.Aplicacion.init(); }
});