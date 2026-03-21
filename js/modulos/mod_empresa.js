/**
 * MÓDULO: ESTRUCTURA CORPORATIVA DE LA EMPRESA
 * Gestión de diccionarios dinámicos para formularios (Nómina, Parentesco, Condición, etc).
 */

window.ModEmpresa = {
    datos: [],
    categoriaActual: null,
    
    init: function() {
        this.cargarDatos();
    },

    cargarDatos: function(silencioso = false) {
        if(!silencioso) window.Aplicacion.mostrarCarga();
        window.Aplicacion.peticion({ action: "get_empresa" }, (res) => {
            if(!silencioso) window.Aplicacion.ocultarCarga();
            if (res && (res.status === "success" || res.data)) {
                this.datos = res.data || [];
                if(this.categoriaActual) this.dibujarTabla();
            }
        });
    },

    abrirVista: function(categoria) {
        this.categoriaActual = categoria;
        document.getElementById('empresa-dashboard').classList.add('d-none');
        
        let panel = document.getElementById('vista-gestion-empresa');
        panel.classList.remove('d-none');
        panel.classList.add('animate__fadeInRight');
        
        let iconos = {
            'Nómina': 'bi-card-checklist',
            'Parentesco': 'bi-people-fill',
            'Condición': 'bi-person-badge-fill',
            'Negocio/Filial': 'bi-building',
            'Organización/Gerencia': 'bi-briefcase-fill'
        };

        let iconoClase = iconos[categoria] || 'bi-list-ul';
        
        document.getElementById('titulo-gestion-empresa').innerHTML = `<i class="bi ${iconoClase} text-secondary me-2"></i> Directorio de ${categoria}`;
        document.getElementById('txt-nuevo-item-empresa').placeholder = `Añadir a la lista de ${categoria}...`;
        
        this.dibujarTabla();
    },

    volverDashboard: function() {
        let panel = document.getElementById('vista-gestion-empresa');
        panel.classList.replace('animate__fadeInRight', 'animate__fadeOutRight');
        setTimeout(() => {
            panel.classList.add('d-none');
            panel.classList.remove('animate__fadeOutRight');
            document.getElementById('empresa-dashboard').classList.remove('d-none');
            this.categoriaActual = null;
        }, 300);
    },

    dibujarTabla: function() {
        const tbody = document.getElementById('tabla-empresa-items');
        if(!tbody) return;
        
        let filtrados = this.datos.filter(d => d.categoria === this.categoriaActual);
        
        if(filtrados.length === 0) {
            tbody.innerHTML = `<tr><td colspan="2" class="text-center py-5 text-muted"><i class="bi bi-inbox fs-1 d-block mb-3"></i>No hay registros en esta categoría.</td></tr>`;
            return;
        }

        let html = '';
        filtrados.forEach(item => {
            html += `<tr>
                <td class="ps-3 fw-bold text-dark"><i class="bi bi-record-circle-fill text-secondary me-2 small"></i>${item.nombre}</td>
                <td class="text-end pe-3">
                    <button class="btn btn-sm btn-light border text-danger shadow-sm hover-efecto" onclick="window.ModEmpresa.eliminarItem('${item.id}')">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </td>
            </tr>`;
        });
        tbody.innerHTML = html;
    },

    guardarItem: function() {
        let input = document.getElementById('txt-nuevo-item-empresa');
        let nombre = input.value.trim();
        
        if(!nombre) return Swal.fire('Atención', 'Debe escribir un nombre.', 'warning');
        
        let existe = this.datos.find(d => d.categoria === this.categoriaActual && d.nombre.toLowerCase() === nombre.toLowerCase());
        if(existe) return Swal.fire('Atención', 'Este registro ya existe en la lista.', 'warning');

        window.Aplicacion.mostrarCarga();
        window.Aplicacion.peticion({ 
            action: 'save_empresa', 
            categoria: this.categoriaActual, 
            nombre: nombre 
        }, (res) => {
            window.Aplicacion.ocultarCarga();
            if(res && res.status === 'success') {
                input.value = ''; 
                Swal.fire({toast:true, position:'top-end', icon:'success', title:'Guardado', showConfirmButton:false, timer:2000});
                this.cargarDatos(true);
            }
        });
    },

    eliminarItem: function(id) {
        Swal.fire({
            title: '¿Borrar Registro?',
            text: "Se eliminará permanentemente de las listas desplegables del sistema.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Sí, borrar'
        }).then((result) => {
            if (result.isConfirmed) {
                window.Aplicacion.mostrarCarga();
                window.Aplicacion.peticion({ action: 'delete_empresa', id: id }, (res) => {
                    window.Aplicacion.ocultarCarga();
                    if(res && res.status === 'success') { this.cargarDatos(true); }
                });
            }
        });
    }
};

window.init_Empresa = function() { window.ModEmpresa.init(); };