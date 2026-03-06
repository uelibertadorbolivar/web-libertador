/**
 * MÓDULO: INICIO (DASHBOARD PRINCIPAL)
 * Encargado de cargar el resumen estadístico y el perfil de la escuela.
 */

const ModInicio = {
    cargarDatosInicio: function() {
        // Hacemos una petición silenciosa al servidor para traer el perfil de la escuela
        Aplicacion.peticion({ action: "get_school_profile" }, (res) => {
            if(res.status === "success" && res.perfil && res.perfil.nombre) {
                const p = res.perfil;
                
                // 1. Actualizar Título Principal y Tarjeta de Identificación
                const elNombre = document.getElementById('dash-nombre-escuela');
                const elRif = document.getElementById('dash-rif');
                const elDea = document.getElementById('dash-dea');
                const elDir = document.getElementById('dash-direccion');
                
                if(elNombre) elNombre.innerText = p.nombre || "Institución Sin Nombre";
                if(elRif) elRif.innerText = p.rif || "No registrado";
                if(elDea) elDea.innerText = p.dea || "No registrado";
                if(elDir) elDir.innerText = p.direccion || "No registrada";
                
                // 2. Actualizar Tarjeta de Filosofía de Gestión (Pestañas)
                const elMision = document.getElementById('dash-mision');
                const elVision = document.getElementById('dash-vision');
                const elPeic = document.getElementById('dash-peic');
                
                if(elMision) elMision.innerText = p.mision || "Misión no definida en el sistema.";
                if(elVision) elVision.innerText = p.vision || "Visión no definida en el sistema.";
                if(elPeic) elPeic.innerText = p.peic || "PEIC no registrado.";
                
            } else {
                // Mensaje por defecto si el usuario aún no ha guardado nada en "Perfil de la Escuela"
                const elNombre = document.getElementById('dash-nombre-escuela');
                if(elNombre) elNombre.innerText = "Bienvenido al SIGAE";
            }
        });
    },

    descargarOrganigrama: function() {
        Swal.fire({
            title: 'Generando Organigrama',
            text: 'Esta función compilará tu plantilla docente y generará un PDF oficial. Estará disponible en la próxima actualización.',
            icon: 'info',
            confirmButtonColor: 'var(--color-primario)'
        });
    }
};

// ==========================================
// INICIALIZADOR (Se ejecuta automáticamente al entrar a Inicio)
// ==========================================
window.init_Inicio = function() { 
    ModInicio.cargarDatosInicio(); 
};