/**
 * CONFIGURACIÓN CENTRAL - SIGAE v1.0
 * URLs y variables globales del entorno.
 */
const Configuracion = {
    // NUEVA URL OFICIAL CON TODOS LOS MÓDULOS ACTIVOS (Roles, Calendario, Cargos)
    API_URL: "https://script.google.com/macros/s/AKfycbzkiYtZbjlX8Dv8rzKomoMVWTTy29pWvbc1D0SLhPDLL4qmDpGjkbek7FPEWdlfnHFwNA/exec",
    
    obtenerApiUrl: function() {
        return this.API_URL;
    }
};