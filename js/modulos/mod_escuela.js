/**
 * MÓDULO: PERFIL DE LA ESCUELA (ACTUALIZADO A LOS NUEVOS IDs)
 * BLINDADO CON window.ModEscuela
 */

window.ModEscuela = {
    
    init: function() {
        this.cargarPerfil();
    },

    cargarPerfil: function() {
        window.Aplicacion.mostrarCarga();
        
        window.Aplicacion.peticion({ action: "get_school_profile" }, (res) => {
            window.Aplicacion.ocultarCarga();
            
            if (res && res.status === "success" && res.perfil) {
                let p = res.perfil;
                
                // Mapeo seguro: Solo asigna si el elemento existe en la pantalla
                if(document.getElementById('pe-nombre')) document.getElementById('pe-nombre').value = p.nombre || '';
                if(document.getElementById('pe-dea')) document.getElementById('pe-dea').value = p.dea || '';
                if(document.getElementById('pe-rif')) document.getElementById('pe-rif').value = p.rif || '';
                if(document.getElementById('pe-direccion')) document.getElementById('pe-direccion').value = p.direccion || '';
                if(document.getElementById('pe-mision')) document.getElementById('pe-mision').value = p.mision || '';
                if(document.getElementById('pe-vision')) document.getElementById('pe-vision').value = p.vision || '';
                if(document.getElementById('pe-objetivo')) document.getElementById('pe-objetivo').value = p.objetivo || '';
                if(document.getElementById('pe-peic')) document.getElementById('pe-peic').value = p.peic || '';
            }
        });
    },

    guardarPerfil: function() {
        let elNombre = document.getElementById('pe-nombre');
        
        // Validación estricta
        if (!elNombre || elNombre.value.trim() === '') {
            return Swal.fire('Atención', 'El Nombre Oficial de la Institución es obligatorio.', 'warning');
        }

        // Recolección de datos
        let payload = {
            action: "save_school_profile",
            nombre: elNombre.value.trim(),
            dea: document.getElementById('pe-dea') ? document.getElementById('pe-dea').value.trim() : '',
            rif: document.getElementById('pe-rif') ? document.getElementById('pe-rif').value.trim() : '',
            direccion: document.getElementById('pe-direccion') ? document.getElementById('pe-direccion').value.trim() : '',
            mision: document.getElementById('pe-mision') ? document.getElementById('pe-mision').value.trim() : '',
            vision: document.getElementById('pe-vision') ? document.getElementById('pe-vision').value.trim() : '',
            objetivo: document.getElementById('pe-objetivo') ? document.getElementById('pe-objetivo').value.trim() : '',
            peic: document.getElementById('pe-peic') ? document.getElementById('pe-peic').value.trim() : ''
        };

        window.Aplicacion.mostrarCarga();
        
        window.Aplicacion.peticion(payload, (res) => {
            window.Aplicacion.ocultarCarga();
            
            if (res && res.status === "success") {
                Swal.fire({ 
                    toast: true, 
                    position: 'top-end', 
                    icon: 'success', 
                    title: 'Perfil Institucional Guardado', 
                    showConfirmButton: false, 
                    timer: 2500 
                });
            } else {
                Swal.fire('Error', res.message || 'No se pudo guardar la información.', 'error');
            }
        });
    }
};

// Vinculación estricta con el Enrutador
window.init_Perfil_de_la_Escuela = function() {
    window.ModEscuela.init();
};