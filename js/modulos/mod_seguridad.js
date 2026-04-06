/**
 * MÓDULO: MI PERFIL
 * Este archivo maneja exclusivamente la vista "Mi Perfil".
 * ✨ INCLUYE AUDITORÍA ✨
 */

window.ModPerfil = {
    preguntasBase:[],
    
    init: function() {
        this.cargarDatos();
    },

    cargarDatos: function() {
        let cedula = window.Aplicacion.usuario.cedula;
        window.Aplicacion.mostrarCarga();
        
        window.Aplicacion.peticion({ action: 'get_my_profile', cedula: cedula }, (res) => {
            window.Aplicacion.ocultarCarga();
            if (res && res.status === 'success') {
                let p = res.perfil;
                this.preguntasBase = res.preguntas ||[];
                
                document.getElementById('perfil-nombre-display').innerText = p.nombre || 'Sin nombre';
                document.getElementById('perfil-cedula-display').innerText = cedula;
                document.getElementById('perfil-rol-display').innerText = p.rol || 'Sin rol';
                document.getElementById('perfil-email-display').innerText = p.email || 'No registrado';
                document.getElementById('perfil-telefono-display').innerText = p.telefono || 'No registrado';
                
                document.getElementById('perfil-nombre').value = p.nombre || '';
                document.getElementById('perfil-email').value = p.email || '';
                document.getElementById('perfil-telefono').value = p.telefono || '';
                
                this.llenarSelectsPreguntas(p.preg_1, p.preg_2);
            } else {
                Swal.fire('Error', 'No se pudo cargar la información de tu perfil.', 'error');
            }
        });
    },
    
    llenarSelectsPreguntas: async function(p1, p2) {
        let s1 = document.getElementById('perfil-preg1');
        let s2 = document.getElementById('perfil-preg2');
        let html = '<option value="">Seleccione una pregunta...</option>';
        try {
            const { data } = await window.supabaseDB.from('conf_preguntas_seguridad').select('pregunta').order('pregunta', { ascending: true });
            if (data && data.length > 0) { data.forEach(q => { html += `<option value="${q.pregunta}">${q.pregunta}</option>`; }); } else { html += '<option value="¿Color favorito?">¿Color favorito?</option>'; }
        } catch (e) {}
        if(s1) { s1.innerHTML = html; if(p1) s1.value = p1; }
        if(s2) { s2.innerHTML = html; if(p2) s2.value = p2; }
    },

    toggleClave: function() { let chk = document.getElementById('check-clave'); let bloque = document.getElementById('bloque-clave'); if(chk && bloque) { bloque.style.display = chk.checked ? 'flex' : 'none'; } },
    togglePreguntas: function() { let chk = document.getElementById('check-preguntas'); let bloque = document.getElementById('bloque-preguntas'); if(chk && bloque) { bloque.style.display = chk.checked ? 'flex' : 'none'; } },

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
        
        if (!payload.nombre) return Swal.fire('Atención', 'El Nombre Completo es obligatorio.', 'warning');
        
        if (payload.cambiar_clave) {
            payload.clave_actual = document.getElementById('perfil-clave-actual').value;
            payload.nueva_clave = document.getElementById('perfil-clave-nueva').value;
            let conf = document.getElementById('perfil-clave-confirmar').value;
            if (!payload.clave_actual || !payload.nueva_clave || !conf) return Swal.fire('Faltan Datos', 'Debe completar todos los campos de contraseña.', 'warning');
            if (payload.nueva_clave !== conf) return Swal.fire('Error', 'Las contraseñas nuevas no coinciden.', 'error');
            if(!/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#.])[A-Za-z\d@$!%*?&#.]{8,}$/.test(payload.nueva_clave)) return Swal.fire('Contraseña Débil', 'Debe tener al menos 8 caracteres, 1 mayúscula, 1 número y 1 símbolo especial.', 'error');
        }
        
        if (payload.cambiar_preguntas) {
            payload.preg_1 = document.getElementById('perfil-preg1').value;
            payload.resp_1 = document.getElementById('perfil-resp1').value.trim();
            payload.preg_2 = document.getElementById('perfil-preg2').value;
            payload.resp_2 = document.getElementById('perfil-resp2').value.trim();
            if (!payload.preg_1 || !payload.resp_1 || !payload.preg_2 || !payload.resp_2) return Swal.fire('Faltan Datos', 'Debe seleccionar y responder ambas preguntas de seguridad.', 'warning');
            if (payload.preg_1 === payload.preg_2) return Swal.fire('Error', 'Debe seleccionar dos preguntas de seguridad distintas.', 'error');
        }
        
        window.Aplicacion.mostrarCarga();
        window.Aplicacion.peticion(payload, (res) => {
            window.Aplicacion.ocultarCarga();
            if (res && res.status === 'success') {
                
                // ✨ AUDITORÍA ✨
                let acciones = [];
                if(payload.cambiar_clave) acciones.push("Contraseña");
                if(payload.cambiar_preguntas) acciones.push("Preguntas");
                let dest = acciones.length > 0 ? " (Incluyó cambio de: " + acciones.join(' y ') + ")" : "";
                window.Aplicacion.auditar('Mi Perfil', 'Actualizar Perfil', `El usuario actualizó sus datos${dest}.`);

                Swal.fire('¡Actualizado!', 'Tu perfil ha sido guardado exitosamente.', 'success').then(() => {
                    window.Aplicacion.usuario.nombre = res.nuevo_nombre || payload.nombre;
                    localStorage.setItem('sigae_usuario', JSON.stringify(window.Aplicacion.usuario));
                    let navNombre = document.getElementById('nombre-usuario-nav');
                    if(navNombre) navNombre.innerText = window.Aplicacion.usuario.nombre;
                    document.getElementById('perfil-clave-actual').value = '';
                    document.getElementById('perfil-clave-nueva').value = '';
                    document.getElementById('perfil-clave-confirmar').value = '';
                    document.getElementById('perfil-resp1').value = '';
                    document.getElementById('perfil-resp2').value = '';
                    document.getElementById('check-clave').checked = false;
                    document.getElementById('check-preguntas').checked = false;
                    this.toggleClave(); this.togglePreguntas();
                    this.cargarDatos();
                });
            } else {
                Swal.fire('Error', res ? res.message : 'Error al actualizar el perfil.', 'error');
            }
        });
    }
};

window.init_Mi_Perfil = function() { window.ModPerfil.init(); };