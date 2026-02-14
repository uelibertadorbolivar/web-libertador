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

        // Buscar el label en la estructura para el título
        let title = "Módulo";
        systemStructure.forEach(cat => {
            const item = cat.items.find(i => i.id === hash);
            if(item) title = item.label;
        });

        App.renderView(hash, title);
    }
};