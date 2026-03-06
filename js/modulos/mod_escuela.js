/**
 * MÓDULO: DIRECCIÓN Y SISTEMA (ESCUELA)
 * Gestiona el Perfil de la Institución y su configuración global.
 */

const ModEscuela = {

    cargarPerfil: function() {
        Aplicacion.mostrarCarga();
        Aplicacion.peticion({ action: "get_school_profile" }, (res) => {
            Aplicacion.ocultarCarga();
            if(res.status === "success" && res.perfil) {
                const p = res.perfil;
                
                // Rellenar formulario
                document.getElementById('escuela-nombre').value = p.nombre || '';
                document.getElementById('escuela-dea').value = p.dea || '';
                document.getElementById('escuela-rif').value = p.rif || '';
                document.getElementById('escuela-direccion').value = p.direccion || '';
                document.getElementById('escuela-mision').value = p.mision || '';
                document.getElementById('escuela-vision').value = p.vision || '';
                document.getElementById('escuela-objetivo').value = p.objetivo || '';
                document.getElementById('escuela-peic').value = p.peic || '';
            } else {
                Swal.fire('Atención', 'No se ha configurado el perfil de la escuela aún.', 'info');
            }
        });
    },

    guardarPerfil: function() {
        const payload = {
            action: "save_school_profile",
            nombre: document.getElementById('escuela-nombre').value,
            dea: document.getElementById('escuela-dea').value,
            rif: document.getElementById('escuela-rif').value,
            direccion: document.getElementById('escuela-direccion').value,
            mision: document.getElementById('escuela-mision').value,
            vision: document.getElementById('escuela-vision').value,
            objetivo: document.getElementById('escuela-objetivo').value,
            peic: document.getElementById('escuela-peic').value
        };

        const usuarioActual = JSON.parse(localStorage.getItem('sigae_usuario'));
        if (usuarioActual) payload.cedula_admin = usuarioActual.cedula;

        if(!payload.nombre) {
            return Swal.fire('Atención', 'El Nombre Oficial de la Institución es obligatorio.', 'warning');
        }

        Aplicacion.mostrarCarga();
        Aplicacion.peticion(payload, (res) => {
            Aplicacion.ocultarCarga();
            if(res.status === "success") {
                Swal.fire('¡Éxito!', res.message, 'success');
            } else {
                Swal.fire('Error', res.message, 'error');
            }
        });
    }
};

// ==========================================
// INICIALIZADORES (Conectan con Enrutador)
// ==========================================
window.init_Perfil_de_la_Escuela = function() { ModEscuela.cargarPerfil(); };