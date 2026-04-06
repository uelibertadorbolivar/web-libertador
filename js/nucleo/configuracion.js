/**
 * CONFIGURACIÓN CENTRAL - SIGAE v1.0
 * URLs y variables globales del entorno.
 */
const Configuracion = {
    // NUEVA URL OFICIAL CON TODOS LOS MÓDULOS ACTIVOS (Roles, Calendario, Cargos)
    API_URL: "https://script.google.com/macros/s/AKfycbwPXUgSyz0V3McJVjjKBJ44Iu6TEHjc39k13rz_SNmUHwJ5VBsidDNGGnodV9qNGT0zcw/exec",
    
    obtenerApiUrl: function() {
        return this.API_URL;
    }
};