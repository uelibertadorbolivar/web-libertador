/**
 * CONFIGURACIÓN CENTRAL - SIGAE v1.0
 * URLs y variables globales del entorno.
 */
const Configuracion = {
    // NUEVA URL OFICIAL CON TODOS LOS MÓDULOS ACTIVOS (Roles, Calendario, Cargos)
    API_URL: "https://script.google.com/macros/s/AKfycbzKGKaxwaQ-raMjJKUCdpVlul7eBtIaiGMXKcnAUC3FuYKV4eFk47bdujyMfcXQ-y4Iyg/exec",
    
    obtenerApiUrl: function() {
        return this.API_URL;
    }
};