/**
 * ENRUTADOR DINÁMICO
 */
const Enrutador = {
    vistaActual: 'Inicio',
    
    MAPA_RUTAS: {
        "Inicio": { url: "vistas/inicio.html", icono: "bi-house-door-fill" },
        "Perfil de la Escuela": { url: "vistas/escuela/perfil.html", icono: "bi-building" },
        "Fases y Periodos": { url: "vistas/escuela/periodos.html", icono: "bi-calendar3" },
        "Niveles Educativos": { url: "vistas/escuela/niveles.html", icono: "bi-layers-fill" },
        "Gestión de Asignaturas": { url: "vistas/escuela/asignaturas.html", icono: "bi-journal-text" },
        "Estructura de Horarios": { url: "vistas/escuela/horarios.html", icono: "bi-clock-fill" },
        "Escalas de Evaluación": { url: "vistas/escuela/escalas.html", icono: "bi-bar-chart-fill" },
        "Gestión de Cargos": { url: "vistas/escuela/cargos.html", icono: "bi-briefcase-fill" },
        "Cadena Supervisoria": { url: "vistas/escuela/supervision.html", icono: "bi-diagram-3-fill" },
        "Grado / Año": { url: "vistas/escuela/grados.html", icono: "bi-mortarboard-fill" },
        
        // NUEVAS RUTAS DOCENTES:
        "Asignar Carga Académica": { url: "vistas/docentes/carga.html", icono: "bi-journal-richtext" },
        "Ver Horario": { url: "vistas/docentes/horario_docente.html", icono: "bi-calendar-week-fill" },
        "Asignar Cargos": { url: "vistas/docentes/asignar.html", icono: "bi-person-vcard-fill" },
        
        "Registrar Tipos de Ausencias (Doc)": { url: "vistas/docentes/tipo_ausencia.html", icono: "bi-list-check" },
        "Registrar Ausencias (Doc)": { url: "vistas/docentes/ausencia.html", icono: "bi-calendar-x-fill" },
        "Expediente Docente": { url: "vistas/docentes/expediente.html", icono: "bi-folder-fill" },
        "Condición Salud (Doc)": { url: "vistas/docentes/salud.html", icono: "bi-heart-pulse-fill" },
        "Reporte Gestión Diaria (Doc)": { url: "vistas/docentes/reporte_diario.html", icono: "bi-file-earmark-bar-graph-fill" },
        "Planes de Evaluación": { url: "vistas/docentes/planes.html", icono: "bi-card-checklist" },
        "Agregar Estudiante (Nuevo)": { url: "vistas/estudiantes/nuevo.html", icono: "bi-person-plus" },
        "Agregar Estudiante (Regular)": { url: "vistas/estudiantes/regular.html", icono: "bi-person-check" },
        "Asignar Cargos (Est)": { url: "vistas/estudiantes/cargos.html", icono: "bi-award-fill" },
        "Registrar Tipos de Ausencias (Est)": { url: "vistas/estudiantes/tipo_ausencia.html", icono: "bi-list-check" },
        "Registrar Ausencias (Est)": { url: "vistas/estudiantes/ausencia.html", icono: "bi-calendar-x" },
        "Expediente Estudiante": { url: "vistas/estudiantes/expediente.html", icono: "bi-folder-fill" },
        "Condición Salud (Est)": { url: "vistas/estudiantes/salud.html", icono: "bi-heart-pulse-fill" },
        "Voceros Estudiantiles": { url: "vistas/estudiantes/voceros.html", icono: "bi-megaphone-fill" },
        "Solicitudes (Retiro/Notas/Constancia)": { url: "vistas/representantes/solicitudes.html", icono: "bi-envelope-paper-fill" },
        "Actualización de Datos (Regular)": { url: "vistas/representantes/actualizar.html", icono: "bi-person-lines-fill" },
        "Inscripciones (Nuevos)": { url: "vistas/representantes/inscripcion.html", icono: "bi-ui-checks" },
        "Ver Boleta": { url: "vistas/representantes/boleta.html", icono: "bi-file-earmark-text-fill" },
        "Ver Corte de Calificaciones": { url: "vistas/representantes/cortes.html", icono: "bi-bar-chart-steps" },
        "Accidentes/Casiaccidentes (Doc)": { url: "vistas/administrativo/accidente_doc.html", icono: "bi-exclamation-triangle-fill" },
        "Accidentes/Casiaccidentes (Est)": { url: "vistas/administrativo/accidente_est.html", icono: "bi-exclamation-triangle" },
        "Reporte Preliminar Asistencias": { url: "vistas/administrativo/rep_asistencia.html", icono: "bi-file-earmark-spreadsheet-fill" },
        "Reporte Incidentes y Requerimientos": { url: "vistas/administrativo/rep_incidentes.html", icono: "bi-journal-medical" },
        "Gestión Diaria (Revisada)": { url: "vistas/administrativo/gestion_diaria.html", icono: "bi-calendar-check-fill" },
        "Gestión Mensual (DEP/CDV)": { url: "vistas/administrativo/gestion_mensual.html", icono: "bi-calendar2-month-fill" },
        "Requerimientos Anuales": { url: "vistas/administrativo/requerimientos.html", icono: "bi-cart-check-fill" },
        "Registros de Espacios": { url: "vistas/administrativo/espacios.html", icono: "bi-door-open-fill" },
        "Asignación de Espacios": { url: "vistas/administrativo/asig_espacios.html", icono: "bi-geo-alt-fill" },
        "Agregar Colectivos Docentes": { url: "vistas/administrativo/col_docentes.html", icono: "bi-collection-fill" },
        "Asignación de Colectivos": { url: "vistas/administrativo/asig_colectivos.html", icono: "bi-diagram-2-fill" },
        "Crear Salones": { url: "vistas/administrativo/salones.html", icono: "bi-easel-fill" },
        "Estadísticas": { url: "vistas/administrativo/estadisticas.html", icono: "bi-pie-chart-fill" },
        "Rutas y Paradas": { url: "vistas/transporte/rutas_paradas.html", icono: "bi-signpost-split-fill" },
        "Asignación de Recorridos": { url: "vistas/transporte/recorridos.html", icono: "bi-shuffle" },
        "Rutogramas": { url: "vistas/transporte/rutogramas.html", icono: "bi-map-fill" },
        "Guardias de Transporte": { url: "vistas/transporte/guardias.html", icono: "bi-person-vcard-fill" },
        "Registro de Asistencias (Transp)": { url: "vistas/transporte/asistencia.html", icono: "bi-list-check" },
        "Reporte Incidentes (Est/Transp)": { url: "vistas/transporte/incidente_est.html", icono: "bi-exclamation-octagon-fill" },
        "Reporte Incidentes (Servicio)": { url: "vistas/transporte/incidente_serv.html", icono: "bi-cone-striped" },
        "Agregar PA": { url: "vistas/pedagogia/agregar_pa.html", icono: "bi-file-earmark-plus-fill" },
        "Perfil del Aula": { url: "vistas/pedagogia/perfil_aula.html", icono: "bi-clipboard-data-fill" },
        "Calendario Escolar": { url: "vistas/pedagogia/calendario.html", icono: "bi-calendar-event-fill" },
        "Solicitud de Cupos": { url: "vistas/control/cupos.html", icono: "bi-journal-bookmark-fill" },
        "Carnet Estudiantil": { url: "vistas/control/carnet.html", icono: "bi-person-bounding-box" },
        "Calificaciones": { url: "vistas/control/calificaciones.html", icono: "bi-sort-numeric-down" },
        "Matrículas": { url: "vistas/control/matriculas.html", icono: "bi-people-fill" },
        "Boletas": { url: "vistas/control/boletas.html", icono: "bi-file-earmark-richtext-fill" },
        "Retiros": { url: "vistas/control/retiros.html", icono: "bi-person-dash-fill" },
        "Notas Certificadas": { url: "vistas/control/notas_cert.html", icono: "bi-patch-check-fill" },
        "Certificación Títulos": { url: "vistas/control/titulos.html", icono: "bi-mortarboard-fill" },
        "Constancias de Estudio": { url: "vistas/control/constancias.html", icono: "bi-file-earmark-ruled-fill" },
        "Cortes de Notas": { url: "vistas/control/cortes.html", icono: "bi-scissors" },
        "Sábanas": { url: "vistas/control/sabanas.html", icono: "bi-table" },
        "Resúmenes Finales": { url: "vistas/control/resumenes.html", icono: "bi-file-earmark-zip-fill" },
        "Ubicaciones CRA": { url: "vistas/cra/ubicaciones.html", icono: "bi-pin-map-fill" },
        "Recursos Educativos CRA": { url: "vistas/cra/recursos.html", icono: "bi-book-half" },
        "Préstamos": { url: "vistas/cra/prestamos.html", icono: "bi-arrow-left-right" },
        "Planificación de Formación": { url: "vistas/formaciones/planificacion.html", icono: "bi-calendar2-week-fill" },
        "Recursos Educativos Formación": { url: "vistas/formaciones/recursos.html", icono: "bi-laptop-fill" },
        "Descarga de Certificados": { url: "vistas/formaciones/certificados.html", icono: "bi-cloud-download-fill" },
        "Gestión de Usuarios": { url: "vistas/software/usuarios.html", icono: "bi-people-fill" },
        "Roles y Privilegios": { url: "vistas/software/roles.html", icono: "bi-shield-lock-fill" },
        "Cambio de Contraseñas": { url: "vistas/software/contrasena.html", icono: "bi-key-fill" },
        "Manual de Usuario": { url: "vistas/ayuda/manual.html", icono: "bi-book-fill" },
        "Soporte Técnico": { url: "vistas/ayuda/soporte.html", icono: "bi-life-preserver" },
        "Accesibilidad y Apariencia": { url: "vistas/diseno/accesibilidad.html", icono: "bi-universal-access-circle" }
    },

    inicializar: function() { window.addEventListener('popstate', (e) => { if (e.state && e.state.vista) this.cargarVista(e.state.vista, false); }); },
    navegar: function(nombreVista) { if (this.vistaActual === nombreVista && document.getElementById('area-dinamica').innerHTML !== '') return; this.cargarVista(nombreVista, true); },

    cargarVista: async function(nombreVista, guardarHistorial = true) {
        const contenedor = document.getElementById('area-dinamica');
        const rutaInfo = this.MAPA_RUTAS[nombreVista];
        this.vistaActual = nombreVista; document.getElementById('titulo-pagina').innerText = nombreVista; Aplicacion.marcarMenuActivo(nombreVista);
        if (window.innerWidth < 992) document.body.classList.remove('menu-abierto');
        contenedor.innerHTML = `<div class="animate__animated animate__pulse animate__infinite text-center py-5"><div class="spinner-grow text-primary" style="width: 3rem; height: 3rem;" role="status"></div><h5 class="mt-3 text-muted fw-bold">Cargando módulo...</h5></div>`;

        try {
            const nombreFuncion = `init_${nombreVista.replace(/[\s/()]/g, '_')}`;
            if (rutaInfo && rutaInfo.url) {
                const response = await fetch(rutaInfo.url);
                if (response.ok) {
                    const html = await response.text();
                    contenedor.innerHTML = `<div class="vista-entrar">${html}</div>`;
                    if(typeof window[nombreFuncion] === 'function') window[nombreFuncion]();
                } else this.mostrarMockup(nombreVista, contenedor);
            } else this.mostrarMockup(nombreVista, contenedor);

            if (guardarHistorial) {
                window.history.pushState({ vista: nombreVista }, nombreVista, `#${nombreVista.replace(/\s+/g, '-')}`);
                localStorage.setItem('sigae_ultima_vista', nombreVista);
            }
        } catch (error) {
            contenedor.innerHTML = `<div class="alert alert-danger glass-panel text-center py-5 border-0"><i class="bi bi-exclamation-triangle-fill fs-1 text-danger"></i><h4 class="mt-3">Error de Conexión</h4><p>No se pudo cargar el módulo <b>${nombreVista}</b>.</p><button class="btn-moderno btn-primario mt-3" onclick="Enrutador.navegar('${nombreVista}')">Reintentar</button></div>`;
        }
    },

    mostrarMockup: function(nombre, contenedor) {
        contenedor.innerHTML = `
        <div class="vista-entrar h-100 d-flex flex-column align-items-center justify-content-center text-center py-5" style="min-height: 60vh;">
            <div class="bg-white p-5 rounded-circle shadow-lg mb-4 position-relative" style="width: 150px; height: 150px; display:flex; align-items:center; justify-content:center;">
                <div class="position-absolute w-100 h-100 rounded-circle border border-4 border-primary animate__animated animate__ping animate__infinite opacity-25"></div>
                <i class="bi ${this.MAPA_RUTAS[nombre]?.icono || 'bi-gear-wide-connected'} text-primary" style="font-size: 4rem;"></i>
            </div>
            <h2 class="fw-bold text-dark">Módulo en Desarrollo</h2>
            <p class="text-muted fs-5">El área de <b>${nombre}</b> está siendo programada para la próxima actualización.</p>
            <button class="btn-moderno btn-primario mt-4 shadow" onclick="Enrutador.navegar('Inicio')"><i class="bi bi-arrow-left me-2"></i> Volver al Inicio</button>
        </div>`;
    }
};