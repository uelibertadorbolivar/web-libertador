/**
 * MÓDULO DE PERSONAS
 * Gestión de usuarios (CON PAGINACIÓN), docentes, roles y solicitudes.
 */

const ModuloDocentes = {
    assignments: [],
    renderAsignarCargo: function(cont) {
        cont.innerHTML = `
        <div class="col-12 card border-0 shadow-sm rounded-4 bg-white mb-4 module-card anim-stagger-1 overflow-hidden">
            <div class="module-header bg-gradient-green mb-0">
                <div class="d-flex align-items-center">
                    <div class="module-icon-box text-success"><i class="bi bi-person-vcard-fill fs-4"></i></div>
                    <div><h5 class="fw-bold mb-0 text-white">Asignación de Cargo</h5><small class="opacity-75 text-white">Vinculación de personal a roles específicos</small></div>
                </div>
            </div>
            <div class="p-4 pt-4 row g-3 align-items-end">
                <div class="col-md-5"><label class="small fw-bold text-muted ps-2">Personal Sin Cargo</label><select id="staff-select" class="form-select input-interactive rounded-pill shadow-none"></select></div>
                <div class="col-md-5"><label class="small fw-bold text-muted ps-2">Cargo</label><select id="cargo-select" class="form-select input-interactive rounded-pill shadow-none"></select></div>
                <div class="col-md-2"><button onclick="ModuloDocentes.saveAssignment()" class="btn btn-primary-vibrant w-100 rounded-pill fw-bold shadow-sm btn-action"><i class="bi bi-check-circle-fill me-2"></i>Asignar</button></div>
            </div>
        </div>
        <div class="col-12 card border-0 shadow-sm p-4 rounded-4 bg-white module-card anim-stagger-2">
            <div class="table-responsive"><table class="table table-interactive align-middle w-100"><thead class="table-light"><tr><th>Personal</th><th>Cédula</th><th>Cargo</th><th class="text-end px-4">Acción</th></tr></thead><tbody id="tbl-assignments"></tbody></table></div>
        </div>`;
        this.loadAssignments();
    },
    loadAssignments: function() { App.showLoader(); App.sendRequest({ action: "get_assigned_staff" }, (res) => { App.hideLoader(); this.assignments = res.assignments || []; this.drawAssignments(); this.updateSelectors(); }); },
    drawAssignments: function() { const tbody = document.getElementById('tbl-assignments'); if(!tbody) return; tbody.innerHTML = this.assignments.length === 0 ? '<tr><td colspan="4" class="text-center text-muted py-4">Sin asignaciones</td></tr>' : this.assignments.map((a,i) => `<tr class="anim-stagger-${(i%5)+1}"><td class="fw-bold">${a.nombre}</td><td>V-${a.cedula}</td><td><span class="badge bg-primary-subtle text-primary border px-3 shadow-sm">${a.cargoNombre}</span></td><td class="text-end px-4"><button onclick="ModuloDocentes.deleteAssignment('${a.cedula}')" class="btn btn-sm btn-light text-danger rounded-circle shadow-sm btn-action"><i class="bi bi-trash-fill"></i></button></td></tr>`).join(''); },
    updateSelectors: function() {
        const staffSel = document.getElementById('staff-select'), cargoSel = document.getElementById('cargo-select');
        if(!staffSel || !cargoSel) return;
        const assignedCedulas = this.assignments.map(a => String(a.cedula));
        const availableStaff = App.allUsers.filter(u => u.rol !== "Estudiante" && u.rol !== "Representante" && !assignedCedulas.includes(String(u.cedula)));
        staffSel.innerHTML = '<option value="">-- Seleccionar --</option>' + availableStaff.map(u => `<option value="${u.cedula}" data-name="${u.nombre}">${u.nombre} (V-${u.cedula})</option>`).join('');
        cargoSel.innerHTML = '<option value="">-- Seleccionar --</option>' + App.allCargos.map(c => `<option value="${c.id}" data-name="${c.nombre}">${c.nombre}</option>`).join('');
    },
    saveAssignment: function() {
        const staff = document.getElementById('staff-select'), cargo = document.getElementById('cargo-select');
        const cedula = staff.value, cargoId = cargo.value;
        if(!cedula || !cargoId) return Swal.fire('Error','Seleccione personal y cargo','warning');
        const nombre = staff.options[staff.selectedIndex].getAttribute('data-name'), cargoNombre = cargo.options[cargo.selectedIndex].getAttribute('data-name');
        App.showLoader(); App.sendRequest({ action: "save_staff_assignment", cedula, nombre, cargoId, cargoNombre }, (res) => { App.hideLoader(); if(res.status === "success") { Swal.fire('Éxito', 'Cargo asignado', 'success'); this.loadAssignments(); } });
    },
    deleteAssignment: function(cedula) {
        Swal.fire({ title: '¿Remover?', icon: 'warning', showCancelButton: true }).then(r => { if(r.isConfirmed) { App.showLoader(); App.sendRequest({ action: "delete_staff_assignment", cedula }, (res) => { App.hideLoader(); if(res.status === "success") { this.loadAssignments(); } }); } });
    }
};

const ModuloUsuarios = {
    data: [],
    filteredData: [],
    currentPage: 1,
    itemsPerPage: 10,

    render: function(cont) {
        cont.innerHTML = `
        <div class="col-12 card border-0 shadow-sm rounded-4 bg-white w-100 module-card anim-stagger-1 overflow-hidden">
            <div class="module-header bg-gradient-magenta">
                <div class="d-flex align-items-center">
                    <div class="module-icon-box text-danger"><i class="bi bi-people-fill fs-4"></i></div>
                    <div><h5 class="fw-bold mb-0 text-white">Gestión de Usuarios</h5><small class="opacity-75 text-white">Directorio de accesos al sistema</small></div>
                </div>
                <button onclick="ModuloUsuarios.modal()" class="btn btn-light text-dark fw-bold rounded-pill px-4 shadow-sm btn-action"><i class="bi bi-person-plus-fill me-2"></i>Nuevo Usuario</button>
            </div>
            
            <div class="p-4 bg-light border-bottom d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div class="input-group shadow-sm rounded-pill overflow-hidden" style="max-width: 350px;">
                    <span class="input-group-text bg-white border-0 ps-3"><i class="bi bi-search text-muted"></i></span>
                    <input type="text" id="search-user" class="form-control border-0 py-2" placeholder="Buscar por nombre o cédula..." onkeyup="ModuloUsuarios.search(this.value)">
                </div>
                <div class="text-muted small fw-bold">
                    Total: <span id="total-users-count">0</span> usuarios
                </div>
            </div>

            <div class="p-4 pt-2 table-responsive">
                <table class="table align-middle w-100 table-interactive">
                    <thead class="table-light"><tr><th>Cédula</th><th>Nombre</th><th>Rol</th><th class="text-end px-4">Acción</th></tr></thead>
                    <tbody id="tbl-usuarios"></tbody>
                </table>
                
                <!-- PAGINACIÓN -->
                <div class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top" id="pagination-controls">
                    <button id="btn-prev" class="btn btn-sm btn-outline-secondary rounded-pill px-3" onclick="ModuloUsuarios.changePage(-1)">Anterior</button>
                    <span class="small text-muted fw-bold" id="page-info">Página 1</span>
                    <button id="btn-next" class="btn btn-sm btn-outline-primary rounded-pill px-3" onclick="ModuloUsuarios.changePage(1)">Siguiente</button>
                </div>
            </div>
        </div>`;
        this.load();
    },

    load: function() {
        App.showLoader();
        App.sendRequest({ action: "get_users" }, (res) => { 
            this.data = res.users || []; 
            this.filteredData = [...this.data];
            this.currentPage = 1;
            this.draw(); 
            App.hideLoader(); 
        });
    },

    search: function(query) {
        query = query.toLowerCase();
        this.filteredData = this.data.filter(u => 
            String(u.cedula).includes(query) || 
            u.nombre.toLowerCase().includes(query) || 
            u.rol.toLowerCase().includes(query)
        );
        this.currentPage = 1; // Resetear a página 1 al buscar
        this.draw();
    },

    changePage: function(direction) {
        const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
        const newPage = this.currentPage + direction;
        if (newPage >= 1 && newPage <= totalPages) {
            this.currentPage = newPage;
            this.draw();
        }
    },

    draw: function() {
        // Calcular índices
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageItems = this.filteredData.slice(start, end);
        const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);

        // Actualizar contador total
        const lblTotal = document.getElementById('total-users-count');
        if(lblTotal) lblTotal.innerText = this.filteredData.length;

        // Renderizar Tabla
        const tbody = document.getElementById('tbl-usuarios');
        if(!tbody) return;

        if (this.filteredData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">No se encontraron usuarios</td></tr>';
            document.getElementById('page-info').innerText = "Página 0 de 0";
            document.getElementById('btn-prev').disabled = true;
            document.getElementById('btn-next').disabled = true;
            return;
        }

        tbody.innerHTML = pageItems.map((u, i) => `<tr class="anim-stagger-${(i%5)+1}">
            <td class="fw-bold px-4">V-${u.cedula}</td>
            <td>${u.nombre}</td>
            <td><span class="badge bg-primary-subtle text-primary border shadow-sm">${u.rol}</span></td>
            <td class="text-end px-4">
                <button onclick="ModuloUsuarios.modal('${u.cedula}')" class="btn btn-sm btn-light text-primary rounded-circle btn-action"><i class="bi bi-pencil"></i></button>
                <button onclick="ModuloUsuarios.delete('${u.cedula}')" class="btn btn-sm btn-light text-danger rounded-circle ms-1 btn-action"><i class="bi bi-trash"></i></button>
            </td>
        </tr>`).join('');

        // Actualizar controles de paginación
        document.getElementById('page-info').innerText = `Página ${this.currentPage} de ${totalPages}`;
        document.getElementById('btn-prev').disabled = this.currentPage === 1;
        document.getElementById('btn-next').disabled = this.currentPage === totalPages;
    },

    modal: function(cedula = null) {
        const d = cedula ? this.data.find(x => String(x.cedula) === String(cedula)) : {cedula: '', nombre: '', rol: ''};
        const rolesOptions = Object.keys(App.allRoles).length > 0 ? Object.keys(App.allRoles).map(r => `<option ${d.rol===r?'selected':''}>${r}</option>`).join('') : '<option>Administrador</option><option>Director</option><option>Docente</option>';
        Swal.fire({
            title: cedula ? 'Editar Usuario' : 'Nuevo Usuario',
            html: `<input id="sw-ced" type="number" class="form-control input-interactive rounded-pill mb-3" value="${d.cedula}" placeholder="Cédula" ${cedula ? 'disabled' : ''}><input id="sw-nom" type="text" class="form-control input-interactive rounded-pill mb-3" value="${d.nombre}" placeholder="Nombre Completo"><select id="sw-rol" class="form-select input-interactive rounded-pill mb-2"><option value="">-- Seleccionar Rol --</option>${rolesOptions}</select>`,
            showCancelButton: true, confirmButtonText: 'Guardar'
        }).then(r => {
            if (r.isConfirmed) {
                const c = document.getElementById('sw-ced').value, n = document.getElementById('sw-nom').value, ro = document.getElementById('sw-rol').value;
                if (!c || !n || !ro) return Swal.fire('Error', 'Todos los campos son obligatorios', 'warning');
                App.showLoader(); App.sendRequest({ action: "save_user", originalCedula: cedula, user: { cedula: c, nombre: n, rol: ro } }, (res) => {
                    App.hideLoader(); if (res.status === 'success') { Swal.fire('Éxito', 'Usuario guardado', 'success'); this.load(); } else Swal.fire('Error', res.message, 'error');
                });
            }
        });
    },
    delete: function(cedula) {
        Swal.fire({ title: '¿Eliminar usuario?', icon: 'warning', showCancelButton: true }).then(r => {
            if (r.isConfirmed) { App.showLoader(); App.sendRequest({ action: "delete_user", cedula: cedula }, (res) => { App.hideLoader(); if (res.status === 'success') this.load(); }); }
        });
    }
};

const ModuloSoftware = {
    renderRoles: function(cont) {
        cont.innerHTML = `
        <div class="col-12 card border-0 shadow-sm rounded-4 bg-white mb-4 w-100 module-card anim-stagger-1 overflow-hidden">
            <div class="module-header bg-gradient-magenta mb-0">
                <div class="d-flex align-items-center">
                    <div class="module-icon-box text-danger"><i class="bi bi-ui-checks-grid fs-4"></i></div>
                    <div><h5 class="fw-bold mb-0 text-white">Roles y Privilegios</h5><small class="opacity-75 text-white">Control de permisos por módulo</small></div>
                </div>
                <button onclick="ModuloSoftware.modalRole()" class="btn btn-light text-dark fw-bold rounded-pill px-4 shadow-sm btn-action"><i class="bi bi-shield-plus me-2"></i>Nuevo Rol</button>
            </div>
        </div>
        <div id="list-roles" class="row g-4 w-100 m-0"></div>`; 
        this.loadRoles();
    },
    loadRoles: function() { App.showLoader(); App.sendRequest({ action: "get_roles" }, (res) => { App.allRoles = res.roles || {}; this.drawRoles(); App.hideLoader(); }); },
    drawRoles: function() {
        const div = document.getElementById('list-roles'); if (!div) return; const rolesKeys = Object.keys(App.allRoles);
        div.innerHTML = rolesKeys.length === 0 ? `<div class="col-12 text-center text-muted py-5">Sin roles</div>` : rolesKeys.map((r, i) => `<div class="col-md-4 anim-stagger-${(i%5)+1}"><div class="card border-0 shadow-sm rounded-4 bg-white p-4 border-start border-5 border-cyan h-100 module-card"><h6>${r}</h6><div class="small text-muted mb-2">${App.allRoles[r].length} Privilegios asignados</div><div class="text-end mt-3"><button onclick="ModuloSoftware.modalRole('${r}')" class="btn btn-sm btn-light text-primary rounded-circle btn-action"><i class="bi bi-pencil"></i></button><button onclick="ModuloSoftware.deleteRole('${r}')" class="btn btn-sm btn-light text-danger rounded-circle ms-1 btn-action" ${r==='Administrador' || r==='Director' ? 'disabled' : ''}><i class="bi bi-trash"></i></button></div></div></div>`).join('');
    },
    modalRole: function(roleName = null) {
        const perms = roleName ? App.allRoles[roleName] : []; 
        let checkboxes = '<div class="form-check mb-3 border-bottom pb-2"><input class="form-check-input input-interactive cursor-pointer" type="checkbox" id="chk-all-perms" onchange="document.querySelectorAll(\'.perm-chk\').forEach(c => c.checked = this.checked)"><label class="form-check-label fw-bold text-primary cursor-pointer" for="chk-all-perms">Seleccionar Todos los Privilegios</label></div>';
        
        systemStructure.forEach(cat => { 
            checkboxes += `<div class="fw-bold mt-3 text-primary small border-bottom pb-1 mb-2">${cat.category}</div>`; 
            cat.items.forEach(item => { 
                const checked = perms.includes(item) ? 'checked' : ''; 
                checkboxes += `<div class="form-check"><input class="form-check-input perm-chk input-interactive cursor-pointer" type="checkbox" value="${item}" id="chk-${item.replace(/\s+/g, '')}" ${checked}><label class="form-check-label small cursor-pointer" for="chk-${item.replace(/\s+/g, '')}">${item}</label></div>`; 
            }); 
        });
        Swal.fire({ title: roleName ? 'Editar Rol' : 'Nuevo Rol', html: `<input id="sw-rolename" class="form-control input-interactive rounded-pill mb-3 fw-bold" value="${roleName || ''}" placeholder="Nombre del Rol" ${roleName === 'Administrador' || roleName === 'Director' ? 'disabled' : ''}><div class="text-start bg-light p-3 rounded-4 border overflow-auto" style="max-height: 300px;">${checkboxes}</div>`, showCancelButton: true, width: '600px' }).then(r => {
            if (r.isConfirmed) {
                const name = document.getElementById('sw-rolename').value, selectedPerms = Array.from(document.querySelectorAll('.perm-chk:checked')).map(cb => cb.value);
                if (!name) return Swal.fire('Error', 'Indique un nombre', 'warning');
                App.showLoader(); App.sendRequest({ action: "save_role", nombre: name, permisos: selectedPerms }, (res) => { App.hideLoader(); if (res.status === 'success') { Swal.fire('Éxito', 'Rol guardado', 'success'); this.loadRoles(); App.loadAppData(); } });
            }
        });
    },
    deleteRole: function(roleName) {
        if(roleName === 'Administrador' || roleName === 'Director') return;
        Swal.fire({ title: '¿Eliminar Rol?', text: roleName, icon: 'warning', showCancelButton: true }).then(r => { if (r.isConfirmed) { App.showLoader(); App.sendRequest({ action: "delete_role", nombre: roleName }, (res) => { App.hideLoader(); if (res.status === 'success') this.loadRoles(); }); } });
    }
};

const ModuloCupos = {
    renderSolicitud: function(cont) {
        cont.innerHTML = `
        <div class="col-12 card border-0 shadow-sm rounded-4 bg-white module-card anim-stagger-1 overflow-hidden mb-4">
            <div class="module-header bg-gradient-purple">
                <div class="d-flex align-items-center">
                    <div class="module-icon-box text-primary"><i class="bi bi-journal-bookmark-fill fs-4" style="color: #6f42c1;"></i></div>
                    <div><h5 class="fw-bold mb-0 text-white">Solicitud de Cupos</h5><small class="opacity-75 text-white">Formulario de registro institucional</small></div>
                </div>
            </div>
            <div class="p-4 p-md-5 pt-4">
                <div class="alert alert-warning border-0 rounded-4 mb-0 shadow-sm d-flex align-items-center">
                    <input class="form-check-input input-interactive me-3 fs-4 mt-0 cursor-pointer" type="checkbox" id="check-veracidad">
                    <label class="form-check-label small cursor-pointer" for="check-veracidad">
                        <strong>Términos y Condiciones:</strong> Declaro que la información aportada en este formulario es veraz y actualizada, comprendiendo la importancia de la misma para el control, gestión y administración por parte de la UE Libertador Bolívar. Soy consciente además de la responsabilidad civil relacionada con la calidad de los datos que aporto.
                    </label>
                </div>
            </div>
        </div>

        <form id="form-cupo" class="pb-5">
            <div class="card border-0 shadow-sm rounded-4 bg-white module-card anim-stagger-2 mb-4 overflow-hidden">
                <div class="bg-light p-3 border-bottom"><h6 class="text-primary fw-bold mb-0"><i class="bi bi-person-badge me-2"></i>Sección 2: Datos Representante Legal</h6></div>
                <div class="p-4 row g-4">
                    <div class="col-md-8"><label class="small fw-bold">Nombres y Apellidos (Representante) *</label><input type="text" id="rep_nombre" class="form-control input-interactive rounded-pill" required></div>
                    <div class="col-md-4"><label class="small fw-bold">Nacionalidad *</label><select id="rep_nacionalidad" class="form-select input-interactive rounded-pill" required><option value="">Seleccione...</option><option value="V">Venezolana (V)</option><option value="E">Extranjera (E)</option></select></div>
                    <div class="col-md-4"><label class="small fw-bold">N° de Cédula de Identidad *</label><input type="number" id="rep_cedula" class="form-control input-interactive rounded-pill" required></div>
                    <div class="col-md-4"><label class="small fw-bold">Correo Personal *</label><input type="email" id="rep_correo_p" class="form-control input-interactive rounded-pill" required></div>
                    <div class="col-md-4"><label class="small fw-bold">Correo de la Empresa</label><input type="email" id="rep_correo_e" class="form-control input-interactive rounded-pill"></div>
                    <div class="col-md-3"><label class="small fw-bold">Número de Teléfono 1 *</label><input type="text" id="rep_tel1" class="form-control input-interactive rounded-pill" placeholder="Ej: 0291-6510384 o 0416-6263890" required></div>
                    <div class="col-md-3"><label class="small fw-bold">Número de Teléfono 2</label><input type="text" id="rep_tel2" class="form-control input-interactive rounded-pill"></div>
                    <div class="col-md-3"><label class="small fw-bold">Tipo de Nómina *</label><select id="rep_nomina" class="form-select input-interactive rounded-pill" required><option value="">Seleccione...</option><option>Contractual</option><option>No Contractual</option><option>Jubilado</option></select></div>
                    <div class="col-md-3"><label class="small fw-bold">Negocio/Filial *</label><select id="rep_filial" class="form-select input-interactive rounded-pill" required><option value="">Seleccione...</option><option>Producción Oriente</option><option>PDVSA Servicios</option><option>CVP</option><option>PDVSA Gas</option><option>FAJA</option><option>Transporte Aéreo</option><option>Desarrollo Urbano</option><option>Auditoria Interna</option><option>BARIVEN</option><option>MINPET</option><option>OTROS</option></select></div>
                    <div class="col-md-6"><label class="small fw-bold">Organización/Gerencia *</label><input type="text" id="rep_gerencia" class="form-control input-interactive rounded-pill" required></div>
                    <div class="col-md-6"><label class="small fw-bold">Localidad de Trabajo *</label><input type="text" id="rep_localidad_t" class="form-control input-interactive rounded-pill" required></div>
                </div>
            </div>

            <div class="card border-0 shadow-sm rounded-4 bg-white module-card anim-stagger-3 mb-4 overflow-hidden">
                <div class="bg-light p-3 border-bottom"><h6 class="text-success fw-bold mb-0"><i class="bi bi-backpack me-2"></i>Sección 3: Datos del Estudiante</h6></div>
                <div class="p-4 row g-4">
                    <div class="col-md-8"><label class="small fw-bold">Nombres y Apellidos (Estudiante) *</label><input type="text" id="est_nombre" class="form-control input-interactive rounded-pill" required></div>
                    <div class="col-md-4"><label class="small fw-bold">N° de Cédula de Identidad o Escolar *</label><input type="text" id="est_id" class="form-control input-interactive rounded-pill" required></div>
                    <div class="col-md-3"><label class="small fw-bold">Género *</label><select id="est_genero" class="form-select input-interactive rounded-pill" required><option value="">Seleccione...</option><option>Masculino</option><option>Femenino</option></select></div>
                    <div class="col-md-3"><label class="small fw-bold">Fecha de Nacimiento *</label><input type="date" id="est_nacimiento" class="form-control input-interactive rounded-pill" required></div>
                    <div class="col-md-3"><label class="small fw-bold">Número de hijo en familia *</label><select id="est_hijo_num" class="form-select input-interactive rounded-pill" required><option value="">Seleccione...</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option><option>9</option><option>10</option></select></div>
                    <div class="col-md-3"><label class="small fw-bold">Parentesco *</label><select id="est_parentesco" class="form-select input-interactive rounded-pill" required><option value="">Seleccione...</option><option>Hijo o Hija</option><option>Sobrino o Sobrina</option><option>Nieto o Nieta</option><option>Hermano o Hermana</option></select></div>
                    <div class="col-md-6"><label class="small fw-bold">Grupo, Grado o Año a Cursar *</label><select id="est_grado" class="form-select input-interactive rounded-pill" required></select></div>
                    <div class="col-md-6"><label class="small fw-bold">Ruta y Parada Escolar *</label><input type="text" id="ruta_parada" class="form-control input-interactive rounded-pill" placeholder="Ej: Ruta 1 Puertas del Sur - Parada Doña Trina" required></div>
                    <div class="col-md-8"><label class="small fw-bold">Dirección de Habitación *</label><input type="text" id="dir_habitacion" class="form-control input-interactive rounded-pill" required></div>
                    <div class="col-md-4"><label class="small fw-bold">Localidad *</label><input type="text" id="localidad" class="form-control input-interactive rounded-pill" required></div>
                    
                    <div class="col-md-6">
                        <label class="small fw-bold d-block mb-2">Solicitudes realizadas en años anteriores</label>
                        <div id="container-prev-sol" class="bg-light p-3 rounded-4 border">
                            <span class="text-muted small">Cargando periodos...</span>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <label class="small fw-bold d-block mb-2">¿Tiene otro(a) representado(a) inscrito(a) en la UE Libertador Bolívar?</label>
                        <select id="prev_inscritos" class="form-select input-interactive rounded-pill"><option value="No">No</option><option value="Si">Sí</option></select>
                    </div>
                </div>
            </div>

            <div class="row g-4 mb-4">
                <div class="col-md-6 anim-stagger-4">
                    <div class="card border-0 shadow-sm rounded-4 bg-white module-card h-100 overflow-hidden">
                        <div class="bg-light p-3 border-bottom"><h6 class="text-magenta fw-bold mb-0" style="color: #E5007E;"><i class="bi bi-person-hearts me-2"></i>Sección 4: Datos de la Madre</h6></div>
                        <div class="p-4 row g-3">
                            <div class="col-12"><label class="small fw-bold">N° de Cédula de Identidad (Madre) *</label><input type="number" id="madre_id" class="form-control input-interactive rounded-pill" required></div>
                            <div class="col-12"><label class="small fw-bold">Nombres y Apellidos (Madre) *</label><input type="text" id="madre_nombre" class="form-control input-interactive rounded-pill" required></div>
                            <div class="col-12"><label class="small fw-bold">Número de Teléfono (Madre) *</label><input type="text" id="madre_tel" class="form-control input-interactive rounded-pill" required></div>
                            <div class="col-12"><label class="small fw-bold">Correo Electrónico (Madre) *</label><input type="email" id="madre_email" class="form-control input-interactive rounded-pill" required></div>
                            <div class="col-12"><label class="small fw-bold">¿Trabajadora de PDVSA? *</label><select id="madre_pdvsa" class="form-select input-interactive rounded-pill" required><option value="">Seleccione...</option><option value="No">No</option><option value="Si">Sí</option></select></div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 anim-stagger-4">
                    <div class="card border-0 shadow-sm rounded-4 bg-white module-card h-100 overflow-hidden">
                        <div class="bg-light p-3 border-bottom"><h6 class="text-info fw-bold mb-0" style="color: #0dcaf0;"><i class="bi bi-person-lines-fill me-2"></i>Sección 5: Datos del Padre</h6></div>
                        <div class="p-4 row g-3">
                            <div class="col-12"><label class="small fw-bold">N° de Cédula de Identidad (Padre) *</label><input type="number" id="padre_id" class="form-control input-interactive rounded-pill" required></div>
                            <div class="col-12"><label class="small fw-bold">Nombres y Apellidos (Padre) *</label><input type="text" id="padre_nombre" class="form-control input-interactive rounded-pill" required></div>
                            <div class="col-12"><label class="small fw-bold">Número de Teléfono (Padre) *</label><input type="text" id="padre_tel" class="form-control input-interactive rounded-pill" required></div>
                            <div class="col-12"><label class="small fw-bold">Correo Electrónico (Padre) *</label><input type="email" id="padre_email" class="form-control input-interactive rounded-pill" required></div>
                            <div class="col-12"><label class="small fw-bold">¿Trabajador de PDVSA? *</label><select id="padre_pdvsa" class="form-select input-interactive rounded-pill" required><option value="">Seleccione...</option><option value="No">No</option><option value="Si">Sí</option></select></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card border-0 shadow-sm rounded-4 bg-white module-card anim-stagger-5 overflow-hidden">
                <div class="p-4">
                    <label class="small fw-bold text-muted">Observaciones</label>
                    <textarea id="observaciones" class="form-control input-interactive rounded-4 mt-2" rows="3" placeholder="Texto de respuesta largo..."></textarea>
                    <div class="text-center mt-5 pt-3 border-top">
                        <button type="button" onclick="ModuloCupos.enviarSolicitud()" class="btn btn-primary-vibrant px-5 py-3 rounded-pill shadow-lg fw-bold btn-action" style="font-size:1.1rem; letter-spacing: 1px;">
                            <i class="bi bi-send-fill me-2"></i> ENVIAR SOLICITUD
                        </button>
                    </div>
                </div>
            </div>
        </form>`;
        this.cargarDatosDinamicos();
    },

    cargarDatosDinamicos: function() {
        const selGrado = document.getElementById('est_grado'); 
        if(selGrado) selGrado.innerHTML = '<option value="">Cargando grados...</option>';
        App.sendRequest({ action: "get_grades" }, (res) => { 
            if(res.grados && selGrado) {
                selGrado.innerHTML = '<option value="">Seleccione...</option>' + res.grados.map(g => `<option value="${g.nombre} (${g.nivel})">${g.nombre} (${g.nivel})</option>`).join('');
            }
        });

        const contPrevSol = document.getElementById('container-prev-sol');
        if(contPrevSol) contPrevSol.innerHTML = '<span class="text-muted small">Cargando periodos...</span>';
        App.sendRequest({ action: "get_school_config" }, (res) => {
            if(res.anios && contPrevSol) {
                let html = res.anios.map((a, i) => `
                    <div class="form-check mb-1">
                        <input class="form-check-input prev-sol cursor-pointer input-interactive" type="checkbox" value="${a.nombre}" id="ps${i}">
                        <label class="form-check-label small cursor-pointer" for="ps${i}">${a.nombre}</label>
                    </div>
                `).join('');
                html += `<div class="form-check mt-2 border-top pt-2"><input class="form-check-input prev-sol cursor-pointer input-interactive" type="checkbox" value="Ninguna" id="ps_none"><label class="form-check-label small cursor-pointer fw-bold" for="ps_none">Ninguna</label></div>`;
                contPrevSol.innerHTML = html;
            }
        });
    },

    enviarSolicitud: function() {
        if(!document.getElementById('check-veracidad').checked) return Swal.fire('Atención', 'Debe aceptar la declaración de veracidad al inicio del formulario.', 'warning');
        
        const inputs = document.querySelectorAll('#form-cupo input[type="text"], #form-cupo input[type="number"], #form-cupo input[type="email"], #form-cupo input[type="date"], #form-cupo select, #form-cupo textarea');
        const solicitud = {}; 
        let missing = false;
        
        inputs.forEach(i => { 
            if(i.required && !i.value) missing = true; 
            solicitud[i.id] = i.value; 
        });

        const prevSol = Array.from(document.querySelectorAll('.prev-sol:checked')).map(cb => cb.value).join(', ');
        solicitud['prev_solicitudes'] = prevSol || 'Ninguna';

        if(missing) return Swal.fire('Error', 'Complete todos los campos obligatorios marcados con (*).', 'error');
        
        App.showLoader();
        App.sendRequest({ action: "save_cupo_request", solicitud }, (res) => {
            App.hideLoader();
            if(res.status === "success") {
                Swal.fire('¡Recibido!', 'Su solicitud ha sido registrada exitosamente.', 'success').then(() => App.showDashboard());
            }
        });
    }
};