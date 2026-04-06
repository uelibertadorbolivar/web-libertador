/**
 * MÓDULO: PERFIL DE LA ESCUELA (Supabase Edition)
 * Gestiona la información institucional, misión, visión y PEIC.
 * ✨ INCLUYE AUDITORÍA ✨
 */

window.ModEscuela = {
    perfilId: null,

    init: function() {
        this.cargarPerfil();
    },

    cargarPerfil: async function() {
        window.Aplicacion.mostrarCarga();
        
        try {
            const { data, error } = await window.supabaseDB
                .from('perfil_escuela')
                .select('*')
                .limit(1)
                .maybeSingle();

            window.Aplicacion.ocultarCarga();
            if (error) throw error;

            if (data) {
                this.perfilId = data.id;
                
                let inNombre = document.getElementById('pe-nombre');
                if(inNombre) inNombre.value = data.nombre_institucion || '';
                
                let inDea = document.getElementById('pe-dea');
                if(inDea) inDea.value = data.codigo_dea || '';
                
                let inRif = document.getElementById('pe-rif');
                if(inRif) inRif.value = data.rif || '';
                
                let inDir = document.getElementById('pe-direccion');
                if(inDir) inDir.value = data.direccion || '';
                
                let inMision = document.getElementById('pe-mision');
                if(inMision) inMision.value = data.mision || '';
                
                let inVision = document.getElementById('pe-vision');
                if(inVision) inVision.value = data.vision || '';
                
                let inObj = document.getElementById('pe-objetivo');
                if(inObj) inObj.value = data.objetivo || '';
                
                let inPeic = document.getElementById('pe-peic');
                if(inPeic) inPeic.value = data.peic || '';
            }
        } catch (e) {
            window.Aplicacion.ocultarCarga();
            Swal.fire('Error', 'No se pudo cargar el perfil desde el servidor Supabase.', 'error');
        }
    },

    guardarPerfil: async function() {
        let nombre = document.getElementById('pe-nombre') ? document.getElementById('pe-nombre').value.trim() : '';
        let dea = document.getElementById('pe-dea') ? document.getElementById('pe-dea').value.trim() : '';
        let rif = document.getElementById('pe-rif') ? document.getElementById('pe-rif').value.trim() : '';
        let dir = document.getElementById('pe-direccion') ? document.getElementById('pe-direccion').value.trim() : '';
        let mision = document.getElementById('pe-mision') ? document.getElementById('pe-mision').value.trim() : '';
        let vision = document.getElementById('pe-vision') ? document.getElementById('pe-vision').value.trim() : '';
        let obj = document.getElementById('pe-objetivo') ? document.getElementById('pe-objetivo').value.trim() : '';
        let peic = document.getElementById('pe-peic') ? document.getElementById('pe-peic').value.trim() : '';

        if(!nombre || !dea) {
            return Swal.fire('Atención', 'El nombre de la institución y el código DEA son obligatorios.', 'warning');
        }

        window.Aplicacion.mostrarCarga();

        const payload = {
            nombre_institucion: nombre,
            codigo_dea: dea,
            rif: rif,
            direccion: dir,
            mision: mision,
            vision: vision,
            objetivo: obj,
            peic: peic
        };

        try {
            let errorGuardado;

            if (this.perfilId) {
                const { error } = await window.supabaseDB.from('perfil_escuela').update(payload).eq('id', this.perfilId);
                errorGuardado = error;
            } else {
                this.perfilId = 'PERFIL-BASE';
                payload.id = this.perfilId;
                const { error } = await window.supabaseDB.from('perfil_escuela').insert([payload]);
                errorGuardado = error;
            }

            window.Aplicacion.ocultarCarga();
            if (errorGuardado) throw errorGuardado;

            Swal.fire({
                toast: true, position: 'top-end', icon: 'success', title: 'Perfil actualizado exitosamente', showConfirmButton: false, timer: 2000
            });
            
            // ✨ REGISTRO EN AUDITORÍA ✨
            window.Aplicacion.auditar('Perfil de la Escuela', 'Actualizar Perfil', `Se actualizaron los datos base de la institución (DEA: ${dea}).`);

        } catch(e) {
            window.Aplicacion.ocultarCarga();
            Swal.fire('Error', 'Falla al guardar los datos en el servidor.', 'error');
        }
    }
};

window.init_Perfil_de_la_Escuela = function() { window.ModEscuela.init(); };