/**
 * MÓDULO: SEGURIDAD Y USUARIOS
 */

const ModSeguridad = {
    datosUsuarios: [], 
    usuariosFiltrados: [], 
    rolesSistema: [], 
    rolSeleccionado: null, 
    cedulaOriginalEdicion: null,
    paginaActual: 1, 
    itemsPorPagina: 10,

    // ==========================================
    // SISTEMA BLINDADO ANTI-CONGELAMIENTO (MODALES)
    // ==========================================
    abrirModalSeguro: function(idModal) {
        let modalEl = document.getElementById(idModal); 
        if(!modalEl) return;
        
        // Mover a la raíz del Body para que nada interfiera
        if (modalEl.parentNode !== document.body) {
            document.body.appendChild(modalEl);
        }
        
        // Destruir basura en memoria y quitar fondos estancados
        let inst = bootstrap.Modal.getInstance(modalEl); 
        if(inst) {
            inst.dispose();
        }
        
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove()); 
        document.body.classList.remove('modal-open'); 
        document.body.style.overflow = '';
        
        // Abrir limpio
        let nuevoModal = new bootstrap.Modal(modalEl, { backdrop: 'static', keyboard: false }); 
        nuevoModal.show();
    },

    cerrarModalSeguro: function(idModal) {
        let modalEl = document.getElementById(idModal);
        if(modalEl) { 
            let inst = bootstrap.Modal.getInstance(modalEl); 
            if(inst) {
                inst.hide(); 
            }
        }
        
        // Limpiador automático por si Bootstrap falla
        setTimeout(() => {
            document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }, 300);
    },

    limpiarFondosModales: function() {
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    },

    // ==========================================
    // CARGA, PAGINACIÓN Y CHECKBOXES
    // ==========================================
    cargarUsuarios: function() {
        // Limpiar cualquier basura residual al cambiar de pestaña
        this.limpiarFondosModales();

        Aplicacion.mostrarCarga();
        
        Promise.all([ 
            fetch(Configuracion.obtenerApiUrl(), { method: 'POST', body: JSON.stringify({ action: "get_roles" }) }).then(r => r.json()), 
            fetch(Configuracion.obtenerApiUrl(), { method: 'POST', body: JSON.stringify({ action: "get_users" }) }).then(r => r.json()), 
            fetch(Configuracion.obtenerApiUrl(), { method: 'POST', body: JSON.stringify({ action: "get_security_questions" }) }).then(r => r.json()) 
        ])
        .then(([resRoles, resUsers, resPregs]) => {
            Aplicacion.ocultarCarga();
            
            if(resRoles.status === "success") {
                this.rolesSistema = resRoles.roles; 
                let opcionesRoles = '<option value="" disabled selected>-- Seleccione un Rol --</option>';
                
                this.rolesSistema.forEach(r => { 
                    opcionesRoles += `<option value="${r.nombre}">${r.nombre}</option>`; 
                });
                
                const filtro = document.getElementById('filtro-rol-usuarios');
                const modalSelectNvo = document.getElementById('nuevo-usr-rol');
                const modalSelectEd = document.getElementById('edit-usr-rol');
                
                if(filtro) filtro.innerHTML = '<option value="Todos">Todos los Roles</option>' + opcionesRoles.replace('<option value="" disabled selected>-- Seleccione un Rol --</option>', '');
                if(modalSelectNvo) modalSelectNvo.innerHTML = opcionesRoles; 
                if(modalSelectEd) modalSelectEd.innerHTML = opcionesRoles.replace('<option value="" disabled selected>-- Seleccione un Rol --</option>', '');
            }
            
            if(resPregs.status === "success" && resPregs.preguntas) {
                let opcionesPreguntas = '<option value="" disabled selected>-- Seleccione una pregunta --</option>'; 
                
                resPregs.preguntas.forEach(p => {
                    opcionesPreguntas += `<option value="${p}">${p}</option>`;
                });
                
                const selectP1 = document.getElementById('edit-usr-preg1');
                const selectP2 = document.getElementById('edit-usr-preg2');
                
                if(selectP1) selectP1.innerHTML = opcionesPreguntas; 
                if(selectP2) selectP2.innerHTML = opcionesPreguntas;
            }
            
            this.datosUsuarios = resUsers.users || []; 
            this.usuariosFiltrados = this.datosUsuarios; 
            this.paginaActual = 1; 
            this.dibujarUsuarios();
            
        }).catch(err => { 
            Aplicacion.ocultarCarga(); 
            Swal.fire('Error', 'Fallo de conexión al cargar datos del servidor.', 'error'); 
        });
    },

    dibujarUsuarios: function() {
        const tbody = document.getElementById('tabla-usuarios'); 
        if (!tbody) return;
        
        const totalRegistros = this.usuariosFiltrados.length;
        
        if (totalRegistros === 0) { 
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-5 text-muted">No se encontraron usuarios.</td></tr>'; 
            document.getElementById('info-paginacion').innerText = "Mostrando 0 de 0"; 
            return; 
        }
        
        const inicio = (this.paginaActual - 1) * this.itemsPorPagina; 
        const fin = Math.min(inicio + this.itemsPorPagina, totalRegistros);
        const usuariosPaginados = this.usuariosFiltrados.slice(inicio, fin);

        let htmlTabla = '';

        usuariosPaginados.forEach(u => {
            let colorEstado = 'bg-success';
            if (u.estado === 'Inactivo') colorEstado = 'bg-secondary';
            if (u.estado === 'Bloqueado') colorEstado = 'bg-danger';

            let inicialNombre = u.nombre_completo ? u.nombre_completo.charAt(0).toUpperCase() : '?';
            let nombreMostrar = u.nombre_completo || 'Sin nombre';

            htmlTabla += `
            <tr class="animate__animated animate__fadeIn">
                <td class="px-4 py-3">
                    <input class="form-check-input chk-usuario border-secondary" type="checkbox" value="${u.cedula}" onchange="ModSeguridad.verificarSeleccion()">
                </td>
                <td class="py-3">
                    <div class="d-flex align-items-center">
                        <div class="bg-primary bg-opacity-10 text-primary rounded-circle d-flex justify-content-center align-items-center me-3 fw-bold" style="width: 40px; height: 40px;">
                            ${inicialNombre}
                        </div>
                        <div class="fw-bold text-dark">${nombreMostrar}</div>
                    </div>
                </td>
                <td class="py-3 text-muted">${u.cedula}</td>
                <td class="py-3">
                    <span class="badge border bg-light text-dark fw-bold shadow-sm px-3 py-2"><i class="bi bi-shield-check text-primary me-1"></i> ${u.rol}</span>
                </td>
                <td class="py-3">
                    <span class="badge ${colorEstado} px-3 py-2 rounded-pill">${u.estado}</span>
                </td>
                <td class="px-4 py-3 text-end" style="min-width: 140px;">
                    <button onclick="ModSeguridad.abrirModalEditarUsuario('${u.cedula}')" class="btn btn-sm btn-light border text-primary rounded-circle me-1 shadow-sm" title="Editar Perfil Completo"><i class="bi bi-pencil-fill"></i></button>
                    <button onclick="ModSeguridad.resetearClaveUsuario('${u.cedula}')" class="btn btn-sm btn-light border text-warning rounded-circle shadow-sm me-1" title="Reset a Fábrica"><i class="bi bi-arrow-counterclockwise"></i></button>
                </td>
            </tr>`;
        });
        
        tbody.innerHTML = htmlTabla;
        
        let elInfo = document.getElementById('info-paginacion');
        if(elInfo) {
            elInfo.innerText = `Mostrando ${inicio + 1} a ${fin} de ${totalRegistros}`;
        }
        
        const chkTodos = document.getElementById('chk-todos-usuarios'); 
        if(chkTodos) {
            chkTodos.checked = false; 
        }
        
        this.verificarSeleccion();
    },

    cambiarPagina: function(delta) { 
        const totalPaginas = Math.ceil(this.usuariosFiltrados.length / this.itemsPorPagina); 
        const nuevaPagina = this.paginaActual + delta; 
        
        if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) { 
            this.paginaActual = nuevaPagina; 
            this.dibujarUsuarios(); 
        } 
    },

    filtrarUsuarios: function() { 
        const busqueda = document.getElementById('buscador-usuarios').value.toLowerCase(); 
        const rolFiltro = document.getElementById('filtro-rol-usuarios').value; 
        
        this.usuariosFiltrados = this.datosUsuarios.filter(u => { 
            let coincideTexto = false;
            if ((u.nombre_completo && u.nombre_completo.toLowerCase().includes(busqueda)) || String(u.cedula).includes(busqueda)) {
                coincideTexto = true;
            }
            
            let coincideRol = false;
            if (rolFiltro === 'Todos' || u.rol === rolFiltro) {
                coincideRol = true;
            }
            
            return coincideTexto && coincideRol; 
        }); 
        
        this.paginaActual = 1; 
        this.dibujarUsuarios(); 
    },
    
    toggleTodosUsuarios: function(checkboxTodos) { 
        const checkboxes = document.querySelectorAll('.chk-usuario');
        checkboxes.forEach(c => {
            c.checked = checkboxTodos.checked;
        }); 
        this.verificarSeleccion(); 
    },

    verificarSeleccion: function() { 
        const cantidadSeleccionados = document.querySelectorAll('.chk-usuario:checked').length; 
        const btnEliminar = document.getElementById('btn-eliminar-masivo'); 
        
        if(btnEliminar) { 
            if(cantidadSeleccionados > 0) {
                btnEliminar.style.display = 'inline-flex';
            } else {
                btnEliminar.style.display = 'none';
            }
        } 
    },

    // ==========================================
    // CREAR, EDITAR Y ELIMINAR MASIVAMENTE
    // ==========================================
    abrirModalUsuario: function() { 
        document.getElementById('nuevo-usr-cedula').value = ''; 
        document.getElementById('nuevo-usr-nombre').value = ''; 
        document.getElementById('nuevo-usr-rol').value = ''; 
        this.abrirModalSeguro('modal-nuevo-usuario'); 
    },
    
    guardarNuevoUsuario: function() {
        const cedula = document.getElementById('nuevo-usr-cedula').value;
        const nombre = document.getElementById('nuevo-usr-nombre').value;
        const rol = document.getElementById('nuevo-usr-rol').value; 
        
        if(!cedula || !nombre || !rol) {
            return Swal.fire('Atención', 'Por favor llene todos los campos.', 'warning');
        }
        
        const usuarioActual = JSON.parse(localStorage.getItem('sigae_usuario'));
        Aplicacion.mostrarCarga(); 
        
        const peticionDatos = { 
            action: "save_user", 
            cedula_nueva: cedula, 
            nombre: nombre, 
            rol: rol, 
            cedula_admin: usuarioActual.cedula 
        };

        Aplicacion.peticion(peticionDatos, (res) => { 
            Aplicacion.ocultarCarga(); 
            this.cerrarModalSeguro('modal-nuevo-usuario'); 
            
            if(res.status === "success") { 
                Swal.fire('¡Usuario Creado!', res.message, 'success'); 
                this.cargarUsuarios(); 
            } else {
                Swal.fire('Error', res.message, 'error'); 
            }
        });
    },

    abrirModalEditarUsuario: function(cedulaEdicion) {
        const usuario = this.datosUsuarios.find(x => String(x.cedula) === String(cedulaEdicion)); 
        if(!usuario) return; 
        
        this.cedulaOriginalEdicion = usuario.cedula;
        
        document.getElementById('edit-usr-cedula').value = usuario.cedula; 
        document.getElementById('edit-usr-nombre').value = usuario.nombre_completo; 
        document.getElementById('edit-usr-email').value = usuario.email || ''; 
        document.getElementById('edit-usr-telefono').value = usuario.telefono || ''; 
        document.getElementById('edit-usr-rol').value = usuario.rol; 
        document.getElementById('edit-usr-estado').value = usuario.estado; 
        
        let elP1 = document.getElementById('edit-usr-preg1'); 
        if(elP1) elP1.value = usuario.pregunta_1 || ''; 
        
        let elR1 = document.getElementById('edit-usr-resp1'); 
        if(elR1) elR1.value = usuario.respuesta_1 || ''; 
        
        let elP2 = document.getElementById('edit-usr-preg2'); 
        if(elP2) elP2.value = usuario.pregunta_2 || ''; 
        
        let elR2 = document.getElementById('edit-usr-resp2'); 
        if(elR2) elR2.value = usuario.respuesta_2 || '';
        
        this.abrirModalSeguro('modal-editar-usuario');
    },

    guardarEdicionUsuario: function() {
        const p1 = document.getElementById('edit-usr-preg1') ? document.getElementById('edit-usr-preg1').value : "";
        const r1 = document.getElementById('edit-usr-resp1') ? document.getElementById('edit-usr-resp1').value : "";
        const p2 = document.getElementById('edit-usr-preg2') ? document.getElementById('edit-usr-preg2').value : "";
        const r2 = document.getElementById('edit-usr-resp2') ? document.getElementById('edit-usr-resp2').value : "";

        const usuarioActual = JSON.parse(localStorage.getItem('sigae_usuario'));

        const payload = { 
            action: "edit_user", 
            cedula_original: this.cedulaOriginalEdicion, 
            nueva_cedula: document.getElementById('edit-usr-cedula').value, 
            nombre: document.getElementById('edit-usr-nombre').value, 
            email: document.getElementById('edit-usr-email').value, 
            telefono: document.getElementById('edit-usr-telefono').value, 
            rol: document.getElementById('edit-usr-rol').value, 
            estado: document.getElementById('edit-usr-estado').value, 
            preg_1: p1, 
            resp_1: r1, 
            preg_2: p2, 
            resp_2: r2, 
            cedula_admin: usuarioActual.cedula 
        };
        
        if(!payload.nombre || !payload.nueva_cedula) {
            return Swal.fire('Atención', 'El Nombre y la Cédula son obligatorios.', 'warning');
        }

        Aplicacion.mostrarCarga(); 
        
        Aplicacion.peticion(payload, (res) => { 
            Aplicacion.ocultarCarga(); 
            this.cerrarModalSeguro('modal-editar-usuario'); 
            
            if(res.status === "success") { 
                Swal.fire('¡Actualizado!', res.message, 'success'); 
                this.cargarUsuarios(); 
            } else {
                Swal.fire('Error', res.message, 'error'); 
            }
        });
    },

    eliminarSeleccionados: function() {
        const checkboxesMarcados = document.querySelectorAll('.chk-usuario:checked');
        const cedulasSeleccionadas = Array.from(checkboxesMarcados).map(c => c.value); 
        
        if (cedulasSeleccionadas.length === 0) return;
        
        Swal.fire({ 
            title: `¿Eliminar ${cedulasSeleccionadas.length} usuario(s)?`, 
            text: "Esta acción no se puede deshacer.", 
            icon: 'warning', 
            showCancelButton: true, 
            confirmButtonColor: '#FF3D00', 
            confirmButtonText: 'Sí, eliminar permanentemente',
            cancelButtonText: 'Cancelar'
        }).then((result) => { 
            if (result.isConfirmed) { 
                const usuarioActual = JSON.parse(localStorage.getItem('sigae_usuario'));
                Aplicacion.mostrarCarga(); 
                
                Aplicacion.peticion({ 
                    action: "delete_users", 
                    cedulas: cedulasSeleccionadas, 
                    cedula_admin: usuarioActual.cedula 
                }, (res) => { 
                    Aplicacion.ocultarCarga(); 
                    if (res.status === "success") { 
                        Swal.fire('Eliminados', res.message, 'success'); 
                        this.cargarUsuarios(); 
                    } else {
                        Swal.fire('Error', res.message, 'error'); 
                    }
                }); 
            } 
        });
    },

    resetearClaveUsuario: function(cedulaTarget) { 
        Swal.fire({ 
            title: '¿Resetear a Fábrica?', 
            text: `Se borrará la contraseña, preguntas de seguridad y datos de contacto del usuario ${cedulaTarget}. Volverá a estado de "Primer Ingreso".`, 
            icon: 'warning', 
            showCancelButton: true, 
            confirmButtonColor: '#FF8D00', 
            confirmButtonText: 'Sí, resetear',
            cancelButtonText: 'Cancelar'
        }).then((result) => { 
            if (result.isConfirmed) { 
                Aplicacion.mostrarCarga(); 
                Aplicacion.peticion({ action: "reset_password", cedula_reset: cedulaTarget }, (res) => { 
                    Aplicacion.ocultarCarga(); 
                    if(res.status === "success") {
                        Swal.fire('¡Reseteado!', res.message, 'success'); 
                    } else {
                        Swal.fire('Error', res.message, 'error'); 
                    }
                }); 
            } 
        }); 
    },

    // ==========================================
    // EXCEL Y PLANTILLAS
    // ==========================================
    descargarPlantilla: function() { 
        Aplicacion.mostrarCarga(); 
        if (typeof XLSX === 'undefined') { 
            const script = document.createElement('script'); 
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"; 
            script.onload = () => this.generarExcelPlantilla(); 
            document.head.appendChild(script); 
        } else { 
            this.generarExcelPlantilla(); 
        } 
    },

    generarExcelPlantilla: function() { 
        Aplicacion.ocultarCarga(); 
        const datosEjemplo = [ 
            ["Cédula", "Nombre Completo", "Rol"], 
            ["15000000", "Juan Pérez", "Docente"],
            ["16000000", "María López", "Directivo"] 
        ]; 
        const worksheet = XLSX.utils.aoa_to_sheet(datosEjemplo); 
        const workbook = XLSX.utils.book_new(); 
        XLSX.utils.book_append_sheet(workbook, worksheet, "Plantilla_Usuarios"); 
        XLSX.writeFile(workbook, "Plantilla_Masiva_SIGAE.xlsx"); 
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
        reader.onload = (eventReader) => { 
            try { 
                const data = new Uint8Array(eventReader.target.result); 
                const workbook = XLSX.read(data, {type: 'array'}); 
                const jsonDatos = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {header: 1}); 
                
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
                    return Swal.fire('Archivo Inválido', 'El archivo está vacío o no cumple el formato de la plantilla.', 'error'); 
                } 
                
                const usuarioActual = JSON.parse(localStorage.getItem('sigae_usuario')); 
                Aplicacion.peticion({ 
                    action: "save_users_bulk", 
                    usuarios: usuariosNuevos, 
                    cedula_admin: usuarioActual.cedula 
                }, (res) => { 
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
                Swal.fire('Error', 'No se pudo leer el archivo Excel.', 'error'); 
            } 
        }; 
        reader.readAsArrayBuffer(archivo); 
    },

    // ==========================================
    // MI PERFIL Y ROLES 
    // ==========================================
    cargarMiPerfil: function() { 
        const usuarioActual = JSON.parse(localStorage.getItem('sigae_usuario')); 
        if(!usuarioActual) return; 
        
        Aplicacion.mostrarCarga(); 
        Aplicacion.peticion({ action: "get_my_profile", cedula: usuarioActual.cedula }, (res) => { 
            Aplicacion.ocultarCarga(); 
            if(res.status === "success") { 
                const perfil = res.perfil; 
                document.getElementById('perfil-avatar').innerText = perfil.nombre ? perfil.nombre.charAt(0).toUpperCase() : '?'; 
                document.getElementById('perfil-cedula').innerText = usuarioActual.cedula; 
                document.getElementById('perfil-rol').innerHTML = `<i class="bi bi-shield-check text-primary"></i> ${perfil.rol}`; 
                document.getElementById('perfil-estado').innerText = perfil.estado; 
                document.getElementById('perfil-nombre-input').value = perfil.nombre || ""; 
                document.getElementById('perfil-email').value = perfil.email || ""; 
                document.getElementById('perfil-telefono').value = perfil.telefono || ""; 
                
                let opcionesPreguntas = '<option value="" disabled selected>-- Elige una pregunta --</option>'; 
                if(res.preguntas) {
                    res.preguntas.forEach(pr => { 
                        opcionesPreguntas += `<option value="${pr}">${pr}</option>`; 
                    }); 
                }
                
                document.getElementById('perfil-preg1').innerHTML = opcionesPreguntas; 
                document.getElementById('perfil-preg2').innerHTML = opcionesPreguntas; 
                
                if(perfil.preg_1) document.getElementById('perfil-preg1').value = perfil.preg_1; 
                if(perfil.preg_2) document.getElementById('perfil-preg2').value = perfil.preg_2; 
            } 
        }); 
    },

    guardarMiPerfil: function() { 
        const usuarioActual = JSON.parse(localStorage.getItem('sigae_usuario')); 
        
        const payload = { 
            action: "update_my_profile", 
            cedula: usuarioActual.cedula, 
            nombre: document.getElementById('perfil-nombre-input').value, 
            email: document.getElementById('perfil-email').value, 
            telefono: document.getElementById('perfil-telefono').value, 
            cambiar_clave: false, 
            cambiar_preguntas: false 
        }; 
        
        if(!payload.nombre) {
            return Swal.fire('Atención', 'El nombre no puede estar vacío.', 'warning'); 
        }

        const claveActual = document.getElementById('perfil-clave-actual').value;
        const claveNueva = document.getElementById('perfil-clave-nueva').value;
        const claveConfirma = document.getElementById('perfil-clave-confirmar').value; 
        
        if(claveNueva || claveActual) { 
            if(!claveActual) {
                return Swal.fire('Atención', 'Debe ingresar su contraseña actual para poder cambiarla.', 'warning'); 
            }
            if(claveNueva !== claveConfirma) {
                return Swal.fire('Error', 'Las contraseñas nuevas no coinciden.', 'error'); 
            }
            payload.cambiar_clave = true; 
            payload.clave_actual = claveActual; 
            payload.nueva_clave = claveNueva; 
        } 
        
        const p1 = document.getElementById('perfil-preg1').value;
        const r1 = document.getElementById('perfil-resp1').value;
        const p2 = document.getElementById('perfil-preg2').value;
        const r2 = document.getElementById('perfil-resp2').value; 
        
        if (r1 || r2) { 
            if(!p1 || !r1 || !p2 || !r2) {
                return Swal.fire('Atención', 'Debe llenar ambas preguntas de seguridad y sus respuestas correspondientes.', 'warning'); 
            }
            payload.cambiar_preguntas = true; 
            payload.preg_1 = p1; 
            payload.resp_1 = r1; 
            payload.preg_2 = p2; 
            payload.resp_2 = r2; 
        } 
        
        Aplicacion.mostrarCarga(); 
        Aplicacion.peticion(payload, (res) => { 
            Aplicacion.ocultarCarga(); 
            if(res.status === "success") { 
                if(res.nuevo_nombre) { 
                    usuarioActual.nombre = res.nuevo_nombre; 
                    localStorage.setItem('sigae_usuario', JSON.stringify(usuarioActual)); 
                    document.getElementById('nombre-usuario-nav').innerText = res.nuevo_nombre; 
                    document.getElementById('perfil-avatar').innerText = res.nuevo_nombre.charAt(0).toUpperCase(); 
                } 
                document.getElementById('perfil-clave-actual').value = ''; 
                document.getElementById('perfil-clave-nueva').value = ''; 
                document.getElementById('perfil-clave-confirmar').value = ''; 
                document.getElementById('perfil-resp1').value = ''; 
                document.getElementById('perfil-resp2').value = ''; 
                
                Swal.fire('¡Éxito!', res.message, 'success'); 
            } else {
                Swal.fire('Error', res.message, 'error'); 
            }
        }); 
    },

    cargarRoles: function() { 
        const listaHTML = document.getElementById('lista-roles-sistema'); 
        if(!listaHTML) return; 
        
        Aplicacion.mostrarCarga(); 
        Aplicacion.peticion({ action: "get_roles" }, (res) => { 
            Aplicacion.ocultarCarga(); 
            if(res.status === "success") { 
                this.rolesSistema = res.roles; 
                let htmlRoles = '';
                
                this.rolesSistema.forEach(rolObj => {
                    htmlRoles += `
                    <button onclick="ModSeguridad.editarRol('${rolObj.nombre}')" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3 hover-efecto">
                        <div><i class="bi bi-person-badge text-primary me-2"></i><span class="fw-bold text-dark">${rolObj.nombre}</span></div>
                        <i class="bi bi-chevron-right text-muted small"></i>
                    </button>`;
                });
                
                listaHTML.innerHTML = htmlRoles;
            } 
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
        
        for (const [categoriaNombre, datosModulo] of Object.entries(Aplicacion.ModulosSistema)) { 
            const categoriaId = categoriaNombre.replace(/[\s/()]/g, ''); 
            
            htmlMatriz += `
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-end mt-3 border-bottom pb-2">
                    <h6 class="fw-bold text-primary mb-0"><i class="bi ${datosModulo.icono} me-2"></i>${categoriaNombre}</h6>
                    ${!esAdmin ? `<button class="btn btn-sm btn-light border py-0 px-2 text-muted shadow-sm" style="font-size: 0.75rem;" onclick="ModSeguridad.seleccionarCategoria('${categoriaId}', this)">Marcar Todo</button>` : ''}
                </div>
                <div class="row g-2 mt-2 categoria-group-${categoriaId}">`; 
                
            datosModulo.items.forEach(item => { 
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

    seleccionarTodo: function(btnElement) { 
        const checkboxes = document.querySelectorAll('.switch-permiso:not(:disabled)'); 
        const todosMarcados = Array.from(checkboxes).every(chk => chk.checked); 
        
        checkboxes.forEach(chk => {
            chk.checked = !todosMarcados;
        }); 
        
        if (!todosMarcados) { 
            btnElement.innerHTML = '<i class="bi bi-x"></i> Desmarcar Todo'; 
            btnElement.classList.replace('btn-outline-primary', 'btn-outline-secondary'); 
        } else { 
            btnElement.innerHTML = '<i class="bi bi-check-all"></i> Marcar Todo'; 
            btnElement.classList.replace('btn-outline-secondary', 'btn-outline-primary'); 
        } 
    },

    seleccionarCategoria: function(categoriaId, btnElement) { 
        const checkboxes = document.querySelectorAll(`.categoria-group-${categoriaId} .switch-permiso:not(:disabled)`); 
        const todosMarcados = Array.from(checkboxes).every(chk => chk.checked); 
        
        checkboxes.forEach(chk => {
            chk.checked = !todosMarcados;
        }); 
        
        btnElement.innerText = todosMarcados ? "Marcar Todo" : "Desmarcar Todo"; 
        
        if(!todosMarcados) { 
            btnElement.classList.add('bg-secondary', 'text-white'); 
            btnElement.classList.remove('text-muted'); 
        } else { 
            btnElement.classList.remove('bg-secondary', 'text-white'); 
            btnElement.classList.add('text-muted'); 
        } 
    },

    cancelarEdicionRol: function() { 
        document.getElementById('panel-edicion-roles').style.display = 'none'; 
        document.getElementById('panel-vacio-roles').style.display = 'block'; 
        this.rolSeleccionado = null; 
    },

    guardarPrivilegiosRol: function() { 
        const checkboxes = document.querySelectorAll('.switch-permiso:checked'); 
        let permisosSeleccionados = Array.from(checkboxes).map(c => c.value); 
        
        const usuarioActual = JSON.parse(localStorage.getItem('sigae_usuario')); 
        Aplicacion.mostrarCarga(); 
        
        Aplicacion.peticion({ 
            action: "save_role", 
            nombre_rol: this.rolSeleccionado, 
            permisos: permisosSeleccionados, 
            cedula_admin: usuarioActual.cedula 
        }, (res) => { 
            Aplicacion.ocultarCarga(); 
            if(res.status === "success") { 
                Swal.fire('¡Guardado!', res.message, 'success'); 
                this.cargarRoles(); 
                this.cancelarEdicionRol(); 
            } else {
                Swal.fire('Error', res.message, 'error'); 
            }
        }); 
    },

    modalNuevoRol: function() { 
        Swal.fire({ 
            title: 'Crear Nuevo Rol', 
            input: 'text', 
            inputPlaceholder: 'Escribe el nombre del rol (Ej: Psicólogo)', 
            showCancelButton: true, 
            confirmButtonText: 'Crear y Guardar', 
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#0066FF' 
        }).then((result) => { 
            if (result.isConfirmed && result.value) { 
                const nuevoRol = result.value.trim(); 
                const existe = this.rolesSistema.find(r => r.nombre.toLowerCase() === nuevoRol.toLowerCase()); 
                
                if(existe) {
                    return Swal.fire('Error', 'Este rol ya existe en el sistema.', 'error'); 
                }
                
                Aplicacion.mostrarCarga(); 
                Aplicacion.peticion({ action: "save_role", nombre_rol: nuevoRol, permisos: [] }, (res) => { 
                    Aplicacion.ocultarCarga(); 
                    if(res.status === "success") { 
                        this.cargarRoles(); 
                        Swal.fire('¡Creado!', `El rol se guardó correctamente en la Base de Datos.`, 'success'); 
                    } 
                }); 
            } 
        }); 
    },

    eliminarRol: function() { 
        Swal.fire({ 
            title: '¿Eliminar este Rol?', 
            text: `Se borrará completamente de la Base de Datos. Los usuarios con este rol perderán accesos.`,
            icon: 'warning', 
            showCancelButton: true, 
            confirmButtonColor: '#FF3D00', 
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => { 
            if (result.isConfirmed) { 
                const usuarioActual = JSON.parse(localStorage.getItem('sigae_usuario')); 
                Aplicacion.mostrarCarga(); 
                
                Aplicacion.peticion({ 
                    action: "delete_role", 
                    nombre_rol: this.rolSeleccionado, 
                    cedula_admin: usuarioActual.cedula 
                }, (res) => { 
                    Aplicacion.ocultarCarga(); 
                    if(res.status === "success") { 
                        this.cargarRoles(); 
                        this.cancelarEdicionRol(); 
                        Swal.fire('Eliminado', 'El rol ha sido borrado del sistema.', 'success'); 
                    } 
                }); 
            } 
        }); 
    }
};

window.init_Gestión_de_Usuarios = function() { ModSeguridad.cargarUsuarios(); };
window.init_Mi_Perfil = function() { ModSeguridad.cargarMiPerfil(); };
window.init_Roles_y_Privilegios = function() { ModSeguridad.cargarRoles(); };