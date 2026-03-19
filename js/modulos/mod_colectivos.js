/**
 * MÓDULO: GESTIÓN DE COLECTIVOS
 * Permite administrar las organizaciones y asignar personal (Asesores, Voceros, Integrantes).
 */

window.ModColectivos = {
    colectivos: [],
    personal: [],
    colectivoActual: null,

    init: function() {
        this.cargarDatos();
    },

    cargarDatos: function() {
        window.Aplicacion.mostrarCarga();
        window.Aplicacion.peticion({ action: "get_colectivos_data" }, (res) => {
            window.Aplicacion.ocultarCarga();
            if (res && res.status === "success") {
                this.colectivos = res.colectivos || [];
                this.personal = res.personal || []; // Ya viene filtrado desde el Backend
                
                this.renderizarLista();
                this.dibujarSelectPersonal();
                this.dibujarCheckboxesIntegrantes();
                
                document.getElementById('panel-gestion').style.display = 'none';
                document.getElementById('panel-vacio').style.display = 'flex';
            } else {
                Swal.fire("Error", "No se pudieron cargar los datos.", "error");
            }
        });
    },

    renderizarLista: function() {
        const lista = document.getElementById('lista-colectivos');
        if (this.colectivos.length === 0) {
            lista.innerHTML = `<div class="p-4 text-center text-muted"><i class="bi bi-inbox fs-2"></i><p class="mb-0 mt-2 small">No hay colectivos registrados</p></div>`;
            return;
        }

        let html = '';
        this.colectivos.forEach(col => {
            html += `
            <a href="javascript:void(0)" class="list-group-item list-group-item-action p-3 border-0 border-bottom d-flex align-items-center hover-efecto" onclick="window.ModColectivos.verDetalles('${col.id}')">
                <div class="bg-danger bg-opacity-10 text-danger p-2 rounded-3 me-3"><i class="bi bi-diagram-3-fill"></i></div>
                <div>
                    <div class="fw-bold text-dark">${col.nombre}</div>
                    <div class="small text-muted" style="font-size: 0.75rem;">${col.tipo}</div>
                </div>
                <i class="bi bi-chevron-right ms-auto text-muted small"></i>
            </a>`;
        });
        lista.innerHTML = html;
    },

    dibujarSelectPersonal: function() {
        const selectAsesor = document.getElementById('col-asesor');
        const selectVocero = document.getElementById('col-vocero');
        let html = '<option value="">Seleccione personal...</option>';
        
        this.personal.forEach(p => {
            html += `<option value="${p.nombre_completo}">${p.nombre_completo} (${p.rol})</option>`;
        });
        
        if(selectAsesor) selectAsesor.innerHTML = html;
        if(selectVocero) selectVocero.innerHTML = html;
    },

    dibujarCheckboxesIntegrantes: function() {
        const contenedor = document.getElementById('contenedor-integrantes');
        if(!contenedor) return;
        
        let html = '';
        this.personal.forEach(p => {
            html += `
            <div class="col-md-6 col-xl-4">
                <div class="form-check bg-white p-2 rounded border shadow-sm" style="padding-left: 2.2rem !important;">
                    <input class="form-check-input chk-integrante" type="checkbox" value="${p.nombre_completo}" id="chk-${p.cedula}" style="cursor: pointer;">
                    <label class="form-check-label small fw-bold text-dark w-100" for="chk-${p.cedula}" style="cursor: pointer;">
                        ${p.nombre_completo} <br><span class="text-muted fw-normal" style="font-size: 0.7rem;">${p.rol}</span>
                    </label>
                </div>
            </div>`;
        });
        contenedor.innerHTML = html;
    },

    nuevoColectivo: function() {
        this.colectivoActual = null;
        document.getElementById('form-colectivo').reset();
        document.getElementById('col-id').value = '';
        
        document.getElementById('titulo-panel').innerText = 'Nuevo Colectivo';
        document.getElementById('badge-id').innerText = 'NUEVO REGISTRO';
        
        // Desmarcar todos los checkboxes
        document.querySelectorAll('.chk-integrante').forEach(chk => chk.checked = false);
        
        // Ocultar Paso 2 hasta que se cree la organización base
        document.getElementById('seccion-miembros').style.display = 'none'; 
        
        document.getElementById('panel-vacio').style.display = 'none';
        document.getElementById('panel-gestion').style.display = 'block';
    },

    verDetalles: function(id) {
        const col = this.colectivos.find(c => String(c.id) === String(id));
        if (!col) return;
        
        this.colectivoActual = col;
        
        document.getElementById('titulo-panel').innerText = 'Gestión: ' + col.nombre;
        document.getElementById('badge-id').innerText = col.id;
        
        // Llenar Paso 1
        document.getElementById('col-id').value = col.id;
        document.getElementById('col-tipo').value = col.tipo || '';
        document.getElementById('col-nombre').value = col.nombre || '';
        document.getElementById('col-descripcion').value = col.descripcion || '';
        
        // Llenar Paso 2 (Asesor y Vocero)
        document.getElementById('col-asesor').value = col.asesor || '';
        document.getElementById('col-vocero').value = col.vocero || '';
        
        // Marcar checkboxes de integrantes guardados
        let integrantesActuales = (col.integrantes || "").split(',').map(s => s.trim());
        document.querySelectorAll('.chk-integrante').forEach(chk => {
            chk.checked = integrantesActuales.includes(chk.value);
        });
        
        document.getElementById('seccion-miembros').style.display = 'block';
        document.getElementById('panel-vacio').style.display = 'none';
        document.getElementById('panel-gestion').style.display = 'block';
    },

    guardarDatosGenerales: function() {
        const id = document.getElementById('col-id').value;
        const tipo = document.getElementById('col-tipo').value;
        const nombre = document.getElementById('col-nombre').value;
        const descripcion = document.getElementById('col-descripcion').value;

        if (!tipo || !nombre) {
            return Swal.fire("Campos Incompletos", "Debe ingresar el Tipo y el Nombre del colectivo.", "warning");
        }

        window.Aplicacion.mostrarCarga();
        window.Aplicacion.peticion({
            action: "save_colectivo",
            id: id,
            tipo: tipo,
            nombre: nombre,
            descripcion: descripcion
        }, (res) => {
            if (res && res.status === "success") {
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: res.message, showConfirmButton: false, timer: 2000 });
                this.cargarDatos(); 
                // Si es nuevo, revelamos el Paso 2
                if(!id) document.getElementById('seccion-miembros').style.display = 'block';
            } else {
                window.Aplicacion.ocultarCarga();
                Swal.fire("Error", res ? res.message : "Error al guardar.", "error");
            }
        });
    },

    guardarMiembros: function() {
        const id = document.getElementById('col-id').value;
        if (!id) return Swal.fire("Atención", "Debe guardar los datos de la organización primero (Paso 1).", "warning");

        const asesor = document.getElementById('col-asesor').value;
        const vocero = document.getElementById('col-vocero').value;
        
        // Recoger todos los checkboxes marcados
        let seleccionados = [];
        document.querySelectorAll('.chk-integrante:checked').forEach(chk => seleccionados.push(chk.value));
        const integrantes = seleccionados.join(', '); // Lo guardamos como texto separado por comas

        window.Aplicacion.mostrarCarga();
        window.Aplicacion.peticion({
            action: "save_miembros_colectivo",
            id: id,
            asesor: asesor,
            vocero: vocero,
            integrantes: integrantes
        }, (res) => {
            if (res && res.status === "success") {
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Asignaciones guardadas correctamente.', showConfirmButton: false, timer: 2000 });
                this.cargarDatos();
            } else {
                window.Aplicacion.ocultarCarga();
                Swal.fire("Error", res ? res.message : "Error al guardar asignaciones.", "error");
            }
        });
    },

    eliminarColectivo: function() {
        const id = document.getElementById('col-id').value;
        if (!id) return;

        Swal.fire({
            title: '¿Eliminar Organización?',
            text: "Se borrará este colectivo y todas sus asignaciones.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar'
        }).then((result) => {
            if (result.isConfirmed) {
                window.Aplicacion.mostrarCarga();
                window.Aplicacion.peticion({ action: "delete_colectivo", id: id }, (res) => {
                    if (res && res.status === "success") {
                        Swal.fire('Eliminado', res.message, 'success');
                        this.nuevoColectivo();
                        this.cargarDatos();
                    } else {
                        window.Aplicacion.ocultarCarga();
                        Swal.fire("Error", res ? res.message : "Error al eliminar.", "error");
                    }
                });
            }
        });
    }
};

// Doble blindaje para el router
window.init_Gestión_de_Colectivos = function() { window.ModColectivos.init(); };
window.init_Gestion_de_Colectivos = function() { window.ModColectivos.init(); };