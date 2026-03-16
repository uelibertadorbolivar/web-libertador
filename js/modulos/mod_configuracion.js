/**
 * MÓDULO: CONFIGURACIÓN DEL SISTEMA (TARJETAS PREMIUM BENTO BOX)
 */
window.ModConfiguracion = {
    datosConfig: [], editandoId: null, editandoCat: null, vistaActualOculta: null,
    
    init: function() { this.dibujarDashboardTarjetas(); this.cargarConfiguracion(); },

    dibujarDashboardTarjetas: function() {
        let pVer = window.Aplicacion.permiso('Configuración del Sistema', 'ver');
        
        const estilos = `<style>.tarjeta-sub { background: #ffffff; border-radius: 20px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; overflow: hidden; position: relative; display: flex; flex-direction: column; text-align: left; }.tarjeta-sub:hover { transform: translateY(-8px); box-shadow: 0 15px 35px rgba(0,0,0,0.1) !important; }.tarjeta-sub .bg-icono-gigante { position: absolute; right: -20px; bottom: -20px; font-size: 8rem; opacity: 0.03; transition: transform 0.5s ease; pointer-events: none; }.tarjeta-sub:hover .bg-icono-gigante { transform: scale(1.2) rotate(-10deg); }.tarjeta-sub .icono-sub { width: 60px; height: 60px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin-bottom: 1.2rem; transition: transform 0.3s ease; }.tarjeta-sub:hover .icono-sub { transform: scale(1.1); }.tarjeta-sub.bloqueado { filter: grayscale(100%); opacity: 0.7; cursor: not-allowed; }</style>`;
        let cAzul = { bg: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)', b: '#bfdbfe', t: '#0066FF' };
        let cNara = { bg: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)', b: '#fde68a', t: '#d97706' };
        let cVerd = { bg: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)', b: '#bbf7d0', t: '#198754' };

        let crearTarjeta = (tit, desc, ico, acc, c, px, col) => {
            if(!px) return `<div class="${col}"><div class="tarjeta-sub p-4 h-100 shadow-sm bloqueado" style="background:#f8fafc; border:1px solid #e2e8f0;" onclick="Swal.fire('Bloqueado','Sin permisos','error')"><i class="bi ${ico} text-muted bg-icono-gigante"></i><div class="icono-sub shadow-sm" style="color:#64748b; background:white; border:1px solid #e2e8f0;"><i class="bi bi-lock-fill"></i></div><h5 class="fw-bold text-muted mb-2" style="position:relative; z-index:2;">${tit}</h5><p class="small text-muted mb-0" style="position:relative; z-index:2;">${desc}</p></div></div>`;
            return `<div class="${col} animate__animated animate__fadeInUp"><div class="tarjeta-sub p-4 h-100 shadow-sm" style="background:${c.bg}; border:1px solid ${c.b};" onclick="${acc}"><i class="bi ${ico} text-dark bg-icono-gigante"></i><div class="icono-sub shadow-sm" style="color:${c.t}; background:white; border:1px solid ${c.b};"><i class="bi ${ico}"></i></div><h5 class="fw-bold text-dark mb-2" style="position:relative; z-index:2;">${tit}</h5><p class="small text-muted mb-0" style="position:relative; z-index:2;">${desc}</p><div class="mt-auto pt-3 d-flex align-items-center fw-bold" style="color:${c.t}; font-size:0.9rem; position:relative; z-index:2;">Entrar <i class="bi bi-arrow-right ms-2"></i></div></div></div>`;
        };

        let html = estilos + 
            crearTarjeta('Períodos Escolares', 'Gestión de años escolares.', 'bi-calendar-event', "window.ModConfiguracion.abrirVistaSegura('Periodos')", cAzul, pVer, 'col-md-4') +
            crearTarjeta('Fases / Lapsos', 'Control de momentos evaluativos.', 'bi-clock-history', "window.ModConfiguracion.abrirVistaSegura('Lapsos')", cNara, pVer, 'col-md-4') +
            crearTarjeta('Niveles Educativos', 'Inicial, Primaria, Media, etc.', 'bi-layers-fill', "window.ModConfiguracion.abrirVistaSegura('Niveles')", cVerd, pVer, 'col-md-4');

        document.getElementById('config-dashboard').innerHTML = html;
        if(!window.Aplicacion.permiso('Configuración del Sistema', 'crear')) { ['periodos', 'lapsos', 'niveles'].forEach(c => { let d = document.getElementById(`form-${c}-area`); if(d) d.innerHTML = `<div class="text-center py-4"><i class="bi bi-lock fs-1 text-muted"></i><p class="mt-2 small text-danger fw-bold">Sin permiso para crear</p></div>`; }); }
    },

    abrirVistaSegura: function(vista) {
        if(!window.Aplicacion.permiso('Configuración del Sistema', 'ver')) return;
        let dash = document.getElementById('config-dashboard'); dash.classList.add('animate__fadeOutLeft');
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
            let dash = document.getElementById('config-dashboard');
            dash.classList.remove('d-none'); dash.classList.add('animate__fadeInLeft');
            let btnRetrocesoPadre = document.querySelector('.btn-white.shadow-sm.border.rounded-pill');
            if(btnRetrocesoPadre) btnRetrocesoPadre.parentElement.style.display = 'block';
            this.vistaActualOculta = null; this.cancelarEdicion();
        }, 300);
    },

    cargarConfiguracion: function() { window.Aplicacion.mostrarCarga(); window.Aplicacion.peticion({ action: "get_config" }, (d) => { window.Aplicacion.ocultarCarga(); if(d && d.periodos) { this.datosConfig = d.periodos.concat(d.lapsos).concat(d.niveles); this.dibujarTablas(d); } }); },

    dibujarTablas: function(d) {
        let pE = window.Aplicacion.permiso('Configuración del Sistema', 'editar'); let pL = window.Aplicacion.permiso('Configuración del Sistema', 'eliminar');
        let generarFila = (item) => {
            let btnE = pE ? `<button class="btn btn-sm btn-light border text-primary me-1" onclick="window.ModConfiguracion.cargarParaEditar('${item.id}', '${item.categoria}')"><i class="bi bi-pencil"></i></button>` : '';
            let btnL = pL ? `<button class="btn btn-sm btn-light border text-danger" onclick="window.ModConfiguracion.eliminarConfiguracion('${item.id}')"><i class="bi bi-trash"></i></button>` : '';
            let fechas = item.inicio ? `<span class="small text-muted">${item.inicio} al ${item.fin}</span>` : '-';
            let bColor = item.estado==='Activo'?'bg-success':(item.estado==='Próximo'?'bg-warning text-dark':'bg-secondary');
            return `<tr><td class="ps-3 fw-bold">${item.valor}</td><td>${fechas}</td><td><span class="badge ${bColor}">${item.estado}</span></td><td class="text-end pe-3">${btnE}${btnL}</td></tr>`;
        };
        document.getElementById('tabla-periodos').innerHTML = d.periodos.map(generarFila).join('') || `<tr><td colspan="4" class="text-center py-3">Vacío</td></tr>`;
        document.getElementById('tabla-lapsos').innerHTML = d.lapsos.map(generarFila).join('') || `<tr><td colspan="4" class="text-center py-3">Vacío</td></tr>`;
        document.getElementById('tabla-niveles').innerHTML = d.niveles.map(generarFila).join('') || `<tr><td colspan="4" class="text-center py-3">Vacío</td></tr>`;
    },

    guardarConfiguracion: function(cat, idTxt, idIni, idFin) {
        let val = document.getElementById(idTxt).value.trim(); let ini = idIni ? document.getElementById(idIni).value : null; let fin = idFin ? document.getElementById(idFin).value : null;
        if(!val) return Swal.fire('Aviso', 'Falta el nombre', 'warning');
        let payload = { action: 'save_config', categoria: cat, valor: val };
        if(ini && fin) { payload.inicio = ini; payload.fin = fin; }
        if(this.editandoId && this.editandoCat === cat) payload.id = this.editandoId;
        window.Aplicacion.mostrarCarga(); window.Aplicacion.peticion(payload, (res) => { window.Aplicacion.ocultarCarga(); if(res && res.status === 'success') { this.cancelarEdicion(); this.cargarConfiguracion(); Swal.fire({toast:true, icon:'success', title:'Guardado', timer:2000, showConfirmButton:false}); } });
    },

    eliminarConfiguracion: function(id) { Swal.fire({title:'¿Borrar?', icon:'warning', showCancelButton:true}).then(r=>{ if(r.isConfirmed) { window.Aplicacion.peticion({action:'delete_config', id: id}, ()=>{this.cargarConfiguracion();}); } }); },
    cargarParaEditar: function(id, cat) { Swal.fire('Edición', 'Para editar fechas, por favor elimine el registro y créelo nuevamente.', 'info'); },
    cancelarEdicion: function() { ['txt-periodo', 'fecha-inicio-periodo', 'fecha-fin-periodo', 'txt-lapso', 'fecha-inicio-lapso', 'fecha-fin-lapso', 'txt-nivel'].forEach(id => { let el = document.getElementById(id); if(el) el.value = ''; }); }
};
window.init_Configuración_del_Sistema = function() { window.ModConfiguracion.init(); };