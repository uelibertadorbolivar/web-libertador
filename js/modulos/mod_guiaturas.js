/**
 * MÓDULO: ASIGNACIÓN DE GUIATURAS (100% COMPLETO, PDF HORIZONTAL Y MATRIZ)
 * BLINDADO CON window.ModGuiaturas
 */

window.ModGuiaturas = {
    salones: [], docentes: [],
    
    init: function() {
        this.cargarTodo();
    },

    cargarTodo: function(silencioso = false) {
        if(!silencioso && typeof window.Aplicacion !== 'undefined') window.Aplicacion.mostrarCarga();
        
        window.Aplicacion.peticion({ action: "get_guiaturas_data" }, (res) => {
            if(!silencioso && typeof window.Aplicacion !== 'undefined') window.Aplicacion.ocultarCarga(); 
            
            if (res && res.status === "success") {
                this.salones = res.salones || [];
                this.docentes = res.docentes || [];
                this.dibujarTabla();
                this.llenarFiltroExportar();
            } else {
                Swal.fire('Error', 'No se pudieron cargar los datos de guiaturas.', 'error');
            }
        });
    },

    llenarFiltroExportar: function() {
        let filtro = document.getElementById('filtro-exportar');
        if (!filtro) return;
        let nivelesUnicos = [...new Set(this.salones.map(s => s.nivel_educativo).filter(n => n))];
        let html = '<option value="Todos">Exportar Todos los Niveles</option>';
        nivelesUnicos.forEach(n => { html += `<option value="${n}">Solo ${n}</option>`; });
        filtro.innerHTML = html;
    },

    dibujarTabla: function() {
        const tbody = document.getElementById('tabla-guiaturas');
        if (!tbody) return;

        if (this.salones.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center py-5 text-muted">No hay salones aperturados en el sistema.</td></tr>`;
            return;
        }

        // SEGURIDAD: Matriz de permisos para ver si puede guardar
        let puedeEditar = window.Aplicacion.permiso('Asignar Guiaturas', 'editar');

        let html = '';
        this.salones.forEach(s => {
            let opciones1 = this.generarOpcionesFiltradas(s.docente_guia_1);
            let opciones2 = this.generarOpcionesFiltradas(s.docente_guia_2);
            let contacto1 = this.generarHtmlContacto(s.docente_guia_1);
            let contacto2 = this.generarHtmlContacto(s.docente_guia_2);

            let disableState = puedeEditar ? '' : 'disabled';
            let btnGuardar = puedeEditar ? `<button class="btn btn-sm btn-success shadow-sm fw-bold px-3" onclick="window.ModGuiaturas.guardarGuiatura('${s.id_salon}')" title="Guardar cambios"><i class="bi bi-save"></i></button>` : `<i class="bi bi-lock text-muted" title="Sin permiso de edición"></i>`;

            html += `
            <tr class="animate__animated animate__fadeIn">
                <td class="py-3 ps-3">
                    <div class="fw-bold text-dark" style="font-size:15px;">${s.nombre_salon}</div>
                    <span class="badge bg-light text-secondary border shadow-sm mt-1">${s.nivel_educativo}</span>
                </td>
                
                <td class="py-3 px-2">
                    <select class="form-select form-select-sm input-moderno shadow-none fw-bold text-primary mb-2" 
                            id="sel-guia-1-${s.id_salon}" onchange="window.ModGuiaturas.cambioLocal('${s.id_salon}', 1, this.value)" ${disableState}>
                        ${opciones1}
                    </select>
                    <div class="p-2 bg-light rounded border">${contacto1}</div>
                </td>
                
                <td class="py-3 px-2">
                    <select class="form-select form-select-sm input-moderno shadow-none fw-bold text-info mb-2" 
                            id="sel-guia-2-${s.id_salon}" onchange="window.ModGuiaturas.cambioLocal('${s.id_salon}', 2, this.value)" ${disableState}>
                        ${opciones2}
                    </select>
                    <div class="p-2 bg-light rounded border border-info border-opacity-25">${contacto2}</div>
                </td>
                
                <td class="py-3 text-center align-middle pe-3">${btnGuardar}</td>
            </tr>`;
        });
        
        tbody.innerHTML = html;
    },

    generarOpcionesFiltradas: function(cedulaActual) {
        let html = '<option value="">-- Sin Asignar --</option>';
        this.docentes.forEach(d => {
            let estaOcupado = this.salones.some(s => String(s.docente_guia_1) === String(d.cedula) || String(s.docente_guia_2) === String(d.cedula));
            if (!estaOcupado || String(d.cedula) === String(cedulaActual)) {
                let selected = (String(d.cedula) === String(cedulaActual)) ? 'selected' : '';
                html += `<option value="${d.cedula}" ${selected}>${d.nombre_completo}</option>`;
            }
        });
        return html;
    },

    generarHtmlContacto: function(cedula) {
        if (!cedula) return '<div class="text-muted small" style="font-style: italic; min-height: 40px; display: flex; align-items: center;">Seleccione un docente</div>';
        let docente = this.docentes.find(d => String(d.cedula) === String(cedula));
        if (docente) {
            return `
                <div class="small text-dark fw-bold mb-1 text-truncate"><i class="bi bi-envelope-fill me-2 text-secondary"></i>${docente.email || 'N/A'}</div>
                <div class="small text-dark fw-bold"><i class="bi bi-telephone-fill me-2 text-secondary"></i>${docente.telefono || 'N/A'}</div>
            `;
        }
        return '<div class="text-danger small fw-bold">Docente no encontrado</div>';
    },

    cambioLocal: function(idSalon, numGuia, nuevaCedula) {
        let salon = this.salones.find(s => s.id_salon === idSalon);
        if (salon) {
            if (numGuia === 1) salon.docente_guia_1 = nuevaCedula;
            if (numGuia === 2) salon.docente_guia_2 = nuevaCedula;
        }
        this.dibujarTabla();
    },

    guardarGuiatura: function(idSalon) {
        let salon = this.salones.find(s => s.id_salon === idSalon);
        if(!salon) return;

        window.Aplicacion.mostrarCarga();
        window.Aplicacion.peticion({ 
            action: "save_guiatura", id_salon: idSalon, cedula_docente_1: salon.docente_guia_1 || "", cedula_docente_2: salon.docente_guia_2 || ""
        }, (res) => {
            window.Aplicacion.ocultarCarga();
            if (res && res.status === "success") {
                Swal.fire({toast: true, position: 'top-end', icon: 'success', title: res.message, showConfirmButton: false, timer: 3000});
                this.cargarTodo(true);
            } else {
                Swal.fire('Error', res ? res.message : 'Error al asignar la guiatura.', 'error');
            }
        });
    },

    // ==========================================
    // EXPORTACIÓN PDF HORIZONTAL Y MULTIPÁGINA
    // ==========================================
    obtenerImagenBase64: function(url) {
        return new Promise((resolve) => {
            let img = new Image(); img.crossOrigin = 'Anonymous';
            img.onload = () => {
                let canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height;
                let ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0); resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = () => resolve(null); 
            img.src = url;
        });
    },

    imprimirPDF: async function() {
        if (this.salones.length === 0) return Swal.fire('Atención', 'No hay salones para exportar.', 'warning');
        let filtro = document.getElementById('filtro-exportar').value;
        let salonesFiltrados = this.salones;
        if (filtro !== 'Todos') salonesFiltrados = this.salones.filter(s => s.nivel_educativo === filtro);
        if (salonesFiltrados.length === 0) return Swal.fire('Atención', 'No hay salones en este nivel.', 'warning');

        window.Aplicacion.mostrarCarga();

        const filasPorPagina = 6; 
        const totalPaginas = Math.ceil(salonesFiltrados.length / filasPorPagina);
        
        const base64LogoEscuela = await this.obtenerImagenBase64('assets/img/logo.png');
        const base64CintilloMPPE = await this.obtenerImagenBase64('assets/img/logoMPPE.png');

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'letter' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        let zonaRender = document.getElementById('pdf-render-zone');
        let anioEscolar = (window.Aplicacion && window.Aplicacion.momentoActual) ? window.Aplicacion.momentoActual.anioEscolar : "2025 - 2026";
        const fechaHoy = new Date().toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

        try {
            for (let paginaActual = 1; paginaActual <= totalPaginas; paginaActual++) {
                if (paginaActual > 1) doc.addPage();
                
                let indiceInicio = (paginaActual - 1) * filasPorPagina;
                let chunkSalones = salonesFiltrados.slice(indiceInicio, indiceInicio + filasPorPagina);

                let tablaHTML = `
                <div id="pdf-reporte-chunk" style="width: 1400px; padding: 20px; background: #ffffff; color: #1e293b; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr>
                                <th style="background-color: #0066FF; color: white; padding: 12px; border: 1px solid #94a3b8; text-align: left; font-size: 14px; width: 22%;">Salón / Grado</th>
                                <th style="background-color: #0066FF; color: white; padding: 12px; border: 1px solid #94a3b8; text-align: left; font-size: 14px; width: 20%;">Docente Principal</th>
                                <th style="background-color: #0066FF; color: white; padding: 12px; border: 1px solid #94a3b8; text-align: left; font-size: 14px; width: 19%;">Contacto Principal</th>
                                <th style="background-color: #0066FF; color: white; padding: 12px; border: 1px solid #94a3b8; text-align: left; font-size: 14px; width: 20%;">Docente Auxiliar</th>
                                <th style="background-color: #0066FF; color: white; padding: 12px; border: 1px solid #94a3b8; text-align: left; font-size: 14px; width: 19%;">Contacto Auxiliar</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

                chunkSalones.forEach((s, index) => {
                    let bgFila = (index % 2 === 0) ? '#ffffff' : '#f8fafc';
                    let doc1 = this.docentes.find(d => String(d.cedula) === String(s.docente_guia_1));
                    let nombre1 = doc1 ? `<strong style="font-size:14px; color:#0f172a;">${doc1.nombre_completo}</strong><br><span style="font-size:12px; color:#475569;">C.I: V-${doc1.cedula}</span>` : '<i style="color:#ef4444; font-size:13px;">Sin asignar</i>';
                    let contacto1 = doc1 ? `<span style="font-size:12px; color:#0f172a;"><b>Tel:</b> ${doc1.telefono || 'N/A'}<br><b>Mail:</b> ${doc1.email || 'N/A'}</span>` : '<span style="color:#94a3b8; font-size:12px;">-</span>';
                    
                    let doc2 = this.docentes.find(d => String(d.cedula) === String(s.docente_guia_2));
                    let nombre2 = doc2 ? `<strong style="font-size:14px; color:#0f172a;">${doc2.nombre_completo}</strong><br><span style="font-size:12px; color:#475569;">C.I: V-${doc2.cedula}</span>` : '<i style="color:#94a3b8; font-size:13px;">Sin asignar</i>';
                    let contacto2 = doc2 ? `<span style="font-size:12px; color:#0f172a;"><b>Tel:</b> ${doc2.telefono || 'N/A'}<br><b>Mail:</b> ${doc2.email || 'N/A'}</span>` : '<span style="color:#94a3b8; font-size:12px;">-</span>';

                    tablaHTML += `
                        <tr style="background-color: ${bgFila};">
                            <td style="padding: 10px; border: 1px solid #cbd5e1; font-size: 14px; font-weight: bold; color: #0f172a;">${s.nivel_educativo}<br><span style="color:#0066FF">${s.nombre_salon}</span></td>
                            <td style="padding: 10px; border: 1px solid #cbd5e1;">${nombre1}</td>
                            <td style="padding: 10px; border: 1px solid #cbd5e1;">${contacto1}</td>
                            <td style="padding: 10px; border: 1px solid #cbd5e1;">${nombre2}</td>
                            <td style="padding: 10px; border: 1px solid #cbd5e1;">${contacto2}</td>
                        </tr>
                    `;
                });

                tablaHTML += `</tbody></table></div>`;
                zonaRender.innerHTML = tablaHTML;
                await new Promise(r => setTimeout(r, 150)); 

                let divReporte = document.getElementById('pdf-reporte-chunk');
                const canvasTable = await html2canvas(divReporte, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false });
                const imgData = canvasTable.toDataURL('image/png');
                
                // HEADER
                let textX = margin; 
                if (base64LogoEscuela) { doc.addImage(base64LogoEscuela, 'PNG', margin, margin, 16, 16); textX = margin + 20; }
                doc.setTextColor(30, 41, 59); doc.setFontSize(9); doc.setFont("helvetica", "normal");
                doc.text("República Bolivariana de Venezuela", textX, margin + 5);
                doc.text("Ministerio del Poder Popular para la Educación", textX, margin + 10);
                doc.setFont("helvetica", "bold"); doc.text("Unidad Educativa Libertador Bolívar", textX, margin + 15);

                doc.setTextColor(0, 102, 255); doc.setFontSize(16);
                doc.text("REPORTE DE ASIGNACIÓN DE GUIATURAS", pageWidth / 2, margin + 25, { align: "center" });
                
                doc.setTextColor(100, 116, 139); doc.setFontSize(10);
                doc.text(`Período Escolar: ${anioEscolar} | Nivel: ${filtro}`, pageWidth / 2, margin + 31, { align: "center" });

                doc.setDrawColor(0, 102, 255); doc.setLineWidth(1.5); doc.line(margin, margin + 35, pageWidth - margin, margin + 35);

                // INYECCIÓN DE TABLA
                const availableWidth = pageWidth - (margin * 2);
                const availableHeight = pageHeight - margin - 35 - 20; 
                const imgProps = doc.getImageProperties(imgData);
                const imgRatio = imgProps.width / imgProps.height;
                const availableRatio = availableWidth / availableHeight;

                let finalWidth = availableWidth; let finalHeight = availableWidth / imgRatio;
                if (finalHeight > availableHeight) { finalHeight = availableHeight; finalWidth = availableHeight * imgRatio; }
                const xOffset = margin + (availableWidth - finalWidth) / 2;
                const yOffset = margin + 38; 

                doc.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);

                // FOOTER
                doc.setDrawColor(220, 38, 38); doc.setLineWidth(0.5); doc.line(margin, pageHeight - margin - 8, pageWidth - margin, pageHeight - margin - 8);
                if (base64CintilloMPPE) { doc.addImage(base64CintilloMPPE, 'PNG', margin, pageHeight - margin - 6, 35, 6); }

                doc.setTextColor(100, 116, 139); doc.setFontSize(8); doc.setFont("helvetica", "normal");
                doc.text(`Generado: ${fechaHoy}`, margin + 40, pageHeight - margin - 1.5);
                doc.text("Sistema SIGAE v1.0", pageWidth / 2, pageHeight - margin - 1.5, { align: "center" });
                doc.text(`Página ${paginaActual} de ${totalPaginas}`, pageWidth - margin, pageHeight - margin - 1.5, { align: "right" });
            }

            zonaRender.innerHTML = ''; 
            let filename = `Guiaturas_${filtro.replace(/\s+/g, '_')}_${anioEscolar.replace(/\s+/g, '')}.pdf`;
            doc.save(filename);
            window.Aplicacion.ocultarCarga();
            Swal.fire({toast: true, position: 'top-end', icon: 'success', title: 'PDF Generado', showConfirmButton: false, timer: 3000});

        } catch (error) {
            console.error(error); window.Aplicacion.ocultarCarga(); Swal.fire('Error', 'Fallo en el PDF.', 'error');
        }
    }
};

window.init_Asignar_Guiaturas = function() { window.ModGuiaturas.init(); };