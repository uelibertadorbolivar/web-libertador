/**
 * MÓDULO: GRADOS Y SALONES
 * Control de Estudios: Define Años, Secciones y vincula los Salones.
 */

window.ModSalones = {
    niveles: [],
    grados: [],
    secciones: [],
    salones: [],

    init: function() {
        this.cargarDatos();
    },

    cambiarVista: function(vista) {
        // Quitar activo a las tarjetas
        document.getElementById('tab-grados').classList.remove('activo');
        document.getElementById('tab-secciones').classList.remove('activo');
        document.getElementById('tab-salones').classList.remove('activo');
        
        // Ocultar contenidos
        document.getElementById('vista-grados').style.display = 'none';
        document.getElementById('vista-secciones').style.display = 'none';
        document.getElementById('vista-salones').style.display = 'none';

        // Mostrar lo seleccionado
        document.getElementById('tab-' + vista).classList.add('activo');
        document.getElementById('vista-' + vista).style.display = 'block';
    },

    cargarDatos: function() {
        window.Aplicacion.mostrarCarga();
        window.Aplicacion.peticion({ action: "get_salones_data" }, (res) => {
            window.Aplicacion.ocultarCarga();
            if(res && res.status === "success") {
                this.niveles = res.niveles || [];
                this.grados = res.grados || [];
                this.secciones = res.secciones || [];
                this.salones = res.salones || [];
                
                this.renderizarListasSimples('lista-grados', this.grados, 'Grado_Anio');
                this.renderizarListasSimples('lista-secciones', this.secciones, 'Seccion');
                this.renderizarSalones();
            } else {
                Swal.fire("Error", "No se pudieron cargar los datos académicos.", "error");
            }
        });
    },

    // ==========================================
    // PARÁMETROS SIMPLES (GRADOS Y SECCIONES)
    // ==========================================
    renderizarListasSimples: function(idContenedor, listaDatos, categoria) {
        const contenedor = document.getElementById(idContenedor);
        if(!contenedor) return;

        if(!listaDatos || listaDatos.length === 0) {
            contenedor.innerHTML = `<div class="p-4 text-center text-muted"><i class="bi bi-inbox fs-2"></i><p class="mb-0 mt-2 small">No hay registros</p></div>`;
            return;
        }

        let html = '';
        listaDatos.forEach(item => {
            html += `
            <div class="list-group-item p-3 border-0 border-bottom d-flex justify-content-between align-items-center hover-efecto">
                <div class="fw-bold text-dark"><i class="bi bi-check2-circle text-info me-2"></i>${item.valor}</div>
                <button class="btn btn-sm btn-light text-danger rounded-circle shadow-sm" onclick="window.ModSalones.eliminarParametro('${item.id}')" title="Eliminar">
                    <i class="bi bi-trash3-fill"></i>
                </button>
            </div>`;
        });
        contenedor.innerHTML = html;
    },

    nuevoParametro: function(categoria, placeholderText) {
        Swal.fire({
            title: 'Nuevo Registro',
            input: 'text',
            inputPlaceholder: placeholderText,
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            confirmButtonColor: '#00BCD4',
            preConfirm: (valor) => {
                if (!valor) Swal.showValidationMessage('Debe escribir un valor');
                return valor;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                window.Aplicacion.mostrarCarga();
                window.Aplicacion.peticion({ action: 'save_config', categoria: categoria, valor: result.value }, (res) => {
                    if (res && res.status === 'success') {
                        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Guardado', showConfirmButton: false, timer: 1500 });
                        this.cargarDatos();
                    } else {
                        window.Aplicacion.ocultarCarga();
                        Swal.fire('Error', res.message, 'error');
                    }
                });
            }
        });
    },

    eliminarParametro: function(id_param) {
        Swal.fire({
            title: '¿Eliminar?', text: "Se borrará del sistema.", icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Sí, eliminar'
        }).then((result) => {
            if (result.isConfirmed) {
                window.Aplicacion.mostrarCarga();
                window.Aplicacion.peticion({ action: "delete_config", id: id_param }, (res) => {
                    if (res && res.status === "success") this.cargarDatos();
                    else Swal.fire('Error', 'No se pudo eliminar.', 'error');
                });
            }
        });
    },

    // ==========================================
    // APERTURA DE SALONES
    // ==========================================
    renderizarSalones: function() {
        const tbody = document.getElementById('tabla-salones');
        if (this.salones.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center p-4 text-muted"><i class="bi bi-inbox fs-3 d-block mb-2"></i>No hay salones aperturados.</td></tr>`;
            return;
        }

        let html = '';
        this.salones.forEach(s => {
            html += `
            <tr>
                <td class="ps-4 fw-bold text-dark text-uppercase">${s.nombre_salon}</td>
                <td><span class="badge bg-light text-dark border">${s.nivel_educativo}</span></td>
                <td>${s.grado_anio}</td>
                <td><span class="badge bg-info rounded-circle p-2">${s.seccion}</span></td>
                <td class="text-end pe-4">
                    <button class="btn btn-sm btn-light text-danger border shadow-sm hover-efecto" onclick="window.ModSalones.eliminarSalon('${s.id_salon}')"><i class="bi bi-trash3-fill"></i></button>
                </td>
            </tr>`;
        });
        tbody.innerHTML = html;
    },

    abrirModalSalon: function() {
        if(this.niveles.length === 0 || this.grados.length === 0 || this.secciones.length === 0) {
            return Swal.fire("Faltan Datos", "Debe registrar primero Niveles (en Configuración), Grados y Secciones antes de aperturar un salón.", "warning");
        }

        let optNiveles = '<option value="">Seleccione Nivel...</option>';
        this.niveles.forEach(n => optNiveles += `<option value="${n.valor}">${n.valor}</option>`);
        
        let optGrados = '<option value="">Seleccione Grado...</option>';
        this.grados.forEach(g => optGrados += `<option value="${g.valor}">${g.valor}</option>`);
        
        let optSecc = '<option value="">Seleccione Sección...</option>';
        this.secciones.forEach(s => optSecc += `<option value="${s.valor}">${s.valor}</option>`);

        let htmlForm = `
            <div class="text-start">
                <label class="small fw-bold mb-1 text-muted">Nivel Educativo</label>
                <select id="swal-nivel" class="swal2-input input-moderno m-0 mb-3 w-100">${optNiveles}</select>
                
                <div class="row g-2">
                    <div class="col-8">
                        <label class="small fw-bold mb-1 text-muted">Grado o Año</label>
                        <select id="swal-grado" class="swal2-input input-moderno m-0 w-100">${optGrados}</select>
                    </div>
                    <div class="col-4">
                        <label class="small fw-bold mb-1 text-muted">Sección</label>
                        <select id="swal-secc" class="swal2-input input-moderno m-0 w-100">${optSecc}</select>
                    </div>
                </div>
            </div>
        `;

        Swal.fire({
            title: 'Aperturar Salón',
            html: htmlForm,
            showCancelButton: true,
            confirmButtonText: 'Crear Salón',
            confirmButtonColor: '#00BCD4',
            preConfirm: () => {
                const niv = document.getElementById('swal-nivel').value;
                const gra = document.getElementById('swal-grado').value;
                const sec = document.getElementById('swal-secc').value;
                
                if (!niv || !gra || !sec) { Swal.showValidationMessage('Todos los campos son obligatorios'); return false; }
                return { nivel: niv, grado: gra, seccion: sec };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                this.guardarSalon(result.value);
            }
        });
    },

    guardarSalon: function(datos) {
        // Generar nombre automático (Ej: 1er Año A)
        const nombre = `${datos.grado} ${datos.seccion}`;
        
        window.Aplicacion.mostrarCarga();
        window.Aplicacion.peticion({
            action: 'save_salon',
            id_salon: '', // Vacío para crear nuevo
            nivel_educativo: datos.nivel,
            grado_anio: datos.grado,
            seccion: datos.seccion,
            nombre_salon: nombre
        }, (res) => {
            if (res && res.status === 'success') {
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Salón Aperturado', showConfirmButton: false, timer: 1500 });
                this.cargarDatos();
            } else {
                window.Aplicacion.ocultarCarga();
                Swal.fire('Error', res.message || 'El salón ya existe o hubo un error.', 'error');
            }
        });
    },

    eliminarSalon: function(id_salon) {
        Swal.fire({
            title: '¿Clausurar Salón?', text: "Se eliminará de la estructura.", icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Sí, eliminar'
        }).then((result) => {
            if (result.isConfirmed) {
                window.Aplicacion.mostrarCarga();
                window.Aplicacion.peticion({ action: "delete_salon", id_salon: id_salon }, (res) => {
                    if (res && res.status === "success") this.cargarDatos();
                    else Swal.fire('Error', 'No se pudo eliminar.', 'error');
                });
            }
        });
    }
};

window.init_Grados_y_Salones = function() { window.ModSalones.init(); };