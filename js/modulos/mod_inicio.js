/**
 * MÓDULO: PANEL PRINCIPAL (INICIO)
 * ADAPTADO AL DISEÑO 3D (FLIP CARDS) Y BANNER INTERACTIVO
 */

window.ModInicio = {
    init: function() {
        this.configurarFechaInmediata();
        this.cargarPerfilEscuela();
        this.cargarEstadisticas();
    },

    // 1. Carga la fecha sincronizada por internet
    configurarFechaInmediata: function() {
        let opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        
        // ✨ CORRECCIÓN: Llamamos a obtenerFechaReal() para asegurar la sincronización ✨
        let fechaReal = window.Aplicacion.obtenerFechaReal(); 
        
        let textoFecha = fechaReal.toLocaleDateString('es-VE', opcionesFecha);
        textoFecha = textoFecha.charAt(0).toUpperCase() + textoFecha.slice(1);
        
        let cajaFecha = document.getElementById('reloj-vivo');
        if (cajaFecha) {
            cajaFecha.innerText = textoFecha;
        }
    },

    // 2. Inyecta los datos de la BD en las partes traseras
    cargarPerfilEscuela: function() {
        window.Aplicacion.peticion({ action: "get_school_profile" }, (res) => {
            if (res && res.status === "success" && res.perfil) {
                let p = res.perfil;
                
                let inyectar = (id, texto) => {
                    let elemento = document.getElementById(id);
                    if (elemento && texto) {
                        elemento.innerText = texto;
                    }
                };

                // Banner superior
                inyectar('lbl-dea-escuela', p.dea);
                inyectar('lbl-rif-escuela', p.rif);
                inyectar('lbl-direccion-escuela', p.direccion);
                
                // Caras traseras de las Flip Cards 3D
                inyectar('lbl-mision-back', p.mision);
                inyectar('lbl-vision-back', p.vision);
                
                if(p.objetivo) inyectar('lbl-objetivo-back', p.objetivo);
                if(p.peic) inyectar('lbl-peic-back', p.peic);
            }
        });
    },

    // 3. Contadores estadísticos
    cargarEstadisticas: function() {
        window.Aplicacion.peticion({ action: "get_users" }, (res) => {
            if (res && res.users) {
                let totalUsuarios = res.users.length;
                let totalDocentes = res.users.filter(u => u.rol === 'Docente').length;
                let totalBloqueados = res.users.filter(u => u.estado === 'Bloqueado').length;

                let cU = document.getElementById('lbl-usuarios'); if (cU) cU.innerText = totalUsuarios;
                let cD = document.getElementById('lbl-docentes'); if (cD) cD.innerText = totalDocentes;
                let cB = document.getElementById('lbl-bloqueados'); if (cB) cB.innerText = totalBloqueados;
            }
        });
    }
};

window.init_Inicio = function() {
    window.ModInicio.init();
};