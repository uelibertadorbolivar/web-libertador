/**
 * MÓDULO: INICIO (DASHBOARD DINÁMICO)
 * BLINDADO CON window.ModInicio
 */

window.ModInicio = {
    
    init: function() {
        this.configurarPanelPorRol();
        this.cargarDatosEscuela();
    },

    // 1. Enciende el panel correcto según quién inicia sesión
    configurarPanelPorRol: function() {
        if(!window.Aplicacion || !window.Aplicacion.usuario) return;
        
        const rolUsuario = window.Aplicacion.usuario.rol;
        document.getElementById('lbl-rol-actual').innerText = `Perfil: ${rolUsuario}`;

        // Ocultar todos por defecto
        document.getElementById('panel-admin').classList.add('d-none');
        document.getElementById('panel-docente').classList.add('d-none');
        document.getElementById('panel-estudiante').classList.add('d-none');

        // Mostrar según el rol
        if (rolUsuario === 'Administrador' || rolUsuario === 'Directivo' || rolUsuario === 'RRHH' || rolUsuario === 'Control de Estudios') {
            document.getElementById('panel-admin').classList.remove('d-none');
        } else if (rolUsuario === 'Docente') {
            document.getElementById('panel-docente').classList.remove('d-none');
        } else {
            // Estudiantes y Representantes
            document.getElementById('panel-estudiante').classList.remove('d-none');
        }
    },

    // 2. Trae los datos de la escuela desde la Base de Datos
    cargarDatosEscuela: function() {
        if(typeof window.Aplicacion !== 'undefined') {
            window.Aplicacion.peticion({ action: "get_school_profile" }, (res) => {
                if (res && res.status === "success" && res.perfil && res.perfil.nombre) {
                    
                    // Llenar Tarjeta de Identificación
                    document.getElementById('lbl-escuela-nombre').innerText = res.perfil.nombre;
                    document.getElementById('lbl-escuela-rif').innerText = res.perfil.rif || 'No registrado';
                    document.getElementById('lbl-escuela-dea').innerText = res.perfil.dea || 'No registrado';
                    document.getElementById('lbl-escuela-dir').innerText = res.perfil.direccion || 'No registrada';

                    // Guardar datos ocultos de Filosofía
                    document.getElementById('data-mision').value = res.perfil.mision || 'Aún no se ha definido la misión institucional.';
                    document.getElementById('data-vision').value = res.perfil.vision || 'Aún no se ha definido la visión institucional.';
                    document.getElementById('data-peic').value = res.perfil.peic || 'PEIC no registrado en el sistema.';

                    // Mostrar Misión por defecto al cargar
                    this.verFilosofia('mision');
                } else {
                    document.getElementById('txt-filosofia').innerHTML = '<i>Datos institucionales no configurados. Pida al administrador que llene el "Perfil de la Escuela".</i>';
                }
            });
        }
    },

    // 3. Sistema de pestañas interactivas para Misión/Visión/PEIC
    verFilosofia: function(tipo) {
        // Limpiar estilos de botones
        document.getElementById('btn-fil-mision').classList.remove('activo', 'text-white');
        document.getElementById('btn-fil-mision').classList.add('text-muted');
        
        document.getElementById('btn-fil-vision').classList.remove('activo', 'text-white');
        document.getElementById('btn-fil-vision').classList.add('text-muted');
        
        document.getElementById('btn-fil-peic').classList.remove('activo', 'text-white');
        document.getElementById('btn-fil-peic').classList.add('text-muted');

        // Activar botón clickeado
        let btnActivo = document.getElementById(`btn-fil-${tipo}`);
        btnActivo.classList.remove('text-muted');
        btnActivo.classList.add('activo');

        // Aplicar animación de fundido al texto
        let contenedorTexto = document.getElementById('txt-filosofia');
        contenedorTexto.classList.remove('animate__animated', 'animate__fadeIn');
        
        // Pequeño truco para reiniciar la animación
        void contenedorTexto.offsetWidth; 
        
        // Inyectar texto correspondiente
        contenedorTexto.innerText = document.getElementById(`data-${tipo}`).value;
        contenedorTexto.classList.add('animate__animated', 'animate__fadeIn');
    }
};

// ==========================================
// LLAVE DEL ENRUTADOR DINÁMICO
// ==========================================
window.init_Inicio = function() { window.ModInicio.init(); };