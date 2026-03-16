/**
 * MÓDULO: COLECTIVOS EDUCATIVOS Y COORDINACIONES
 * ACTUALIZADO: LIMPIEZA DE FORMULARIO E INDICADORES VISUALES DE CONFORMACIÓN
 */
window.ModColectivos = {
    colectivos: [], personalActivo: [], editandoId: null, vistaActualOculta: null,

    init: function() { this.dibujarDashboardTarjetas(); this.cargarDatosInciales(); },

    dibujarDashboardTarjetas: function() {
        const estilos = `<style>.tarjeta-sub { background: #ffffff; border-radius: 20px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; overflow: hidden; position: relative; display: flex; flex-direction: column; text-align: left; }.tarjeta-sub:hover { transform: translateY(-8px); box-shadow: 0 15px 35px rgba(0,0,0,0.1) !important; }.tarjeta-sub .bg-icono-gigante { position: absolute; right: -20px; bottom: -20px; font-size: 8rem; opacity: 0.03; transition: transform 0.5s ease; pointer-events: none; }.tarjeta-sub:hover .bg-icono-gigante { transform: scale(1.2) rotate(-10deg); }.tarjeta-sub .icono-sub { width: 60px; height: 60px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin-bottom: 1.2rem; transition: transform 0.3s ease; }.tarjeta-sub:hover .icono-sub { transform: scale(1.1); }</style>`;
        let cRojo = { bg: 'linear-gradient(135deg, #ffffff 0%, #fff1f2 100%)', b: '#fecdd3', t: '#e11d48' };
        let cAzul = { bg: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)', b: '#bfdbfe', t: '#0066FF' };

        let crearTarjeta = (tit, desc, ico, acc, c, col) => {
            return `<div class="${col} animate__animated animate__fadeInUp"><div class="tarjeta-sub p-4 h-100 shadow-sm" style="background:${c.bg}; border:1px solid ${c.b};" onclick="${acc}"><i class="bi ${ico} text-dark bg-icono-gigante"></i><div class="icono-sub shadow-sm" style="color:${c.t}; background:white; border:1px solid ${c.b};"><i class="bi ${ico}"></i></div><h5 class="fw-bold text-dark mb-2" style="position:relative; z-index:2;">${tit}</h5><p class="small text-muted mb-0" style="position:relative; z-index:2;">${desc}</p><div class="mt-auto pt-3 d-flex align-items-center fw-bold" style="color:${c.t}; font-size:0.9rem; position:relative; z-index:2;">Entrar <i class="bi bi-arrow-right ms-2"></i></div></div></div>`;
        };

        let html = estilos + 
            crearTarjeta('Registrar Colectivos', 'Crea colectivos, brigadas y coordinaciones.', 'bi-bookmark-plus-fill', "window.ModColectivos.cambiarVista('Directorio')", cRojo, 'col-md-6') + 
            crearTarjeta('Asignar Integrantes', 'Define el Asesor, Vocero y demás miembros.', 'bi-people-fill', "window.ModColectivos.cambiarVista('Asignacion')", cAzul, 'col-md-6');
        
        document.getElementById('colectivos-dashboard').innerHTML = html;
    },

    cambiarVista: function(vistaDestino) {
        const vistas = ['colectivos-dashboard', 'vista-directorio', 'vista-asignacion'];
        vistas.forEach(v => { let el = document.getElementById(v); if(el) el.classList.add('d-none'); });
        
        if (vistaDestino === 'Dashboard') {
            document.getElementById('colectivos-dashboard').classList.remove('d-none');
            document.getElementById('btn-volver-dashboard').classList.add('d-none');
            this.vistaActualOculta = null; this.cancelarEdicion();
        } else {
            let panel = document.getElementById(`vista-${vistaDestino.toLowerCase()}`);
            if(panel) panel.classList.remove('d-none');
            document.getElementById('btn-volver-dashboard').classList.remove('d-none');
            this.vistaActualOculta = vistaDestino;
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    volverDashboard: function() { this.cambiarVista('Dashboard'); },

    cargarDatosInciales: function() {
        window.Aplicacion.mostrarCarga();
        window.Aplicacion.peticion({ action: "get_colectivos_data" }, (res) => {
            window.Aplicacion.ocultarCarga();
            if (res && res.status === "success") {
                this.colectivos = res.colectivos || [];
                this.personalActivo = res.personal || [];
                this.dibujarTablaColectivos();
                this.llenarSelects();
            }
        });
    },

    llenarSelects: function() {
        let hCol = '<option value="">Seleccione...</option>';
        this.colectivos.forEach(c => {
            // ✨ Indicador en el desplegable ✨
            let estaConformado = (c.asesor || c.vocero || c.integrantes) ? " ✅ Conformado" : " ⚠️ Pendiente";
            hCol += `<option value="${c.id}">${c.tipo}: ${c.nombre} (${estaConformado})</option>`;
        });
        let sC = document.getElementById('asig-colectivo'); if(sC) sC.innerHTML = hCol;

        let hDoc = '<option value="">Seleccione personal...</option>';
        this.personalActivo.forEach(p => {
            let nombreFinal = p.nombre_completo || p.nombre || "Sin Nombre";
            let rolFinal = p.rol || "Sin Rol";
            hDoc += `<option value="${nombreFinal}">${nombreFinal} (${rolFinal})</option>`;
        });
        
        let sA = document.getElementById('asig-asesor'); if(sA) sA.innerHTML = hDoc;
        let sV = document.getElementById('asig-vocero'); if(sV) sV.innerHTML = hDoc;
        let sI = document.getElementById('asig-select-integrante'); if(sI) sI.innerHTML = hDoc;
    },

    dibujarTablaColectivos: function() {
        const tbody = document.getElementById('tabla-colectivos'); if(!tbody) return;
        let html = '';
        this.colectivos.forEach(c => {
            let badge = c.tipo === 'Colectivo' ? 'primary' : (c.tipo === 'Coordinación' ? 'warning text-dark' : (c.tipo === 'Brigada' ? 'success' : 'secondary'));
            
            // ✨ Indicador visual en la tabla ✨
            let statusBadge = (c.asesor || c.vocero || c.integrantes) 
                ? `<span class="badge bg-success ms-2" style="font-size: 0.65rem;">Conformado</span>` 
                : `<span class="badge bg-warning text-dark ms-2" style="font-size: 0.65rem;">Pendiente</span>`;

            html += `<tr>
                <td class="ps-3 align-middle"><span class="badge bg-${badge} shadow-sm">${c.tipo}</span></td>
                <td class="align-middle fw-bold text-dark">${c.nombre} ${statusBadge}</td>
                <td class="align-middle text-muted small" style="max-width: 250px;">${c.descripcion || 'Sin descripción'}</td>
                <td class="text-end pe-3 align-middle text-nowrap">
                    <button class="btn btn-sm btn-light border text-info shadow-sm me-1" title="Ver Estructura" onclick="window.ModColectivos.mostrarEstructura('${c.id}')"><i class="bi bi-diagram-3"></i></button>
                    <button class="btn btn-sm btn-light border text-primary shadow-sm me-1" title="Editar Nombre" onclick="window.ModColectivos.editarColectivo('${c.id}')"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-light border text-danger shadow-sm" title="Eliminar" onclick="window.ModColectivos.eliminarColectivo('${c.id}')"><i class="bi bi-trash"></i></button>
                </td>
            </tr>`;
        });
        tbody.innerHTML = html || `<tr><td colspan="4" class="text-center py-5 text-muted"><i class="bi bi-inbox fs-1 d-block mb-3"></i>No hay organizaciones registradas.</td></tr>`;
    },

    guardarColectivo: function() {
        let t = document.getElementById('col-tipo').value;
        let n = document.getElementById('col-nombre').value.trim();
        let d = document.getElementById('col-desc').value.trim();
        if(!n) return Swal.fire('Atención', 'El nombre es obligatorio.', 'warning');

        window.Aplicacion.mostrarCarga();
        window.Aplicacion.peticion({ action: 'save_colectivo', id: this.editandoId, tipo: t, nombre: n, descripcion: d }, (res) => {
            window.Aplicacion.ocultarCarga();
            if(res && res.status === 'success') {
                Swal.fire({toast:true, position:'top-end', icon:'success', title:'Guardado', timer:2000, showConfirmButton:false});
                this.cancelarEdicion(); this.cargarDatosInciales();
            } else { Swal.fire('Error', res.message, 'error'); }
        });
    },

    editarColectivo: function(id) {
        let c = this.colectivos.find(x => x.id === id); if(!c) return;
        this.editandoId = id;
        document.getElementById('col-tipo').value = c.tipo;
        document.getElementById('col-nombre').value = c.nombre;
        document.getElementById('col-desc').value = c.descripcion;
        document.getElementById('btn-guardar-colectivo').innerText = "Actualizar Registro";
        document.getElementById('btn-cancelar-colectivo').classList.remove('d-none');
        document.getElementById('titulo-form-colectivo').innerHTML = `<i class="bi bi-pencil-square text-danger me-2"></i>Editar Registro`;
    },

    eliminarColectivo: function(id) {
        Swal.fire({title:'¿Borrar registro?', text: 'Se perderá también su estructura de integrantes.', icon:'warning', showCancelButton:true, confirmButtonColor:'#dc3545', confirmButtonText:'Sí, Borrar'}).then(r=>{ 
            if(r.isConfirmed){ window.Aplicacion.peticion({action:'delete_colectivo', id:id}, ()=>this.cargarDatosInciales()); }
        });
    },

    cancelarEdicion: function() {
        this.editandoId = null;
        let inpN = document.getElementById('col-nombre'); if(inpN) inpN.value = '';
        let inpD = document.getElementById('col-desc'); if(inpD) inpD.value = '';
        let btnG = document.getElementById('btn-guardar-colectivo'); if(btnG) btnG.innerText = "Guardar Registro";
        let btnC = document.getElementById('btn-cancelar-colectivo'); if(btnC) btnC.classList.add('d-none');
        let tit = document.getElementById('titulo-form-colectivo'); if(tit) tit.innerHTML = `<i class="bi bi-bookmark-plus text-danger me-2"></i>Crear Colectivo`;
    },

    agregarIntegrante: function() {
        let sel = document.getElementById('asig-select-integrante');
        if(!sel.value) return Swal.fire({toast:true, position:'top-end', icon:'warning', title:'Seleccione alguien de la lista', timer:2000, showConfirmButton:false});
        
        let nombreSeleccionado = sel.value; 
        let txt = document.getElementById('asig-integrantes');
        
        let actuales = txt.value.split(',').map(s => s.trim()).filter(s => s !== "");
        if(actuales.includes(nombreSeleccionado)) {
            return Swal.fire({toast:true, position:'top-end', icon:'info', title:'Ya está en la lista', timer:2000, showConfirmButton:false});
        }
        
        actuales.push(nombreSeleccionado);
        txt.value = actuales.join(", ");
        sel.value = ""; 
        
        txt.classList.add('animate__animated', 'animate__pulse');
        setTimeout(() => { txt.classList.remove('animate__animated', 'animate__pulse'); }, 1000);
    },

    cargarMiembrosActuales: function() {
        let idCol = document.getElementById('asig-colectivo').value;
        if(!idCol) {
            this.limpiarFormularioAsignacion();
            return;
        }
        let c = this.colectivos.find(x => x.id === idCol);
        if(c) {
            document.getElementById('asig-asesor').value = c.asesor || "";
            document.getElementById('asig-vocero').value = c.vocero || "";
            document.getElementById('asig-integrantes').value = c.integrantes || "";
        }
    },

    // ✨ LIMPIA LOS CAMPOS DEL FORMULARIO ✨
    limpiarFormularioAsignacion: function() {
        let sc = document.getElementById('asig-colectivo'); if(sc) sc.value = "";
        let sa = document.getElementById('asig-asesor'); if(sa) sa.value = "";
        let sv = document.getElementById('asig-vocero'); if(sv) sv.value = "";
        let si = document.getElementById('asig-integrantes'); if(si) si.value = "";
        let ssel = document.getElementById('asig-select-integrante'); if(ssel) ssel.value = "";
    },

    guardarMiembros: function() {
        let idCol = document.getElementById('asig-colectivo').value;
        if(!idCol) return Swal.fire('Atención', 'Debe seleccionar un Colectivo primero.', 'warning');
        
        let asesor = document.getElementById('asig-asesor').value;
        let vocero = document.getElementById('asig-vocero').value;
        let integrantes = document.getElementById('asig-integrantes').value;

        window.Aplicacion.mostrarCarga();
        window.Aplicacion.peticion({ action: 'save_miembros_colectivo', id: idCol, asesor: asesor, vocero: vocero, integrantes: integrantes }, (res) => {
            window.Aplicacion.ocultarCarga();
            if(res && res.status === 'success') {
                Swal.fire({toast:true, position:'top-end', icon:'success', title:'Estructura Guardada', timer:2000, showConfirmButton:false});
                // ✨ SE LLAMA A LA LIMPIEZA DESPUÉS DE GUARDAR ✨
                this.limpiarFormularioAsignacion();
                this.cargarDatosInciales();
            } else { Swal.fire('Error', res.message, 'error'); }
        });
    },

    mostrarEstructura: function(id) {
        let c = this.colectivos.find(x => x.id === id);
        if(!c) return;

        let badgesIntegrantes = '<span class="text-muted fst-italic">Sin integrantes adicionales registrados.</span>';
        if (c.integrantes) {
            badgesIntegrantes = c.integrantes.split(',').map(i => i.trim()).filter(i => i !== "").map(i => `<span class="badge bg-light text-dark border border-success me-2 mb-2 p-2 shadow-sm"><i class="bi bi-person me-1"></i>${i}</span>`).join('');
        }

        let html = `
        <div class="text-start">
            <h6 class="fw-bold text-danger border-bottom pb-2 mb-3"><i class="bi bi-person-badge me-2"></i>Asesor / Coordinador</h6>
            <p class="text-dark mb-4 fs-5">${c.asesor ? `<i class="bi bi-check-circle-fill text-danger me-2"></i>${c.asesor}` : '<span class="text-muted fst-italic">No asignado</span>'}</p>
            
            <h6 class="fw-bold text-warning border-bottom pb-2 mb-3"><i class="bi bi-megaphone-fill me-2"></i>Vocero Principal</h6>
            <p class="text-dark mb-4 fs-5">${c.vocero ? `<i class="bi bi-check-circle-fill text-warning me-2"></i>${c.vocero}` : '<span class="text-muted fst-italic">No asignado</span>'}</p>
            
            <h6 class="fw-bold text-success border-bottom pb-2 mb-3"><i class="bi bi-people me-2"></i>Equipo Integrante</h6>
            <div class="d-flex flex-wrap">${badgesIntegrantes}</div>
        </div>`;

        Swal.fire({ title: `<div class="fs-4 text-primary fw-bold mb-2">${c.nombre}</div><span class="badge bg-secondary mb-3">${c.tipo}</span>`, html: html, confirmButtonText: 'Cerrar Visor', confirmButtonColor: '#e11d48', width: '600px' });
    }
};

window.init_Gestión_de_Colectivos = function() { window.ModColectivos.init(); };