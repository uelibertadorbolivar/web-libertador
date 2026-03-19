/**
 * MÓDULO: ACTUALIZACIÓN DE DATOS (WIZARD ESTUDIANTES)
 * Gestiona el mega formulario conectándose a DB Empresa, Transporte y DB División Política (Excel)
 */

window.ModActualizacion = {
    pasoActual: 1,
    totalPasos: 6,
    datosEmpresa:[],
    rutasTransporte:[],
    paradasTransporte: [],
    diccionarioVzla: {},

    init: function() {
        this.pasoActual = 1;
        this.generarCodigoUnico();
        this.actualizarUI();
        this.cargarDiccionarios();
    },

    generarCodigoUnico: function() {
        const ahora = window.Aplicacion && window.Aplicacion.obtenerFechaReal 
                      ? window.Aplicacion.obtenerFechaReal().getTime() 
                      : new Date().getTime();
                      
        const codigoAuto = "EST-" + ahora.toString().substring(3);
        const inputCodigo = document.getElementById('est-codigo');
        if(inputCodigo) inputCodigo.value = codigoAuto;
    },

    construirDiccionarioGeografico: function(datosPlanos) {
        let dicc = {};
        datosPlanos.forEach(fila => {
            let e = fila.estado;
            let m = fila.municipio;
            let p = fila.parroquia;

            if(e && m && p) {
                e = String(e).trim(); m = String(m).trim(); p = String(p).trim();
                if(!dicc[e]) dicc[e] = {};
                if(!dicc[e][m]) dicc[e][m] =[];
                if(!dicc[e][m].includes(p)) dicc[e][m].push(p);
            }
        });
        this.diccionarioVzla = dicc;
    },

    cambiarNacionalidad: function() {
        const nacion = document.getElementById('est-nacionalidad').value;
        const bloqVzla = document.getElementById('bloque-venezolano');
        const bloqExt = document.getElementById('bloque-extranjero');

        if(nacion === "Venezolana") {
            bloqExt.style.display = "none";
            bloqVzla.style.display = "block";
            this.cargarEstados();
        } else if (nacion === "Extranjera") {
            bloqVzla.style.display = "none";
            bloqExt.style.display = "block";
        } else {
            bloqVzla.style.display = "none";
            bloqExt.style.display = "none";
        }
    },

    cargarEstados: function() {
        const selEstado = document.getElementById('est-estado');
        if(!selEstado) return;
        let estados = Object.keys(this.diccionarioVzla).sort();
        let html = '<option value="">Seleccione Estado...</option>';
        if(estados.length === 0) {
            html = '<option value="">No hay datos cargados en el Excel</option>';
        } else {
            estados.forEach(estado => { html += `<option value="${estado}">${estado}</option>`; });
        }
        selEstado.innerHTML = html;
        document.getElementById('est-municipio').disabled = true;
        document.getElementById('est-municipio').innerHTML = '<option value="">Estado primero...</option>';
        document.getElementById('est-parroquia').disabled = true;
        document.getElementById('est-parroquia').innerHTML = '<option value="">Municipio primero...</option>';
    },

    cargarMunicipios: function() {
        const estado = document.getElementById('est-estado').value;
        const selMuni = document.getElementById('est-municipio');
        if(!estado) {
            selMuni.disabled = true;
            selMuni.innerHTML = '<option value="">Estado primero...</option>';
            return;
        }
        let html = '<option value="">Seleccione Municipio...</option>';
        let municipios = Object.keys(this.diccionarioVzla[estado]).sort();
        municipios.forEach(muni => { html += `<option value="${muni}">${muni}</option>`; });
        selMuni.innerHTML = html;
        selMuni.disabled = false;
        document.getElementById('est-parroquia').disabled = true;
        document.getElementById('est-parroquia').innerHTML = '<option value="">Municipio primero...</option>';
    },

    cargarParroquias: function() {
        const estado = document.getElementById('est-estado').value;
        const muni = document.getElementById('est-municipio').value;
        const selParroquia = document.getElementById('est-parroquia');
        if(!muni) {
            selParroquia.disabled = true;
            selParroquia.innerHTML = '<option value="">Municipio primero...</option>';
            return;
        }
        let html = '<option value="">Seleccione Parroquia...</option>';
        let parroquias = this.diccionarioVzla[estado][muni].sort();
        parroquias.forEach(parr => { html += `<option value="${parr}">${parr}</option>`; });
        selParroquia.innerHTML = html;
        selParroquia.disabled = false;
    },

    // ✨ FUNCIÓN COMPLETADA SIN CORTE ABRUPTO ✨
    cargarDiccionarios: function() {
        window.Aplicacion.mostrarCarga();
        window.Aplicacion.peticion({ action: "get_empresa" }, (resEmp) => {
            if(resEmp && (resEmp.status === "success" || resEmp.data)) {
                this.datosEmpresa = resEmp.data ||[];
                this.llenarSelect('Parentesco', 'rep-parentesco');
                this.llenarSelect('Condición', 'corp-condicion');
                this.llenarSelect('Nómina', 'corp-nomina');
                this.llenarSelect('Negocio/Filial', 'corp-filial');
                this.llenarSelect('Organización/Gerencia', 'corp-gerencia');
            }
            window.Aplicacion.peticion({ action: "get_transporte_data" }, (resTrans) => {
                if(resTrans && resTrans.status === "success") {
                    this.rutasTransporte = resTrans.rutas ||[];
                    this.paradasTransporte = resTrans.paradas ||[];
                    this.llenarSelectRutas();
                }
                window.Aplicacion.peticion({ action: "get_divpol" }, (resDiv) => {
                    window.Aplicacion.ocultarCarga();
                    if(resDiv && (resDiv.status === "success" || resDiv.data)) {
                        this.construirDiccionarioGeografico(resDiv.data || []);
                    }
                });
            });
        });
    },

    llenarSelect: function(categoria, idElemento) {
        const select = document.getElementById(idElemento);
        if(!select) return;
        const filtrados = this.datosEmpresa.filter(d => d.categoria === categoria && d.estado === 'Activo');
        select.innerHTML = '<option value="">Seleccione...</option>' + filtrados.map(d => `<option value="${d.nombre}">${d.nombre}</option>`).join('');
    },

    llenarSelectRutas: function() {
        const sel = document.getElementById('est-ruta');
        if(!sel) return;
        let html = '<option value="No requiere">No requiere transporte</option>';
        this.rutasTransporte.forEach(r => { let idSeguro = r.id_ruta ? r.id_ruta : r.nombre_ruta; html += `<option value="${idSeguro}">${r.nombre_ruta}</option>`; });
        sel.innerHTML = html;
    },

    filtrarParadas: function() {
        const idRuta = document.getElementById('est-ruta').value;
        const selParada = document.getElementById('est-parada');
        if(!idRuta || idRuta === "No requiere") { selParada.innerHTML = '<option value="No aplica">No aplica...</option>'; selParada.disabled = true; return; }
        
        let ruta = this.rutasTransporte.find(r => String(r.id_ruta) === String(idRuta) || String(r.nombre_ruta) === String(idRuta));
        if(ruta) {
            if(ruta.paradas_json && ruta.paradas_json.trim() !== "") {
                try {
                    let arrayIds = typeof ruta.paradas_json === "string" ? JSON.parse(ruta.paradas_json) : ruta.paradas_json;
                    if (Array.isArray(arrayIds) && arrayIds.length > 0) {
                        let html = '<option value="">Seleccione una parada...</option>';
                        arrayIds.forEach(id => { 
                            let paradaObj = this.paradasTransporte.find(p => String(p.id_parada) === String(id));
                            if(paradaObj) html += `<option value="${paradaObj.id_parada}">${paradaObj.nombre_parada}</option>`; 
                        });
                        selParada.innerHTML = html === '<option value="">Seleccione una parada...</option>' ? '<option value="Sin paradas">Paradas no localizadas</option>' : html;
                        selParada.disabled = false;
                    } else { selParada.innerHTML = '<option value="Sin paradas">La ruta no tiene paradas registradas</option>'; selParada.disabled = false; }
                } catch(e) { selParada.innerHTML = '<option value="">Error de lectura</option>'; selParada.disabled = true; }
            } else { selParada.innerHTML = '<option value="Directa">Ruta Directa (Sin paradas)</option>'; selParada.disabled = false; }
        } else { selParada.innerHTML = '<option value="">Error: Ruta no encontrada</option>'; selParada.disabled = true; }
    },

    irAPaso: function(pasoDestino) {
        if (pasoDestino === this.pasoActual) return;
        document.getElementById(`paso-${this.pasoActual}`).style.display = 'none';
        for(let i=1; i<=this.totalPasos; i++) {
            let btnNum = document.getElementById(`step-indicator-${i}`);
            if(btnNum) {
                if(i < pasoDestino) { btnNum.classList.add('completado'); btnNum.classList.remove('activo'); } 
                else if (i === pasoDestino) { btnNum.classList.add('activo'); btnNum.classList.remove('completado'); } 
                else { btnNum.classList.remove('activo', 'completado'); }
            }
        }
        this.pasoActual = pasoDestino;
        let elDestino = document.getElementById(`paso-${this.pasoActual}`);
        if(elDestino) elDestino.style.display = 'block';
        this.actualizarUI();
    },

    cambiarPaso: function(direccion) { this.irAPaso(this.pasoActual + direccion); },

    actualizarUI: function() {
        let prev = document.getElementById('btn-est-prev');
        let next = document.getElementById('btn-est-next');
        let save = document.getElementById('btn-est-save');
        if(prev) prev.style.display = this.pasoActual === 1 ? 'none' : 'block';
        if(next && save) {
            if (this.pasoActual === this.totalPasos) { next.style.display = 'none'; save.style.display = 'block'; } 
            else { next.style.display = 'block'; save.style.display = 'none'; }
        }
    },

    guardarExpediente: function() {
        Swal.fire({
            icon: 'info',
            title: 'En Construcción',
            text: 'El guardado de actualización de datos se encuentra en fase de programación.'
        });
    }
};

// ✨ PUENTE PARA EL ENRUTADOR ✨
window.init_Actualizacion_de_Datos = function() { window.ModActualizacion.init(); };