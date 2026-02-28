/**
 * MÓDULO: INICIO (DASHBOARD)
 * Gestiona la vista principal y la generación del Organigrama Profesional.
 * ACTUALIZADO: Líneas más gruesas y Nombres Completos.
 */

const ModInicio = {
    datosEscuela: {},
    datosCargos: [],
    datosSupervision: [],
    datosPersonal: [], 

    cargarDatos: function() {
        // Pedimos perfil de la escuela para llenar el Dashboard
        Aplicacion.peticion({ action: "get_school_profile" }, (res) => {
            this.datosEscuela = res;
            document.getElementById('dash-nombre-escuela').innerText = res.nombre || "UE Libertador Bolívar";
            document.getElementById('dash-direccion').innerHTML = `<i class="bi bi-geo-alt-fill me-2"></i> ${res.direccion || 'Sin dirección registrada'}`;
            document.getElementById('dash-rif').innerHTML = `<i class="bi bi-card-heading me-1"></i> RIF: ${res.rif || '---'}`;
            document.getElementById('dash-dea').innerHTML = `<i class="bi bi-building-check me-1"></i> DEA: ${res.dea || '---'}`;
            
            document.getElementById('dash-mision').innerText = res.mision || 'No definida';
            document.getElementById('dash-vision').innerText = res.vision || 'No definida';
            document.getElementById('dash-objetivo').innerText = res.objetivo || 'No definido';
            document.getElementById('dash-peic').innerText = res.peic || 'No definido';
        });
    },

    descargarOrganigrama: function() {
        Aplicacion.mostrarCarga();
        
        // 1. Obtener Cargos
        Aplicacion.peticion({ action: "get_positions" }, (resC) => {
            this.datosCargos = resC.cargos || [];
            
            // 2. Obtener Estructura (Supervisión)
            Aplicacion.peticion({ action: "get_supervision" }, (resS) => {
                this.datosSupervision = resS.data || [];

                // 3. Obtener Personal Asignado (NOMBRES)
                Aplicacion.peticion({ action: "get_assigned_staff" }, async (resP) => {
                    this.datosPersonal = resP.assignments || [];

                    if(this.datosCargos.length === 0) {
                        Aplicacion.ocultarCarga();
                        return Swal.fire('Error', 'No hay cargos registrados para generar el organigrama.', 'error');
                    }

                    await this.generarPDF();
                    Aplicacion.ocultarCarga();
                });
            });
        });
    },

    generarPDF: async function() {
        const contenedor = document.getElementById('contenedor-organigrama-pdf');
        const fechaHoy = new Date().toLocaleDateString();
        
        // Estructura HTML del PDF (Diseño Mejorado)
        contenedor.innerHTML = `
            <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; text-align: center; color: #333; background-color: white; padding: 20px;">
                
                <!-- Encabezado del Documento -->
                <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 5px solid #0066FF; padding-bottom: 20px; margin-bottom: 40px;">
                     <div style="display: flex; align-items: center;">
                        <img src="assets/img/logo.png" width="90" style="margin-right: 25px;">
                        <div style="text-align: left;">
                            <h1 style="margin: 0; font-size: 26px; text-transform: uppercase; color: #0066FF; font-weight: 800;">${this.datosEscuela.nombre || 'Institución Educativa'}</h1>
                            <div style="font-size: 16px; color: #475569; font-weight: 600;">${this.datosEscuela.direccion || ''}</div>
                        </div>
                     </div>
                     <div style="text-align: right;">
                        <h2 style="margin: 0; font-size: 36px; color: #1e293b; font-weight: 900;">ORGANIGRAMA</h2>
                        <div style="font-size: 14px; color: #64748b; font-weight: 600;">Actualizado al: ${fechaHoy}</div>
                     </div>
                </div>

                <!-- Contenedor del Árbol -->
                <div id="arbol-jerarquico" style="display: flex; flex-direction: column; align-items: center; padding-top: 20px;"></div>
                
                <!-- Pie de página -->
                <div style="margin-top: 60px; border-top: 2px solid #e2e8f0; padding-top: 15px; font-size: 12px; color: #94a3b8; text-align: center; font-weight: bold;">
                    Generado automáticamente por el Sistema SIGAE v4.0
                </div>
            </div>
        `;

        const arbolDiv = contenedor.querySelector('#arbol-jerarquico');

        // Lógica del Árbol
        const supervisadosIds = new Set();
        this.datosSupervision.forEach(s => s.supervisadosIds.forEach(id => supervisadosIds.add(String(id))));
        const raices = this.datosCargos.filter(c => !supervisadosIds.has(String(c.id)));

        // Función Recursiva para Dibujar Nodos (Diseño Tarjeta Profesional)
        const dibujarNodo = (cargo, elementoPadre) => {
            // Buscar personas asignadas a este cargo
            const ocupantes = this.datosPersonal.filter(p => String(p.cargoId) === String(cargo.id));
            
            // Generar HTML de los nombres (NOMBRES COMPLETOS)
            let htmlOcupantes = '';
            if (ocupantes.length > 0) {
                htmlOcupantes = ocupantes.map(o => `
                    <div style="display: flex; align-items: flex-start; justify-content: start; margin-top: 6px; font-size: 13px; color: #1e293b; font-weight: 700; text-align: left; line-height: 1.3;">
                        <span style="display: inline-block; width: 8px; height: 8px; background: #10b981; border-radius: 50%; margin-right: 8px; margin-top: 4px; flex-shrink: 0;"></span>
                        <span>${o.nombre}</span>
                    </div>
                `).join('');
            } else {
                htmlOcupantes = `<div style="font-size: 12px; color: #ef4444; font-style: italic; margin-top: 5px; font-weight: 600;">(Vacante)</div>`;
            }

            // Diseño de la Tarjeta del Cargo
            const caja = document.createElement('div');
            // Estilos CSS en línea para html2canvas
            caja.style.cssText = `
                background: white; 
                border-radius: 12px; 
                width: 240px; /* Un poco más ancho para nombres largos */
                margin: 0 20px 30px 20px; 
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); 
                position: relative; 
                z-index: 2;
                overflow: hidden;
                border: 2px solid #cbd5e1; /* Borde más definido */
            `;
            
            // Color de la barra superior según tipo de cargo
            let colorBarra = '#2563eb'; // Azul fuerte (Docente)
            if(cargo.tipo === 'Directivo') colorBarra = '#ea580c'; // Naranja oscuro
            if(cargo.tipo === 'Administrativo') colorBarra = '#7c3aed'; // Violeta fuerte
            if(cargo.tipo === 'Obrero') colorBarra = '#059669'; // Verde esmeralda

            caja.innerHTML = `
                <div style="background: ${colorBarra}; padding: 12px 15px; color: white; text-align: left;">
                    <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9; font-weight: 800;">${cargo.tipo}</div>
                    <div style="font-size: 14px; font-weight: 800; line-height: 1.2; margin-top: 2px;">${cargo.nombre}</div>
                </div>
                <div style="padding: 12px 15px; background: #f8fafc; min-height: 40px;">
                    ${htmlOcupantes}
                </div>
            `;
            elementoPadre.appendChild(caja);

            // Buscar hijos y dibujar líneas
            const relacion = this.datosSupervision.find(s => String(s.supervisorId) === String(cargo.id));
            
            if (relacion && relacion.supervisadosIds.length > 0) {
                // LÍNEA VERTICAL CONECTORA (GRUESA Y OSCURA)
                const lineaV = document.createElement('div');
                lineaV.style.cssText = "width: 4px; height: 30px; background: #334155; margin: 0 auto;";
                elementoPadre.appendChild(lineaV);

                // CONTENEDOR HORIZONTAL DE HIJOS (LÍNEA SUPERIOR GRUESA)
                const contenedorHijos = document.createElement('div');
                contenedorHijos.style.cssText = "display: flex; justify-content: center; align-items: flex-start; border-top: 4px solid #334155; padding-top: 30px; position: relative;";
                elementoPadre.appendChild(contenedorHijos);

                relacion.supervisadosIds.forEach(idHijo => {
                    const hijo = this.datosCargos.find(c => String(c.id) === String(idHijo));
                    if (hijo) {
                        const rama = document.createElement('div');
                        rama.style.cssText = "display: flex; flex-direction: column; align-items: center;";
                        contenedorHijos.appendChild(rama);
                        dibujarNodo(hijo, rama);
                    }
                });
            }
        };

        // Dibujar
        if (raices.length === 0 && this.datosCargos.length > 0) dibujarNodo(this.datosCargos[0], arbolDiv);
        else raices.forEach(raiz => dibujarNodo(raiz, arbolDiv));

        // Renderizar PDF
        const { jsPDF } = window.jspdf;
        // Tiempo extra para renderizado de fuentes
        await new Promise(r => setTimeout(r, 800)); 
        
        const canvas = await html2canvas(contenedor, { scale: 2, backgroundColor: "#ffffff" });
        const imgData = canvas.toDataURL('image/png');
        
        // CONFIGURACIÓN OFICIO (LEGAL) HORIZONTAL
        const pdf = new jsPDF('l', 'mm', 'legal'); 
        const pdfW = pdf.internal.pageSize.getWidth(); 
        const pdfH = pdf.internal.pageSize.getHeight(); 
        
        const imgProps = pdf.getImageProperties(imgData);
        const ratio = imgProps.width / imgProps.height;
        
        // Ajustar al ancho con márgenes
        let w = pdfW - 20; 
        let h = w / ratio;

        // Si la altura es mayor a la página, ajustar por altura
        if (h > pdfH - 20) {
            h = pdfH - 20;
            w = h * ratio;
        }

        // Centrar
        const x = (pdfW - w) / 2;
        const y = (pdfH - h) / 2;

        pdf.addImage(imgData, 'PNG', x, y, w, h);
        pdf.save('Organigrama_Oficial_Personal.pdf');
        
        contenedor.innerHTML = '';
        Swal.fire({
            title: '¡Organigrama Generado!',
            text: 'Se descargó en formato Oficio (Legal) con nombres completos.',
            icon: 'success',
            confirmButtonColor: '#0066FF'
        });
    }
};

window.init_Inicio = function() { ModInicio.cargarDatos(); };