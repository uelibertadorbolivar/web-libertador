/**
 * ENRUTAMIENTO SPA - SIGAE v3.1
 */
const Router = {
    init: function() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
    },
    
    handleRoute: function() {
        const hash = window.location.hash.replace('#', '') || 'dashboard';
        document.body.classList.remove('sidebar-open');
        
        if (hash === 'dashboard') {
            App.showDashboard();
            return;
        }
        
        // Buscar el título en la estructura del sistema
        let title = "Módulo";
        
        systemStructure.forEach(cat => {
            const item = cat.items.find(i => i === hash);
            if (item) title = item;
        });
        
        App.renderView(hash, title);
    }
};