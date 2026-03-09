/**
 * CONFIGURACIÓN CENTRAL - SIGAE v1.0
 * URLs y variables globales del entorno.
 */
const Configuracion = {
    // NUEVA URL OFICIAL CON TODOS LOS MÓDULOS ACTIVOS (Roles, Calendario, Cargos)
    API_URL: "https://script.google.com/macros/s/AKfycbyWbmvHHvLfOiTcNCeiJJH_YXBUkO-8kC0cB7nOveI_8tVWWbPuT0GMQ8HUjdeahrR0xg/exec",
    
    obtenerApiUrl: function() {
        return this.API_URL;
    }
};