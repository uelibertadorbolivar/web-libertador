/**
 * ENRUTADOR DINÁMICO - SIGAE
 */
const Enrutador = {
    vistaActual: 'Inicio',
    
    MAPA_RUTAS: {
        "Inicio": { url: "vistas/inicio.html" },
        "Mi Perfil": { url: "vistas/seguridad/mi_perfil.html" },
        "Gestión de Usuarios": { url: "vistas/seguridad/usuarios.html" },
        "Roles y Privilegios": { url: "vistas/seguridad/roles.html" },
        "Perfil de la Escuela": { url: "vistas/escuela/perfil.html" },
        "Configuración del Sistema": { url: "vistas/escuela/configuracion.html" },
        "Calendario Escolar": { url: "vistas/escuela/calendario.html" },
        "Cargos Institucionales": { url: "vistas/personal/cargos.html" },
        
        // NUEVA RUTA: CADENA SUPERVISORIA
        "Cadena Supervisoria": { url: "vistas/personal/jerarquia.html" } 
    },

    inicializar: function() { window.addEventListener('popstate', (e) => { if (e.state && e.state.vista) this.cargarVista(e.state.vista, false); }); },
    navegar: function(nombreVista) { if (this.vistaActual === nombreVista && document.getElementById('area-dinamica').innerHTML !== '') return; this.cargarVista(nombreVista, true); },

    cargarVista: async function(nombreVista, guardarHistorial = true) {
        const contenedor = document.getElementById('area-dinamica');
        this.vistaActual = nombreVista; document.getElementById('titulo-pagina').innerText = nombreVista; Aplicacion.marcarMenuActivo(nombreVista);
        if (window.innerWidth < 992) document.body.classList.remove('menu-abierto');
        
        contenedor.innerHTML = `<div class="animate__animated animate__pulse animate__infinite text-center py-5"><div class="spinner-grow text-primary" style="width: 3rem; height: 3rem;" role="status"></div><h5 class="mt-3 text-muted fw-bold">Cargando módulo...</h5></div>`;

        try {
            if (Aplicacion.ModulosSistema && Aplicacion.ModulosSistema[nombreVista]) {
                const htmlDashboard = Aplicacion.generarDashboardModulo(nombreVista);
                contenedor.innerHTML = `<div class="vista-entrar">${htmlDashboard}</div>`;
            } else if (this.MAPA_RUTAS[nombreVista] && this.MAPA_RUTAS[nombreVista].url) {
                const nombreFuncion = `init_${nombreVista.replace(/[\s/()]/g, '_')}`;
                
                const response = await fetch(this.MAPA_RUTAS[nombreVista].url);
                if (response.ok) { 
                    const html = await response.text(); 
                    contenedor.innerHTML = `<div class="vista-entrar">${html}</div>`; 
                    if(typeof window[nombreFuncion] === 'function') {
                        window[nombreFuncion](); 
                    } else {
                        console.warn("Falta declarar la función de inicio: " + nombreFuncion);
                        if(typeof Aplicacion !== 'undefined') Aplicacion.ocultarCarga();
                    }
                } 
                else { this.mostrarMockup(nombreVista, contenedor); }
            } else { this.mostrarMockup(nombreVista, contenedor); }

            if (guardarHistorial) { window.history.pushState({ vista: nombreVista }, nombreVista, `#${nombreVista.replace(/\s+/g, '-')}`); localStorage.setItem('sigae_ultima_vista', nombreVista); }
        } catch (error) { 
            contenedor.innerHTML = `<div class="alert alert-danger glass-panel text-center py-5 border-0"><i class="bi bi-exclamation-triangle-fill fs-1 text-danger"></i><h4 class="mt-3">Error de Conexión</h4><p>No se pudo cargar el módulo.</p><button class="btn-moderno btn-primario mt-3" onclick="Enrutador.navegar('${nombreVista}')">Reintentar</button></div>`; 
            if(typeof Aplicacion !== 'undefined') Aplicacion.ocultarCarga();
        }
    },

    mostrarMockup: function(nombre, contenedor) {
        contenedor.innerHTML = `<div class="vista-entrar h-100 d-flex flex-column align-items-center justify-content-center text-center py-5" style="min-height: 60vh;"><div class="bg-white p-5 rounded-circle shadow-lg mb-4 position-relative" style="width: 150px; height: 150px; display:flex; align-items:center; justify-content:center;"><div class="position-absolute w-100 h-100 rounded-circle border border-4 border-primary animate__animated animate__ping animate__infinite opacity-25"></div><i class="bi bi-gear-wide-connected text-primary" style="font-size: 4rem;"></i></div><h2 class="fw-bold text-dark">Módulo en Desarrollo</h2><p class="text-muted fs-5">El área de <b>${nombre}</b> está siendo programada.</p><button class="btn-moderno btn-primario mt-4 shadow" onclick="window.history.back()"><i class="bi bi-arrow-left me-2"></i> Volver atrás</button></div>`;
        if(typeof Aplicacion !== 'undefined') Aplicacion.ocultarCarga();
    }
};