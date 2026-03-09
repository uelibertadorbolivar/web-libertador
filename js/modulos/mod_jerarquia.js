/**
 * MÓDULO: CADENA SUPERVISORIA (ORGANIGRAMA Y PDF)
 * BLINDADO Y CON SOPORTE DE GOOGLE CHARTS + JSPDF
 */

window.ModJerarquia = {
    cargos: [],
    personal: [],
    chartsCargado: false,
    
    init: function() {
        if (!this.chartsCargado && typeof google !== 'undefined') {
            google.charts.load('current', {packages:["orgchart"]});
            google.charts.setOnLoadCallback(() => {
                this.chartsCargado = true;
                this.cargarTodo();
            });
        } else {
            this.cargarTodo();
        }
    },

    cambiarTab: function(vista) {
        if (vista === 'Asignar') {
            document.getElementById('tab-asignar').classList.add('active', 'bg-primary', 'text-white');
            document.getElementById('tab-asignar').classList.remove('text-secondary');
            document.getElementById('tab-organigrama').classList.remove('active', 'bg-primary', 'text-white');
            document.getElementById('tab-organigrama').classList.add('text-secondary');
            
            document.getElementById('vista-asignar').classList.remove('d-none');
            document.getElementById('vista-organigrama').classList.add('d-none');
        } else {
            document.getElementById('tab-organigrama').classList.add('active', 'bg-primary', 'text-white');
            document.getElementById('tab-organigrama').classList.remove('text-secondary');
            document.getElementById('tab-asignar').classList.remove('active', 'bg-primary', 'text-white');
            document.getElementById('tab-asignar').classList.add('text-secondary');
            
            document.getElementById('vista-organigrama').classList.remove('d-none');
            document.getElementById('vista-asignar').classList.add('d-none');
            
            this.dibujarOrganigrama();
        }
    },

    cargarTodo: function() {
        if(typeof Aplicacion !== 'undefined') Aplicacion.mostrarCarga();
        
        Aplicacion.peticion({ action: "get_cargos" }, (resCargos) => {
            this.cargos = (resCargos && resCargos.cargos) ? resCargos.cargos : [];
            
            Aplicacion.peticion({ action: "get_users" }, (resUsers) => {
                if(typeof Aplicacion !== 'undefined') Aplicacion.ocultarCarga(); 
                this.personal = (resUsers && resUsers.users) ? resUsers.users : [];
                
                this.llenarSelectores();
            });
        });
    },

    llenarSelectores: function() {
        let opciones = '<option value="">-- Seleccione el Cargo --</option>';
        let opcionesFiltro = '<option value="">Vista General (Todos)</option>';
        
        this.cargos.forEach(c => {
            opciones += `<option value="${c.id_cargo}">${c.nombre_cargo} (${c.tipo_cargo})</option>`;
            opcionesFiltro += `<option value="${c.id_cargo}">Solo rama de: ${c.nombre_cargo}</option>`;
        });
        
        document.getElementById('sel-supervisor').innerHTML = opciones;
        document.getElementById('filtro-organigrama').innerHTML = opcionesFiltro;
    },

    cargarSubordinados: function() {
        let supervisorId = document.getElementById('sel-supervisor').value;
        let msj = document.getElementById('mensaje-seleccione');
        let panel = document.getElementById('panel-subordinados');
        
        if(!supervisorId) {
            msj.classList.remove('d-none');
            panel.classList.add('d-none');
            return;
        }

        msj.classList.add('d-none');
        panel.classList.remove('d-none');

        let html = '';
        this.cargos.forEach(c => {
            if(c.id_cargo === supervisorId) return; 

            let isChecked = (c.depende_de === supervisorId) ? 'checked' : '';
            let isWarning = '';
            
            if(c.depende_de && c.depende_de !== supervisorId) {
                let nombreJefe = this.cargos.find(x => x.id_cargo === c.depende_de)?.nombre_cargo || 'Otro';
                isWarning = `<span class="badge bg-warning text-dark ms-2" style="font-size:0.7rem;"><i class="bi bi-exclamation-triangle"></i> Asignado a: ${nombreJefe}</span>`;
            }

            html += `
            <div class="form-check custom-checkbox p-2 border-bottom hover-efecto">
                <input class="form-check-input chk-subordinado" type="checkbox" value="${c.id_cargo}" id="chk-${c.id_cargo}" ${isChecked} style="transform: scale(1.3); margin-top:0.3rem;">
                <label class="form-check-label fw-bold text-dark ms-2 w-100 cursor-pointer" for="chk-${c.id_cargo}">
                    ${c.nombre_cargo} <span class="text-muted fw-normal small">(${c.tipo_cargo})</span>
                    ${isWarning}
                </label>
            </div>`;
        });
        
        document.getElementById('lista-subordinados').innerHTML = html;
    },

    guardarJerarquia: function() {
        let supervisorId = document.getElementById('sel-supervisor').value;
        if(!supervisorId) return Swal.fire('Error', 'Debe seleccionar un supervisor.', 'error');

        let checks = document.querySelectorAll('.chk-subordinado:checked');
        let supervisadosIds = Array.from(checks).map(chk => chk.value);

        Aplicacion.mostrarCarga();
        Aplicacion.peticion({ 
            action: "save_jerarquia", 
            id_supervisor: supervisorId, 
            supervisados: supervisadosIds 
        }, (res) => {
            if (res && res.status === "success") {
                Swal.fire({toast: true, position: 'top-end', icon: 'success', title: res.message, showConfirmButton: false, timer: 3000});
                this.cargarTodo(); 
            } else {
                Aplicacion.ocultarCarga();
                Swal.fire('Error', res ? res.message : 'Error al guardar.', 'error');
            }
        });
    },

    dibujarOrganigrama: function() {
        if(!this.chartsCargado || this.cargos.length === 0) return;

        var data = new google.visualization.DataTable();
        data.addColumn('string', 'ID');
        data.addColumn('string', 'Jefe');
        data.addColumn('string', 'Tooltip');

        let mostrarNombres = document.getElementById('chk-nombres').checked;
        let raizSeleccionada = document.getElementById('filtro-organigrama').value;

        let nodos = [];
        this.cargos.forEach(c => {
            let personalDeEsteCargo = this.personal.filter(u => u.cargo === c.nombre_cargo);
            let htmlNombres = '';
            
            if (mostrarNombres && personalDeEsteCargo.length > 0) {
                 let listadoNombres = personalDeEsteCargo.map(u => `&bull; ${u.nombre_completo}`).join('<br>');
                 htmlNombres = `<div style="margin-top:8px; padding-top:6px; border-top:1px dashed #e2e8f0; font-size:11px; color:#475569; text-align:left; line-height:1.2;">${listadoNombres}</div>`;
            } else if (mostrarNombres && personalDeEsteCargo.length === 0) {
                 htmlNombres = `<div style="margin-top:8px; padding-top:6px; border-top:1px dashed #e2e8f0; font-size:10px; color:#ef4444; font-style:italic;">Sin asignar</div>`;
            }

            let colorBorde = '#0066FF';
            if (c.tipo_cargo === 'Gerencial') colorBorde = '#dc2626';
            else if (c.tipo_cargo === 'Supervisorio') colorBorde = '#ea580c';
            else if (c.tipo_cargo === 'Docente') colorBorde = '#16a34a';
            
            let htmlFormato = `
            <div style="border: 3px solid ${colorBorde}; border-radius: 12px; background: white; padding: 12px; width: 170px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin: 0 auto; text-align: center;">
                <div style="font-weight: 800; color: #1e293b; font-size:13px; margin-bottom:6px; line-height:1.2;">${c.nombre_cargo}</div>
                <div style="font-size: 10px; color: white; background: ${colorBorde}; border-radius: 4px; padding: 2px 6px; display:inline-block; font-weight:bold;">${c.tipo_cargo}</div>
                ${htmlNombres}
            </div>`;

            let parent = c.depende_de || '';
            nodos.push([ {v: c.id_cargo, f: htmlFormato}, parent, c.descripcion || 'Cargo Institucional' ]);
        });

        if (raizSeleccionada) {
           let nodosFiltrados = [];
           let idsPermitidos = new Set([raizSeleccionada]);
           let cambiando = true;
           
           while(cambiando) {
               cambiando = false;
               nodos.forEach(n => {
                   if (idsPermitidos.has(n[1]) && !idsPermitidos.has(n[0].v)) {
                       idsPermitidos.add(n[0].v);
                       cambiando = true;
                   }
               });
           }
           
           nodosFiltrados = nodos.filter(n => idsPermitidos.has(n[0].v));
           let rootNode = nodosFiltrados.find(n => n[0].v === raizSeleccionada);
           if(rootNode) rootNode[1] = '';
           
           data.addRows(nodosFiltrados);
        } else {
           data.addRows(nodos);
        }

        var chart = new google.visualization.OrgChart(document.getElementById('chart_div'));
        chart.draw(data, {'allowHtml':true, 'allowCollapse':true, 'size': 'medium'});
    },

    // ==========================================
    // FUNCIÓN AUXILIAR: CARGAR IMÁGENES A BASE64
    // ==========================================
    obtenerImagenBase64: function(url) {
        return new Promise((resolve) => {
            let img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                let canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                let ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = () => resolve(null); 
            img.src = url;
        });
    },

    // ==========================================
    // SISTEMA DE EXPORTACIÓN PDF CON LOGOS (IZQUIERDA)
    // ==========================================
    imprimirPDF: function() {
        if (!this.chartsCargado || this.cargos.length === 0) return Swal.fire('Atención', 'No hay datos para generar el organigrama.', 'warning');

        Swal.fire({
            title: 'Configuración de Página',
            text: 'Seleccione la orientación del documento (Hoja Carta).',
            icon: 'question',
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: '<i class="bi bi-aspect-ratio me-1"></i> Horizontal',
            denyButtonText: '<i class="bi bi-file-earmark-pdf me-1"></i> Vertical',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#0066FF',
            denyButtonColor: '#455A64'
        }).then((result) => {
            if (result.isConfirmed) {
                this.generarDocumento('landscape'); 
            } else if (result.isDenied) {
                this.generarDocumento('portrait'); 
            }
        });
    },

    generarDocumento: async function(orientacion) {
        Aplicacion.mostrarCarga();

        // Precargar Logos Institucionales
        const base64LogoEscuela = await this.obtenerImagenBase64('assets/img/logo.png');
        const base64CintilloMPPE = await this.obtenerImagenBase64('assets/img/logoMPPE.png');

        const chartContenedor = document.getElementById('chart_div');
        const innerTable = chartContenedor.querySelector('.google-visualization-orgchart-table');

        if (!innerTable) {
            Aplicacion.ocultarCarga();
            return Swal.fire('Error', 'El gráfico no está visible.', 'error');
        }

        const anchoReal = Math.max(innerTable.offsetWidth, chartContenedor.scrollWidth) + 80;
        const altoReal = Math.max(innerTable.offsetHeight, chartContenedor.scrollHeight) + 80;

        const originalCssText = chartContenedor.style.cssText;
        const originalScrollX = window.scrollX;
        const originalScrollY = window.scrollY;

        // Estirar la caja a la fuerza bruta
        chartContenedor.style.cssText = `
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: ${anchoReal}px !important;
            height: ${altoReal}px !important;
            max-width: none !important;
            max-height: none !important;
            overflow: visible !important;
            background: #ffffff !important;
            z-index: 9999 !important;
            padding: 40px !important;
            margin: 0 !important;
            border: none !important;
            text-align: center !important;
        `;

        await new Promise(resolve => setTimeout(resolve, 300));

        try {
            window.scrollTo(0, 0);

            // Foto del diagrama
            const canvasChart = await html2canvas(chartContenedor, {
                scale: 2, 
                width: anchoReal,
                height: altoReal,
                windowWidth: anchoReal + 200, 
                windowHeight: altoReal + 200,
                x: 0, 
                y: 0, 
                scrollX: 0, 
                scrollY: 0,
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false
            });

            const imgData = canvasChart.toDataURL('image/png');

            // Restaurar pantalla
            chartContenedor.style.cssText = originalCssText;
            window.scrollTo(originalScrollX, originalScrollY);

            // Generar PDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: orientacion, unit: 'mm', format: 'letter' });

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 15;

            // --- HEADER OFICIAL (Logo a la izquierda) ---
            
            let textX = margin; // Posición X inicial para el texto
            
            if (base64LogoEscuela) {
                // Inyectar Logo de la Escuela (Arriba a la Izquierda)
                doc.addImage(base64LogoEscuela, 'PNG', margin, margin, 16, 16);
                // Desplazamos el texto a la derecha para que no pise el logo (16mm logo + 4mm espacio)
                textX = margin + 20; 
            }

            doc.setTextColor(30, 41, 59); 
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            
            doc.text("República Bolivariana de Venezuela", textX, margin + 5);
            doc.text("Ministerio del Poder Popular para la Educación", textX, margin + 10);
            doc.setFont("helvetica", "bold");
            doc.text("Unidad Educativa Libertador Bolívar", textX, margin + 15);

            doc.setTextColor(0, 102, 255);
            doc.setFontSize(16);
            doc.text("ORGANIGRAMA INSTITUCIONAL", pageWidth / 2, margin + 25, { align: "center" });
            
            let selectFiltro = document.getElementById('filtro-organigrama');
            let nombreFiltro = selectFiltro.options[selectFiltro.selectedIndex].text;
            let anioEscolar = (window.Aplicacion && window.Aplicacion.momentoActual) ? window.Aplicacion.momentoActual.anioEscolar : "2025 - 2026";
            
            doc.setTextColor(100, 116, 139);
            doc.setFontSize(10);
            doc.text(`Período Escolar: ${anioEscolar} | Filtro: ${nombreFiltro}`, pageWidth / 2, margin + 31, { align: "center" });

            doc.setDrawColor(0, 102, 255);
            doc.setLineWidth(1.5);
            doc.line(margin, margin + 36, pageWidth - margin, margin + 36);

            // --- CÁLCULO DE ESCALA PARA ENCAJAR PERFECTO ---
            const availableWidth = pageWidth - (margin * 2);
            const availableHeight = pageHeight - margin - 36 - 25; 

            const imgProps = doc.getImageProperties(imgData);
            const imgRatio = imgProps.width / imgProps.height;
            const availableRatio = availableWidth / availableHeight;

            let finalWidth, finalHeight;

            if (imgRatio > availableRatio) {
                finalWidth = availableWidth;
                finalHeight = availableWidth / imgRatio;
            } else {
                finalHeight = availableHeight;
                finalWidth = availableHeight * imgRatio;
            }

            const xOffset = margin + (availableWidth - finalWidth) / 2;
            const yOffset = margin + 40 + (availableHeight - finalHeight) / 2;

            doc.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);

            // --- FOOTER ---
            doc.setDrawColor(220, 38, 38); 
            doc.setLineWidth(0.5);
            doc.line(margin, pageHeight - margin - 8, pageWidth - margin, pageHeight - margin - 8);

            // Inyectar Cintillo MPPE (Abajo a la izquierda)
            if (base64CintilloMPPE) {
                doc.addImage(base64CintilloMPPE, 'PNG', margin, pageHeight - margin - 6, 35, 6);
            }

            doc.setTextColor(100, 116, 139);
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            
            const fechaHoy = new Date().toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            
            doc.text(`Generado: ${fechaHoy}`, margin + 40, pageHeight - margin - 1.5);
            doc.text("Sistema SIGAE v1.0", pageWidth / 2, pageHeight - margin - 1.5, { align: "center" });
            doc.text("Página 1 de 1", pageWidth - margin, pageHeight - margin - 1.5, { align: "right" });

            let filename = `Organigrama_${nombreFiltro.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
            doc.save(filename);

            Aplicacion.ocultarCarga();
            Swal.fire({toast: true, position: 'top-end', icon: 'success', title: 'PDF Generado exitosamente.', showConfirmButton: false, timer: 3000});

        } catch (error) {
            console.error(error);
            chartContenedor.style.cssText = originalCssText; 
            window.scrollTo(originalScrollX, originalScrollY);
            Aplicacion.ocultarCarga();
            Swal.fire('Error', 'Hubo un problema al generar el PDF. Intente nuevamente.', 'error');
        }
    }
};

// ==========================================
// LLAVES DE ENRUTADOR DINÁMICO
// ==========================================
window.init_Cadena_Supervisoria = function() { window.ModJerarquia.init(); };