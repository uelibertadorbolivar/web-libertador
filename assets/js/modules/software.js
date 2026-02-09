/**
 * MÓDULO: ADMINISTRACIÓN DE SOFTWARE
 */
const ModuloSoftware = {
    rolesDisponibles: ["Administrador", "Director", "Docente", "Administrativo", "Representante", "Estudiante"],

    renderUsuarios: function() {
        App.renderView("sw-usuarios", "Gestión de Usuarios");
        const div = document.getElementById('dynamic-view');

        div.innerHTML = `
            <div class="card border-0 shadow-sm p-4 animate__animated animate__fadeIn" style="border-radius:20px;">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h6 class="mb-0 fw-medium">Usuarios Registrados en el Sistema</h6>
                    <button class="btn btn-primary rounded-pill btn-sm px-3" onclick="ModuloSoftware.modalNuevoUsuario()">
                        <i class="bi bi-plus-lg me-1"></i> Agregar Usuario
                    </button>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover small align-middle">
                        <thead class="table-light">
                            <tr>
                                <th>CÉDULA</th>
                                <th>NOMBRE Y APELLIDO</th>
                                <th>ROL</th>
                                <th>ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody id="lista-usuarios-tabla">
                            <tr><td colspan="4" class="text-center">Consultando base de datos...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        this.cargarUsuarios();
    },

    cargarUsuarios: function() {
        App.sendRequest({ action: "get_users" }, (res) => {
            const tbody = document.getElementById('lista-usuarios-tabla');
            if(res.status === "success") {
                tbody.innerHTML = res.users.map(u => `
                    <tr>
                        <td class="fw-medium">${u.cedula}</td>
                        <td>${u.nombre}</td>
                        <td><span class="badge bg-light text-dark border fw-normal">${u.rol}</span></td>
                        <td>
                            <button class="btn btn-sm btn-light rounded-circle" onclick="ModuloSoftware.editarRol('${u.cedula}')"><i class="bi bi-shield-lock"></i></button>
                            <button class="btn btn-sm btn-light rounded-circle text-danger" onclick="ModuloSoftware.eliminarUsuario('${u.cedula}')"><i class="bi bi-trash"></i></button>
                        </td>
                    </tr>
                `).join('');
            }
        });
    },

    modalNuevoUsuario: async function() {
        const { value: formValues } = await Swal.fire({
            title: 'Registrar Nuevo Usuario',
            html:
                `<input id="swal-cedula" class="swal2-input" placeholder="Cédula">` +
                `<input id="swal-nombre" class="swal2-input" placeholder="Nombre Completo">` +
                `<select id="swal-rol" class="swal2-input">
                    ${this.rolesDisponibles.map(r => `<option value="${r}">${r}</option>`).join('')}
                </select>`,
            focusConfirm: false,
            confirmButtonText: 'Guardar Usuario',
            preConfirm: () => {
                return {
                    cedula: document.getElementById('swal-cedula').value,
                    nombre: document.getElementById('swal-nombre').value,
                    rol: document.getElementById('swal-rol').value
                }
            }
        });

        if (formValues) {
            App.sendRequest({ action: "save_user", data: formValues }, (res) => {
                Swal.fire('Guardado', 'El usuario ha sido habilitado', 'success');
                this.renderUsuarios();
            });
        }
    }
};