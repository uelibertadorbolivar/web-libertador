/**
 * MÓDULO: ESCUELA
 */
const ModuloEscuela = {
    
    // 1. PERFIL DE LA INSTITUCIÓN
    renderPerfil: function() {
        App.renderView("esc-perfil", "Perfil de la Escuela");
        const div = document.getElementById('dynamic-view');
        
        div.innerHTML = `
            <div class="row animate__animated animate__fadeIn">
                <div class="col-md-10 mx-auto">
                    <div class="card border-0 shadow-sm" style="border-radius:20px;">
                        <div class="card-body p-4 p-md-5">
                            <div class="d-flex align-items-center mb-4">
                                <div class="p-3 rounded-circle bg-light-warning me-3">
                                    <i class="bi bi-building-gear fs-3 text-warning"></i>
                                </div>
                                <div>
                                    <h4 class="mb-0" style="font-weight:500;">Datos Institucionales</h4>
                                    <p class="text-muted small mb-0">Información legal y de identidad</p>
                                </div>
                            </div>
                            
                            <form id="form-perfil" onsubmit="ModuloEscuela.savePerfil(event)">
                                <div class="row g-4">
                                    <div class="col-md-12">
                                        <label class="form-label small" style="font-weight:500;">Nombre Completo del Plantel</label>
                                        <input type="text" class="form-control custom-input" name="nombre" value="U.E. Libertador Bolívar">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label small" style="font-weight:500;">Código DEA</label>
                                        <input type="text" class="form-control custom-input" name="dea" placeholder="Ej: OD123456">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label small" style="font-weight:500;">RIF</label>
                                        <input type="text" class="form-control custom-input" name="rif" placeholder="Ej: J-12345678-9">
                                    </div>
                                    <div class="col-md-12">
                                        <label class="form-label small" style="font-weight:500;">Dirección</label>
                                        <textarea class="form-control custom-input" name="direccion" rows="2"></textarea>
                                    </div>
                                </div>
                                <div class="text-end mt-5">
                                    <button type="submit" class="btn btn-primary px-5 rounded-pill shadow-sm" id="btn-save-escuela">
                                        Guardar Cambios
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
        Chatbot.addBotMessage("Asegúrate de que el <b>Código DEA</b> y el <b>RIF</b> sean correctos, ya que se imprimirán en todos los reportes oficiales.");
    },

    // 2. GESTIÓN DE PERIODOS ESCOLARES
    renderPeriodos: function() {
        App.renderView("esc-periodos", "Fases y Periodos Escolares");
        const div = document.getElementById('dynamic-view');

        div.innerHTML = `
            <div class="row g-4 animate__animated animate__fadeIn">
                <!-- Formulario Nuevo Periodo -->
                <div class="col-md-4">
                    <div class="card border-0 shadow-sm p-4" style="border-radius:20px;">
                        <h6 class="mb-4" style="font-weight:500;">Nuevo Año Escolar</h6>
                        <form onsubmit="ModuloEscuela.savePeriodo(event)">
                            <div class="mb-3">
                                <label class="form-label small">Nombre del Periodo</label>
                                <input type="text" class="form-control custom-input" placeholder="Ej: 2023 - 2024" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label small">Fecha Inicio</label>
                                <input type="date" class="form-control custom-input" required>
                            </div>
                            <div class="mb-4">
                                <label class="form-label small">Fecha Cierre</label>
                                <input type="date" class="form-control custom-input" required>
                            </div>
                            <button type="submit" class="btn btn-success w-100 rounded-pill shadow-sm">
                                <i class="bi bi-plus-circle me-2"></i>Activar Periodo
                            </button>
                        </form>
                    </div>
                </div>

                <!-- Lista de Periodos -->
                <div class="col-md-8">
                    <div class="card border-0 shadow-sm p-4" style="border-radius:20px;">
                        <h6 class="mb-4" style="font-weight:500;">Historial de Periodos</h6>
                        <div class="table-responsive">
                            <table class="table table-hover align-middle">
                                <thead class="table-light">
                                    <tr style="font-size: 0.8rem; font-weight: 500;">
                                        <th>NOMBRE</th>
                                        <th>RANGO DE FECHAS</th>
                                        <th>ESTADO</th>
                                        <th>ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody style="font-size: 0.85rem; font-weight:300;">
                                    <tr>
                                        <td>2023 - 2024</td>
                                        <td>Sep 2023 - Jul 2024</td>
                                        <td><span class="badge rounded-pill bg-success-subtle text-success px-3">Activo</span></td>
                                        <td><button class="btn btn-sm btn-light rounded-circle"><i class="bi bi-pencil"></i></button></td>
                                    </tr>
                                    <tr>
                                        <td>2022 - 2023</td>
                                        <td>Sep 2022 - Jul 2023</td>
                                        <td><span class="badge rounded-pill bg-light text-muted px-3">Cerrado</span></td>
                                        <td><button class="btn btn-sm btn-light rounded-circle"><i class="bi bi-eye"></i></button></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        Chatbot.addBotMessage("Recuerda que solo puede haber un <b>Periodo Activo</b> a la vez. Al crear uno nuevo, el anterior se cerrará automáticamente.");
    },

    savePerfil: function(e) {
        e.preventDefault();
        Swal.fire('Procesando...', 'Guardando datos en el Sistema Integral', 'info');
        // Aquí iría el App.sendRequest...
    },

    savePeriodo: function(e) {
        e.preventDefault();
        Swal.fire('¡Éxito!', 'Nuevo Año Escolar activado correctamente', 'success');
    }
};