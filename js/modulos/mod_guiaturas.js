/**
 * MÓDULO: ASIGNAR GUIATURAS
 * Permite vincular a los docentes con los salones aperturados.
 */

window.ModGuiaturas = {
    salones: [],
    docentes: [],

    init: function() {
        this.cargarDatos();
    },

    cargarDatos: function() {
        window.Aplicacion.mostrarCarga();
        
        window.Aplicacion.peticion({ action: "get_guiaturas_data" }, (res) => {
            window.Aplicacion.ocultarCarga();
            if (res && res.status === "success") {
                this.salones = res.salones || [];
                // El backend ya filtra y nos envía solo a los que tienen rol "Docente"
                this.docentes = res.docentes || []; 
                this.renderizarTabla();
            } else {
                Swal.fire("Error", "No se pudieron cargar los datos de guiaturas.", "error");
            }
        });
    },

    renderizarTabla: function() {
        const tbody = document.getElementById('tabla-guiaturas');
        document.getElementById('contador-salones').innerText = `${this.salones.length} Salones`;

        if (this.salones.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center p-5 text-muted"><i class="bi bi-door-closed fs-1 d-block mb-3"></i>No hay salones aperturados en el sistema.<br>Vaya al módulo de "Grados y Salones" para crearlos.</td></tr>`;
            return;
        }

        // 1. Construir las opciones del Select con los Docentes
        let opcionesDocentes = '<option value="">Sin asignar...</option>';
        this.docentes.forEach(d => {
            // Se usa la cédula como ID de vínculo
            opcionesDocentes += `<option value="${d.cedula}">${d.nombre_completo} (C.I: ${d.cedula})</option>`;
        });

        // 2. Dibujar las filas
        let html = '';
        this.salones.forEach(s => {
            
            // Reemplazamos los "value" para pre-seleccionar si ya tienen docente guardado
            let selectGuia1 = `<select class="form-select border-success text-dark shadow-sm select-guia-1" id="g1-${s.id_salon}">${opcionesDocentes}</select>`;
            if (s.docente_guia_1) selectGuia1 = selectGuia1.replace(`value="${s.docente_guia_1}"`, `value="${s.docente_guia_1}" selected`);

            let selectGuia2 = `<select class="form-select border-secondary text-dark select-guia-2" id="g2-${s.id_salon}">${opcionesDocentes}</select>`;
            if (s.docente_guia_2) selectGuia2 = selectGuia2.replace(`value="${s.docente_guia_2}"`, `value="${s.docente_guia_2}" selected`);

            html += `
            <tr>
                <td class="ps-4">
                    <div class="fw-bolder text-dark text-uppercase fs-6">${s.nombre_salon}</div>
                    <div class="small text-muted"><span class="badge bg-light text-dark border me-1">${s.nivel_educativo}</span></div>
                </td>
                <td>${selectGuia1}</td>
                <td>${selectGuia2}</td>
                <td class="text-end pe-4">
                    <button class="btn btn-success fw-bold shadow-sm hover-efecto" onclick="window.ModGuiaturas.guardar('${s.id_salon}')" title="Guardar Asignación">
                        <i class="bi bi-floppy-fill"></i>
                    </button>
                </td>
            </tr>`;
        });
        
        tbody.innerHTML = html;
    },

    guardar: function(id_salon) {
        const cedula1 = document.getElementById(`g1-${id_salon}`).value;
        const cedula2 = document.getElementById(`g2-${id_salon}`).value;

        if (cedula1 && cedula1 === cedula2) {
            return Swal.fire("Atención", "No puede asignar al mismo docente como Guía Principal y Auxiliar en el mismo salón.", "warning");
        }

        window.Aplicacion.mostrarCarga();
        
        window.Aplicacion.peticion({
            action: 'save_guiatura',
            id_salon: id_salon,
            cedula_docente_1: cedula1,
            cedula_docente_2: cedula2
        }, (res) => {
            window.Aplicacion.ocultarCarga();
            if (res && res.status === "success") {
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Asignación Guardada', showConfirmButton: false, timer: 2000 });
            } else {
                Swal.fire("Error", res ? res.message : "Error al guardar.", "error");
            }
        });
    }
};

window.init_Asignar_Guiaturas = function() { window.ModGuiaturas.init(); };