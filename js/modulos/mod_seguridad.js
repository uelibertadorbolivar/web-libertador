/**
 * MÓDULO: SEGURIDAD Y USUARIOS
 */

const ModSeguridad = {
    datosUsuarios: [],
    usuariosFiltrados: [], // Array para la paginación
    rolesSistema: [], 
    cedulaOriginalEdicion: null,
    paginaActual: 1,
    itemsPorPagina: 10,

    cargarUsuarios: function() {
        this.limpiarFondosModales();

        Aplicacion.mostrarCarga();
        Promise.all([
            fetch(Configuracion.obtenerApiUrl(), { method: 'POST', body: JSON.stringify({ action: "get_roles" }) }).then(r => r.json()),
            fetch(Configuracion.obtenerApiUrl(), { method: 'POST', body: JSON.stringify({ action: "get_users" }) }).then(r => r.json()),
            fetch(Configuracion.obtenerApiUrl(), { method: 'POST', body: JSON.stringify({ action: "get_security_questions" }) }).then(r => r.json())
        ]).then(([resRoles, resUsers, resPregs]) => {
            Aplicacion.ocultarCarga();
            
            if(resRoles.status === "success") {
                this.rolesSistema = resRoles.roles;
                let opcionesModal = '<option value="" disabled selected>-- Seleccione un Rol --</option>';
                this.rolesSistema.forEach(r => { opcionesModal += `<option value="${r.nombre}">${r.nombre}</option>`; });
                const filtro = document.getElementById('filtro-rol-usuarios'), modalSelect = document.getElementById('nuevo-usr-rol'), modalEditSelect = document.getElementById('edit-usr-rol');
                if(filtro) filtro.innerHTML = '<option value="Todos">Todos los Roles</option>' + opcionesModal.replace('<option value="" disabled selected>-- Seleccione un Rol --</option>', '');
                if(modalSelect) modalSelect.innerHTML = opcionesModal;
                if(modalEditSelect) modalEditSelect.innerHTML = opcionesModal.replace('<option value="" disabled selected>-- Seleccione un Rol --</option>', '');
            }

            if(resPregs.status === "success" && resPregs.preguntas) {
                let opPreg = '<option value="" disabled selected>-- Seleccione una pregunta --</option>'; resPregs.preguntas.forEach(p => opPreg += `<option value="${p}">${p}</option>`);
                const elPreg1 = document.getElementById('edit-usr-preg1'), elPreg2 = document.getElementById('edit-usr-preg2');
                if(elPreg1) elPreg1.innerHTML = opPreg; if(elPreg2) elPreg2.innerHTML = opPreg;
            }

            this.datosUsuarios = resUsers.users || [];
            this.usuariosFiltrados = this.datosUsuarios; // Inicia con todos
            this.paginaActual = 1;
            this.dibujarUsuarios();
        }).catch(err => { Aplicacion.ocultarCarga(); Swal.fire('Error', 'Fallo de conexión.', 'error'); });
    },

    limpiarFondosModales: function() {
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove()); document.body.classList.remove('modal-open'); document.body.style.overflow = ''; document.body.style.paddingRight = '';
        const m1 = document.querySelector('body > #modal-nuevo-usuario'), m2 = document.querySelector('body > #modal-editar-usuario');
        if (m1) m1.remove(); if (m2) m2.remove();
    },

    cerrarModalYLimpiar: function(idModal) { const modalEl = document.getElementById(idModal); if (modalEl) { const inst = bootstrap.Modal.getInstance(modalEl); if (inst) inst.hide(); } setTimeout(() => { this.limpiarFondosModales(); }, 300); },

    // --- NUEVA LÓGICA DE PAGINACIÓN Y TABLA ---
    dibujarUsuarios: function() {
        const tbody = document.getElementById('tabla-usuarios');
        if (!tbody) return;

        const total = this.usuariosFiltrados.length;
        if (total === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-5 text-muted">No se encontraron usuarios.</td></tr>';
            document.getElementById('info-paginacion').innerText = "Mostrando 0 de 0";
            return;
        }

        const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
        const fin = Math.min(inicio + this.itemsPorPagina, total);
        const paginados = this.usuariosFiltrados.slice(inicio, fin);

        tbody.innerHTML = paginados.map(u => {
            let colorEstado = u.estado === 'Activo' ? 'bg-success' : (u.estado === 'Bloqueado' ? 'bg-danger' : 'bg-secondary');
            return `
            <tr class="animate__animated animate__fadeIn">
                <td class="px-4 py-3"><input class="form-check-input chk-usuario border-secondary" type="checkbox" value="${u.cedula}" onchange="ModSeguridad.verificarSeleccion()"></td>
                <td class="py-3"><div class="d-flex align-items-center"><div class="bg-primary bg-opacity-10 text-primary rounded-circle d-flex justify-content-center align-items-center me-3 fw-bold" style="width: 40px; height: 40px;">${u.nombre_completo ? u.nombre_completo.charAt(0).toUpperCase() : '?'}</div><div class="fw-bold text-dark">${u.nombre_completo || 'Sin nombre'}</div></div></td>
                <td class="py-3 text-muted">${u.cedula}</td>
                <td class="py-3"><span class="badge border bg-light text-dark fw-bold shadow-sm px-3 py-2"><i class="bi bi-shield-check text-primary me-1"></i> ${u.rol}</span></td>
                <td class="py-3"><span class="badge ${colorEstado} px-3 py-2 rounded-pill">${u.estado}</span></td>
                <td class="px-4 py-3 text-end">
                    <button onclick="ModSeguridad.abrirModalEditarUsuario('${u.cedula}')" class="btn btn-sm btn-light border text-primary rounded-circle me-1 shadow-sm" title="Editar Perfil Completo"><i class="bi bi-pencil-fill"></i></button>
                    <button onclick="ModSeguridad.resetearClaveUsuario('${u.cedula}')" class="btn btn-sm btn-light border text-warning rounded-circle shadow-sm me-1" title="Reset a Fábrica"><i class="bi bi-arrow-counterclockwise"></i></button>
                    <button onclick="ModSeguridad.eliminarUsuarioUnico('${u.cedula}')" class="btn btn-sm btn-light border text-danger rounded-circle shadow-sm" title="Eliminar"><i class="bi bi-trash-fill"></i></button>
                </td>
            </tr>`;
        }).join('');

        document.getElementById('info-paginacion').innerText = `Mostrando ${inicio + 1} a ${fin} de ${total}`;
        const chkTodos = document.getElementById('chk-todos-usuarios'); if(chkTodos) chkTodos.checked = false;
        this.verificarSeleccion();
    },

    cambiarPagina: function(delta) {
        const totalPaginas = Math.ceil(this.usuariosFiltrados.length / this.itemsPorPagina);
        const nuevaPagina = this.paginaActual + delta;
        if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) { this.paginaActual = nuevaPagina; this.dibujarUsuarios(); }
    },

    filtrarUsuarios: function() {
        const busqueda = document.getElementById('buscador-usuarios').value.toLowerCase();
        const rolFiltro = document.getElementById('filtro-rol-usuarios').value;
        this.usuariosFiltrados = this.datosUsuarios.filter(u => {
            const coincideTexto = (u.nombre_completo && u.nombre_completo.toLowerCase().includes(busqueda)) || String(u.cedula).includes(busqueda);
            const coincideRol = (rolFiltro === 'Todos') || (u.rol === rolFiltro);
            return coincideTexto && coincideRol;
        });
        this.paginaActual = 1;
        this.dibujarUsuarios();
    },

    // --- NUEVO: CHECKBOXES Y ELIMINACIÓN ---
    toggleTodosUsuarios: function(chk) { document.querySelectorAll('.chk-usuario').forEach(c => c.checked = chk.checked); this.verificarSeleccion(); },
    verificarSeleccion: function() {
        const seleccionados = document.querySelectorAll('.chk-usuario:checked').length;
        const btnEliminar = document.getElementById('btn-eliminar-masivo');
        if(btnEliminar) { btnEliminar.style.display = seleccionados > 0 ? 'inline-flex' : 'none'; }
    },

    eliminarSeleccionados: function() {
        const seleccionados = Array.from(document.querySelectorAll('.chk-usuario:checked')).map(c => c.value);
        if (seleccionados.length === 0) return;
        Swal.fire({ title: `¿Eliminar ${seleccionados.length} usuario(s)?`, text: "Esta acción no se puede deshacer.", icon: 'warning', showCancelButton: true, confirmButtonColor: '#FF3D00', confirmButtonText: 'Sí, eliminar permanentemente' }).then((result) => {
            if (result.isConfirmed) {
                const admin = JSON.parse(localStorage.getItem('sigae_usuario')).cedula; Aplicacion.mostrarCarga();
                Aplicacion.peticion({ action: "delete_users", cedulas: seleccionados, cedula_admin: admin }, (res) => {
                    Aplicacion.ocultarCarga(); if (res.status === "success") { Swal.fire('Eliminados', res.message, 'success'); this.cargarUsuarios(); } else Swal.fire('Error', res.message, 'error');
                });
            }
        });
    },

    eliminarUsuarioUnico: function(cedula) {
        Swal.fire({ title: `¿Eliminar a ${cedula}?`, text: "El usuario será borrado del sistema permanentemente.", icon: 'warning', showCancelButton: true, confirmButtonColor: '#FF3D00', confirmButtonText: 'Sí, eliminar' }).then((result) => {
            if (result.isConfirmed) {
                const admin = JSON.parse(localStorage.getItem('sigae_usuario')).cedula; Aplicacion.mostrarCarga();
                Aplicacion.peticion({ action: "delete_users", cedulas: [cedula], cedula_admin: admin }, (res) => {
                    Aplicacion.ocultarCarga(); if (res.status === "success") { Swal.fire('Eliminado', res.message, 'success'); this.cargarUsuarios(); } else Swal.fire('Error', res.message, 'error');
                });
            }
        });
    },

    // --- FORMULARIOS ---
    abrirModalUsuario: function() { document.getElementById('nuevo-usr-cedula').value = ''; document.getElementById('nuevo-usr-nombre').value = ''; document.getElementById('nuevo-usr-rol').value = ''; let modalEl = document.getElementById('modal-nuevo-usuario'); if (modalEl && modalEl.parentNode !== document.body) document.body.appendChild(modalEl); new bootstrap.Modal(modalEl).show(); },
    guardarNuevoUsuario: function() { const ced = document.getElementById('nuevo-usr-cedula').value, nom = document.getElementById('nuevo-usr-nombre').value, rol = document.getElementById('nuevo-usr-rol').value; if(!ced || !nom || !rol) return Swal.fire('Atención', 'Debe llenar todos los campos.', 'warning'); Aplicacion.mostrarCarga(); Aplicacion.peticion({ action: "save_user", cedula_nueva: ced, nombre: nom, rol: rol }, (res) => { Aplicacion.ocultarCarga(); this.cerrarModalYLimpiar('modal-nuevo-usuario'); if(res.status === "success") { Swal.fire('¡Usuario Creado!', res.message, 'success'); this.cargarUsuarios(); } else Swal.fire('Error', res.message, 'error'); }); },

    abrirModalEditarUsuario: function(cedula) {
        const u = this.datosUsuarios.find(u => String(u.cedula) === String(cedula)); if(!u) return; this.cedulaOriginalEdicion = u.cedula; 
        document.getElementById('edit-usr-cedula').value = u.cedula; document.getElementById('edit-usr-nombre').value = u.nombre_completo; document.getElementById('edit-usr-email').value = u.email || ''; document.getElementById('edit-usr-telefono').value = u.telefono || ''; document.getElementById('edit-usr-rol').value = u.rol; document.getElementById('edit-usr-estado').value = u.estado; document.getElementById('edit-usr-preg1').value = u.pregunta_1 || ''; document.getElementById('edit-usr-resp1').value = u.respuesta_1 || ''; document.getElementById('edit-usr-preg2').value = u.pregunta_2 || ''; document.getElementById('edit-usr-resp2').value = u.respuesta_2 || '';
        let modalEl = document.getElementById('modal-editar-usuario'); if (modalEl && modalEl.parentNode !== document.body) document.body.appendChild(modalEl); new bootstrap.Modal(modalEl).show();
    },

    guardarEdicionUsuario: function() {
        const payload = { action: "edit_user", cedula_original: this.cedulaOriginalEdicion, nueva_cedula: document.getElementById('edit-usr-cedula').value, nombre: document.getElementById('edit-usr-nombre').value, email: document.getElementById('edit-usr-email').value, telefono: document.getElementById('edit-usr-telefono').value, rol: document.getElementById('edit-usr-rol').value, estado: document.getElementById('edit-usr-estado').value, preg_1: document.getElementById('edit-usr-preg1').value, resp_1: document.getElementById('edit-usr-resp1').value, preg_2: document.getElementById('edit-usr-preg2').value, resp_2: document.getElementById('edit-usr-resp2').value, cedula_admin: JSON.parse(localStorage.getItem('sigae_usuario')).cedula };
        if(!payload.nombre || !payload.nueva_cedula) return Swal.fire('Atención', 'Nombre y Cédula son obligatorios.', 'warning');
        Aplicacion.mostrarCarga(); Aplicacion.peticion(payload, (res) => { Aplicacion.ocultarCarga(); this.cerrarModalYLimpiar('modal-editar-usuario'); if(res.status === "success") { Swal.fire('¡Actualizado!', res.message, 'success'); this.cargarUsuarios(); } else Swal.fire('Error', res.message, 'error'); });
    },

    resetearClaveUsuario: function(cedulaTarget) {
        Swal.fire({ title: '¿Resetear a Fábrica?', text: `Se borrará la contraseña, preguntas de seguridad y datos de contacto de ${cedulaTarget}. Volverá a estado de "Primer Ingreso".`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#FF8D00', confirmButtonText: 'Sí, resetear' }).then((result) => { if (result.isConfirmed) { Aplicacion.mostrarCarga(); Aplicacion.peticion({ action: "reset_password", cedula_reset: cedulaTarget }, (res) => { Aplicacion.ocultarCarga(); if(res.status === "success") Swal.fire('¡Reseteado!', res.message, 'success'); else Swal.fire('Error', res.message, 'error'); }); } });
    },

    descargarPlantilla: function() { Aplicacion.mostrarCarga(); if (typeof XLSX === 'undefined') { const script = document.createElement('script'); script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"; script.onload = () => this.generarExcelPlantilla(); document.head.appendChild(script); } else { this.generarExcelPlantilla(); } },
    generarExcelPlantilla: function() { Aplicacion.ocultarCarga(); const datosEjemplo = [ ["Cédula", "Nombre Completo", "Rol"], ["15000000", "Juan Pérez", "Docente"], ["16000000", "María López", "Directivo"] ]; const ws = XLSX.utils.aoa_to_sheet(datosEjemplo); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Usuarios"); XLSX.writeFile(wb, "Plantilla_Usuarios.xlsx"); },
    procesarExcel: function(event) { const archivo = event.target.files[0]; if (!archivo) return; Aplicacion.mostrarCarga(); if (typeof XLSX === 'undefined') { const script = document.createElement('script'); script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"; script.onload = () => this.leerArchivoExcel(archivo); document.head.appendChild(script); } else { this.leerArchivoExcel(archivo); } event.target.value = '';  },
    leerArchivoExcel: function(archivo) { const reader = new FileReader(); reader.onload = (e) => { try { const data = new Uint8Array(e.target.result); const workbook = XLSX.read(data, {type: 'array'}); const primeraHoja = workbook.Sheets[workbook.SheetNames[0]]; const jsonDatos = XLSX.utils.sheet_to_json(primeraHoja, {header: 1}); let usuariosNuevos = []; for (let i = 1; i < jsonDatos.length; i++) { let fila = jsonDatos[i]; if (fila.length >= 3 && fila[0] && fila[1] && fila[2]) { usuariosNuevos.push({ cedula: String(fila[0]).trim(), nombre: String(fila[1]).trim(), rol: String(fila[2]).trim() }); } } if (usuariosNuevos.length === 0) { Aplicacion.ocultarCarga(); return Swal.fire('Archivo Inválido', 'El archivo está vacío o no tiene el formato correcto.', 'error'); } const usuarioActual = JSON.parse(localStorage.getItem('sigae_usuario')); Aplicacion.peticion({ action: "save_users_bulk", usuarios: usuariosNuevos, cedula_admin: usuarioActual.cedula }, (res) => { Aplicacion.ocultarCarga(); if(res.status === "success") { Swal.fire('¡Carga Exitosa!', res.message, 'success'); this.cargarUsuarios(); } else { Swal.fire('Atención', res.message, 'warning'); } }); } catch (err) { Aplicacion.ocultarCarga(); Swal.fire('Error de Lectura', 'No se pudo leer el archivo Excel. Asegúrate de usar la plantilla.', 'error'); } }; reader.readAsArrayBuffer(archivo); },

    // --- MI PERFIL Y ROLES ---
    cargarMiPerfil: function() { const usuarioActual = JSON.parse(localStorage.getItem('sigae_usuario')); if(!usuarioActual) return; Aplicacion.mostrarCarga(); Aplicacion.peticion({ action: "get_my_profile", cedula: usuarioActual.cedula }, (res) => { Aplicacion.ocultarCarga(); if(res.status === "success") { const p = res.perfil; document.getElementById('perfil-avatar').innerText = p.nombre ? p.nombre.charAt(0).toUpperCase() : '?'; document.getElementById('perfil-cedula').innerText = usuarioActual.cedula; document.getElementById('perfil-rol').innerHTML = `<i class="bi bi-shield-check text-primary"></i> ${p.rol}`; document.getElementById('perfil-estado').innerText = p.estado; document.getElementById('perfil-nombre-input').value = p.nombre || ""; document.getElementById('perfil-email').value = p.email || ""; document.getElementById('perfil-telefono').value = p.telefono || ""; let opciones = '<option value="" disabled selected>-- Elige una pregunta --</option>'; if(res.preguntas) res.preguntas.forEach(pr => { opciones += `<option value="${pr}">${pr}</option>`; }); document.getElementById('perfil-preg1').innerHTML = opciones; document.getElementById('perfil-preg2').innerHTML = opciones; if(p.preg_1) document.getElementById('perfil-preg1').value = p.preg_1; if(p.preg_2) document.getElementById('perfil-preg2').value = p.preg_2; } else Swal.fire('Error', res.message, 'error'); }); },
    guardarMiPerfil: function() { const usuarioActual = JSON.parse(localStorage.getItem('sigae_usuario')); const payload = { action: "update_my_profile", cedula: usuarioActual.cedula, nombre: document.getElementById('perfil-nombre-input').value, email: document.getElementById('perfil-email').value, telefono: document.getElementById('perfil-telefono').value, cambiar_clave: false, cambiar_preguntas: false }; if(!payload.nombre) return Swal.fire('Atención', 'El nombre no puede estar vacío.', 'warning'); const claveActual = document.getElementById('perfil-clave-actual').value, claveNueva = document.getElementById('perfil-clave-nueva').value, claveConfirma = document.getElementById('perfil-clave-confirmar').value; if(claveNueva || claveActual) { if(!claveActual) return Swal.fire('Atención', 'Ingresa tu contraseña actual.', 'warning'); if(claveNueva !== claveConfirma) return Swal.fire('Error', 'Las contraseñas nuevas no coinciden.', 'error'); if(!/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#.])[A-Za-z\d@$!%*?&#.]{8,}$/.test(claveNueva)) return Swal.fire('Contraseña Débil', 'Mínimo 8 caracteres, 1 mayúscula, 1 número y 1 símbolo.', 'error'); payload.cambiar_clave = true; payload.clave_actual = claveActual; payload.nueva_clave = claveNueva; } const p1 = document.getElementById('perfil-preg1').value, r1 = document.getElementById('perfil-resp1').value, p2 = document.getElementById('perfil-preg2').value, r2 = document.getElementById('perfil-resp2').value; if (r1 || r2) { if(!p1 || !r1 || !p2 || !r2) return Swal.fire('Atención', 'Llena ambas preguntas y respuestas.', 'warning'); payload.cambiar_preguntas = true; payload.preg_1 = p1; payload.resp_1 = r1; payload.preg_2 = p2; payload.resp_2 = r2; } Aplicacion.mostrarCarga(); Aplicacion.peticion(payload, (res) => { Aplicacion.ocultarCarga(); if(res.status === "success") { if(res.nuevo_nombre) { usuarioActual.nombre = res.nuevo_nombre; localStorage.setItem('sigae_usuario', JSON.stringify(usuarioActual)); document.getElementById('nombre-usuario-nav').innerText = res.nuevo_nombre; document.getElementById('perfil-avatar').innerText = res.nuevo_nombre.charAt(0).toUpperCase(); } document.getElementById('perfil-clave-actual').value = ''; document.getElementById('perfil-clave-nueva').value = ''; document.getElementById('perfil-clave-confirmar').value = ''; document.getElementById('perfil-resp1').value = ''; document.getElementById('perfil-resp2').value = ''; Swal.fire('¡Éxito!', res.message, 'success'); } else Swal.fire('Error', res.message, 'error'); }); },
    cargarRoles: function() { const listaHTML = document.getElementById('lista-roles-sistema'); if(!listaHTML) return; Aplicacion.mostrarCarga(); Aplicacion.peticion({ action: "get_roles" }, (res) => { Aplicacion.ocultarCarga(); if(res.status === "success") { this.rolesSistema = res.roles; listaHTML.innerHTML = this.rolesSistema.map(rolObj => `<button onclick="ModSeguridad.editarRol('${rolObj.nombre}')" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3 hover-efecto"><div><i class="bi bi-person-badge text-primary me-2"></i><span class="fw-bold text-dark">${rolObj.nombre}</span></div><i class="bi bi-chevron-right text-muted small"></i></button>`).join(''); } }); },
    editarRol: function(nombreRol) { this.rolSeleccionado = nombreRol; document.getElementById('panel-vacio-roles').style.display = 'none'; document.getElementById('panel-edicion-roles').style.display = 'block'; document.getElementById('titulo-rol-editar').innerText = nombreRol; const esAdmin = (nombreRol === 'Administrador' || nombreRol === 'Directivo'); document.getElementById('btn-eliminar-rol').style.display = esAdmin ? 'none' : 'inline-block'; document.getElementById('btn-seleccionar-todo').style.display = esAdmin ? 'none' : 'inline-block'; document.getElementById('btn-seleccionar-todo').innerHTML = '<i class="bi bi-check-all"></i> Marcar Todo'; const rolActualObj = this.rolesSistema.find(r => r.nombre === nombreRol); const permisosGuardados = rolActualObj ? rolActualObj.permisos : []; let htmlMatriz = ''; for (const [cat, datos] of Object.entries(Aplicacion.ModulosSistema)) { const catId = cat.replace(/[\s/()]/g, ''); htmlMatriz += `<div class="col-12"><div class="d-flex justify-content-between align-items-end mt-3 border-bottom pb-2"><h6 class="fw-bold text-primary mb-0"><i class="bi ${datos.icono} me-2"></i>${cat}</h6>${!esAdmin ? `<button class="btn btn-sm btn-light border py-0 px-2 text-muted shadow-sm" style="font-size: 0.75rem;" onclick="ModSeguridad.seleccionarCategoria('${catId}', this)">Marcar Todo</button>` : ''}</div><div class="row g-2 mt-2 categoria-group-${catId}">`; datos.items.forEach(item => { const tienePermiso = esAdmin || permisosGuardados.includes(item.vista); const isBlocked = esAdmin ? "disabled" : ""; htmlMatriz += `<div class="col-md-6 col-lg-4"><div class="form-check form-switch bg-light p-3 rounded-3 border"><input class="form-check-input switch-permiso ms-0 me-3" type="checkbox" value="${item.vista}" id="switch-${item.vista.replace(/[\s/()]/g, '')}" ${tienePermiso ? 'checked' : ''} ${isBlocked}><label class="form-check-label text-dark fw-bold small" for="switch-${item.vista.replace(/[\s/()]/g, '')}">${item.vista}</label></div></div>`; }); htmlMatriz += `</div></div>`; } document.getElementById('matriz-permisos').innerHTML = htmlMatriz; },
    seleccionarTodo: function(btn) { const checkboxes = document.querySelectorAll('.switch-permiso:not(:disabled)'); const marcados = document.querySelectorAll('.switch-permiso:not(:disabled):checked'); const todosMarcados = checkboxes.length === marcados.length && checkboxes.length > 0; checkboxes.forEach(chk => chk.checked = !todosMarcados); if (!todosMarcados) { btn.innerHTML = '<i class="bi bi-x"></i> Desmarcar Todo'; btn.classList.replace('btn-outline-primary', 'btn-outline-secondary'); } else { btn.innerHTML = '<i class="bi bi-check-all"></i> Marcar Todo'; btn.classList.replace('btn-outline-secondary', 'btn-outline-primary'); } },
    seleccionarCategoria: function(catId, btn) { const checkboxes = document.querySelectorAll(`.categoria-group-${catId} .switch-permiso:not(:disabled)`); const marcados = document.querySelectorAll(`.categoria-group-${catId} .switch-permiso:not(:disabled):checked`); const todosMarcados = checkboxes.length === marcados.length && checkboxes.length > 0; checkboxes.forEach(chk => chk.checked = !todosMarcados); btn.innerText = todosMarcados ? "Marcar Todo" : "Desmarcar Todo"; if(!todosMarcados) { btn.classList.add('bg-secondary', 'text-white'); btn.classList.remove('text-muted'); } else { btn.classList.remove('bg-secondary', 'text-white'); btn.classList.add('text-muted'); } },
    cancelarEdicionRol: function() { document.getElementById('panel-edicion-roles').style.display = 'none'; document.getElementById('panel-vacio-roles').style.display = 'block'; this.rolSeleccionado = null; },
    guardarPrivilegiosRol: function() { const checkboxes = document.querySelectorAll('.switch-permiso'); let permisosSeleccionados = []; checkboxes.forEach(chk => { if(chk.checked) permisosSeleccionados.push(chk.value); }); const usuarioActual = JSON.parse(localStorage.getItem('sigae_usuario')); Aplicacion.mostrarCarga(); Aplicacion.peticion({ action: "save_role", nombre_rol: this.rolSeleccionado, permisos: permisosSeleccionados, cedula_admin: usuarioActual.cedula }, (res) => { Aplicacion.ocultarCarga(); if(res.status === "success") { Swal.fire('¡Guardado!', 'Los privilegios han sido registrados en la Base de Datos.', 'success'); this.cargarRoles(); this.cancelarEdicionRol(); } else Swal.fire('Error', res.message, 'error'); }); },
    modalNuevoRol: function() { Swal.fire({ title: 'Crear Nuevo Rol', input: 'text', inputLabel: 'Nombre del perfil', showCancelButton: true, confirmButtonText: 'Crear y Guardar', confirmButtonColor: '#0066FF' }).then((result) => { if (result.isConfirmed && result.value) { const nuevoRol = result.value.trim(); const existe = this.rolesSistema.find(r => r.nombre.toLowerCase() === nuevoRol.toLowerCase()); if(existe) return Swal.fire('Error', 'Este rol ya existe.', 'error'); Aplicacion.mostrarCarga(); Aplicacion.peticion({ action: "save_role", nombre_rol: nuevoRol, permisos: [] }, (res) => { Aplicacion.ocultarCarga(); if(res.status === "success") { this.cargarRoles(); Swal.fire('¡Creado!', `El rol se guardó.`, 'success'); } }); } }); },
    eliminarRol: function() { Swal.fire({ title: '¿Eliminar este Rol?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#FF3D00', confirmButtonText: 'Sí, eliminar' }).then((result) => { if (result.isConfirmed) { const usuarioActual = JSON.parse(localStorage.getItem('sigae_usuario')); Aplicacion.mostrarCarga(); Aplicacion.peticion({ action: "delete_role", nombre_rol: this.rolSeleccionado, cedula_admin: usuarioActual.cedula }, (res) => { Aplicacion.ocultarCarga(); if(res.status === "success") { this.cargarRoles(); this.cancelarEdicionRol(); Swal.fire('Eliminado', '', 'success'); } }); } }); }
};

window.init_Gestión_de_Usuarios = function() { ModSeguridad.cargarUsuarios(); };
window.init_Mi_Perfil = function() { ModSeguridad.cargarMiPerfil(); };
window.init_Roles_y_Privilegios = function() { ModSeguridad.cargarRoles(); };