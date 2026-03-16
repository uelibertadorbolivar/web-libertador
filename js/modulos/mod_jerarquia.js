/**
 * MÓDULO: CADENA SUPERVISORIA (PDF AVANZADO, FILTROS Y NOMBRES RESTAURADOS)
 * BLINDADO CON window.ModJerarquia
 */

window.ModJerarquia = {
    cargos: [], usuarios: [], vistaActualOculta: null,
    
    init: function() {
        this.dibujarDashboardTarjetas();
        this.cargarDatosMaestros();
    },

    dibujarDashboardTarjetas: function() {
        let pVer = window.Aplicacion.permiso('Cadena Supervisoria', 'ver');
        let html = `
        <div class="col-md-6 col-xl-4">
            <div class="tarjeta-btn p-4 text-center h-100 shadow-sm ${pVer ? '' : 'bloqueado'}" onclick="window.ModJerarquia.abrirVistaSegura('Constructor')">
                <div class="bg-primary bg-opacity-10 d-inline-block p-3 rounded-circle mb-3"><i class="bi bi-diagram-3-fill text-primary fs-1"></i></div>
                <h5 class="fw-bold text-dark">Estructurar Cadena</h5>
                <p class="small text-muted mb-2">Conectar jefes y subordinados.</p>
                ${!pVer ? '<span class="badge bg-danger"><i class="bi bi-lock-fill"></i> Bloqueado</span>' : ''}
            </div>
        </div>
        <div class="col-md-6 col-xl-4">
            <div class="tarjeta-btn p-4 text-center h-100 shadow-sm ${pVer ? '' : 'bloqueado'}" onclick="window.ModJerarquia.abrirVistaSegura('Mapa')">
                <div class="bg-dark bg-opacity-10 d-inline-block p-3 rounded-circle mb-3"><i class="bi bi-bezier2 text-dark fs-1"></i></div>
                <h5 class="fw-bold text-dark">Ver Mapa / Exportar</h5>
                <p class="small text-muted mb-2">Filtros, nombres y PDF oficial.</p>
            </div>
        </div>`;
        document.getElementById('jerarquia-dashboard').innerHTML = html;

        if(!window.Aplicacion.permiso('Cadena Supervisoria', 'editar')) {
            document.getElementById('btn-guardar-jerarquia-area').innerHTML = `<div class="text-center text-danger fw-bold"><i class="bi bi-lock me-1"></i> Sin permisos para modificar estructura.</div>`;
        }
    },

    abrirVistaSegura: function(vista) {
        if(!window.Aplicacion.permiso('Cadena Supervisoria', 'ver')) return;
        let dash = document.getElementById('jerarquia-dashboard');
        dash.classList.add('animate__fadeOutLeft');
        setTimeout(() => {
            dash.classList.add('d-none'); dash.classList.remove('animate__fadeOutLeft');
            let panel = document.getElementById(`vista-${vista.toLowerCase()}`);
            panel.classList.remove('d-none'); panel.classList.add('animate__fadeInRight');
            document.getElementById('btn-volver-dashboard').classList.remove('d-none');
            document.getElementById('titulo-jerarquia-main').innerText = vista === 'Mapa' ? 'Organigrama' : 'Estructura';
            this.vistaActualOculta = vista;
            
            if(vista === 'Mapa') this.dibujarOrganigrama();
        }, 300);
    },

    volverDashboard: function() {
        if(!this.vistaActualOculta) return;
        let panel = document.getElementById(`vista-${this.vistaActualOculta.toLowerCase()}`);
        panel.classList.replace('animate__fadeInRight', 'animate__fadeOutRight');
        document.getElementById('btn-volver-dashboard').classList.add('d-none');
        setTimeout(() => {
            panel.classList.add('d-none'); panel.classList.remove('animate__fadeOutRight');
            let dash = document.getElementById('jerarquia-dashboard');
            dash.classList.remove('d-none'); dash.classList.add('animate__fadeInLeft');
            document.getElementById('titulo-jerarquia-main').innerText = "Cadena Supervisoria";
            this.vistaActualOculta = null;
        }, 300);
    },

    // CARGAMOS CARGOS Y USUARIOS AL MISMO TIEMPO PARA EL SWITCH DE NOMBRES
    cargarDatosMaestros: function() {
        window.Aplicacion.mostrarCarga();
        window.Aplicacion.peticion({ action: "get_cargos" }, (resC) => {
            if (resC && resC.cargos) this.cargos = resC.cargos;
            
            window.Aplicacion.peticion({ action: "get_users" }, (resU) => {
                window.Aplicacion.ocultarCarga();
                if(resU && resU.users) this.usuarios = resU.users;
                this.poblarSelectores();
            });
        });
    },

    poblarSelectores: function() {
        let sel1 = document.getElementById('sel-supervisor');
        let sel2 = document.getElementById('filtro-rama');
        let html = '<option value="">-- Elija un Cargo --</option>';
        let htmlFiltro = '<option value="">Mostrar Toda la Escuela</option>';
        
        this.cargos.forEach(c => {
            let opt = `<option value="${c.id_cargo}">${c.nombre_cargo}</option>`;
            html += opt; htmlFiltro += opt;
        });
        
        if(sel1) sel1.innerHTML = html;
        if(sel2) sel2.innerHTML = htmlFiltro;
    },

    alCambiarSupervisor: function() {
        const idSup = document.getElementById('sel-supervisor').value;
        const lista = document.getElementById('lista-cargos-check');
        const info = document.getElementById('info-supervisor');
        
        if (!idSup) {
            lista.innerHTML = '<div class="col-12 text-center text-muted py-4">Esperando selección...</div>';
            info.innerHTML = '<i class="bi bi-info-circle-fill text-info me-2"></i>Seleccione un cargo arriba.';
            return;
        }

        let sup = this.cargos.find(c => c.id_cargo === idSup);
        info.innerHTML = `<h6 class="fw-bold mb-1 text-primary">${sup.nombre_cargo}</h6><span class="badge bg-secondary">${sup.tipo_cargo}</span>`;

        let htmlLista = '';
        this.cargos.forEach(c => {
            if (c.id_cargo === idSup) return;
            if (String(sup.depende_de) === String(c.id_cargo)) return; 
            
            let isChecked = String(c.depende_de) === String(idSup) ? 'checked' : '';
            let yaTieneJefe = (c.depende_de && c.depende_de !== idSup) ? `(Depende de: ${this.obtenerNombre(c.depende_de)})` : '';
            let colorClase = yaTieneJefe ? 'text-warning' : 'text-dark';

            htmlLista += `
            <div class="col-md-6 col-lg-4">
                <div class="form-check bg-white border p-3 rounded shadow-sm hover-efecto" style="cursor: pointer;" onclick="document.getElementById('chk-${c.id_cargo}').click()">
                    <input class="form-check-input ms-0 me-2" type="checkbox" value="${c.id_cargo}" id="chk-${c.id_cargo}" ${isChecked} onclick="event.stopPropagation()">
                    <label class="form-check-label fw-bold ${colorClase}" for="chk-${c.id_cargo}" style="font-size: 0.9rem; cursor: pointer;">
                        ${c.nombre_cargo} <br><small class="text-muted fw-normal">${yaTieneJefe}</small>
                    </label>
                </div>
            </div>`;
        });
        lista.innerHTML = htmlLista || '<div class="col-12 text-center text-muted py-4">No hay más cargos.</div>';
    },

    obtenerNombre: function(id) { let c = this.cargos.find(x => x.id_cargo === id); return c ? c.nombre_cargo : 'Desconocido'; },

    guardarJerarquia: function() {
        const idSup = document.getElementById('sel-supervisor').value;
        if (!idSup) return Swal.fire('Aviso', 'Seleccione el supervisor primero.', 'warning');
        let seleccionados = [];
        document.querySelectorAll('input[type="checkbox"][id^="chk-"]:checked').forEach(chk => seleccionados.push(chk.value));
        window.Aplicacion.mostrarCarga();
        window.Aplicacion.peticion({ action: 'save_jerarquia', id_supervisor: idSup, supervisados: seleccionados }, (res) => {
            if (res && res.status === 'success') {
                Swal.fire({toast: true, position: 'top-end', icon: 'success', title: 'Estructura actualizada', showConfirmButton: false, timer: 3000});
                this.cargarDatosMaestros();
                document.getElementById('lista-cargos-check').innerHTML = '<div class="col-12 text-center text-muted py-4">Actualizado. Seleccione otro supervisor.</div>';
                document.getElementById('sel-supervisor').value = ''; document.getElementById('info-supervisor').innerHTML = '';
            }
        });
    },

    // ALGORITMO RECURSIVO PARA EL FILTRO DE RAMA
    obtenerRamaDescendiente: function(idRaiz) {
        let rama = [];
        let cargosMap = {};
        this.cargos.forEach(c => cargosMap[c.id_cargo] = c);
        
        let agregarDescendientes = (idJefe) => {
            let hijos = this.cargos.filter(c => String(c.depende_de) === String(idJefe));
            hijos.forEach(h => {
                if(!rama.find(r => r.id_cargo === h.id_cargo)) { // evitar bucles infinitos
                    rama.push(h);
                    agregarDescendientes(h.id_cargo);
                }
            });
        };
        
        if(cargosMap[idRaiz]) {
            let raiz = { ...cargosMap[idRaiz], depende_de: '' }; // Rompemos el enlace hacia arriba para que quede de rey
            rama.push(raiz);
            agregarDescendientes(idRaiz);
        }
        return rama;
    },

    dibujarOrganigrama: function() {
        if (typeof google === 'undefined' || !google.visualization) {
            google.charts.load('current', {packages:["orgchart"]});
            google.charts.setOnLoadCallback(() => this.renderChart());
        } else { this.renderChart(); }
    },

    renderChart: function() {
        let div = document.getElementById('chart_div');
        if (!div) return;
        if (this.cargos.length === 0) { div.innerHTML = "No hay cargos creados."; return; }

        let idFiltro = document.getElementById('filtro-rama').value;
        let mostrarNombres = document.getElementById('chk-nombres').checked;
        
        let cargosARenderizar = idFiltro ? this.obtenerRamaDescendiente(idFiltro) : this.cargos;

        let data = new google.visualization.DataTable();
        data.addColumn('string', 'Name'); data.addColumn('string', 'Manager'); data.addColumn('string', 'ToolTip');

        let filas = [];
        cargosARenderizar.forEach(c => {
            let tipo = (c.tipo_cargo || '').toLowerCase();
            let cBg = '#ffffff', cBorde = '#0066FF', cTexto = '#0066FF';
            
            if(tipo.includes('directiv')) { cBg = '#f5f3ff'; cBorde = '#7c3aed'; cTexto = '#5b21b6'; } 
            else if(tipo.includes('coord')) { cBg = '#eff6ff'; cBorde = '#2563eb'; cTexto = '#1d4ed8'; } 
            else if(tipo.includes('docen') || tipo.includes('pedag')) { cBg = '#f0fdf4'; cBorde = '#16a34a'; cTexto = '#14532d'; } 
            else if(tipo.includes('admin')) { cBg = '#fffbeb'; cBorde = '#d97706'; cTexto = '#78350f'; } 
            else if(tipo.includes('obrer') || tipo.includes('apoyo')) { cBg = '#f8fafc'; cBorde = '#475569'; cTexto = '#0f172a'; } 
            else { cBg = '#ffffff'; cBorde = '#0ea5e9'; cTexto = '#0369a1'; } 

            // Lógica para inyectar el nombre de las personas asignadas
            let htmlNombres = '';
            if(mostrarNombres) {
                let dueños = this.usuarios.filter(u => String(u.cargo) === String(c.id_cargo));
                if(dueños.length > 0) {
                    let lista = dueños.map(d => `<div style="font-weight:bold; color:#1e293b; margin-top:2px;">${d.nombre_completo}</div>`).join('');
                    htmlNombres = `<div style="margin-top:8px; padding-top:6px; border-top:1px dashed ${cBorde}; font-size:11px;">${lista}</div>`;
                } else {
                    htmlNombres = `<div style="margin-top:8px; padding-top:6px; border-top:1px dashed ${cBorde}; font-size:11px; color:#ef4444; font-weight:bold; font-style:italic;">Vacante</div>`;
                }
            }

            let formatedNode = {
                v: c.id_cargo,
                f: `<div style="border:3px solid ${cBorde}; border-radius:12px; padding:15px; background:${cBg}; min-width:180px; box-shadow:0 6px 12px rgba(0,0,0,0.08);">
                        <div style="color:${cTexto}; font-weight:900; font-size:14px; font-family:sans-serif; text-transform:uppercase; margin-bottom:4px;">${c.nombre_cargo}</div>
                        <div style="color:#475569; font-size:11px; font-family:sans-serif; font-weight:600;">${c.tipo_cargo}</div>
                        ${htmlNombres}
                    </div>`
            };
            filas.push([formatedNode, c.depende_de || '', c.descripcion || '']);
        });

        data.addRows(filas);
        let chart = new google.visualization.OrgChart(div);
        chart.draw(data, {allowHtml: true, allowCollapse: true, size: 'large', nodeClass: 'nodo-org', selectedNodeClass: 'nodo-org-sel'});
    },

    // ==========================================
    // EXPORTACIÓN PDF CON PROMPT Y AUTO-ESCALADO
    // ==========================================
    prepararPDF: function() {
        Swal.fire({
            title: 'Exportar Organigrama',
            text: '¿Cómo desea orientar la hoja PDF?',
            icon: 'question',
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: '<i class="bi bi-aspect-ratio me-1"></i> Horizontal',
            denyButtonText: '<i class="bi bi-file-earmark-pdf me-1"></i> Vertical',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#0066FF',
            denyButtonColor: '#455A64'
        }).then((result) => {
            if (result.isConfirmed) { this.generarPDFOficial('landscape'); } 
            else if (result.isDenied) { this.generarPDFOficial('portrait'); }
        });
    },

    obtenerImagenBase64: function(url) {
        return new Promise((resolve) => {
            let img = new Image(); img.crossOrigin = 'Anonymous';
            img.onload = () => {
                let canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height;
                let ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0); resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = () => resolve(null); img.src = url;
        });
    },

    generarPDFOficial: async function(orientacion) {
        let div = document.getElementById('chart_div');
        if(!div || div.innerHTML === '') return Swal.fire('Atención', 'No hay organigrama para exportar.', 'warning');
        
        window.Aplicacion.mostrarCarga();
        try {
            const base64LogoEscuela = await this.obtenerImagenBase64('assets/img/logo.png');
            const base64CintilloMPPE = await this.obtenerImagenBase64('assets/img/logoMPPE.png');

            // Truco maestro para evitar el recorte del scroll en mapas gigantes
            let clon = div.cloneNode(true);
            clon.style.width = "max-content"; // Auto ajusta al ancho real de la estructura
            clon.style.height = "max-content"; 
            clon.style.padding = "40px"; // Margen de respiración
            clon.style.position = "absolute"; 
            clon.style.top = "-9999px"; 
            clon.style.left = "-9999px"; 
            clon.style.background = "#ffffff";
            document.body.appendChild(clon);

            const canvas = await html2canvas(clon, { scale: 2, backgroundColor: '#ffffff', logging: false });
            document.body.removeChild(clon);
            const imgData = canvas.toDataURL('image/png');

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: orientacion, unit: 'mm', format: 'letter' });
            
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 15;

            // --- ENCABEZADO OFICIAL ---
            let textX = margin; 
            if (base64LogoEscuela) { doc.addImage(base64LogoEscuela, 'PNG', margin, margin, 16, 16); textX = margin + 20; }

            doc.setTextColor(30, 41, 59); doc.setFontSize(9); doc.setFont("helvetica", "normal");
            doc.text("República Bolivariana de Venezuela", textX, margin + 5);
            doc.text("Ministerio del Poder Popular para la Educación", textX, margin + 10);
            doc.setFont("helvetica", "bold"); doc.text("Unidad Educativa Libertador Bolívar", textX, margin + 15);

            doc.setTextColor(0, 102, 255); doc.setFontSize(16);
            doc.text("ORGANIGRAMA INSTITUCIONAL", pageWidth / 2, margin + 25, { align: "center" });
            
            let anioEscolar = (window.Aplicacion && window.Aplicacion.momentoActual) ? window.Aplicacion.momentoActual.anioEscolar : "2025 - 2026";
            
            doc.setTextColor(100, 116, 139); doc.setFontSize(10);
            doc.text(`Período Escolar: ${anioEscolar}`, pageWidth / 2, margin + 31, { align: "center" });

            doc.setDrawColor(0, 102, 255); doc.setLineWidth(1.5); doc.line(margin, margin + 35, pageWidth - margin, margin + 35);

            // --- MATEMÁTICA DE AUTO-ESCALADO ---
            const availableWidth = pageWidth - (margin * 2);
            const availableHeight = pageHeight - margin - 35 - 20; // 20 para el pie de página
            const imgProps = doc.getImageProperties(imgData);
            
            // Calculamos cuánto debemos encoger la imagen para que quepa tanto de ancho como de alto sin deformarse
            const ratio = Math.min(availableWidth / imgProps.width, availableHeight / imgProps.height);
            
            let finalWidth = imgProps.width * ratio;
            let finalHeight = imgProps.height * ratio;

            // Centrado perfecto
            const x = margin + ((availableWidth - finalWidth) / 2);
            const y = margin + 40;

            doc.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);

            // --- PIE DE PÁGINA ---
            doc.setDrawColor(220, 38, 38); doc.setLineWidth(0.5); doc.line(margin, pageHeight - margin - 8, pageWidth - margin, pageHeight - margin - 8);
            if (base64CintilloMPPE) { doc.addImage(base64CintilloMPPE, 'PNG', margin, pageHeight - margin - 6, 35, 6); }
            doc.setTextColor(100, 116, 139); doc.setFontSize(8); doc.setFont("helvetica", "normal");
            const fechaHoy = new Date().toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            doc.text(`Generado: ${fechaHoy}`, margin + 40, pageHeight - margin - 1.5);
            doc.text("Sistema SIGAE v1.0", pageWidth / 2, pageHeight - margin - 1.5, { align: "center" });

            doc.save('Organigrama_Institucional.pdf');
            window.Aplicacion.ocultarCarga();

        } catch(error) {
            console.error(error); window.Aplicacion.ocultarCarga(); Swal.fire('Error', 'Fallo al generar el PDF.', 'error');
        }
    }
};

window.init_Cadena_Supervisoria = function() { window.ModJerarquia.init(); };