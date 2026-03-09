/**
 * MÓDULO: CALENDARIO ESCOLAR Y PLAN PEDAGÓGICO
 * INGENIERÍA: BLOQUEO DE DESTINO Y CHECKBOXES TÁCTILES MÓVILES
 */

const ModCalendario = {
    eventos: [],
    eventosFiltrados: [], 
    periodoActivo: "No definido",
    tabActivo: "Escolar", 
    listaDocentes: [], 
    
    paginaActual: 1,
    itemsPorPagina: 10,
    idEventoEdicion: null,

    abrirModalSeguro: function(idModal) {
        let modalEl = document.getElementById(idModal); 
        if(!modalEl) return;
        if (modalEl.parentNode !== document.body) { document.body.appendChild(modalEl); }
        let inst = bootstrap.Modal.getInstance(modalEl); 
        if(inst) { inst.dispose(); }
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove()); 
        document.body.classList.remove('modal-open'); document.body.style.overflow = '';
        let nuevoModal = new bootstrap.Modal(modalEl, { backdrop: 'static', keyboard: false }); 
        nuevoModal.show();
    },

    cerrarModalSeguro: function(idModal) {
        let modalEl = document.getElementById(idModal);
        if(modalEl) { let inst = bootstrap.Modal.getInstance(modalEl); if(inst) { inst.hide(); } }
        setTimeout(() => {
            document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }, 300);
    },

    // ==========================================
    // MOTOR DE DOCENTES (CHECKBOXES MÓVILES)
    // ==========================================
    cargarDocentesParaSelect: function() {
        Aplicacion.peticion({ action: "get_users" }, (res) => {
            if (res.users) {
                // Filtramos solo personal de la institución
                this.listaDocentes = res.users.filter(u => u.rol !== 'Estudiante' && u.rol !== 'Representante');
                this.renderizarCheckboxesDocentes('cal-docentes-container', 'chk-add');
                this.renderizarCheckboxesDocentes('edit-cal-docentes-container', 'chk-edit');
            }
        });
    },

    renderizarCheckboxesDocentes: function(containerId, prefixId) {
        let html = '';
        this.listaDocentes.forEach((u, idx) => {
            html += `
            <div class="form-check mb-1">
                <input class="form-check-input docente-checkbox" type="checkbox" value="${u.nombre_completo}" id="${prefixId}-${idx}" onchange="ModCalendario.validarMaxDocentes(this, '${containerId}')">
                <label class="form-check-label text-dark w-100" for="${prefixId}-${idx}" style="cursor: pointer;">
                    ${u.nombre_completo} <span class="text-muted small">(${u.rol})</span>
                </label>
            </div>`;
        });
        let container = document.getElementById(containerId);
        if (container) container.innerHTML = html;
    },

    validarMaxDocentes: function(checkboxElement, containerId) {
        let container = document.getElementById(containerId);
        let seleccionados = container.querySelectorAll('.docente-checkbox:checked');
        if (seleccionados.length > 2) {
            checkboxElement.checked = false; // Desmarcamos instantáneamente
            Swal.fire({toast: true, position: 'top-end', icon: 'warning', title: 'Máximo 2 responsables permitidos.', showConfirmButton: false, timer: 3000});
        }
    },

    obtenerDocentesSeleccionados: function(containerId) {
        let container = document.getElementById(containerId);
        let seleccionados = container.querySelectorAll('.docente-checkbox:checked');
        let valores = [];
        seleccionados.forEach(chk => valores.push(chk.value));
        return valores.join(" y ");
    },

    marcarDocentesEdit: function(containerId, docentesString) {
        let container = document.getElementById(containerId);
        if (!container) return;
        let checkboxes = container.querySelectorAll('.docente-checkbox');
        let docArray = (docentesString || "").split(" y ");
        checkboxes.forEach(chk => {
            chk.checked = docArray.includes(chk.value);
        });
    },

    // ==========================================
    // UI Y NAVEGACIÓN
    // ==========================================
    alternarCamposFormulario: function() {
        let destino = document.getElementById('cal-destino').value;
        if (destino === 'Pedagógico') {
            document.getElementById('bloque-form-estandar').classList.add('d-none');
            document.getElementById('bloque-form-pedagogico').classList.remove('d-none');
        } else {
            document.getElementById('bloque-form-estandar').classList.remove('d-none');
            document.getElementById('bloque-form-pedagogico').classList.add('d-none');
        }
    },

    alternarCamposEdicion: function(destino) {
        document.getElementById('edit-lbl-destino').innerText = "Calendario " + destino;
        document.getElementById('edit-cal-destino').value = destino;
        if (destino === 'Pedagógico') {
            document.getElementById('edit-bloque-estandar').classList.add('d-none');
            document.getElementById('edit-bloque-pedagogico').classList.remove('d-none');
        } else {
            document.getElementById('edit-bloque-estandar').classList.remove('d-none');
            document.getElementById('edit-bloque-pedagogico').classList.add('d-none');
        }
    },

    cargarCalendario: function() {
        Aplicacion.mostrarCarga();
        this.cargarDocentesParaSelect(); 
        
        Aplicacion.peticion({ action: "get_calendar" }, (res) => {
            Aplicacion.ocultarCarga();
            if (res.status === "success") {
                this.eventos = res.eventos || [];
                this.periodoActivo = res.periodoActivo;
                document.getElementById('lbl-anio-calendario').innerText = this.periodoActivo;
                
                // Actualiza el select de destino bloqueado
                let selectDestino = document.getElementById('cal-destino');
                if (selectDestino) { selectDestino.value = this.tabActivo; }
                
                this.alternarCamposFormulario();
                this.procesarFiltrosYPaginacion();
            } else { 
                Swal.fire('Error', 'No se pudo cargar la agenda.', 'error'); 
            }
        });
    },

    cambiarTab: function(nombreTab) {
        this.tabActivo = nombreTab;
        this.paginaActual = 1; 
        const tabs = ['Escolar', 'Operativo', 'Pedagógico'];
        tabs.forEach(tab => {
            let idTabLimpio = tab.toLowerCase().replace('ó', 'o');
            let el = document.getElementById(`tab-${idTabLimpio}`);
            if (el) {
                if (tab === nombreTab) {
                    el.classList.add('active', 'bg-primary', 'text-white'); el.classList.remove('text-secondary');
                } else {
                    el.classList.remove('active', 'bg-primary', 'text-white'); el.classList.add('text-secondary');
                }
            }
        });
        document.getElementById('lbl-nombre-calendario').innerText = nombreTab;
        
        // Bloqueo de seguridad: Fuerza al selector a igualar la pestaña activa
        let selectDestino = document.getElementById('cal-destino');
        if (selectDestino) { selectDestino.value = nombreTab; }
        
        this.alternarCamposFormulario();
        this.procesarFiltrosYPaginacion();
    },

    procesarFiltrosYPaginacion: function() {
        this.eventosFiltrados = this.eventos.filter(e => e.tipo_calendario === this.tabActivo);
        this.eventosFiltrados.sort((a, b) => {
            let dA = this.parsearFechaInmune(a.inicio); let dB = this.parsearFechaInmune(b.inicio);
            if (!dA && !dB) return 0; if (!dA) return 1; if (!dB) return -1;
            return dA.getTime() - dB.getTime();
        });
        this.dibujarCalendario();
    },

    parsearFechaInmune: function(fechaRaw) {
        if (!fechaRaw) return null;
        let str = String(fechaRaw).trim();
        let matchIso = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
        if (matchIso) return new Date(parseInt(matchIso[1], 10), parseInt(matchIso[2], 10) - 1, parseInt(matchIso[3], 10));
        let matchLatino = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
        if (matchLatino) return new Date(parseInt(matchLatino[3], 10), parseInt(matchLatino[2], 10) - 1, parseInt(matchLatino[1], 10));
        let d = new Date(str);
        if (!isNaN(d.getTime())) return d;
        return null; 
    },

    formatearFechaAgradable: function(fechaRaw, incluirAnio = false) {
        let d = this.parsearFechaInmune(fechaRaw);
        if (!d) return fechaRaw || "Sin fecha";
        const meses = ["Ene.", "Feb.", "Mar.", "Abr.", "May.", "Jun.", "Jul.", "Ago.", "Sep.", "Oct.", "Nov.", "Dic."];
        let dia = String(d.getDate()).padStart(2, '0'); let mes = meses[d.getMonth()]; let anio = d.getFullYear();
        return incluirAnio ? `${dia} ${mes} ${anio}` : `${dia} ${mes}`;
    },

    obtenerMesNombre: function(fechaRaw) {
        let d = this.parsearFechaInmune(fechaRaw);
        if (!d) return "ACTIVIDADES ESPECIALES / CONTINUAS"; 
        const mesesLargos = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        return mesesLargos[d.getMonth()] + " " + d.getFullYear();
    },

    dibujarCalendario: function() {
        const tbody = document.getElementById('tabla-calendario');
        if (!tbody) return;
        const totalRegistros = this.eventosFiltrados.length;
        if (totalRegistros === 0) {
            tbody.innerHTML = `<tr><td colspan="3" class="text-center py-5 text-muted">No hay actividades en ${this.tabActivo}.</td></tr>`;
            document.getElementById('info-paginacion-calendario').innerText = "Mostrando 0 de 0";
            return;
        }
        const inicio = (this.paginaActual - 1) * this.itemsPorPagina; 
        const fin = Math.min(inicio + this.itemsPorPagina, totalRegistros);
        const paginados = this.eventosFiltrados.slice(inicio, fin);
        
        let htmlTabla = '';
        paginados.forEach(e => {
            let fInTxt = this.formatearFechaAgradable(e.inicio, false);
            let fOutTxt = this.formatearFechaAgradable(e.fin, true);
            let textoFechas = (e.inicio === e.fin) ? `${fOutTxt}` : `${fInTxt} al ${fOutTxt}`;
            if (!this.parsearFechaInmune(e.inicio)) textoFechas = e.inicio; 
            
            let contenidoDetalles = '';
            if (this.tabActivo === 'Pedagógico') {
                contenidoDetalles = `
                    <div class="fw-bold text-dark" style="font-size:14px;">${e.titulo}</div>
                    <div class="mt-1"><span class="badge bg-info text-dark">Objetivo:</span> <span class="small text-muted">${e.objetivo || "N/A"}</span></div>
                    <div class="mt-1"><span class="badge bg-light text-primary border">Responsables:</span> <span class="small fw-bold">${e.docentes || "Sin asignar"}</span></div>
                `;
            } else {
                contenidoDetalles = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <div class="fw-bold text-dark" style="font-size:13px;">${e.titulo}</div>
                            ${e.desc ? `<div class="small text-muted mt-1" style="font-size: 11px;">${e.desc}</div>` : ''}
                        </div>
                        <span class="badge bg-light text-secondary border shadow-sm ms-3 text-uppercase" style="font-size:9px;">${e.tipo_evento}</span>
                    </div>
                `;
            }

            htmlTabla += `
            <tr class="animate__animated animate__fadeIn">
                <td class="py-2 text-center text-dark fw-bold border-end" style="font-size:12px; width: 20%; background-color: #f8fafc;">
                    ${textoFechas}
                </td>
                <td class="py-2 px-3" style="width: 65%;">
                    ${contenidoDetalles}
                </td>
                <td class="text-end accion-columna pe-3" style="width: 15%;">
                    <button class="btn btn-sm btn-light border text-primary px-2 shadow-sm me-1" onclick="ModCalendario.abrirModalEditar('${e.id}')"><i class="bi bi-pencil-fill"></i></button>
                    <button class="btn btn-sm btn-light border text-danger px-2 shadow-sm" onclick="ModCalendario.eliminarEvento('${e.id}')"><i class="bi bi-trash-fill"></i></button>
                </td>
            </tr>`;
        });
        
        tbody.innerHTML = htmlTabla;
        document.getElementById('info-paginacion-calendario').innerText = `Mostrando ${inicio + 1} a ${fin} de ${totalRegistros}`;
    },

    cambiarPagina: function(delta) { 
        const totalPaginas = Math.ceil(this.eventosFiltrados.length / this.itemsPorPagina); 
        const nuevaPagina = this.paginaActual + delta; 
        if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) { this.paginaActual = nuevaPagina; this.dibujarCalendario(); } 
    },

    // ==========================================
    // OPERACIONES CRUD CON LECTURA DE CHECKBOXES
    // ==========================================
    guardarEvento: function() {
        if(this.periodoActivo === "No definido") return Swal.fire('Error', 'Debe haber un Año Escolar activo.', 'warning');
        
        const calDestino = document.getElementById('cal-destino').value; // Funciona aunque esté disabled
        const titulo = document.getElementById('cal-titulo').value;
        const inicio = document.getElementById('cal-inicio').value;
        const fin = document.getElementById('cal-fin').value;
        
        if(!titulo || !inicio || !fin) return Swal.fire('Atención', 'Título, Fecha Inicio y Fecha Fin son obligatorios.', 'warning');
        
        let payload = {
            action: "save_calendar", periodo: this.periodoActivo, tipo_calendario: calDestino, titulo: titulo, inicio: inicio, fin: fin, 
            cedula_admin: JSON.parse(localStorage.getItem('sigae_usuario')).cedula
        };

        if (calDestino === 'Pedagógico') {
            payload.tipo_evento = "Plan Pedagógico"; 
            payload.desc = "";
            payload.objetivo = document.getElementById('cal-objetivo').value;
            payload.docentes = this.obtenerDocentesSeleccionados('cal-docentes-container'); // Checkboxes MÓVIL
            payload.requerimientos = document.getElementById('cal-requerimientos').value;
            payload.observacion = document.getElementById('cal-observacion').value;
        } else {
            payload.tipo_evento = document.getElementById('cal-tipo').value;
            payload.desc = document.getElementById('cal-desc').value;
            payload.objetivo = ""; payload.docentes = ""; payload.requerimientos = ""; payload.observacion = "";
        }

        Aplicacion.mostrarCarga();
        Aplicacion.peticion(payload, (res) => {
            Aplicacion.ocultarCarga();
            if(res.status === "success") {
                Swal.fire('¡Registrado!', res.message, 'success');
                document.getElementById('cal-titulo').value = ''; document.getElementById('cal-inicio').value = ''; document.getElementById('cal-fin').value = ''; 
                document.getElementById('cal-desc').value = ''; document.getElementById('cal-objetivo').value = ''; document.getElementById('cal-requerimientos').value = ''; document.getElementById('cal-observacion').value = '';
                // Limpiar Checkboxes
                let chks = document.querySelectorAll('#cal-docentes-container .docente-checkbox');
                chks.forEach(c => c.checked = false);

                this.cambiarTab(calDestino); this.cargarCalendario();
            } else { Swal.fire('Error', res.message, 'error'); }
        });
    },

    abrirModalEditar: function(idEvento) {
        const ev = this.eventos.find(e => e.id === idEvento);
        if (!ev) return;
        this.idEventoEdicion = idEvento;
        
        this.alternarCamposEdicion(ev.tipo_calendario);
        
        document.getElementById('edit-cal-titulo').value = ev.titulo;
        let dIn = this.parsearFechaInmune(ev.inicio); let dOut = this.parsearFechaInmune(ev.fin);
        document.getElementById('edit-cal-inicio').value = dIn ? dIn.toISOString().split('T')[0] : '';
        document.getElementById('edit-cal-fin').value = dOut ? dOut.toISOString().split('T')[0] : '';

        if (ev.tipo_calendario === 'Pedagógico') {
            document.getElementById('edit-cal-objetivo').value = ev.objetivo || "";
            document.getElementById('edit-cal-requerimientos').value = ev.requerimientos || "";
            document.getElementById('edit-cal-observacion').value = ev.observacion || "";
            
            // Marcar checkboxes táctiles
            this.marcarDocentesEdit('edit-cal-docentes-container', ev.docentes);
        } else {
            document.getElementById('edit-cal-tipo').value = ev.tipo_evento;
            document.getElementById('edit-cal-desc').value = ev.desc || "";
        }

        this.abrirModalSeguro('modal-editar-evento');
    },

    guardarEdicionEvento: function() {
        const calDestino = document.getElementById('edit-cal-destino').value;
        const titulo = document.getElementById('edit-cal-titulo').value;
        const inicio = document.getElementById('edit-cal-inicio').value;
        const fin = document.getElementById('edit-cal-fin').value;
        
        if(!titulo || !inicio || !fin) return Swal.fire('Atención', 'Título y fechas vacíos.', 'warning');
        
        let payload = {
            action: "save_calendar", id: this.idEventoEdicion, tipo_calendario: calDestino, titulo: titulo, inicio: inicio, fin: fin, 
            cedula_admin: JSON.parse(localStorage.getItem('sigae_usuario')).cedula
        };

        if (calDestino === 'Pedagógico') {
            payload.tipo_evento = "Plan Pedagógico"; 
            payload.desc = "";
            payload.objetivo = document.getElementById('edit-cal-objetivo').value;
            payload.docentes = this.obtenerDocentesSeleccionados('edit-cal-docentes-container'); // Checkboxes
            payload.requerimientos = document.getElementById('edit-cal-requerimientos').value;
            payload.observacion = document.getElementById('edit-cal-observacion').value;
        } else {
            payload.tipo_evento = document.getElementById('edit-cal-tipo').value;
            payload.desc = document.getElementById('edit-cal-desc').value;
            payload.objetivo = ""; payload.docentes = ""; payload.requerimientos = ""; payload.observacion = "";
        }

        Aplicacion.mostrarCarga();
        Aplicacion.peticion(payload, (res) => {
            Aplicacion.ocultarCarga(); this.cerrarModalSeguro('modal-editar-evento');
            if(res.status === "success") { Swal.fire('Actualizado!', res.message, 'success'); this.cambiarTab(calDestino); this.cargarCalendario(); } 
            else { Swal.fire('Error', res.message, 'error'); }
        });
    },

    eliminarEvento: function(idEvento) {
        Swal.fire({ title: '¿Eliminar actividad?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#FF3D00', confirmButtonText: 'Sí, eliminar' }).then((result) => {
            if (result.isConfirmed) {
                Aplicacion.mostrarCarga();
                Aplicacion.peticion({ action: "delete_calendar", id: idEvento, cedula_admin: JSON.parse(localStorage.getItem('sigae_usuario')).cedula }, (res) => {
                    Aplicacion.ocultarCarga();
                    if(res.status === "success") { Swal.fire('Eliminado', res.message, 'success'); this.cargarCalendario(); } 
                    else { Swal.fire('Error', res.message, 'error'); }
                });
            }
        });
    },

    // ==========================================
    // EXCEL Y RENDERIZADOR PDF
    // ==========================================
    descargarPlantilla: function() {
        Aplicacion.mostrarCarga();
        if (typeof XLSX === 'undefined') {
            const script = document.createElement('script'); script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
            script.onload = () => this.generarExcelPlantilla(); document.head.appendChild(script);
        } else { this.generarExcelPlantilla(); }
    },

    generarExcelPlantilla: function() {
        Aplicacion.ocultarCarga();
        let datosExcel = [];
        
        if (this.tabActivo === 'Pedagógico') {
            datosExcel.push(["Tipo Calendario", "Título de Proyecto", "Fecha Inicio", "Fecha Fin", "Objetivo", "Responsables", "Requerimientos", "Observaciones"]);
        } else {
            datosExcel.push(["Tipo Calendario", "Categoría", "Título de la Actividad", "Fecha Inicio", "Fecha Fin", "Descripción"]);
        }
        
        let eventosDelTab = this.eventos.filter(e => e.tipo_calendario === this.tabActivo);
        if (eventosDelTab.length > 0) {
            eventosDelTab.sort((a, b) => { 
                let dA = this.parsearFechaInmune(a.inicio); let dB = this.parsearFechaInmune(b.inicio);
                if (!dA && !dB) return 0; if (!dA) return 1; if (!dB) return -1; return dA.getTime() - dB.getTime();
            });
            eventosDelTab.forEach(e => {
                let dIn = this.parsearFechaInmune(e.inicio), dOut = this.parsearFechaInmune(e.fin);
                let fInTxt = dIn ? dIn.toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit', year: 'numeric'}) : e.inicio;
                let fOutTxt = dOut ? dOut.toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit', year: 'numeric'}) : e.fin;
                
                if (this.tabActivo === 'Pedagógico') {
                    datosExcel.push([ e.tipo_calendario, e.titulo, fInTxt, fOutTxt, e.objetivo, e.docentes, e.requerimientos, e.observacion ]);
                } else {
                    datosExcel.push([ e.tipo_calendario, e.tipo_evento, e.titulo, fInTxt, fOutTxt, e.desc || "" ]);
                }
            });
        } else {
            if (this.tabActivo === 'Pedagógico') {
                datosExcel.push([this.tabActivo, "Feria de Ciencias", "15/03/2026", "18/03/2026", "Exposición", "María Pérez", "Mesas", "Llevar bata"]);
            } else {
                datosExcel.push([this.tabActivo, "Efeméride / Feriado", "Día del Maestro", "15/01/2026", "15/01/2026", "Nacional"]);
            }
        }
        
        const worksheet = XLSX.utils.aoa_to_sheet(datosExcel);
        let range = XLSX.utils.decode_range(worksheet['!ref']);
        const totalFilas = range.e.r + 1000; 
        
        let colIndexInicio = (this.tabActivo === 'Pedagógico') ? 2 : 3;
        let colIndexFin = (this.tabActivo === 'Pedagógico') ? 3 : 4;

        for (let R = 1; R <= totalFilas; ++R) {
            let cellD = XLSX.utils.encode_cell({c: colIndexInicio, r: R}); let cellE = XLSX.utils.encode_cell({c: colIndexFin, r: R});
            if (!worksheet[cellD]) worksheet[cellD] = { t: 's', v: '' }; if (!worksheet[cellE]) worksheet[cellE] = { t: 's', v: '' };
            worksheet[cellD].z = '@'; worksheet[cellE].z = '@'; 
        }
        
        worksheet['!ref'] = XLSX.utils.encode_range({ s: {c:0, r:0}, e: {c: (this.tabActivo === 'Pedagógico' ? 7 : 5), r:totalFilas} });
        worksheet['!cols'] = (this.tabActivo === 'Pedagógico') 
            ? [ {wch: 15}, {wch: 35}, {wch: 15}, {wch: 15}, {wch: 30}, {wch: 25}, {wch: 25}, {wch: 25} ]
            : [ {wch: 18}, {wch: 25}, {wch: 50}, {wch: 25}, {wch: 25}, {wch: 40} ];
            
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, `Calendario_${this.tabActivo}`);
        XLSX.writeFile(workbook, `Plantilla_Masiva_${this.tabActivo}.xlsx`);
    },

    procesarExcel: function(event) {
        const archivo = event.target.files[0];
        if (!archivo) return;
        if (this.periodoActivo === "No definido") { event.target.value = ''; return Swal.fire('Error', 'Debe existir un Año Escolar activo.', 'warning'); }
        Aplicacion.mostrarCarga();
        if (typeof XLSX === 'undefined') {
            const script = document.createElement('script'); script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
            script.onload = () => this.leerArchivoExcel(archivo); document.head.appendChild(script);
        } else { this.leerArchivoExcel(archivo); }
        event.target.value = ''; 
    },

    validarYConvertirFechaDDMMYYYY: function(fechaRaw) {
        if (!fechaRaw) return null;
        let str = String(fechaRaw).trim();
        let numFormat = Number(str);
        if (!isNaN(numFormat) && numFormat > 20000) {
            let date = new Date(Math.round((numFormat - 25569) * 86400 * 1000));
            date = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
            return date.toISOString().split('T')[0]; 
        }
        let matchIso = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
        if (matchIso) return `${matchIso[1]}-${matchIso[2].padStart(2, '0')}-${matchIso[3].padStart(2, '0')}`;
        let matchLatino = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
        if (matchLatino) return `${matchLatino[3]}-${matchLatino[2].padStart(2, '0')}-${matchLatino[1].padStart(2, '0')}`;
        return str; 
    },

    leerArchivoExcel: function(archivo) {
        const reader = new FileReader();
        reader.onload = (eventReader) => {
            try {
                const data = new Uint8Array(eventReader.target.result);
                const workbook = XLSX.read(data, {type: 'array', cellDates: false}); 
                const jsonDatos = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {header: 1, raw: false});
                let eventosNuevos = [];
                
                for (let i = 1; i < jsonDatos.length; i++) {
                    let fila = jsonDatos[i];
                    
                    if (this.tabActivo === 'Pedagógico' && fila.length >= 4 && fila[0] && fila[1] && fila[2] && fila[3]) {
                        eventosNuevos.push({
                            tipo_calendario: this.tabActivo, tipo_evento: "Plan Pedagógico", 
                            titulo: String(fila[1]).trim(), inicio: this.validarYConvertirFechaDDMMYYYY(fila[2]), fin: this.validarYConvertirFechaDDMMYYYY(fila[3]), 
                            desc: "", objetivo: fila[4] ? String(fila[4]).trim() : "", docentes: fila[5] ? String(fila[5]).trim() : "",
                            requerimientos: fila[6] ? String(fila[6]).trim() : "", observacion: fila[7] ? String(fila[7]).trim() : ""
                        });
                    } else if (this.tabActivo !== 'Pedagógico' && fila.length >= 5 && fila[0] && fila[1] && fila[2] && fila[3] && fila[4]) {
                        eventosNuevos.push({
                            tipo_calendario: this.tabActivo, tipo_evento: String(fila[1]).trim(), 
                            titulo: String(fila[2]).trim(), inicio: this.validarYConvertirFechaDDMMYYYY(fila[3]), fin: this.validarYConvertirFechaDDMMYYYY(fila[4]), 
                            desc: fila[5] ? String(fila[5]).trim() : "", objetivo: "", docentes: "", requerimientos: "", observacion: ""
                        });
                    }
                }
                
                if (eventosNuevos.length === 0) { Aplicacion.ocultarCarga(); return Swal.fire('Archivo Vacío', 'Use la plantilla correspondiente a la pestaña actual.', 'error'); }
                Aplicacion.peticion({ action: "save_calendar_bulk", periodo: this.periodoActivo, eventos: eventosNuevos, cedula_admin: JSON.parse(localStorage.getItem('sigae_usuario')).cedula }, (res) => {
                    Aplicacion.ocultarCarga();
                    if(res.status === "success") { Swal.fire('¡Carga Exitosa!', res.message, 'success'); this.cargarCalendario(); } 
                });
            } catch (err) { Aplicacion.ocultarCarga(); Swal.fire('Error', 'Fallo leyendo el Excel.', 'error'); }
        };
        reader.readAsArrayBuffer(archivo);
    },

    generarPDFDirectivoEstricto: async function() {
        let eventosDelTab = this.eventos.filter(e => e.tipo_calendario === this.tabActivo);
        if (eventosDelTab.length === 0) return Swal.fire('Atención', `No hay eventos en ${this.tabActivo}.`, 'warning');
        
        Aplicacion.mostrarCarga();
        window.scrollTo(0, 0); 
        
        eventosDelTab.sort((a, b) => { 
            let dA = this.parsearFechaInmune(a.inicio); let dB = this.parsearFechaInmune(b.inicio);
            if (!dA && !dB) return 0; if (!dA) return 1; if (!dB) return -1; return dA.getTime() - dB.getTime();
        });

        const agrupadosPorMes = {};
        eventosDelTab.forEach(e => {
            let nombreMes = this.obtenerMesNombre(e.inicio);
            if (!agrupadosPorMes[nombreMes]) agrupadosPorMes[nombreMes] = [];
            agrupadosPorMes[nombreMes].push(e);
        });

        const medidor = document.createElement('div');
        medidor.style.width = '736px'; 
        medidor.style.position = 'absolute';
        medidor.style.visibility = 'hidden';
        medidor.style.fontFamily = "'Plus Jakarta Sans', Arial, sans-serif";
        document.body.appendChild(medidor);

        let paginasData = [];
        const MAXIMO_PIXELES_TABLA = 630; 

        Object.keys(agrupadosPorMes).forEach(mesNombre => {
            let eventosMes = agrupadosPorMes[mesNombre];
            let itemsHojaActual = [];
            
            medidor.innerHTML = `<table style="width: 100%; border-collapse: collapse;"><tbody id="medidor-tbody"></tbody></table>`;
            let tbody = medidor.querySelector('#medidor-tbody');

            for (let i = 0; i < eventosMes.length; i++) {
                let e = eventosMes[i];
                let fInTxt = this.formatearFechaAgradable(e.inicio, false);
                let fOutTxt = this.formatearFechaAgradable(e.fin, false);
                let textoFechas = (e.inicio === e.fin) ? `${fOutTxt}` : `${fInTxt} al ${fOutTxt}`;
                if (!this.parsearFechaInmune(e.inicio)) textoFechas = e.inicio;

                let filaHTML = '';
                
                if (this.tabActivo === 'Pedagógico') {
                    filaHTML = `
                    <tr>
                        <td style="padding: 12px 10px; border: 1px solid #cbd5e1; font-weight: 800; font-size: 13px; width: 22%;">${textoFechas}</td>
                        <td style="padding: 12px 10px; border: 1px solid #cbd5e1; width: 78%;">
                            <div style="font-size: 15px; font-weight: 900; color: #0f172a; margin-bottom: 5px;">${e.titulo}</div>
                            <div style="font-size: 12px; color: #334155; margin-bottom: 3px;"><strong>Objetivo:</strong> ${e.objetivo || "N/A"}</div>
                            <div style="font-size: 12px; color: #334155; margin-bottom: 3px;"><strong>Docentes:</strong> ${e.docentes || "N/A"}</div>
                            <div style="font-size: 12px; color: #334155; margin-bottom: 3px;"><strong>Req:</strong> ${e.requerimientos || "N/A"}</div>
                            ${e.observacion ? `<div style="font-size: 11px; color: #64748b; font-style: italic;">Obs: ${e.observacion}</div>` : ''}
                        </td>
                    </tr>`;
                } else {
                    filaHTML = `
                    <tr>
                        <td style="padding: 12px 10px; border: 1px solid #cbd5e1; font-weight: 800; font-size: 13px; width: 22%;">${textoFechas}</td>
                        <td style="padding: 12px 10px; border: 1px solid #cbd5e1; width: 78%;">
                            <div style="font-size: 14px; font-weight: bold; margin-bottom: 3px;">${e.titulo}</div>
                            ${e.desc ? `<div style="font-size: 12px; line-height: 1.3;">${e.desc}</div>` : ''}
                            <span style="font-size: 10px; padding: 4px 8px; border: 1px solid #000;">${e.tipo_evento}</span>
                        </td>
                    </tr>`;
                }

                tbody.insertAdjacentHTML('beforeend', filaHTML);

                if (tbody.offsetHeight > MAXIMO_PIXELES_TABLA && itemsHojaActual.length > 0) {
                    paginasData.push({ mes: mesNombre, eventos: [...itemsHojaActual] });
                    itemsHojaActual = [e];
                    tbody.innerHTML = filaHTML; 
                } else {
                    itemsHojaActual.push(e);
                }
            }
            if (itemsHojaActual.length > 0) { paginasData.push({ mes: mesNombre, eventos: [...itemsHojaActual] }); }
        });

        document.body.removeChild(medidor); 

        let mesTracking = {}; paginasData.forEach(p => { mesTracking[p.mes] = (mesTracking[p.mes] || 0) + 1; });
        let contadores = {}; paginasData.forEach(p => {
            if (mesTracking[p.mes] > 1) { contadores[p.mes] = (contadores[p.mes] || 0) + 1; p.tituloImpreso = `${p.mes} (Parte ${contadores[p.mes]})`; } 
            else { p.tituloImpreso = p.mes; }
        });

        const zone = document.getElementById('pdf-render-zone');
        zone.innerHTML = ''; 
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'letter');
        const pdfAnchoMM = 215.9; const pdfAltoMM = 279.4;
        const totalPaginas = paginasData.length;

        for (let idx = 0; idx < totalPaginas; idx++) {
            let datosPag = paginasData[idx];
            
            let htmlHojaCompleta = `
            <div id="hoja-completa-${idx}" style="width: 816px; height: 1056px; padding: 40px; background: white; color: #111111; font-family: 'Plus Jakarta Sans', Arial, sans-serif; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between;">
                
                <div style="flex-grow: 1;">
                    <div style="height: 100px; display: flex; align-items: flex-start; border-bottom: 3px solid #0066FF; padding-bottom: 15px; margin-bottom: 20px;">
                        <img src="assets/img/logo.png" style="width: 75px; object-fit: contain; margin-right: 20px;">
                        <div style="padding-top: 5px;">
                            <h4 style="margin: 0; font-size: 17px; color: #000;"><b>República Bolivariana de Venezuela</b></h4>
                            <h4 style="margin: 3px 0 0 0; font-size: 14px; font-weight: normal; color: #333;">Ministerio del Poder Popular para la Educación</h4>
                            <h4 style="margin: 3px 0 0 0; font-size: 14px; font-weight: normal; color: #333;">Unidad Educativa Libertador Bolívar</h4>
                        </div>
                    </div>

                    <div style="text-align: center; margin-bottom: 15px;">
                        <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: #0066FF; text-transform: uppercase; letter-spacing: 1px;">CALENDARIO ${this.tabActivo.toUpperCase()}</h1>
                        <h2 style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #475569;">PERÍODO ESCOLAR ${this.periodoActivo}</h2>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #D81B60 0%, #E53935 100%); padding: 10px 15px; margin-bottom: 15px; border-radius: 4px;">
                        <h2 style="margin: 0; font-size: 16px; font-weight: bold; color: #ffffff; text-transform: uppercase; letter-spacing: 2px;">${datosPag.tituloImpreso}</h2>
                    </div>

                    <table style="width: 100%; border-collapse: collapse; border-bottom: 2px solid #005ce6;">
                        <thead>
                            <tr style="background-color: #0066FF; color: #ffffff; font-size: 12px; text-transform: uppercase;">
                                <th style="padding: 10px; text-align: center; border: 1px solid #005ce6; width: 22%;">FECHAS</th>
                                <th style="padding: 10px; text-align: left; border: 1px solid #005ce6; width: 78%;">ACTIVIDAD PLANIFICADA</th>
                            </tr>
                        </thead>
                        <tbody>`;

            datosPag.eventos.forEach(e => {
                let fInTxt = this.formatearFechaAgradable(e.inicio, false);
                let fOutTxt = this.formatearFechaAgradable(e.fin, false);
                let textoFechas = (e.inicio === e.fin) ? `${fOutTxt}` : `${fInTxt} al ${fOutTxt}`;
                if (!this.parsearFechaInmune(e.inicio)) textoFechas = e.inicio;

                if (this.tabActivo === 'Pedagógico') {
                    htmlHojaCompleta += `
                        <tr style="background-color: #ffffff;">
                            <td style="padding: 12px 10px; text-align: center; border: 1px solid #cbd5e1; font-weight: 800; color: #1e293b; font-size: 13px; vertical-align: middle; background-color: #f8fafc;">${textoFechas}</td>
                            <td style="padding: 12px 10px; border: 1px solid #cbd5e1; vertical-align: top;">
                                <div style="font-size: 15px; font-weight: 900; color: #0f172a; margin-bottom: 6px;">${e.titulo}</div>
                                <div style="display: flex; gap: 20px; margin-bottom: 4px;">
                                    <div style="flex: 1;"><span style="color:#0066FF; font-weight:bold; font-size:12px;">Objetivo:</span> <span style="font-size:12px; color:#334155;">${e.objetivo || "-"}</span></div>
                                    <div style="flex: 1;"><span style="color:#0066FF; font-weight:bold; font-size:12px;">Docentes:</span> <span style="font-size:12px; color:#334155;">${e.docentes || "-"}</span></div>
                                </div>
                                <div style="margin-bottom: 4px;"><span style="color:#0066FF; font-weight:bold; font-size:12px;">Req:</span> <span style="font-size:12px; color:#334155;">${e.requerimientos || "-"}</span></div>
                                ${e.observacion ? `<div style="font-size: 11px; color: #64748b; font-style: italic;">${e.observacion}</div>` : ''}
                            </td>
                        </tr>`;
                } else {
                    htmlHojaCompleta += `
                        <tr style="background-color: #ffffff;">
                            <td style="padding: 12px 10px; text-align: center; border: 1px solid #cbd5e1; font-weight: 800; color: #1e293b; font-size: 13px; vertical-align: middle; background-color: #f8fafc;">${textoFechas}</td>
                            <td style="padding: 12px 10px; border: 1px solid #cbd5e1; vertical-align: top;">
                                <div style="display: flex; justify-content: space-between; align-items: center; gap: 15px;">
                                    <div style="flex-grow: 1;">
                                        <div style="font-size: 14px; font-weight: bold; color: #0f172a; margin-bottom: 3px;">${e.titulo}</div>
                                        ${e.desc ? `<div style="font-size: 12px; color: #64748b; line-height: 1.3;">${e.desc}</div>` : ''}
                                    </div>
                                    <div style="flex-shrink: 0;"><span style="font-size: 10px; font-weight: bold; background: #fee2e2; color: #b91c1c; padding: 4px 8px; border-radius: 4px; border: 1px solid #fca5a5; text-transform: uppercase;">${e.tipo_evento}</span></div>
                                </div>
                            </td>
                        </tr>`;
                }
            });

            htmlHojaCompleta += `
                        </tbody>
                    </table>
                </div>
                <div style="height: 60px; border-top: 3px solid #D81B60; padding-top: 15px; display: flex; justify-content: space-between; align-items: center;">
                    <img src="assets/img/logoMPPE.png" style="height: 45px; width: auto; object-fit: contain;">
                    <div style="font-size: 12px; color: #64748b; font-weight: bold;">Página ${idx + 1} de ${totalPaginas}</div>
                </div>
            </div>`;

            zone.innerHTML = htmlHojaCompleta;
            await new Promise(resolve => setTimeout(resolve, 400)); 
            
            const hojaDOM = document.getElementById(`hoja-completa-${idx}`);
            const canvas = await html2canvas(hojaDOM, { scale: 3, useCORS: true, logging: false });
            const imgData = canvas.toDataURL('image/jpeg', 0.95); 
            
            if (idx > 0) { doc.addPage(); }
            doc.addImage(imgData, 'JPEG', 0, 0, pdfAnchoMM, pdfAltoMM, undefined, 'FAST'); 
        }

        doc.save(`Calendario_${this.tabActivo}_UE_LB_${this.periodoActivo}.pdf`);
        zone.innerHTML = '';
        Aplicacion.ocultarCarga();
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `PDF ${this.tabActivo} descargado.`, showConfirmButton: false, timer: 3000 });
    }
};

window.init_Calendario_Escolar = function() { ModCalendario.cargarCalendario(); };