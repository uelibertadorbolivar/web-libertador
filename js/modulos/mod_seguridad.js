/**
 * MÓDULO: SEGURIDAD Y USUARIOS
 * Gestiona Usuarios, Mi Perfil, Roles y Privilegios.
 */

const ModSeguridad = {
    datosUsuarios: [],
    rolesSistema: [], 
    rolSeleccionado: null,

    // ==========================================
    // 1. GESTIÓN DE USUARIOS Y CARGA MASIVA
    // ==========================================
    cargarUsuarios: function() {
        // --- PREVENCIÓN DE CONGELAMIENTO (Limpieza de modales) ---
        const modalEnBody = document.querySelector('body > #modal-nuevo-usuario');
        const modalEnDinamica = document.querySelector('#area-dinamica #modal-nuevo-usuario');
        // Si el enrutador acaba de inyectar un modal nuevo, borramos el viejo del body
        if (modalEnBody && modalEnDinamica) modalEnBody.remove(); 
        
        document.body.classList.remove('modal-open');
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        // ---------------------------------------------------------

        Aplicacion.mostrarCarga();
        Promise.all([
            fetch(Configuracion.obtenerApiUrl(), { method: 'POST', body: JSON.stringify({ action: "get_roles" }) }).then(r => r.json()),
            fetch(Configuracion.obtenerApiUrl(), { method: 'POST', body: JSON.stringify({ action: "get_users" }) }).then(r => r.json())
        ]).then(([resRoles, resUsers]) => {
            Aplicacion.ocultarCarga();
            if(resRoles.status === "success") {
                this.rolesSistema = resRoles.roles;
                let opcionesRol = '<option value="Todos">Todos los Roles</option>';
                let opcionesModal = '<option value="" disabled selected>-- Seleccione un Rol --</option>';
                this.rolesSistema.forEach(r => {
                    opcionesRol += `<option value="${r.nombre}">${r.nombre}</option>`;
                    opcionesModal += `<option value="${r.nombre}">${r.nombre}</option>`;
                });
                const filtro = document.getElementById('filtro-rol-usuarios');
                const modalSelect = document.getElementById('nuevo-usr-rol');
                if(filtro) filtro.innerHTML = opcionesRol;
                if(modalSelect) modalSelect.innerHTML = opcionesModal;
            }
            this.datosUsuarios = resUsers.users || [];
            this.dibujarUsuarios(this.datosUsuarios);
        }).catch(err => {
            Aplicacion.ocultarCarga();
            Swal.fire('Error', 'Fallo de conexión al cargar datos del servidor.', 'error');
        });
    },

    dibujarUsuarios: function(lista) {
        const tbody = document.getElementById('tabla-usuarios');
        if (!tbody) return;
        if (lista.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-5 text-muted">No se encontraron usuarios.</td></tr>';
            return;
        }
        tbody.innerHTML = lista.map(u => {
            let colorEstado = 'bg-success';
            if (u.estado === 'Inactivo') colorEstado = 'bg-secondary';
            if (u.estado === 'Bloqueado') colorEstado = 'bg-danger';

            return `
            <tr class="animate__animated animate__fadeIn">
                <td class="px-4 py-3">
                    <div class="d-flex align-items-center">
                        <div class="bg-primary bg-opacity-10 text-primary rounded-circle d-flex justify-content-center align-items-center me-3 fw-bold" style="width: 40px; height: 40px;">
                            ${u.nombre_completo ? u.nombre_completo.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div class="fw-bold text-dark">${u.nombre_completo || 'Sin nombre'}</div>
                    </div>
                </td>
                <td class="py-3 text-muted">${u.cedula}</td>
                <td class="py-3"><span class="badge border bg-light text-dark fw-bold shadow-sm px-3 py-2"><i class="bi bi-shield-check text-primary me-1"></i> ${u.rol}</span></td>
                <td class="py-3"><span class="badge ${colorEstado} px-3 py-2 rounded-pill">${u.estado}</span></td>
                <td class="px-4 py-3 text-end celda-acciones">
                    <button onclick="ModSeguridad.resetearClaveUsuario('${u.cedula}')" class="btn btn-sm btn-light border text-warning rounded-circle me-1 shadow-sm" title="Resetear Clave"><i class="bi bi-key-fill"></i></button>
                </td>
            </tr>`;
        }).join('');
    },

    filtrarUsuarios: function() {
        const busqueda = document.getElementById('buscador-usuarios').value.toLowerCase();
        const rolFiltro = document.getElementById('filtro-rol-usuarios').value;
        const filtrados = this.datosUsuarios.filter(u => {
            const coincideTexto = (u.nombre_completo && u.nombre_completo.toLowerCase().includes(busqueda)) || String(u.cedula).includes(busqueda);
            const coincideRol = (rolFiltro === 'Todos') || (u.rol === rolFiltro);
            return coincideTexto && coincideRol;
        });
        this.dibujarUsuarios(filtrados);
    },

    abrirModalUsuario: function() {
        document.getElementById('nuevo-usr-cedula').value = '';
        document.getElementById('nuevo-usr-nombre').value = '';
        document.getElementById('nuevo-usr-rol').value = '';
        
        let modalEl = document.getElementById('modal-nuevo-usuario');
        
        // --- MAGIA CONTRA LA PANTALLA OPACA ---
        // Sacamos el modal de la zona animada y lo enviamos al frente de la app
        if (modalEl && modalEl.parentNode !== document.body) {
            document.body.appendChild(modalEl);
        }

        const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modal.show();
    },

    guardarNuevoUsuario: function() {
        const ced = document.getElementById('nuevo-usr-cedula').value;
        const nom = document.getElementById('nuevo-usr-nombre').value;
        const rol = document.getElementById('nuevo-usr-rol').value;
        
        if(!ced || !nom || !rol) return Swal.fire('Atención', 'Debe llenar todos los campos.', 'warning');
        
        const usuarioActual = JSON.parse(localStorage.getItem('sigae_usuario'));
        Aplicacion.mostrarCarga();
        
        Aplicacion.peticion({ action: "save_user", cedula_nueva: ced, nombre: nom, rol: rol, cedula_admin: usuarioActual.cedula }, (res) => {
            Aplicacion.ocultarCarga();
            
            // FIX: CERRAR Y DESTRUIR MODAL CORRECTAMENTE
            const modalEl = document.getElementById('modal-nuevo-usuario');
            if(modalEl) {
                const modalInstance = bootstrap.Modal.getInstance(modalEl);
                if(modalInstance) modalInstance.hide();
            }
            
            setTimeout(() => {
                document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
            }, 300);

            if(res.status === "success") {
                Swal.fire('¡Usuario Creado!', res.message, 'success');
                this.cargarUsuarios(); 
            } else {
                Swal.fire('Error', res.message, 'error');
            }
        });
    },

    resetearClaveUsuario: function(cedulaTarget) {
        Swal.fire({
            title: '¿Resetear contraseña?',
            text: `Se borrará la contraseña del usuario ${cedulaTarget} y se le pedirá crear una nueva en su próximo ingreso.`,
            icon: 'warning', showCancelButton: true, confirmButtonColor: '#FF8D00', confirmButtonText: 'Sí, resetear'
        }).then((result) => {
            if (result.isConfirmed) {
                Aplicacion.mostrarCarga();
                Aplicacion.peticion({ action: "reset_password", cedula_reset: cedulaTarget }, (res) => {
                    Aplicacion.ocultarCarga();
                    if(res.status === "success") Swal.fire('¡Reseteada!', res.message, 'success');
                    else Swal.fire('Error', res.message, 'error');
                });
            }
        });
    },

    descargarPlantilla: function() {
        const contenido = "\uFEFFCédula,Nombre Completo,Rol\n12345678,Juan Perez,Docente\n87654321,Maria Gomez,Directivo";
        const blob = new Blob([contenido], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "Plantilla_Usuarios_SIGAE.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    procesarExcel: function(event) {
        const archivo = event.target.files[0];
        if (!archivo) return;
        Aplicacion.mostrarCarga();

        if (typeof XLSX === 'undefined') {
            const script = document.createElement('script');
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
            script.onload = () => this.leerArchivoExcel(archivo);
            document.head.appendChild(script);
        } else {
            this.leerArchivoExcel(archivo);
        }
        
        event.target.value = ''; 
    },

    leerArchivoExcel: function(archivo) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, {type: 'array'});
                const primeraHoja = workbook.Sheets[workbook.SheetNames[0]];
                
                const jsonDatos = XLSX.utils.sheet_to_json(primeraHoja, {header: 1});
                
                let usuariosNuevos = [];
                for (let i = 1; i < jsonDatos.length; i++) {
                    let fila = jsonDatos[i];
                    if (fila.length >= 3 && fila[0] && fila[1] && fila[2]) {
                        usuariosNuevos.push({
                            cedula: String(fila[0]).trim(),
                            nombre: String(fila[1]).trim(),
                            rol: String(fila[2]).trim()
                        });
                    }
                }

                if (usuariosNuevos.length === 0) {
                    Aplicacion.ocultarCarga();
                    return Swal.fire('Archivo Inválido', 'El archivo está vacío o no tiene el formato correcto.', 'error');
                }

                const usuarioActual = JSON.parse(localStorage.getItem('sigae_usuario'));
                Aplicacion.peticion({ action: "save_users_bulk", usuarios: usuariosNuevos, cedula_admin: usuarioActual.cedula }, (res) => {
                    Aplicacion.ocultarCarga();
                    if(res.status === "success") {
                        Swal.fire('¡Carga Exitosa!', res.message, 'success');
                        this.cargarUsuarios();
                    } else {
                        Swal.fire('Atención', res.message, 'warning');
                    }
                });
            } catch (err) {
                Aplicacion.ocultarCarga();
                Swal.fire('Error de Lectura', 'No se pudo leer el archivo Excel. Asegúrate de usar la plantilla descargada.', 'error');
            }
        };
        reader.readAsArrayBuffer(archivo);
    },

    // ==========================================
    // 2. MI PERFIL
    // ==========================================
    cargarMiPerfil: function() {
        const usuarioActual = JSON.parse(localStorage.getItem('sigae_usuario'));
        if(!usuarioActual) return;
        Aplicacion.mostrarCarga();
        Aplicacion.peticion({ action: "get_my_profile", cedula: usuarioActual.cedula }, (res) => {
            Aplicacion.ocultarCarga();
            if(res.status === "success") {
                const p = res.perfil;
                document.getElementById('perfil-avatar').innerText = p.nombre ? p.nombre.charAt(0).toUpperCase() : '?';
                document.getElementById('perfil-cedula').innerText = usuarioActual.cedula;
                document.getElementById('perfil-rol').innerHTML = `<i class="bi bi-shield-check text-primary"></i> ${p.rol}`;
                document.getElementById('perfil-estado').innerText = p.estado;
                document.getElementById('perfil-nombre-input').value = p.nombre || "";
                document.getElementById('perfil-email').value = p.email || "";
                document.getElementById('perfil-telefono').value = p.telefono || "";

                let opciones = '<option value="" disabled selected>-- Elige una pregunta --</option>';
                if(res.preguntas) res.preguntas.forEach(pr => { opciones += `<option value="${pr}">${pr}</option>`; });
                document.getElementById('perfil-preg1').innerHTML = opciones; document.getElementById('perfil-preg2').innerHTML = opciones;
                if(p.preg_1) document.getElementById('perfil-preg1').value = p.preg_1;
                if(p.preg_2) document.getElementById('perfil-preg2').value = p.preg_2;
            } else Swal.fire('Error', res.message, 'error');
        });
    },

    guardarMiPerfil: function() {
        const usuarioActual = JSON.parse(localStorage.getItem('sigae_usuario'));
        const payload = { action: "update_my_profile", cedula: usuarioActual.cedula, nombre: document.getElementById('perfil-nombre-input').value, email: document.getElementById('perfil-email').value, telefono: document.getElementById('perfil-telefono').value, cambiar_clave: false, cambiar_preguntas: false };
        if(!payload.nombre) return Swal.fire('Atención', 'El nombre no puede estar vacío.', 'warning');

        const claveActual = document.getElementById('perfil-clave-actual').value, claveNueva = document.getElementById('perfil-clave-nueva').value, claveConfirma = document.getElementById('perfil-clave-confirmar').value;
        if(claveNueva || claveActual) {
            if(!claveActual) return Swal.fire('Atención', 'Ingresa tu contraseña actual.', 'warning');
            if(claveNueva !== claveConfirma) return Swal.fire('Error', 'Las contraseñas nuevas no coinciden.', 'error');
            if(!/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#.])[A-Za-z\d@$!%*?&#.]{8,}$/.test(claveNueva)) return Swal.fire('Contraseña Débil', 'Mínimo 8 caracteres, 1 mayúscula, 1 número y 1 símbolo.', 'error');
            payload.cambiar_clave = true; payload.clave_actual = claveActual; payload.nueva_clave = claveNueva;
        }

        const p1 = document.getElementById('perfil-preg1').value, r1 = document.getElementById('perfil-resp1').value, p2 = document.getElementById('perfil-preg2').value, r2 = document.getElementById('perfil-resp2').value;
        if (r1 || r2) {
            if(!p1 || !r1 || !p2 || !r2) return Swal.fire('Atención', 'Llena ambas preguntas y respuestas.', 'warning');
            payload.cambiar_preguntas = true; payload.preg_1 = p1; payload.resp_1 = r1; payload.preg_2 = p2; payload.resp_2 = r2;
        }

        Aplicacion.mostrarCarga();
        Aplicacion.peticion(payload, (res) => {
            Aplicacion.ocultarCarga();
            if(res.status === "success") {
                if(res.nuevo_nombre) {
                    usuarioActual.nombre = res.nuevo_nombre; localStorage.setItem('sigae_usuario', JSON.stringify(usuarioActual));
                    document.getElementById('nombre-usuario-nav').innerText = res.nuevo_nombre; document.getElementById('perfil-avatar').innerText = res.nuevo_nombre.charAt(0).toUpperCase();
                }
                document.getElementById('perfil-clave-actual').value = ''; document.getElementById('perfil-clave-nueva').value = ''; document.getElementById('perfil-clave-confirmar').value = ''; document.getElementById('perfil-resp1').value = ''; document.getElementById('perfil-resp2').value = '';
                Swal.fire('¡Éxito!', res.message, 'success');
            } else Swal.fire('Error', res.message, 'error');
        });
    },

    // ==========================================
    // 3. ROLES Y PRIVILEGIOS
    // ==========================================
    cargarRoles: function() {
        const listaHTML = document.getElementById('lista-roles-sistema');
        if(!listaHTML) return;

        Aplicacion.mostrarCarga();
        Aplicacion.peticion({ action: "get_roles" }, (res) => {
            Aplicacion.ocultarCarga();
            if(res.status === "success") {
                this.rolesSistema = res.roles; 
                listaHTML.innerHTML = this.rolesSistema.map(rolObj => `
                    <button onclick="ModSeguridad.editarRol('${rolObj.nombre}')" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3 hover-efecto">
                        <div><i class="bi bi-person-badge text-primary me-2"></i><span class="fw-bold text-dark">${rolObj.nombre}</span></div>
                        <i class="bi bi-chevron-right text-muted small"></i>
                    </button>
                `).join('');
            } else Swal.fire('Error', 'No se pudieron cargar los roles de la base de datos.', 'error');
        });
    },

    editarRol: function(nombreRol) {
        this.rolSeleccionado = nombreRol;
        document.getElementById('panel-vacio-roles').style.display = 'none';
        document.getElementById('panel-edicion-roles').style.display = 'block';
        document.getElementById('titulo-rol-editar').innerText = nombreRol;

        const esAdmin = (nombreRol === 'Administrador' || nombreRol === 'Directivo');
        document.getElementById('btn-eliminar-rol').style.display = esAdmin ? 'none' : 'inline-block';
        document.getElementById('btn-seleccionar-todo').style.display = esAdmin ? 'none' : 'inline-block';
        document.getElementById('btn-seleccionar-todo').innerHTML = '<i class="bi bi-check-all"></i> Marcar Todo';

        const rolActualObj = this.rolesSistema.find(r => r.nombre === nombreRol);
        const permisosGuardados = rolActualObj ? rolActualObj.permisos : [];

        let htmlMatriz = '';
        for (const [cat, datos] of Object.entries(Aplicacion.ModulosSistema)) {
            const catId = cat.replace(/[\s/()]/g, ''); 
            
            htmlMatriz += `
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-end mt-3 border-bottom pb-2">
                    <h6 class="fw-bold text-primary mb-0"><i class="bi ${datos.icono} me-2"></i>${cat}</h6>
                    ${!esAdmin ? `<button class="btn btn-sm btn-light border py-0 px-2 text-muted shadow-sm" style="font-size: 0.75rem;" onclick="ModSeguridad.seleccionarCategoria('${catId}', this)">Marcar Todo</button>` : ''}
                </div>
                <div class="row g-2 mt-2 categoria-group-${catId}">`;
            
            datos.items.forEach(item => {
                const tienePermiso = esAdmin || permisosGuardados.includes(item.vista);
                const isBlocked = esAdmin ? "disabled" : ""; 
                
                htmlMatriz += `
                <div class="col-md-6 col-lg-4">
                    <div class="form-check form-switch bg-light p-3 rounded-3 border">
                        <input class="form-check-input switch-permiso ms-0 me-3" type="checkbox" value="${item.vista}" id="switch-${item.vista.replace(/[\s/()]/g, '')}" ${tienePermiso ? 'checked' : ''} ${isBlocked}>
                        <label class="form-check-label text-dark fw-bold small" for="switch-${item.vista.replace(/[\s/()]/g, '')}">${item.vista}</label>
                    </div>
                </div>`;
            });
            htmlMatriz += `</div></div>`;
        }
        document.getElementById('matriz-permisos').innerHTML = htmlMatriz;
    },

    seleccionarTodo: function(btn) {
        const checkboxes = document.querySelectorAll('.switch-permiso:not(:disabled)');
        const marcados = document.querySelectorAll('.switch-permiso:not(:disabled):checked');
        const todosMarcados = checkboxes.length === marcados.length && checkboxes.length > 0;
        
        checkboxes.forEach(chk => chk.checked = !todosMarcados);
        
        if (!todosMarcados) {
            btn.innerHTML = '<i class="bi bi-x"></i> Desmarcar Todo';
            btn.classList.replace('btn-outline-primary', 'btn-outline-secondary');
        } else {
            btn.innerHTML = '<i class="bi bi-check-all"></i> Marcar Todo';
            btn.classList.replace('btn-outline-secondary', 'btn-outline-primary');
        }
    },

    seleccionarCategoria: function(catId, btn) {
        const checkboxes = document.querySelectorAll(`.categoria-group-${catId} .switch-permiso:not(:disabled)`);
        const marcados = document.querySelectorAll(`.categoria-group-${catId} .switch-permiso:not(:disabled):checked`);
        const todosMarcados = checkboxes.length === marcados.length && checkboxes.length > 0;

        checkboxes.forEach(chk => chk.checked = !todosMarcados);
        btn.innerText = todosMarcados ? "Marcar Todo" : "Desmarcar Todo";
        if(!todosMarcados) { btn.classList.add('bg-secondary', 'text-white'); btn.classList.remove('text-muted'); }
        else { btn.classList.remove('bg-secondary', 'text-white'); btn.classList.add('text-muted'); }
    },

    cancelarEdicionRol: function() {
        document.getElementById('panel-edicion-roles').style.display = 'none';
        document.getElementById('panel-vacio-roles').style.display = 'block';
        this.rolSeleccionado = null;
    },

    guardarPrivilegiosRol: function() {
        const checkboxes = document.querySelectorAll('.switch-permiso');
        let permisosSeleccionados = [];
        checkboxes.forEach(chk => { if(chk.checked) permisosSeleccionados.push(chk.value); });

        const usuarioActual = JSON.parse(localStorage.getItem('sigae_usuario'));
        Aplicacion.mostrarCarga();
        Aplicacion.peticion({ action: "save_role", nombre_rol: this.rolSeleccionado, permisos: permisosSeleccionados, cedula_admin: usuarioActual.cedula }, (res) => {
            Aplicacion.ocultarCarga();
            if(res.status === "success") {
                Swal.fire('¡Guardado!', 'Los privilegios han sido registrados en la Base de Datos.', 'success');
                this.cargarRoles(); 
                this.cancelarEdicionRol();
            } else Swal.fire('Error', res.message, 'error');
        });
    },

    modalNuevoRol: function() {
        Swal.fire({
            title: 'Crear Nuevo Rol', input: 'text', inputLabel: 'Nombre del perfil (Ej: Psicólogo, Biblioteca)', inputPlaceholder: 'Escribe el nombre...',
            showCancelButton: true, confirmButtonText: 'Crear y Guardar', cancelButtonText: 'Cancelar', confirmButtonColor: '#0066FF'
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                const nuevoRol = result.value.trim();
                const existe = this.rolesSistema.find(r => r.nombre.toLowerCase() === nuevoRol.toLowerCase());
                if(existe) return Swal.fire('Error', 'Este rol ya existe en el sistema.', 'error');
                
                Aplicacion.mostrarCarga();
                Aplicacion.peticion({ action: "save_role", nombre_rol: nuevoRol, permisos: [] }, (res) => {
                    Aplicacion.ocultarCarga();
                    if(res.status === "success") {
                        this.cargarRoles();
                        Swal.fire('¡Creado!', `El rol "${nuevoRol}" se guardó en la BD. Selecciónalo para darle permisos.`, 'success');
                    } else Swal.fire('Error', res.message, 'error');
                });
            }
        });
    },

    eliminarRol: function() {
        Swal.fire({
            title: '¿Eliminar este Rol?', html: `Se borrará <b>${this.rolSeleccionado}</b> de la Base de Datos.<br>Cualquier usuario con este rol perderá sus accesos.`,
            icon: 'warning', showCancelButton: true, confirmButtonColor: '#FF3D00', confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                const usuarioActual = JSON.parse(localStorage.getItem('sigae_usuario'));
                Aplicacion.mostrarCarga();
                Aplicacion.peticion({ action: "delete_role", nombre_rol: this.rolSeleccionado, cedula_admin: usuarioActual.cedula }, (res) => {
                    Aplicacion.ocultarCarga();
                    if(res.status === "success") {
                        this.cargarRoles(); this.cancelarEdicionRol();
                        Swal.fire('Eliminado', 'El rol ha sido borrado exitosamente.', 'success');
                    } else Swal.fire('Error', res.message, 'error');
                });
            }
        });
    }
};

// ==========================================
// INICIALIZADORES (Conectan con Enrutador)
// ==========================================
window.init_Gestión_de_Usuarios = function() { ModSeguridad.cargarUsuarios(); };
window.init_Mi_Perfil = function() { ModSeguridad.cargarMiPerfil(); };
window.init_Roles_y_Privilegios = function() { ModSeguridad.cargarRoles(); };