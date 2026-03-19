/**
 * MÓDULO: MI PERFIL (Antes mod_seguridad.js)
 * Este archivo maneja exclusivamente la vista "Mi Perfil".
 * Al quitar las referencias a Usuarios y Roles, esos módulos ahora 
 * funcionarán correctamente con sus propios archivos (mod_usuarios y mod_roles).
 */

window.ModPerfil = {
    preguntasBase:[],
    
    init: function() {
        this.cargarDatos();
    },

    cargarDatos: function() {
        let cedula = window.Aplicacion.usuario.cedula;
        window.Aplicacion.mostrarCarga();
        
        // Pedimos los datos del perfil al backend
        window.Aplicacion.peticion({ action: 'get_my_profile', cedula: cedula }, (res) => {
            window.Aplicacion.ocultarCarga();
            
            if (res && res.status === 'success') {
                let p = res.perfil;
                this.preguntasBase = res.preguntas ||[];
                
                // 1. Llenar Tarjeta de Visualización
                document.getElementById('perfil-nombre-display').innerText = p.nombre || 'Sin nombre';
                document.getElementById('perfil-cedula-display').innerText = cedula;
                document.getElementById('perfil-rol-display').innerText = p.rol || 'Sin rol';
                document.getElementById('perfil-email-display').innerText = p.email || 'No registrado';
                document.getElementById('perfil-telefono-display').innerText = p.telefono || 'No registrado';
                
                // 2. Llenar Inputs del Formulario
                document.getElementById('perfil-nombre').value = p.nombre || '';
                document.getElementById('perfil-email').value = p.email || '';
                document.getElementById('perfil-telefono').value = p.telefono || '';
                
                // 3. Llenar los Selectores de Preguntas de Seguridad
                this.llenarSelectsPreguntas(p.preg_1, p.preg_2);
            } else {
                Swal.fire('Error', 'No se pudo cargar la información de tu perfil.', 'error');
            }
        });
    },
    
    llenarSelectsPreguntas: function(p1, p2) {
        let s1 = document.getElementById('perfil-preg1');
        let s2 = document.getElementById('perfil-preg2');
        
        let html = '<option value="">Seleccione una pregunta...</option>';
        
        // Si el sistema aún no tiene preguntas guardadas, ponemos unas por defecto
        if(this.preguntasBase.length === 0) {
            html += '<option value="¿Color favorito?">¿Color favorito?</option>';
            html += '<option value="¿Nombre de tu primera mascota?">¿Nombre de tu primera mascota?</option>';
            html += '<option value="¿Ciudad donde nacieron tus padres?">¿Ciudad donde nacieron tus padres?</option>';
        } else {
            this.preguntasBase.forEach(q => {
                html += `<option value="${q}">${q}</option>`;
            });
        }
        
        if(s1) { s1.innerHTML = html; if(p1) s1.value = p1; }
        if(s2) { s2.innerHTML = html; if(p2) s2.value = p2; }
    },

    toggleClave: function() {
        let chk = document.getElementById('check-clave');
        let bloque = document.getElementById('bloque-clave');
        if(chk && bloque) {
            bloque.style.display = chk.checked ? 'flex' : 'none';
        }
    },

    togglePreguntas: function() {
        let chk = document.getElementById('check-preguntas');
        let bloque = document.getElementById('bloque-preguntas');
        if(chk && bloque) {
            bloque.style.display = chk.checked ? 'flex' : 'none';
        }
    },

    guardarCambios: function() {
        let payload = {
            action: 'update_my_profile',
            cedula: window.Aplicacion.usuario.cedula,
            nombre: document.getElementById('perfil-nombre').value.trim(),
            email: document.getElementById('perfil-email').value.trim(),
            telefono: document.getElementById('perfil-telefono').value.trim(),
            cambiar_clave: document.getElementById('check-clave').checked,
            cambiar_preguntas: document.getElementById('check-preguntas').checked
        };
        
        // Validaciones base
        if (!payload.nombre) return Swal.fire('Atención', 'El Nombre Completo es obligatorio.', 'warning');
        
        // Validaciones si quiere cambiar contraseña
        if (payload.cambiar_clave) {
            payload.clave_actual = document.getElementById('perfil-clave-actual').value;
            payload.nueva_clave = document.getElementById('perfil-clave-nueva').value;
            let conf = document.getElementById('perfil-clave-confirmar').value;
            
            if (!payload.clave_actual || !payload.nueva_clave || !conf) {
                return Swal.fire('Faltan Datos', 'Debe completar todos los campos de contraseña.', 'warning');
            }
            if (payload.nueva_clave !== conf) {
                return Swal.fire('Error', 'Las contraseñas nuevas no coinciden.', 'error');
            }
            // Expresión regular para contraseña fuerte
            if(!/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#.])[A-Za-z\d@$!%*?&#.]{8,}$/.test(payload.nueva_clave)) {
                return Swal.fire('Contraseña Débil', 'Debe tener al menos 8 caracteres, 1 mayúscula, 1 número y 1 símbolo especial.', 'error');
            }
        }
        
        // Validaciones si quiere cambiar preguntas
        if (payload.cambiar_preguntas) {
            payload.preg_1 = document.getElementById('perfil-preg1').value;
            payload.resp_1 = document.getElementById('perfil-resp1').value.trim();
            payload.preg_2 = document.getElementById('perfil-preg2').value;
            payload.resp_2 = document.getElementById('perfil-resp2').value.trim();
            
            if (!payload.preg_1 || !payload.resp_1 || !payload.preg_2 || !payload.resp_2) {
                return Swal.fire('Faltan Datos', 'Debe seleccionar y responder ambas preguntas de seguridad.', 'warning');
            }
            if (payload.preg_1 === payload.preg_2) {
                return Swal.fire('Error', 'Debe seleccionar dos preguntas de seguridad distintas.', 'error');
            }
        }
        
        window.Aplicacion.mostrarCarga();
        
        window.Aplicacion.peticion(payload, (res) => {
            window.Aplicacion.ocultarCarga();
            
            if (res && res.status === 'success') {
                Swal.fire('¡Actualizado!', 'Tu perfil ha sido guardado exitosamente.', 'success').then(() => {
                    // Actualizar el nombre en la sesión del navegador
                    window.Aplicacion.usuario.nombre = res.nuevo_nombre || payload.nombre;
                    localStorage.setItem('sigae_usuario', JSON.stringify(window.Aplicacion.usuario));
                    
                    // Actualizar nombre en el Header Global
                    let navNombre = document.getElementById('nombre-usuario-nav');
                    if(navNombre) navNombre.innerText = window.Aplicacion.usuario.nombre;
                    
                    // Limpiar campos sensibles por seguridad
                    document.getElementById('perfil-clave-actual').value = '';
                    document.getElementById('perfil-clave-nueva').value = '';
                    document.getElementById('perfil-clave-confirmar').value = '';
                    document.getElementById('perfil-resp1').value = '';
                    document.getElementById('perfil-resp2').value = '';
                    
                    // Apagar los switches
                    document.getElementById('check-clave').checked = false;
                    document.getElementById('check-preguntas').checked = false;
                    this.toggleClave();
                    this.togglePreguntas();
                    
                    // Refrescar la tarjeta
                    this.cargarDatos();
                });
            } else {
                Swal.fire('Error', res ? res.message : 'Error al actualizar el perfil.', 'error');
            }
        });
    }
};

// Vinculación ESTRICTA con el Enrutador para el submódulo "Mi Perfil"
window.init_Mi_Perfil = function() { 
    window.ModPerfil.init(); 
};