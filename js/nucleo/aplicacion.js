/**
 * APLICACIÓN CORE - SIGAE v4.5
 */
const EstructuraMenu =[
    { categoria: "Escuela", icono: "bi-building", color: "#FF8D00", items:["Perfil de la Escuela", "Fases y Periodos", "Niveles Educativos", "Gestión de Asignaturas", "Estructura de Horarios", "Escalas de Evaluación", "Gestión de Cargos", "Cadena Supervisoria", "Grado / Año"] },
    // CAMBIO AQUI: Menú de Docentes actualizado
    { categoria: "Docentes", icono: "bi-person-workspace", color: "#00E676", items:["Asignar Carga Académica", "Ver Horario", "Asignar Cargos"] },
    
    { categoria: "Estudiantes", icono: "bi-people-fill", color: "#00C3FF", items:["Agregar Estudiante (Nuevo)", "Agregar Estudiante (Regular)", "Asignar Cargos (Est)", "Registrar Tipos de Ausencias (Est)", "Registrar Ausencias (Est)", "Expediente Estudiante", "Condición Salud (Est)", "Voceros Estudiantiles"] },
    { categoria: "Representantes", icono: "bi-person-heart", color: "#E5007E", items:["Solicitudes (Retiro/Notas/Constancia)", "Actualización de Datos (Regular)", "Inscripciones (Nuevos)", "Ver Boleta", "Ver Corte de Calificaciones"] },
    { categoria: "Administrativo", icono: "bi-clipboard-check-fill", color: "#6f42c1", items:["Accidentes/Casiaccidentes (Doc)", "Accidentes/Casiaccidentes (Est)", "Reporte Preliminar Asistencias", "Reporte Incidentes y Requerimientos", "Gestión Diaria (Revisada)", "Gestión Mensual (DEP/CDV)", "Requerimientos Anuales", "Registros de Espacios", "Asignación de Espacios", "Agregar Colectivos Docentes", "Asignación de Colectivos", "Crear Salones", "Estadísticas"] },
    { categoria: "Transporte Escolar", icono: "bi-bus-front-fill", color: "#FF007A", items:["Rutas y Paradas", "Asignación de Recorridos", "Rutogramas", "Guardias de Transporte", "Registro de Asistencias (Transp)", "Reporte Incidentes (Est/Transp)", "Reporte Incidentes (Servicio)"] },
    { categoria: "Pedagogía", icono: "bi-journal-bookmark-fill", color: "#00E676", items:["Agregar PA", "Perfil del Aula", "Calendario Escolar"] },
    { categoria: "Control de Estudios", icono: "bi-shield-lock-fill", color: "#6f42c1", items:["Solicitud de Cupos", "Carnet Estudiantil", "Calificaciones", "Matrículas", "Boletas", "Retiros", "Notas Certificadas", "Certificación Títulos", "Constancias de Estudio", "Cortes de Notas", "Sábanas", "Resúmenes Finales"] },
    { categoria: "C.R.A.", icono: "bi-book-half", color: "#00C3FF", items:["Ubicaciones CRA", "Recursos Educativos CRA", "Préstamos"] },
    { categoria: "Formaciones", icono: "bi-patch-check-fill", color: "#00E676", items:["Planificación de Formación", "Recursos Educativos Formación", "Descarga de Certificados"] },
    { categoria: "Software", icono: "bi-cpu-fill", color: "#E5007E", items:["Gestión de Usuarios", "Roles y Privilegios", "Cambio de Contraseñas"] },
    { categoria: "Ayuda", icono: "bi-question-circle-fill", color: "#FF8D00", items:["Manual de Usuario", "Soporte Técnico"] },
    { categoria: "Diseño Web", icono: "bi-palette-fill", color: "#0066FF", items: ["Accesibilidad y Apariencia"] }
];

const Aplicacion = {
    usuario: null,
    iniciar: function() { this.ocultarCarga(); Enrutador.inicializar(); this.verificarSesion(); },
    mostrarCarga: function() { const l = document.getElementById('pantalla-carga'); if(l) { l.style.display = 'flex'; setTimeout(()=>l.style.opacity = '1', 10); } },
    ocultarCarga: function() { const l = document.getElementById('pantalla-carga'); if(l) { l.style.opacity = '0'; setTimeout(()=>l.style.display = 'none', 500); } },

    peticion: async function(datos, callback) {
        this.mostrarCarga();
        try {
            const url = Configuracion.obtenerApiUrl();
            const res = await fetch(url, { method: "POST", body: JSON.stringify(datos) });
            let txt = await res.text(); txt = txt.trim().replace(/^\uFEFF/, '');
            let json = null;
            try { json = JSON.parse(txt); } 
            catch (e1) {
                try {
                    const ini = txt.indexOf('{'), fin = txt.lastIndexOf('}') + 1;
                    if(ini !== -1 && fin !== -1) json = JSON.parse(txt.substring(ini, fin));
                    else throw new Error();
                } catch (e2) {
                    this.ocultarCarga(); Swal.fire('Error', 'Datos corruptos desde el servidor.', 'error'); return;
                }
            }
            this.ocultarCarga();
            if(json.status === "error") Swal.fire('Error Backend', json.message, 'error');
            else callback(json);
        } catch(err) {
            this.ocultarCarga(); Swal.fire('Error de Red', 'Fallo de conexión.', 'error');
        }
    },
    alternarClave: function(id) { const i = document.getElementById(id); i.type = i.type === 'password' ? 'text' : 'password'; },
    alternarMenu: function() { document.body.classList.toggle('menu-colapsado'); },
    alternarMenuMovil: function() { document.body.classList.toggle('menu-abierto'); },
    verificarSesion: function() {
        const g = localStorage.getItem('sigae_usuario');
        if (g) { this.usuario = JSON.parse(g); this.prepararApp(); } else document.getElementById('vista-login').style.display = 'flex';
    },
    verificarUsuario: function() {
        const c = document.getElementById('inputCedula').value; if (!c) return Swal.fire('Atención', 'Ingresa cédula', 'warning');
        this.peticion({ action: "verificar_usuario", cedula: c }, (res) => {
            if(res.found) { document.getElementById('paso-cedula').style.display = 'none'; document.getElementById('lbl-nombre-login').innerText = res.nombre; document.getElementById('paso-clave').style.display = 'block'; }
            else Swal.fire('Error', 'Cédula no registrada.', 'error');
        });
    },
    iniciarSesion: function() {
        const c = document.getElementById('inputCedula').value, p = document.getElementById('inputClave').value;
        if (!p) return Swal.fire('Atención', 'Ingresa contraseña', 'warning');
        this.peticion({ action: "login", cedula: c, password: p }, (res) => {
            if(res.status === "success") { this.usuario = res.user; localStorage.setItem('sigae_usuario', JSON.stringify(this.usuario)); this.prepararApp(); }
        });
    },
    accesoInvitado: function() { this.usuario = { nombre: "Visitante", rol: "Visitante", cedula: "0" }; localStorage.setItem('sigae_usuario', JSON.stringify(this.usuario)); this.prepararApp(); },
    cerrarSesion: function() { localStorage.removeItem('sigae_usuario'); localStorage.removeItem('sigae_ultima_vista'); location.reload(); },
    prepararApp: function() {
        document.getElementById('vista-login').style.display = 'none'; document.getElementById('vista-app').style.display = 'block';
        document.getElementById('nombre-usuario-nav').innerText = this.usuario.nombre; document.getElementById('rol-usuario-nav').innerText = this.usuario.rol;
        this.renderizarMenuLateral(); Enrutador.navegar(localStorage.getItem('sigae_ultima_vista') || 'Inicio');
    },
    renderizarMenuLateral: function() {
        const c = document.getElementById('contenedor-enlaces');
        let html = `<div class="px-3 mb-3 mt-3"><button onclick="Enrutador.navegar('Inicio')" class="btn-moderno btn-inicio-sidebar w-100" style="background: rgba(0, 102, 255, 0.1); color: var(--color-primario); font-size: 0.9rem; padding: 12px;"><i class="bi bi-house-door-fill me-2"></i> <span class="texto-menu-ocultable">Vista Principal</span></button></div><div class="accordion accordion-flush" id="acordeon-menu">`;
        EstructuraMenu.forEach((cat, index) => {
            const id = `collapse-cat-${index}`;
            html += `<div class="accordion-item bg-transparent border-0 mb-1"><button class="menu-categoria collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${id}"><span><i class="bi ${cat.icono} me-3 fs-5" style="color: ${cat.color};"></i> <span>${cat.categoria}</span></span><i class="bi bi-chevron-down fs-6"></i></button><div id="${id}" class="accordion-collapse collapse" data-bs-parent="#acordeon-menu"><div class="accordion-body p-0 py-2">${cat.items.map(i => `<a href="javascript:void(0)" onclick="Enrutador.navegar('${i}')" class="menu-item" data-id="${i}">${i}</a>`).join('')}</div></div></div>`;
        });
        c.innerHTML = html + `</div>`;
    },
    marcarMenuActivo: function(id) {
        document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('activo'));
        if (id !== 'Inicio') {
            const el = document.querySelector(`.menu-item[data-id="${id}"]`);
            if (el) { el.classList.add('activo'); const p = el.closest('.accordion-collapse'); if (p) { p.classList.add('show'); p.previousElementSibling.classList.remove('collapsed'); } }
        }
    }
};
document.addEventListener("DOMContentLoaded", () => Aplicacion.iniciar());