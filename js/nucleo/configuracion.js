/**
 * CONFIGURACIÓN CENTRAL - SIGAE v1.0
 * URLs y variables globales del entorno.
 */
const Configuracion = {
    // NUEVA URL OFICIAL CON TODOS LOS MÓDULOS ACTIVOS (Roles, Calendario, Cargos)
    API_URL: "https://script.google.com/macros/s/AKfycby7ulR-EBOoYbiY8LVkOzE52ofa2W5QsBx74aCEuC8PO90WUwnMtEky1Ic34PnmLYs9/exec",
    
    obtenerApiUrl: function() {
        return this.API_URL;
    }
};