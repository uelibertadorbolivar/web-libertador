/**
 * MÓDULO: CONFIGURACIÓN GLOBAL DEL SISTEMA
 * Gestiona Años Escolares, Lapsos y Niveles.
 */

window.ModConfiguracion = {
    init: function() {
        this.cargarConfiguraciones();
    },

    cargarConfiguraciones: function() {
        window.Aplicacion.mostrarCarga();
        window.Aplicacion.peticion({ action: "get_config" }, (res) => {
            window.Aplicacion.ocultarCarga();
            if(res && res.status === "success") {
                this.renderizarLista('lista-periodos', res.periodos, true);
                this.renderizarLista('lista-lapsos', res.lapsos, true);
                this.renderizarLista('lista-niveles', res.niveles, false);
            } else {
                Swal.fire("Error", "No se pudieron cargar las configuraciones.", "error");
            }
        });
    },

    renderizarLista: function(idContenedor, listaDatos, requiereFechas) {
        const contenedor = document.getElementById(idContenedor);
        if(!contenedor) return;

        if(!listaDatos || listaDatos.length === 0) {
            contenedor.innerHTML = `<div class="p-4 text-center text-muted"><i class="bi bi-inbox fs-2"></i><p class="mb-0 small fw-bold mt-2">No hay registros</p></div>`;
            return;
        }

        let html = '';
        listaDatos.forEach(item => {
            let badgeHTML = '';
            if (requiereFechas) {
                if(item.estado === 'Activo') badgeHTML = `<span class="badge bg-success rounded-pill px-2 shadow-sm" style="font-size: 0.7rem;">Activo</span>`;
                else if(item.estado === 'Próximo') badgeHTML = `<span class="badge bg-warning text-dark rounded-pill px-2 shadow-sm" style="font-size: 0.7rem;">Próximo</span>`;
                else badgeHTML = `<span class="badge bg-secondary rounded-pill px-2 shadow-sm" style="font-size: 0.7rem;">Finalizado</span>`;
            }

            let infoFechas = requiereFechas ? `<div class="small text-muted mt-1" style="font-size: 0.75rem;"><i class="bi bi-calendar2-range me-1"></i>${item.inicio || '?'} al ${item.fin || '?'}</div>` : '';

            html += `
            <div class="list-group-item p-3 border-0 border-bottom d-flex justify-content-between align-items-center hover-efecto" style="transition: background 0.2s;">
                <div>
                    <div class="fw-bold text-dark d-flex align-items-center gap-2">
                        ${item.valor} ${badgeHTML}
                    </div>
                    ${infoFechas}
                </div>
                <button class="btn btn-sm btn-light text-danger rounded-circle shadow-sm" onclick="window.ModConfiguracion.eliminar('${item.id}')" title="Eliminar">
                    <i class="bi bi-trash3-fill"></i>
                </button>
            </div>`;
        });
        contenedor.innerHTML = html;
    },

    nuevoParametro: function(categoria, requiereFechas = true) {
        let htmlForm = `
            <input type="text" id="swal-valor" class="swal2-input input-moderno mb-3" placeholder="Ej: ${categoria === 'Periodo_Escolar' ? '2025 - 2026' : (categoria === 'Fase_Escolar' ? '1er Momento' : 'Educación Media')}">
        `;
        
        if (requiereFechas) {
            htmlForm += `
            <div class="row text-start mt-3">
                <div class="col-6">
                    <label class="small fw-bold text-muted mb-1">Fecha de Inicio</label>
                    <input type="date" id="swal-inicio" class="swal2-input m-0 w-100 input-moderno text-muted">
                </div>
                <div class="col-6">
                    <label class="small fw-bold text-muted mb-1">Fecha de Fin</label>
                    <input type="date" id="swal-fin" class="swal2-input m-0 w-100 input-moderno text-muted">
                </div>
            </div>`;
        }

        Swal.fire({
            title: 'Nuevo Registro',
            html: htmlForm,
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#4F46E5',
            focusConfirm: false,
            preConfirm: () => {
                const valor = document.getElementById('swal-valor').value;
                if (!valor) { Swal.showValidationMessage('El nombre/valor es obligatorio'); return false; }
                
                let inicio = "", fin = "";
                if (requiereFechas) {
                    inicio = document.getElementById('swal-inicio').value;
                    fin = document.getElementById('swal-fin').value;
                    if (!inicio || !fin) { Swal.showValidationMessage('Ambas fechas son obligatorias'); return false; }
                    if (new Date(inicio) > new Date(fin)) { Swal.showValidationMessage('La fecha de fin debe ser posterior al inicio'); return false; }
                }
                
                return { valor: valor, inicio: inicio, fin: fin };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                this.guardar(categoria, result.value);
            }
        });
    },

    guardar: function(categoria, datos) {
        window.Aplicacion.mostrarCarga();
        window.Aplicacion.peticion({
            action: 'save_config',
            categoria: categoria,
            valor: datos.valor,
            inicio: datos.inicio,
            fin: datos.fin
        }, (res) => {
            if (res && res.status === 'success') {
                Swal.fire('Guardado', 'El parámetro se registró correctamente.', 'success').then(() => {
                    this.cargarConfiguraciones();
                });
            } else {
                window.Aplicacion.ocultarCarga();
                Swal.fire('Error', res.message || 'No se pudo guardar.', 'error');
            }
        });
    },

    eliminar: function(id_parametro) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "Se eliminará este parámetro del sistema.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar'
        }).then((result) => {
            if (result.isConfirmed) {
                window.Aplicacion.mostrarCarga();
                window.Aplicacion.peticion({ action: "delete_config", id: id_parametro }, (res) => {
                    if (res && res.status === "success") {
                        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Eliminado', showConfirmButton: false, timer: 1500 });
                        this.cargarConfiguraciones();
                    } else {
                        window.Aplicacion.ocultarCarga();
                        Swal.fire('Error', 'No se pudo eliminar.', 'error');
                    }
                });
            }
        });
    }
};

// ✨ FIX: Múltiples aliases por si hay tildes en la ruta HTML
window.init_Configuracion_del_Sistema = function() { window.ModConfiguracion.init(); };
window.init_Configuración_del_Sistema = function() { window.ModConfiguracion.init(); };