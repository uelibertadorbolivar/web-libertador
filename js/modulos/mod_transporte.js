/**
 * MÓDULO: TRANSPORTE ESCOLAR (RUTAS Y MONITOREO GPS)
 * BLINDADO CON window.ModTransporte
 */

window.ModTransporte = {
    paradas: [],
    rutas: [],
    docentes: [],
    trackingHoy: [],
    paradasTemporalesRuta: [],
    editandoParadaId: null,
    
    init: function() {
        this.configurarPermisos();
        this.cargarTodo();
    },

    // Ocultar creación a representantes/estudiantes
    configurarPermisos: function() {
        let rol = window.Aplicacion.usuario ? window.Aplicacion.usuario.rol : '';
        if (rol === 'Estudiante' || rol === 'Representante') {
            document.getElementById('tab-paradas').classList.add('d-none');
            document.getElementById('tab-rutas').classList.add('d-none');
            this.cambiarTab('Monitoreo'); // Forzar tab de vista
        }
    },

    cambiarTab: function(vista) {
        ['Paradas', 'Rutas', 'Monitoreo'].forEach(tab => {
            let btn = document.getElementById(`tab-${tab.toLowerCase()}`);
            let panel = document.getElementById(`vista-${tab.toLowerCase()}`);
            if(!btn || !panel) return;
            
            if (vista === tab) {
                btn.classList.add('active', 'bg-primary', 'text-white');
                btn.classList.remove('text-secondary');
                panel.classList.remove('d-none');
            } else {
                btn.classList.remove('active', 'bg-primary', 'text-white');
                btn.classList.add('text-secondary');
                panel.classList.add('d-none');
            }
        });
    },

    // LA MAGIA DE LA LIMPIEZA DIARIA: Le enviamos al servidor la fecha de hoy.
    obtenerFechaHoy: function() {
        const hoy = new Date();
        const yyyy = hoy.getFullYear();
        const mm = String(hoy.getMonth() + 1).padStart(2, '0');
        const dd = String(hoy.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    },

    cargarTodo: function(silencioso = false) {
        if(!silencioso && typeof window.Aplicacion !== 'undefined') window.Aplicacion.mostrarCarga();
        
        let payload = { action: "get_transporte_data", fecha_hoy: this.obtenerFechaHoy() };

        window.Aplicacion.peticion(payload, (res) => {
            if(!silencioso && typeof window.Aplicacion !== 'undefined') window.Aplicacion.ocultarCarga(); 
            
            if (res && res.status === "success") {
                this.paradas = res.paradas || [];
                this.rutas = res.rutas || [];
                this.docentes = res.docentes || [];
                this.trackingHoy = res.tracking || []; // Solo trae lo de HOY. Si es un nuevo día, viene vacío.
                
                this.dibujarTablaParadas();
                this.dibujarTarjetasRutas();
                this.llenarSelectores();
                
                // Si estaba monitoreando una, la refresca
                if(document.getElementById('sel-monitoreo-ruta').value) {
                    this.cargarMonitoreoRuta();
                }
            }
        });
    },

    // -----------------------------------------
    // VISTA 1: GESTIÓN DE PARADAS
    // -----------------------------------------
    dibujarTablaParadas: function() {
        const tbody = document.getElementById('tabla-paradas');
        if(!tbody) return;
        let html = '';
        this.paradas.forEach(p => {
            html += `
            <tr>
                <td class="fw-bold text-dark">${p.nombre_parada}</td>
                <td class="text-muted small">${p.referencia}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-light text-primary" onclick="window.ModTransporte.cargarParaEditarParada('${p.id_parada}')"><i class="bi bi-pencil-fill"></i></button>
                    <button class="btn btn-sm btn-light text-danger" onclick="window.ModTransporte.eliminarParada('${p.id_parada}')"><i class="bi bi-trash-fill"></i></button>
                </td>
            </tr>`;
        });
        tbody.innerHTML = html || `<tr><td colspan="3" class="text-center py-4">No hay paradas.</td></tr>`;
    },

    guardarParada: function() {
        let nombre = document.getElementById('txt-parada-nombre').value.trim();
        let ref = document.getElementById('txt-parada-ref').value.trim();
        if(!nombre) return Swal.fire('Error', 'El nombre es obligatorio', 'warning');
        
        let p = { action: 'save_parada', nombre_parada: nombre, referencia: ref };
        if(this.editandoParadaId) p.id_parada = this.editandoParadaId;

        window.Aplicacion.mostrarCarga();
        window.Aplicacion.peticion(p, (res) => {
            window.Aplicacion.ocultarCarga();
            if(res && res.status === 'success') {
                this.cancelarEdicionParada();
                Swal.fire({toast:true, position:'top-end', icon:'success', title:'Parada guardada', showConfirmButton:false, timer:2000});
                this.cargarTodo(true);
            }
        });
    },

    eliminarParada: function(id) {
        Swal.fire({title:'¿Borrar parada?', icon:'warning', showCancelButton:true}).then((r) => {
            if(r.isConfirmed) {
                window.Aplicacion.peticion({action:'delete_parada', id_parada: id}, (res) => { this.cargarTodo(true); });
            }
        });
    },

    cargarParaEditarParada: function(id) {
        let p = this.paradas.find(x => x.id_parada === id);
        if(p) {
            this.editandoParadaId = id;
            document.getElementById('txt-parada-nombre').value = p.nombre_parada;
            document.getElementById('txt-parada-ref').value = p.referencia;
            document.getElementById('btn-guardar-parada').innerText = "Actualizar Parada";
            document.getElementById('btn-cancelar-parada').classList.remove('d-none');
        }
    },
    cancelarEdicionParada: function() {
        this.editandoParadaId = null;
        document.getElementById('txt-parada-nombre').value = '';
        document.getElementById('txt-parada-ref').value = '';
        document.getElementById('btn-guardar-parada').innerHTML = '<i class="bi bi-save me-2"></i>Guardar Parada';
        document.getElementById('btn-cancelar-parada').classList.add('d-none');
    },

    // -----------------------------------------
    // VISTA 2: GESTIÓN DE RUTAS
    // -----------------------------------------
    llenarSelectores: function() {
        let selDoc = document.getElementById('sel-ruta-docente');
        let htmlDoc = '<option value="">-- Seleccione Docente de Guardia --</option>';
        this.docentes.forEach(d => htmlDoc += `<option value="${d.cedula}">${d.nombre_completo}</option>`);
        if(selDoc) selDoc.innerHTML = htmlDoc;

        let selPar = document.getElementById('sel-add-parada');
        let htmlPar = '<option value="">-- Elija parada a agregar --</option>';
        this.paradas.forEach(p => htmlPar += `<option value="${p.id_parada}">${p.nombre_parada}</option>`);
        if(selPar) selPar.innerHTML = htmlPar;

        let selMon = document.getElementById('sel-monitoreo-ruta');
        let htmlMon = '<option value="">-- Seleccione Ruta --</option>';
        this.rutas.forEach(r => htmlMon += `<option value="${r.id_ruta}">${r.nombre_ruta}</option>`);
        if(selMon) selMon.innerHTML = htmlMon;
    },

    agregarParadaARuta: function() {
        let sel = document.getElementById('sel-add-parada');
        let idParada = sel.value;
        if(!idParada) return;

        let pData = this.paradas.find(p => p.id_parada === idParada);
        if(pData) {
            this.paradasTemporalesRuta.push(pData);
            this.dibujarListaConstruccionRuta();
            sel.value = ""; // reset
        }
    },

    quitarParadaDeRuta: function(index) {
        this.paradasTemporalesRuta.splice(index, 1);
        this.dibujarListaConstruccionRuta();
    },

    dibujarListaConstruccionRuta: function() {
        let div = document.getElementById('lista-paradas-ruta');
        if(this.paradasTemporalesRuta.length === 0) {
            div.innerHTML = '<div class="text-center text-muted small mt-4">Agregue paradas al recorrido...</div>';
            return;
        }

        let html = '';
        this.paradasTemporalesRuta.forEach((p, idx) => {
            html += `
            <div class="d-flex justify-content-between align-items-center bg-white p-2 mb-2 border rounded shadow-sm">
                <div><span class="badge bg-primary rounded-circle me-2">${idx+1}</span> ${p.nombre_parada}</div>
                <button class="btn btn-sm text-danger p-0" onclick="window.ModTransporte.quitarParadaDeRuta(${idx})"><i class="bi bi-x-circle-fill fs-5"></i></button>
            </div>`;
        });
        div.innerHTML = html;
    },

    guardarRuta: function() {
        let nombre = document.getElementById('txt-ruta-nombre').value.trim();
        let chofer = document.getElementById('txt-ruta-chofer').value.trim();
        let cedulaDoc = document.getElementById('sel-ruta-docente').value;

        if(!nombre || !chofer || !cedulaDoc || this.paradasTemporalesRuta.length === 0) {
            return Swal.fire('Incompleto', 'Debe llenar todos los campos y agregar al menos una parada.', 'warning');
        }

        let idParadas = this.paradasTemporalesRuta.map(p => p.id_parada);

        window.Aplicacion.mostrarCarga();
        window.Aplicacion.peticion({
            action: 'save_ruta', nombre_ruta: nombre, chofer: chofer, cedula_docente: cedulaDoc, paradas_array: idParadas
        }, (res) => {
            window.Aplicacion.ocultarCarga();
            if(res && res.status === 'success') {
                Swal.fire({toast:true, position:'top-end', icon:'success', title:'Ruta guardada', showConfirmButton:false, timer:2000});
                
                // Limpiar formulario
                document.getElementById('txt-ruta-nombre').value = '';
                document.getElementById('txt-ruta-chofer').value = '';
                document.getElementById('sel-ruta-docente').value = '';
                this.paradasTemporalesRuta = [];
                this.dibujarListaConstruccionRuta();
                
                this.cargarTodo(true);
            }
        });
    },

    eliminarRuta: function(idRuta) {
        Swal.fire({title:'¿Borrar Ruta?', icon:'warning', showCancelButton:true}).then((r) => {
            if(r.isConfirmed) {
                window.Aplicacion.peticion({action:'delete_ruta', id_ruta: idRuta}, (res) => { this.cargarTodo(true); });
            }
        });
    },

    dibujarTarjetasRutas: function() {
        let contenedor = document.getElementById('contenedor-rutas-activas');
        if(!contenedor) return;

        if(this.rutas.length === 0) {
            contenedor.innerHTML = '<div class="text-center py-4 text-muted">No hay rutas diseñadas.</div>';
            return;
        }

        let html = '';
        this.rutas.forEach(r => {
            let doc = this.docentes.find(d => String(d.cedula) === String(r.cedula_docente));
            let nombreDoc = doc ? doc.nombre_completo : 'No asignado';
            
            let idParadasArray = [];
            try { idParadasArray = JSON.parse(r.paradas_json); } catch(e){}
            
            html += `
            <div class="bg-light border rounded p-3 mb-3 position-relative">
                <button class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2" onclick="window.ModTransporte.eliminarRuta('${r.id_ruta}')" title="Eliminar Ruta"><i class="bi bi-trash"></i></button>
                <h6 class="fw-bold text-primary mb-1">${r.nombre_ruta}</h6>
                <div class="small text-muted mb-2"><i class="bi bi-person-badge me-1"></i> Chofer: ${r.chofer} | <i class="bi bi-person-video3 ms-2 me-1"></i> Docente: ${nombreDoc}</div>
                <div class="small text-dark"><b>${idParadasArray.length} Paradas:</b> Recorrido hacia la escuela.</div>
                <button class="btn btn-sm btn-outline-info mt-2" onclick="window.ModTransporte.exportarRutograma('${r.id_ruta}')"><i class="bi bi-file-pdf"></i> Exportar Rutograma</button>
            </div>`;
        });
        contenedor.innerHTML = html;
    },

    // ==========================================
    // VISTA 3: MONITOREO EN VIVO
    // ==========================================
    cargarMonitoreoRuta: function() {
        let idRuta = document.getElementById('sel-monitoreo-ruta').value;
        let tipo = document.getElementById('sel-monitoreo-tipo').value;
        
        let msj = document.getElementById('mensaje-espera-monitoreo');
        let divTime = document.getElementById('timeline-contenedor');
        let divInfo = document.getElementById('info-docente-monitoreo');

        if(!idRuta) { msj.classList.remove('d-none'); divTime.classList.add('d-none'); divInfo.classList.add('d-none'); return; }

        let ruta = this.rutas.find(r => r.id_ruta === idRuta);
        if(!ruta) return;

        msj.classList.add('d-none');
        divTime.classList.remove('d-none');
        divInfo.classList.remove('d-none');

        // Mostrar info de contacto del Docente de Guardia
        let doc = this.docentes.find(d => String(d.cedula) === String(ruta.cedula_docente));
        if(doc) {
            divInfo.innerHTML = `<h6 class="fw-bold mb-1 text-success">Docente a Cargo: ${doc.nombre_completo}</h6><div class="small text-muted"><i class="bi bi-telephone-fill me-1"></i> ${doc.telefono || 'N/A'}</div>`;
        } else {
            divInfo.innerHTML = `<div class="text-danger small fw-bold">Docente no encontrado.</div>`;
        }

        // Obtener estado actual de HOY desde el servidor (cargado en init)
        let trackActual = this.trackingHoy.find(t => t.id_ruta === idRuta && t.tipo_recorrido === tipo);
        let marcadas = {};
        if(trackActual) { try { marcadas = JSON.parse(trackActual.estado_json); } catch(e){} }

        // Armar el arreglo de paradas dependiendo si es Entrada o Salida
        let rutaIds = [];
        try { rutaIds = JSON.parse(ruta.paradas_json); } catch(e){}

        let puntosRecorrido = [];
        
        if (tipo === 'Entrada') {
            // Entrada: Paradas en orden -> Escuela al final
            rutaIds.forEach(id => { let p = this.paradas.find(x => x.id_parada === id); if(p) puntosRecorrido.push({id: p.id_parada, nombre: p.nombre_parada, ref: p.referencia}); });
            puntosRecorrido.push({id: 'escuela', nombre: 'U.E. Libertador Bolívar (Destino Final)', ref: 'Llegada a la institución'});
        } else {
            // Salida: Escuela al inicio -> Paradas en reversa
            puntosRecorrido.push({id: 'escuela', nombre: 'U.E. Libertador Bolívar (Salida)', ref: 'Inicio del retorno'});
            let reversa = [...rutaIds].reverse();
            reversa.forEach(id => { let p = this.paradas.find(x => x.id_parada === id); if(p) puntosRecorrido.push({id: p.id_parada, nombre: p.nombre_parada, ref: p.referencia}); });
        }

        // Permisos para ver botón de "Marcar Llegada"
        let rol = window.Aplicacion.usuario ? window.Aplicacion.usuario.rol : '';
        let puedeMarcar = (rol === 'Administrador' || rol === 'Directivo' || rol === 'Coordinador' || String(window.Aplicacion.usuario.cedula) === String(ruta.cedula_docente));

        let htmlTimeline = '';
        puntosRecorrido.forEach(pto => {
            let horaPaso = marcadas[pto.id];
            let claseCompletada = horaPaso ? 'completada' : '';
            
            let botonMarcar = '';
            if (puedeMarcar && !horaPaso) {
                botonMarcar = `<button class="btn btn-sm btn-outline-success ms-3" onclick="window.ModTransporte.marcarCheckPoint('${idRuta}', '${tipo}', '${pto.id}')">Marcar Llegada</button>`;
            }

            let badgeHora = horaPaso ? `<span class="badge bg-success ms-2"><i class="bi bi-check2-all"></i> Pasó a las ${horaPaso}</span>` : `<span class="badge bg-secondary opacity-50 ms-2"><i class="bi bi-clock"></i> En espera</span>`;

            htmlTimeline += `
            <div class="timeline-item ${claseCompletada}">
                <div class="fw-bold nombre-parada ${horaPaso ? 'text-muted' : 'text-dark'}">${pto.nombre} ${badgeHora}</div>
                <div class="small text-muted mt-1">${pto.ref} ${botonMarcar}</div>
            </div>`;
        });

        divTime.innerHTML = htmlTimeline;
    },

    marcarCheckPoint: function(idRuta, tipo, idParada) {
        // Obtenemos hora actual formateada
        let ahora = new Date();
        let horaStr = ahora.toLocaleTimeString('es-VE', {hour: '2-digit', minute:'2-digit'});

        // Leemos estado actual de la memoria
        let trackActual = this.trackingHoy.find(t => t.id_ruta === idRuta && t.tipo_recorrido === tipo);
        let marcadas = {};
        if(trackActual) { try { marcadas = JSON.parse(trackActual.estado_json); } catch(e){} }
        
        marcadas[idParada] = horaStr; // Registramos

        // Enviamos al servidor
        let payload = {
            action: 'update_tracking',
            fecha_str: this.obtenerFechaHoy(),
            id_ruta: idRuta,
            tipo_recorrido: tipo,
            estado_json: marcadas
        };

        window.Aplicacion.peticion(payload, (res) => {
            if(res && res.status === 'success') {
                // Actualizamos la memoria silenciosamente y redibujamos
                this.cargarTodo(true); 
            }
        });
    },

    // ==========================================
    // EXPORTACIÓN PDF (RUTOGRAMA OFICIAL)
    // ==========================================
    exportarRutograma: function(idRuta) {
        let ruta = this.rutas.find(r => r.id_ruta === idRuta);
        if(!ruta) return;

        let docPerfil = this.docentes.find(d => String(d.cedula) === String(ruta.cedula_docente));
        let nombreDoc = docPerfil ? docPerfil.nombre_completo : 'Sin asignar';
        let telDoc = docPerfil ? docPerfil.telefono : 'N/A';

        let rutaIds = [];
        try { rutaIds = JSON.parse(ruta.paradas_json); } catch(e){}

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
        const margin = 20;
        const pageWidth = doc.internal.pageSize.getWidth();

        // Header
        doc.setTextColor(0, 102, 255); doc.setFontSize(16); doc.setFont("helvetica", "bold");
        doc.text("RUTOGRAMA DE TRANSPORTE ESCOLAR", pageWidth/2, margin, {align:"center"});
        
        doc.setTextColor(50, 50, 50); doc.setFontSize(12); doc.setFont("helvetica", "normal");
        doc.text(`Ruta: ${ruta.nombre_ruta}`, margin, margin + 15);
        doc.text(`Chofer Asignado: ${ruta.chofer}`, margin, margin + 22);
        doc.text(`Docente de Guardia: ${nombreDoc} (Tel: ${telDoc})`, margin, margin + 29);
        
        doc.setDrawColor(0, 102, 255); doc.setLineWidth(1);
        doc.line(margin, margin + 35, pageWidth - margin, margin + 35);

        // Timeline visual PDF
        doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.setTextColor(0,0,0);
        doc.text("Secuencia de Recorrido (Entrada):", margin, margin + 45);

        doc.setFontSize(11); doc.setFont("helvetica", "normal");
        let startY = margin + 55;

        rutaIds.forEach((id, index) => {
            let p = this.paradas.find(x => x.id_parada === id);
            if(p) {
                // Círculo
                doc.setDrawColor(0, 102, 255); doc.setFillColor(255, 255, 255);
                doc.circle(margin + 5, startY, 2, 'FD');
                // Texto
                doc.text(`${index + 1}. ${p.nombre_parada}`, margin + 10, startY + 1);
                doc.setFontSize(9); doc.setTextColor(100,100,100);
                doc.text(`Ref: ${p.referencia}`, margin + 10, startY + 5);
                doc.setFontSize(11); doc.setTextColor(0,0,0);
                
                // Línea vertical
                if (index < rutaIds.length - 1) {
                    doc.setDrawColor(200, 200, 200);
                    doc.line(margin + 5, startY + 2, margin + 5, startY + 13);
                }
                startY += 15;
            }
        });

        // Parada final
        doc.setDrawColor(0, 230, 118); doc.setFillColor(0, 230, 118); // Verde
        doc.circle(margin + 5, startY, 2, 'FD');
        doc.setFont("helvetica", "bold"); doc.setTextColor(0, 150, 50);
        doc.text(`LLEGADA: U.E. Libertador Bolívar`, margin + 10, startY + 1);

        doc.save(`Rutograma_${ruta.nombre_ruta.replace(/\s/g, '_')}.pdf`);
    }
};

window.init_Transporte_Escolar = function() { window.ModTransporte.init(); };