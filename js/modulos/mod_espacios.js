/**
 * MÓDULO: ESPACIOS Y AMBIENTES (TARJETAS PREMIUM BENTO BOX)
 */
window.ModEspacios = {
    espacios: [], editandoId: null, vistaActualOculta: null,
    paginaActual: 1, itemsPorPagina: 6,

    init: function() { this.dibujarDashboardTarjetas(); this.cargarEspacios(); },

    dibujarDashboardTarjetas: function() {
        let pVer = window.Aplicacion.permiso('Espacios Escolares', 'ver');
        
        const estilos = `<style>.tarjeta-sub { background: #ffffff; border-radius: 20px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; overflow: hidden; position: relative; display: flex; flex-direction: column; text-align: left; }.tarjeta-sub:hover { transform: translateY(-8px); box-shadow: 0 15px 35px rgba(0,0,0,0.1) !important; }.tarjeta-sub .bg-icono-gigante { position: absolute; right: -20px; bottom: -20px; font-size: 8rem; opacity: 0.03; transition: transform 0.5s ease; pointer-events: none; }.tarjeta-sub:hover .bg-icono-gigante { transform: scale(1.2) rotate(-10deg); }.tarjeta-sub .icono-sub { width: 60px; height: 60px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin-bottom: 1.2rem; transition: transform 0.3s ease; }.tarjeta-sub:hover .icono-sub { transform: scale(1.1); }.tarjeta-sub.bloqueado { filter: grayscale(100%); opacity: 0.7; cursor: not-allowed; }</style>`;
        let cCyan = { bg: 'linear-gradient(135deg, #ffffff 0%, #ecfeff 100%)', b: '#a5f3fc', t: '#0dcaf0' };
        let cAzul = { bg: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)', b: '#bfdbfe', t: '#0066FF' };

        let crearTarjeta = (tit, desc, ico, acc, c, px, col) => {
            if(!px) return `<div class="${col}"><div class="tarjeta-sub p-4 h-100 shadow-sm bloqueado" style="background:#f8fafc; border:1px solid #e2e8f0;" onclick="Swal.fire('Bloqueado','Sin permisos','error')"><i class="bi ${ico} text-muted bg-icono-gigante"></i><div class="icono-sub shadow-sm" style="color:#64748b; background:white; border:1px solid #e2e8f0;"><i class="bi bi-lock-fill"></i></div><h5 class="fw-bold text-muted mb-2" style="position:relative; z-index:2;">${tit}</h5><p class="small text-muted mb-0" style="position:relative; z-index:2;">${desc}</p></div></div>`;
            return `<div class="${col} animate__animated animate__fadeInUp"><div class="tarjeta-sub p-4 h-100 shadow-sm" style="background:${c.bg}; border:1px solid ${c.b};" onclick="${acc}"><i class="bi ${ico} text-dark bg-icono-gigante"></i><div class="icono-sub shadow-sm" style="color:${c.t}; background:white; border:1px solid ${c.b};"><i class="bi ${ico}"></i></div><h5 class="fw-bold text-dark mb-2" style="position:relative; z-index:2;">${tit}</h5><p class="small text-muted mb-0" style="position:relative; z-index:2;">${desc}</p><div class="mt-auto pt-3 d-flex align-items-center fw-bold" style="color:${c.t}; font-size:0.9rem; position:relative; z-index:2;">Entrar <i class="bi bi-arrow-right ms-2"></i></div></div></div>`;
        };

        let html = estilos + 
            crearTarjeta('Directorio de Espacios', 'Ver todos los ambientes registrados.', 'bi-list-columns-reverse', "window.ModEspacios.abrirVisorSeguro('Directorio')", cCyan, pVer, 'col-md-6') +
            crearTarjeta('Nuevo Espacio', 'Añadir aulas, laboratorios u oficinas.', 'bi-plus-square-fill', "window.ModEspacios.abrirPlanificador()", cAzul, pVer, 'col-md-6');

        document.getElementById('espacios-dashboard').innerHTML = html;
        if(!window.Aplicacion.permiso('Espacios Escolares', 'crear')) { document.getElementById('form-espacios-area').innerHTML = `<div class="text-center py-5"><i class="bi bi-lock text-danger fs-1"></i><h5 class="mt-3 text-muted">No tiene permisos.</h5></div>`; }
    },

    abrirVisorSeguro: function(vista) {
        if(!window.Aplicacion.permiso('Espacios Escolares', 'ver')) return;
        this.paginaActual = 1; this.ejecutarTransicion(vista); if(vista === 'Directorio') this.dibujarTabla();
    },

    abrirPlanificador: function() {
        if(!window.Aplicacion.permiso('Espacios Escolares', 'ver')) return;
        this.ejecutarTransicion('Registro');
    },

    ejecutarTransicion: function(vista) {
        let dash = document.getElementById('espacios-dashboard'); dash.classList.add('animate__fadeOutLeft');
        setTimeout(() => {
            dash.classList.add('d-none'); dash.classList.remove('animate__fadeOutLeft');
            let panel = document.getElementById(`vista-${vista.toLowerCase()}`);
            panel.classList.remove('d-none'); panel.classList.add('animate__fadeInRight');
            let btnRetrocesoPadre = document.querySelector('.btn-white.shadow-sm.border.rounded-pill');
            if(btnRetrocesoPadre) btnRetrocesoPadre.parentElement.style.display = 'none';
            document.getElementById('btn-volver-dashboard').classList.remove('d-none');
            this.vistaActualOculta = vista;
        }, 300);
    },

    volverDashboard: function() {
        if(!this.vistaActualOculta) return;
        let panel = document.getElementById(`vista-${this.vistaActualOculta.toLowerCase()}`);
        panel.classList.replace('animate__fadeInRight', 'animate__fadeOutRight');
        document.getElementById('btn-volver-dashboard').classList.add('d-none');
        setTimeout(() => {
            panel.classList.add('d-none'); panel.classList.remove('animate__fadeOutRight');
            let dash = document.getElementById('espacios-dashboard');
            dash.classList.remove('d-none'); dash.classList.add('animate__fadeInLeft');
            let btnRetrocesoPadre = document.querySelector('.btn-white.shadow-sm.border.rounded-pill');
            if(btnRetrocesoPadre) btnRetrocesoPadre.parentElement.style.display = 'block';
            this.vistaActualOculta = null; this.cancelarEdicion();
        }, 300);
    },

    cargarEspacios: function(silencioso = false) { window.Aplicacion.mostrarCarga(); window.Aplicacion.peticion({ action: "get_espacios" }, (res) => { window.Aplicacion.ocultarCarga(); this.espacios = (res && res.espacios) ? res.espacios : []; if(this.vistaActualOculta === 'Directorio') this.dibujarTabla(); }); },

    cambiarPagina: function(nuevaPagina) { this.paginaActual = nuevaPagina; this.dibujarTabla(); },

    dibujarTabla: function() {
        const tbody = document.getElementById('tabla-espacios'); const paginador = document.getElementById('paginacion-espacios'); if(!tbody) return;
        let pEditar = window.Aplicacion.permiso('Espacios Escolares', 'editar'); let pEliminar = window.Aplicacion.permiso('Espacios Escolares', 'eliminar');
        let totalItems = this.espacios.length; let totalPaginas = Math.ceil(totalItems / this.itemsPorPagina); if (totalPaginas === 0) totalPaginas = 1; if (this.paginaActual > totalPaginas) this.paginaActual = totalPaginas;
        let inicioPagina = (this.paginaActual - 1) * this.itemsPorPagina; let finPagina = inicioPagina + this.itemsPorPagina; let listaPagina = this.espacios.slice(inicioPagina, finPagina);

        let html = '';
        listaPagina.forEach(e => {
            let btnE = pEditar ? `<button class="btn btn-sm btn-light border text-primary me-1 shadow-sm" onclick="window.ModEspacios.editarEspacio('${e.id}')"><i class="bi bi-pencil"></i></button>` : '';
            let btnL = pEliminar ? `<button class="btn btn-sm btn-light border text-danger shadow-sm" onclick="window.ModEspacios.eliminarEspacio('${e.id}')"><i class="bi bi-trash"></i></button>` : '';
            let colorBadge = e.tipo.includes('Aula') ? 'primary' : (e.tipo.includes('Laboratorio') ? 'info text-dark' : 'secondary');
            html += `<tr class="animate__animated animate__fadeIn"><td class="ps-3 align-middle"><span class="badge bg-${colorBadge} px-2 py-1 shadow-sm">${e.tipo}</span></td><td class="align-middle fw-bold text-dark fs-6">${e.nombre}</td><td class="align-middle text-center"><span class="badge bg-light text-dark border"><i class="bi bi-people-fill me-1"></i> ${e.capacidad} pax</span></td><td class="text-end pe-3 align-middle">${btnE}${btnL}</td></tr>`;
        });
        tbody.innerHTML = html || `<tr><td colspan="4" class="text-center py-5"><i class="bi bi-building-slash fs-1 text-muted d-block mb-3"></i><span class="text-muted fw-bold">No hay espacios registrados aún.</span></td></tr>`;

        if(paginador) {
            if(totalItems > 0) {
                let btnPrev = `<button class="btn btn-sm btn-outline-info fw-bold" ${this.paginaActual === 1 ? 'disabled' : ''} onclick="window.ModEspacios.cambiarPagina(${this.paginaActual - 1})"><i class="bi bi-chevron-left me-1"></i> Anterior</button>`;
                let btnNext = `<button class="btn btn-sm btn-outline-info fw-bold" ${this.paginaActual === totalPaginas ? 'disabled' : ''} onclick="window.ModEspacios.cambiarPagina(${this.paginaActual + 1})">Siguiente <i class="bi bi-chevron-right ms-1"></i></button>`;
                paginador.innerHTML = `<div class="small text-muted fw-bold mb-2 mb-md-0"><i class="bi bi-card-list me-1"></i> Mostrando ${inicioPagina + 1} al ${Math.min(finPagina, totalItems)} de ${totalItems} ambientes</div><div class="d-flex gap-2 align-items-center justify-content-center">${btnPrev}<span class="badge bg-info text-dark rounded-pill px-3 py-2 shadow-sm">Pág. ${this.paginaActual} de ${totalPaginas}</span>${btnNext}</div>`;
                paginador.classList.remove('d-none');
            } else { paginador.innerHTML = ''; paginador.classList.add('d-none'); }
        }
    },

    guardarEspacio: function() {
        let n = document.getElementById('esp-nombre').value.trim(); let c = document.getElementById('esp-capacidad').value.trim(); let t = document.getElementById('esp-tipo').value;
        if(!n || !c) return Swal.fire('Aviso', 'Debe ingresar el nombre y la capacidad.', 'warning');
        
        let payload = { action:'save_espacio', nombre: n, capacidad: c, tipo: t }; 
        if(this.editandoId) payload.id = this.editandoId;
        
        window.Aplicacion.mostrarCarga(); 
        window.Aplicacion.peticion(payload, res => { 
            window.Aplicacion.ocultarCarga(); 
            
            if(res && res.status === 'success') { 
                Swal.fire({toast:true, position:'top-end', icon:'success', title:'Guardado', timer:2000, showConfirmButton:false}); 
                this.cancelarEdicion(); 
                this.cargarEspacios(true); 
                this.volverDashboard(); 
            } else { 
                // ✨ ESTA LÍNEA AHORA MOSTRARÁ EL ERROR REAL DEL SERVIDOR ✨
                let mensajeError = res && res.message ? res.message : 'Error desconocido de conexión.';
                Swal.fire('Atención del Servidor', mensajeError, 'error'); 
            } 
        });
    },

    eliminarEspacio: function(id) { Swal.fire({title:'¿Eliminar este ambiente?', icon:'warning', showCancelButton:true}).then(r=>{ if(r.isConfirmed){ window.Aplicacion.peticion({action:'delete_espacio', id:id}, ()=>this.cargarEspacios(true)); } }); },
    editarEspacio: function(id) { let e = this.espacios.find(x => x.id === id); if(e) { this.editandoId = id; document.getElementById('esp-nombre').value = e.nombre; document.getElementById('esp-capacidad').value = e.capacidad; document.getElementById('esp-tipo').value = e.tipo; document.getElementById('btn-guardar-espacio').innerHTML = '<i class="bi bi-save-fill me-2"></i>Actualizar Espacio'; this.ejecutarTransicion('Registro'); } },
    cancelarEdicion: function() { this.editandoId=null; document.getElementById('esp-nombre').value=''; document.getElementById('esp-capacidad').value=''; document.getElementById('btn-guardar-espacio').innerHTML='<i class="bi bi-save-fill me-2"></i>Guardar Espacio'; }
};

window.init_Espacios_Escolares = function() { window.ModEspacios.init(); };