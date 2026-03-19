/**
 * MÓDULO: VERIFICACIONES
 * Consulta de solicitudes, escáner QR y re-impresión de comprobantes PDF.
 */

window.ModVerificaciones = {
    rutasTransporte: [],
    paradasTransporte: [],
    html5QrcodeScanner: null,

    init: function() {
        this.dibujarInterfaz();
        this.cargarDiccionariosTransporte();
    },

    // ✨ 1. INTERFAZ GRÁFICA CON EL CONTENEDOR DE LA CÁMARA ✨
    dibujarInterfaz: function() {
        const contenedor = document.getElementById('area-dinamica');
        
        let html = `
        <style>
            .banner-verificacion { background: linear-gradient(135deg, #7B24F1 0%, #9b51e0 100%); border-radius: 24px; position: relative; overflow: hidden; }
            .circulo-bg { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.1); }
            .input-verificacion { border-radius: 50px !important; border: 2px solid #e2e8f0; padding: 15px 25px; font-size: 1.1rem; font-weight: bold; color: #1e293b; text-transform: uppercase; box-shadow: none !important; }
            .input-verificacion:focus { border-color: #7B24F1; background: white; }
            .btn-escaner { border-radius: 50px 0 0 50px !important; border: 2px solid #e2e8f0; border-right: none; background: #f8fafc; padding: 0 20px; color: #7B24F1; transition: all 0.3s; }
            .btn-escaner:hover { background: #f1f5f9; color: #581c87; }
            .btn-buscar-ver { border-radius: 0 50px 50px 0 !important; background: #7B24F1; border: 2px solid #7B24F1; color: white; font-weight: bold; padding: 0 30px; transition: all 0.3s; }
            .btn-buscar-ver:hover { background: #6b21a8; border-color: #6b21a8; }
            #lector-qr-container { width: 100%; max-width: 400px; margin: 0 auto; border-radius: 15px; overflow: hidden; border: 3px solid #7B24F1; display: none; box-shadow: 0 10px 25px rgba(123, 36, 241, 0.2); }
            #verif-resultado { display: none; }
            #qr-temp-verif { display: none; }
        </style>

        <div id="qr-temp-verif"></div>

        <div class="row animate__animated animate__fadeIn">
            <div class="col-12 mb-4">
                <div class="banner-verificacion p-4 p-md-5 text-white shadow-sm">
                    <div class="circulo-bg" style="width: 300px; height: 300px; top: -100px; right: -50px;"></div>
                    <div class="circulo-bg" style="width: 150px; height: 150px; bottom: -50px; right: 250px;"></div>
                    
                    <div class="row align-items-center position-relative z-1">
                        <div class="col-md-9 text-center text-md-start mb-3 mb-md-0">
                            <span class="badge bg-white text-dark mb-3 px-3 py-2 shadow-sm fw-bold rounded-pill" style="color: #7B24F1 !important;">
                                <i class="bi bi-shield-check me-1"></i> CONSULTA DE TRÁMITES
                            </span>
                            <h1 class="fw-bolder mb-2 text-white" style="font-size: 2.8rem;">Verificaciones</h1>
                            <p class="mb-0 fw-bold fs-5" style="color: rgba(255,255,255,0.9);">Recupere comprobantes y consulte el estatus de las solicitudes.</p>
                        </div>
                        <div class="col-md-3 text-center text-md-end d-none d-md-block">
                            <img src="assets/img/logo.png" alt="Logo" style="max-height: 120px; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.3));">
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-12 col-md-8 col-lg-6 mx-auto mt-2">
                <div class="bg-white p-4 p-md-5 rounded-4 shadow-sm text-center border">
                    
                    <div class="d-inline-flex justify-content-center align-items-center bg-danger bg-opacity-10 text-danger rounded-circle mb-4" style="width: 80px; height: 80px;">
                        <i class="bi bi-file-earmark-pdf-fill" style="font-size: 2.5rem;"></i>
                    </div>
                    
                    <h3 class="fw-bolder text-dark mb-2">Descargar Comprobante</h3>
                    <p class="text-muted mb-4 px-3">Ingrese el <b>Código Único</b> que el sistema le asignó o escanee el código QR del documento.</p>

                    <div id="lector-qr-container" class="mb-4 bg-dark position-relative">
                        <div id="reader" width="100%"></div>
                        <button onclick="window.ModVerificaciones.detenerEscaner()" class="btn btn-danger btn-sm position-absolute bottom-0 start-50 translate-middle-x mb-2 shadow rounded-pill px-4" style="z-index:100;">
                            <i class="bi bi-x-circle me-1"></i> Cancelar
                        </button>
                    </div>

                    <div id="input-busqueda-container">
                        <div class="input-group mb-3 shadow-sm rounded-pill">
                            <button class="btn btn-escaner fs-5" type="button" onclick="window.ModVerificaciones.iniciarEscaner()" title="Escanear Código QR">
                                <i class="bi bi-qr-code-scan"></i>
                            </button>
                            <input type="text" id="verif-codigo" class="form-control input-verificacion border-start-0 border-end-0" placeholder="ADM-0000000" oninput="this.value = this.value.toUpperCase()" onkeypress="if(event.key === 'Enter') window.ModVerificaciones.buscarComprobante()">
                            <button class="btn btn-buscar-ver fs-5" type="button" onclick="window.ModVerificaciones.buscarComprobante()">
                                Buscar
                            </button>
                        </div>
                    </div>

                    <div id="verif-resultado" class="text-start mt-4 pt-3 border-top"></div>

                </div>
            </div>
        </div>
        `;
        
        contenedor.innerHTML = html;
        document.getElementById('titulo-pagina').innerText = "Verificaciones";
        if(window.Aplicacion && window.Aplicacion.marcarMenuActivo) window.Aplicacion.marcarMenuActivo("Verificaciones");
        
        setTimeout(() => { document.getElementById('verif-codigo').focus(); }, 500);
    },

    // ✨ 2. FUNCIONES DEL ESCÁNER QR ✨
    iniciarEscaner: function() {
        const contenedorLector = document.getElementById('lector-qr-container');
        const contenedorInput = document.getElementById('input-busqueda-container');
        const divRes = document.getElementById('verif-resultado');

        contenedorLector.style.display = 'block';
        contenedorInput.style.display = 'none';
        divRes.style.display = 'none';

        this.html5QrcodeScanner = new Html5Qrcode("reader");
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        this.html5QrcodeScanner.start(
            { facingMode: "environment" }, // Intenta usar la cámara trasera
            config,
            (textoDecodificado) => {
                // ÉXITO: Se leyó el código
                this.detenerEscaner();
                document.getElementById('verif-codigo').value = textoDecodificado;
                
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Código detectado', showConfirmButton: false, timer: 1500 });
                
                // Ejecuta tu búsqueda original
                setTimeout(() => { this.buscarComprobante(); }, 500);
            },
            (msjError) => { /* Errores de frame (se ignoran) */ }
        ).catch(err => {
            Swal.fire('Acceso Denegado', 'No se pudo acceder a la cámara. Asegúrese de otorgar los permisos en su navegador.', 'error');
            this.detenerEscaner();
        });
    },

    detenerEscaner: function() {
        if (this.html5QrcodeScanner) {
            this.html5QrcodeScanner.stop().then(() => {
                this.html5QrcodeScanner.clear();
                document.getElementById('lector-qr-container').style.display = 'none';
                document.getElementById('input-busqueda-container').style.display = 'block';
            }).catch(err => {
                document.getElementById('lector-qr-container').style.display = 'none';
                document.getElementById('input-busqueda-container').style.display = 'block';
            });
        }
    },

    // ✨ 3. TU LÓGICA ORIGINAL INTACTA ✨
    cargarDiccionariosTransporte: function() {
        window.Aplicacion.peticion({ action: "get_transporte_data" }, (resTrans) => {
            if(resTrans && resTrans.status === "success") {
                this.rutasTransporte = resTrans.rutas || [];
                this.paradasTransporte = resTrans.paradas || []; 
            }
        });
    },

    calcularProximoPeriodo: function(periodoActual) {
        if (!periodoActual || periodoActual === "No definido") return "2025 - 2026";
        let partes = periodoActual.split('-');
        if (partes.length === 2) {
            let y1 = parseInt(partes[0].trim());
            let y2 = parseInt(partes[1].trim());
            if (!isNaN(y1) && !isNaN(y2)) return `${y1 + 1} - ${y2 + 1}`;
        }
        return periodoActual; 
    },

    buscarComprobante: function() {
        const codigo = document.getElementById('verif-codigo').value.trim().toUpperCase();
        if(!codigo) return Swal.fire('Atención', 'Debe ingresar un código válido.', 'warning');

        window.Aplicacion.mostrarCarga();
        window.Aplicacion.peticion({ action: 'get_solicitud_pdf', codigo: codigo }, (res) => {
            window.Aplicacion.ocultarCarga();
            const divRes = document.getElementById('verif-resultado');
            
            if (res && res.status === "success") {
                const sol = res.solicitud;
                let colorEstatus = sol.estatus_solicitud === 'En Revisión' ? 'warning' : 'success';
                if(sol.estatus_solicitud === 'Rechazado') colorEstatus = 'danger';
                
                divRes.innerHTML = `
                    <div class="d-flex align-items-center mb-3">
                        <i class="bi bi-check-circle-fill text-success fs-1 me-3"></i>
                        <div>
                            <h5 class="fw-bold mb-1 text-dark">Documento Válido</h5>
                            <p class="text-muted small mb-0">Estudiante: <span class="fw-bold">${sol.est_nombre}</span></p>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center bg-light p-3 rounded border mb-3">
                        <span class="text-muted fw-bold small">Estatus de Solicitud:</span>
                        <span class="badge bg-${colorEstatus} px-3 py-2 text-dark border shadow-sm">${sol.estatus_solicitud || 'Recibida'}</span>
                    </div>
                    <button class="btn btn-danger w-100 fw-bold shadow-sm py-2 hover-efecto rounded-pill" onclick='window.ModVerificaciones.iniciarDescargaPDF(${JSON.stringify(sol).replace(/'/g, "\\'")})'>
                        <i class="bi bi-file-earmark-pdf-fill me-2"></i> Descargar Comprobante PDF
                    </button>
                `;
                divRes.style.display = 'block';
            } else {
                divRes.style.display = 'none';
                Swal.fire({
                    title: '<span class="text-danger">Documento Inválido</span>',
                    text: res ? res.message : 'El código no existe en el sistema. Podría tratarse de un documento adulterado.',
                    icon: 'error',
                    confirmButtonColor: '#1e293b'
                });
            }
        });
    },

    obtenerImagenBase64: function(url) { 
        return new Promise((resolve) => { 
            let img = new Image(); img.crossOrigin = 'Anonymous'; 
            img.onload = () => { 
                let canvas = document.createElement('canvas'); 
                canvas.width = img.width; canvas.height = img.height; 
                let ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0); 
                resolve(canvas.toDataURL('image/png')); 
            }; 
            img.onerror = () => resolve(null); img.src = url; 
        }); 
    },

    iniciarDescargaPDF: function(solicitudObj) {
        this.generarPDFResumen(solicitudObj);
    },

    generarPDFResumen: async function(datosPDF) {
        Swal.fire({ title: 'Generando Documento...', text: 'Construyendo comprobante PDF. Por favor espere.', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); }});
        
        const qrContainer = document.getElementById('qr-temp-verif');
        qrContainer.innerHTML = '';
        new QRCode(qrContainer, {
            text: datosPDF.codigo, width: 120, height: 120,
            colorDark : "#000000", colorLight : "#ffffff", correctLevel : QRCode.CorrectLevel.H
        });

        let base64LogoEscuela = await this.obtenerImagenBase64('assets/img/logo.png');
        let base64CintilloMPPE = await this.obtenerImagenBase64('assets/img/logoMPPE.png');

        setTimeout(() => {
            const canvas = qrContainer.querySelector('canvas');
            const qrDataUrl = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
            
            const margin = 15;
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            
            let y = 60; 
            const checkOverflow = (espacio) => { if (y + espacio > pageHeight - 30) { doc.addPage(); y = 60; } };

            const secTitle = (txt) => {
                checkOverflow(15);
                doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(0, 102, 255);
                doc.text(txt, margin, y); y += 6;
                doc.setTextColor(0, 0, 0); doc.setFontSize(10);
            };

            const col1X = margin; const val1X = margin + 35;
            const col2X = margin + 100; const val2X = margin + 135;

            const row = (lbl1, val1, lbl2, val2) => {
                checkOverflow(8);
                doc.setFont("helvetica", "bold"); doc.text(lbl1+":", col1X, y); 
                doc.setFont("helvetica", "normal"); doc.text(String(val1||'N/A'), val1X, y);
                if (lbl2) {
                    doc.setFont("helvetica", "bold"); doc.text(lbl2+":", col2X, y); 
                    doc.setFont("helvetica", "normal"); doc.text(String(val2||'N/A'), val2X, y);
                }
                y += 6;
            };

            const rowFull = (lbl, val) => {
                checkOverflow(8);
                doc.setFont("helvetica", "bold"); doc.text(lbl+":", col1X, y); 
                doc.setFont("helvetica", "normal"); 
                let splitText = doc.splitTextToSize(String(val||'N/A'), pageWidth - val1X - margin);
                doc.text(splitText, val1X, y);
                y += 6 * splitText.length;
            };

            secTitle("I. DATOS DEL ASPIRANTE");
            row("Cédula/Escolar", datosPDF.est_cedula, "Nombres", datosPDF.est_nombre);
            row("Fecha Nac.", datosPDF.est_fecha_nac, "Género", datosPDF.est_genero);
            row("Orden de Hijo", datosPDF.est_num_hijo, "Parentesco Rep.", datosPDF.est_parentesco);
            y += 2;
            
            secTitle("II. UBICACIÓN Y TRANSPORTE");
            row("Estado", datosPDF.est_estado, "Municipio", datosPDF.est_municipio);
            
            let nombreRuta = datosPDF.est_ruta;
            let nombreParada = datosPDF.est_parada;
            if (datosPDF.est_ruta !== "No requiere" && this.rutasTransporte.length > 0) {
                let rObj = this.rutasTransporte.find(r => String(r.id_ruta) === String(datosPDF.est_ruta));
                if (rObj) nombreRuta = rObj.nombre_ruta;
                let pObj = this.paradasTransporte.find(p => String(p.id_parada) === String(datosPDF.est_parada));
                if (pObj) nombreParada = pObj.nombre_parada;
            }

            row("Parroquia", datosPDF.est_parroquia, "Ruta", nombreRuta);
            if (datosPDF.est_ruta !== "No requiere") { rowFull("Parada", nombreParada); }
            rowFull("Dirección", datosPDF.est_direccion);
            y += 2;

            secTitle("III. DATOS ACADÉMICOS");
            row("Grado", datosPDF.est_grado, "Nivel Educativo", datosPDF.est_nivel);
            rowFull("Escuela Anterior", datosPDF.est_procedencia);
            rowFull("Motivo Cambio", datosPDF.est_razon_cambio);
            y += 2;

            secTitle("IV. REPRESENTANTE LEGAL");
            row("Cédula", datosPDF.rep_cedula, "Nombres", datosPDF.rep_nombre);
            row("Teléfono", datosPDF.rep_telefono, "Correo", datosPDF.rep_correo);
            if (datosPDF.rep_nomina && !datosPDF.rep_nomina.toLowerCase().includes("comunidad")) {
                row("Nómina", datosPDF.rep_nomina, "Filial", datosPDF.rep_filial);
                rowFull("Gerencia", datosPDF.rep_gerencia);
            } else {
                row("Nómina", datosPDF.rep_nomina);
            }
            y += 2;

            secTitle(`V. DATOS DE LOS PADRES (Reconocido por: ${datosPDF.reconocido_por})`);
            if (datosPDF.reconocido_por === "Ambos Padres" || datosPDF.reconocido_por === "Solo la Madre") {
                doc.setFont("helvetica", "bold"); doc.text("- MADRE:", margin, y); y+=6; doc.setFont("helvetica", "normal");
                row("Cédula", datosPDF.madre_cedula, "Nombres", datosPDF.madre_nombre);
                row("Est. Vital", datosPDF.madre_estatus, "Trabaja PDVSA", datosPDF.madre_pdvsa);
                row("Teléfono", datosPDF.madre_telefono, "Correo", datosPDF.madre_correo);
                y += 2;
            }
            if (datosPDF.reconocido_por === "Ambos Padres" || datosPDF.reconocido_por === "Solo el Padre") {
                doc.setFont("helvetica", "bold"); doc.text("- PADRE:", margin, y); y+=6; doc.setFont("helvetica", "normal");
                row("Cédula", datosPDF.padre_cedula, "Nombres", datosPDF.padre_nombre);
                row("Est. Vital", datosPDF.padre_estatus, "Trabaja PDVSA", datosPDF.padre_pdvsa);
                row("Teléfono", datosPDF.padre_telefono, "Correo", datosPDF.padre_correo);
            }

            if (datosPDF.observaciones) {
                y += 2;
                secTitle("VI. OBSERVACIONES ADICIONALES");
                rowFull("Detalle", datosPDF.observaciones);
            }

            checkOverflow(45); y += 5;
            doc.setDrawColor(200, 200, 200); doc.setFillColor(248, 250, 252);
            doc.roundedRect(margin, y, pageWidth - (margin*2), 35, 3, 3, 'FD');
            doc.addImage(qrDataUrl, 'PNG', margin + 5, y + 2.5, 30, 30);
            doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(0, 0, 0);
            doc.text("COMPROBANTE DE REGISTRO EN LÍNEA", margin + 40, y + 10);
            doc.setFontSize(9); doc.setTextColor(100, 116, 139); doc.setFont("helvetica", "normal");
            doc.text("Código de Solicitud:", margin + 40, y + 16);
            doc.setFont("helvetica", "bold"); doc.setTextColor(0, 102, 255);
            doc.text(datosPDF.codigo, margin + 40 + doc.getTextWidth("Código de Solicitud: "), y + 16);
            const fechaHoyFormat = new Date().toLocaleString('es-VE', { timeZone: 'America/Caracas', dateStyle: 'long', timeStyle: 'short' });
            doc.setFontSize(9); doc.setTextColor(100, 116, 139); doc.setFont("helvetica", "normal");
            doc.text(`Lugar y Fecha: Maturín, Edo. Monagas. ${fechaHoyFormat}`, margin + 40, y + 22);
            doc.text("Conserve este comprobante digital. No requiere firma para ser válido.", margin + 40, y + 28);

            const pgs = doc.internal.getNumberOfPages();
            let anioEscolarActual = (window.Aplicacion && window.Aplicacion.momentoActual) ? window.Aplicacion.momentoActual.anioEscolar : "2025 - 2026";
            let anioEscolarProximo = window.ModVerificaciones.calcularProximoPeriodo(anioEscolarActual);

            for(let i=1; i<=pgs; i++) {
                doc.setPage(i);
                if (base64LogoEscuela) doc.addImage(base64LogoEscuela, 'PNG', margin, 12, 18, 18);
                doc.setTextColor(30, 41, 59); doc.setFontSize(10); doc.setFont("helvetica", "normal");
                doc.text("República Bolivariana de Venezuela", margin + 22, 16);
                doc.text("Ministerio del Poder Popular para la Educación", margin + 22, 21);
                doc.setFont("helvetica", "bold"); doc.text("Unidad Educativa Libertador Bolívar", margin + 22, 26);
                doc.setTextColor(0, 102, 255); doc.setFontSize(14); doc.setFont("helvetica", "bold");
                doc.text("COMPROBANTE DE SOLICITUD DE CUPO", pageWidth / 2, 40, { align: "center" });
                doc.setTextColor(100, 116, 139); doc.setFontSize(10); doc.setFont("helvetica", "normal");
                doc.text(`Período Escolar: ${anioEscolarProximo}`, pageWidth / 2, 46, { align: "center" });
                doc.setDrawColor(0, 102, 255); doc.setLineWidth(1.5); doc.line(margin, 52, pageWidth - margin, 52);
                doc.setDrawColor(220, 38, 38); doc.setLineWidth(0.8); doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
                if (base64CintilloMPPE) { doc.addImage(base64CintilloMPPE, 'PNG', margin, pageHeight - 18, 36, 10); }
                doc.setTextColor(100, 116, 139); doc.setFontSize(8); doc.setFont("helvetica", "normal");
                doc.text(`Copia descargada: ${fechaHoyFormat}`, margin + 42, pageHeight - 12);
                doc.text(`Sistema SIGAE v1.0`, pageWidth / 2 + 25, pageHeight - 12, { align: "center" });
                doc.text(`Página ${i} de ${pgs}`, pageWidth - margin, pageHeight - 12, { align: "right" });
            }

            doc.save(`Recuperado_Solicitud_${datosPDF.codigo}.pdf`);
            Swal.close();
            Swal.fire({toast:true, position:'top-end', icon:'success', title:'Comprobante Descargado', showConfirmButton:false, timer:2500});
        }, 500); 
    }
};

window.init_Verificaciones = function() {
    window.ModVerificaciones.init();
};