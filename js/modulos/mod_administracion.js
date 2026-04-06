/**
 * MÓDULO: ADMINISTRACIÓN MAESTRA
 * Control de Cierre de Sistema (Mantenimiento), Cerco de Beneficios y Promoción Masiva.
 */

window.ModAdministracion = {
    init: function() {
        if (!window.Aplicacion.usuario || !window.Aplicacion.usuario.rol.toLowerCase().includes('administrador')) {
            document.getElementById('area-dinamica').innerHTML = `<div class="alert alert-danger p-5 text-center mt-4 rounded-4 shadow-sm border-0"><i class="bi bi-shield-lock-fill fs-1 d-block mb-3 text-danger"></i><h4 class="fw-bold">Acceso Denegado</h4><p>Este panel es de uso exclusivo para la Administración Global.</p></div>`;
            return;
        }
        this.cargarConfiguraciones();
    },

    cargarConfiguraciones: async function() {
        window.Aplicacion.mostrarCarga();
        try {
            const { data, error } = await window.supabaseDB.from('conf_sistema').select('*');
            window.Aplicacion.ocultarCarga();
            if (error) throw error;

            data.forEach(conf => {
                if (conf.id_config === 'modo_mantenimiento') {
                    let chk = document.getElementById('switch-mantenimiento');
                    let bdg = document.getElementById('badge-mantenimiento');
                    if(chk) chk.checked = conf.valor_booleano;
                    this.actualizarUIBadge(bdg, conf.valor_booleano, 'bg-danger', 'bg-secondary', '<i class="bi bi-tools me-2"></i> En Mantenimiento (Bloqueado)', '<i class="bi bi-power me-2"></i> Sistema Operativo (Normal)');
                }
                if (conf.id_config === 'actualizacion_obligatoria') {
                    let chk = document.getElementById('switch-actualizacion');
                    let bdg = document.getElementById('badge-actualizacion');
                    if(chk) chk.checked = conf.valor_booleano;
                    this.actualizarUIBadge(bdg, conf.valor_booleano, 'bg-primary', 'bg-secondary', '<i class="bi bi-lock-fill me-2"></i> Cerco Activo (Obligatorio)', '<i class="bi bi-unlock-fill me-2"></i> Libre Tránsito (Desactivado)');
                }
            });
        } catch (e) {
            window.Aplicacion.ocultarCarga();
            console.error(e);
            Swal.fire('Error', 'No se pudo leer la configuración del sistema.', 'error');
        }
    },

    actualizarUIBadge: function(elemento, estado, claseOn, claseOff, textoOn, textoOff) {
        if(!elemento) return;
        if (estado) {
            elemento.className = `badge ${claseOn} px-3 py-2 fs-6 w-100 shadow-sm`;
            elemento.innerHTML = textoOn;
        } else {
            elemento.className = `badge ${claseOff} px-3 py-2 fs-6 w-100 shadow-sm`;
            elemento.innerHTML = textoOff;
        }
    },

    toggleConfig: async function(id_config, valor) {
        window.Aplicacion.mostrarCarga();
        try {
            const { error } = await window.supabaseDB.from('conf_sistema').update({ valor_booleano: valor }).eq('id_config', id_config);
            if (error) throw error;
            
            window.Aplicacion.auditar('Administración', 'Modificación de Sistema', `Cambió ${id_config} a ${valor}`);
            this.cargarConfiguraciones(); 
            
            if(id_config === 'modo_mantenimiento' && valor === true) {
                Swal.fire('¡Atención!', 'El sistema acaba de entrar en Mantenimiento. Cualquier usuario que no sea Administrador no podrá iniciar sesión.', 'warning');
            }
        } catch (e) {
            window.Aplicacion.ocultarCarga();
            Swal.fire('Error', 'Falla al guardar en la base de datos.', 'error');
            this.cargarConfiguraciones(); 
        }
    },

    promoverEstudiantes: async function() {
        const confirmacion = await Swal.fire({
            title: '¿Ejecutar la Promoción Escolar?',
            html: '<div class="text-start bg-light p-3 rounded text-danger border border-danger small fw-bold"><i class="bi bi-exclamation-triangle-fill me-1"></i> El sistema leerá el ORDEN de los grados y ascenderá a <b>todos los estudiantes</b> al grado siguiente.<br><br>Escriba <b>PROMOVER</b> para confirmar.</div>',
            input: 'text',
            inputPlaceholder: 'Escriba PROMOVER',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Ejecutar Ascensos Masivos'
        });

        if (!confirmacion.isConfirmed) return;
        if (confirmacion.value !== 'PROMOVER') {
            return Swal.fire('Cancelado', 'La palabra de seguridad no es correcta.', 'info');
        }

        window.Aplicacion.mostrarCarga();

        try {
            // 1. Obtener la escalera de grados ordenada matemáticamente (✨ CORRECCIÓN AQUÍ: select('valor, orden') ✨)
            const { data: grados, error: errGrados } = await window.supabaseDB.from('conf_grados').select('valor, orden').order('orden', { ascending: true });
            if (errGrados || !grados || grados.length === 0) throw new Error("No hay grados configurados o falta la columna 'orden'.");

            let mapaAscensos = {};
            for(let i = 0; i < grados.length - 1; i++) {
                // ✨ CORRECCIÓN AQUÍ: usamos .valor en lugar de .grado ✨
                mapaAscensos[grados[i].valor] = grados[i+1].valor;
            }
            // El grado más alto egresa
            mapaAscensos[grados[grados.length - 1].valor] = 'Egresado/Graduado';

            // 2. Obtener a todos los estudiantes activos
            // ⚠️ NOTA: Si tu tabla de estudiantes se llama distinto a 'expedientes', debes cambiar la palabra 'expedientes' aquí abajo.
            const { data: estudiantes, error: errEst } = await window.supabaseDB.from('expedientes').select('id, grado_actual').neq('grado_actual', 'Egresado/Graduado');
            if (errEst) throw errEst;

            let promoviendo = 0;
            let egresando = 0;

            // 3. Proceso masivo
            for (let est of estudiantes) {
                let gradoNuevo = mapaAscensos[est.grado_actual];
                if (gradoNuevo) {
                    await window.supabaseDB.from('expedientes').update({ grado_actual: gradoNuevo }).eq('id', est.id);
                    gradoNuevo === 'Egresado/Graduado' ? egresando++ : promoviendo++;
                }
            }

            window.Aplicacion.ocultarCarga();
            window.Aplicacion.auditar('Administración', 'Promoción Masiva', `Se ascendieron ${promoviendo} estudiantes y egresaron ${egresando}.`);
            
            Swal.fire({
                title: '¡Promoción Completada!',
                html: `<b>${promoviendo}</b> estudiantes fueron ascendidos al siguiente grado.<br><b>${egresando}</b> estudiantes culminaron su etapa y son Egresados.`,
                icon: 'success'
            });

        } catch (e) {
            window.Aplicacion.ocultarCarga();
            console.error(e);
            Swal.fire('Error Crítico', e.message || 'Falla al procesar la promoción masiva.', 'error');
        }
    }
};

window.init_Panel_de_Control = function() { window.ModAdministracion.init(); };