/**
 * MÓDULO: ACTUALIZACIÓN DE DATOS (WIZARD ESTUDIANTES)
 * Gestiona el mega formulario conectándose a DB Empresa, Transporte y DB División Política (Excel)
 */

window.ModActualizacion = {
    pasoActual: 1,
    totalPasos: 6,
    datosEmpresa: [],
    rutasTransporte: [],
    diccionarioVzla: {},

    init: function() {
        this.pasoActual = 1;
        this.generarCodigoUnico();
        this.actualizarUI();
        this.cargarDiccionarios();
    },

    generarCodigoUnico: function() {
        const codigoAuto = "EST-" + new Date().getTime().toString().substring(3);
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
                if(!dicc[e][m]) dicc[e][m] = [];
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

    cargarDiccionarios: function() {
        window.Aplicacion.mostrarCarga();
        window.Aplicacion.peticion({ action: "get_empresa" }, (resEmp) => {
            if(resEmp && (resEmp.status === "success" || resEmp.data)) {
                this.datosEmpresa = resEmp.data || [];
                this.llenarSelect('Parentesco', 'rep-parentesco');
                this.llenarSelect('Condición', 'corp-condicion');
                this.llenarSelect('Nómina', 'corp-nomina');
                this.llenarSelect('Negocio/Filial', 'corp-filial');
                this.llenarSelect('Organización/Gerencia', 'corp-gerencia');
            }
            window.Aplicacion.peticion({ action: "get_transporte_data" }, (resTrans) => {
                if(resTrans && resTrans.status === "success") {
                    this.rutasTransporte = resTrans.rutas || [];
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
        let select = document.getElementById(idElemento);
        if(!select) return;
        let filtrados = this.datosEmpresa.filter(d => d.categoria === categoria);
        let html = '<option value="">Seleccione...</option>';
        filtrados.forEach(item => { html += `<option value="${item.nombre}">${item.nombre}</option>`; });
        select.innerHTML = html;
    },

    llenarSelectRutas: function() {
        let select = document.getElementById('log-ruta');
        if(!select) return;
        let html = '<option value="">Ninguna / No usa transporte</option>';
        this.rutasTransporte.forEach(ruta => { html += `<option value="${ruta.id_ruta}">${ruta.nombre_ruta} (Chofer: ${ruta.chofer})</option>`; });
        select.innerHTML = html;
    },

    filtrarParadas: function() {
        let idRuta = document.getElementById('log-ruta').value;
        let selParada = document.getElementById('log-parada');
        selParada.innerHTML = '<option value="">Seleccione...</option>';
        if(!idRuta) { selParada.disabled = true; return; }
        selParada.disabled = false;
        let rutaObj = this.rutasTransporte.find(r => String(r.id_ruta) === String(idRuta));
        if(rutaObj && rutaObj.paradas_json) {
            try {
                let paradas = JSON.parse(rutaObj.paradas_json);
                paradas.forEach(p => { selParada.innerHTML += `<option value="${p.id}">${p.nombre}</option>`; });
            } catch(e) {}
        }
    },

    cambiarPaso: function(direccion) {
        if(direccion === 1) {
            if(this.pasoActual === 1) {
                if(!document.getElementById('est-cedula').value) return Swal.fire('Atención', 'La Cédula Escolar o Identidad es obligatoria para continuar.', 'warning');
                if(!document.getElementById('est-nacionalidad').value) return Swal.fire('Atención', 'Debe indicar la Nacionalidad del estudiante.', 'warning');
                
                if(document.getElementById('est-nacionalidad').value === "Venezolana") {
                    if(!document.getElementById('est-estado').value || !document.getElementById('est-municipio').value || !document.getElementById('est-sector-vzla').value) {
                        return Swal.fire('Atención', 'Debe completar la dirección de origen (Estado, Municipio y Sector).', 'warning');
                    }
                }
            }
            if(this.pasoActual === 3 && !document.getElementById('rep-cedula').value) return Swal.fire('Atención', 'La Cédula del Representante es obligatoria.', 'warning');
        }

        document.getElementById(`paso-${this.pasoActual}`).classList.remove('activo');
        
        this.pasoActual += direccion;
        if(this.pasoActual < 1) this.pasoActual = 1;
        if(this.pasoActual > this.totalPasos) this.pasoActual = this.totalPasos;

        document.getElementById(`paso-${this.pasoActual}`).classList.add('activo');
        this.actualizarUI();
    },

    actualizarUI: function() {
        document.getElementById('btn-prev').style.display = (this.pasoActual === 1) ? 'none' : 'inline-block';
        
        if(this.pasoActual === this.totalPasos) {
            document.getElementById('btn-next').style.display = 'none';
            document.getElementById('btn-save').style.display = 'inline-block';
        } else {
            document.getElementById('btn-next').style.display = 'inline-block';
            document.getElementById('btn-save').style.display = 'none';
        }

        for(let i = 1; i <= this.totalPasos; i++) {
            let ind = document.getElementById(`ind-${i}`);
            ind.className = 'wizard-step';
            if(i < this.pasoActual) ind.classList.add('completado');
            if(i === this.pasoActual) ind.classList.add('activo');
        }
    },

    // ✨ EL CEREBRO DEL GUARDADO ✨
    guardarActualizacion: function() {
        if(!document.getElementById('legal-contrato').checked) {
            return Swal.fire('Términos Legales', 'Debe aceptar el contrato digital para guardar la información.', 'warning');
        }

        // Determinar qué dirección enviar según nacionalidad
        let nac = document.getElementById('est-nacionalidad').value;
        let direccionFinal = "";
        let estadoStr = "", municipioStr = "", parroquiaStr = "";
        
        if(nac === "Venezolana") {
            estadoStr = document.getElementById('est-estado').value;
            municipioStr = document.getElementById('est-municipio').value;
            parroquiaStr = document.getElementById('est-parroquia').value;
            direccionFinal = document.getElementById('est-sector-vzla').value;
        } else {
            direccionFinal = document.getElementById('est-direccion-ext').value;
        }

        // Construir paquete de datos
        const payload = {
            action: 'save_estudiante',
            codigo_unico: document.getElementById('est-codigo').value,
            nombres: document.getElementById('est-nombres').value,
            apellidos: document.getElementById('est-apellidos').value,
            cedula: document.getElementById('est-cedula').value,
            fecha_nac: document.getElementById('est-nacimiento').value,
            genero: document.getElementById('est-genero').value,
            nacionalidad: nac,
            estado: estadoStr,
            municipio: municipioStr,
            parroquia: parroquiaStr,
            direccion_origen: direccionFinal,
            
            talla_franela: document.getElementById('est-talla-franela').value,
            talla_pantalon: document.getElementById('est-talla-pantalon').value,
            talla_zapato: document.getElementById('est-talla-zapato').value,
            estatura: document.getElementById('est-estatura').value,
            peso: document.getElementById('est-peso').value,
            condicion_medica: document.getElementById('est-medico').value,
            pc: document.getElementById('est-pc').value,
            internet: document.getElementById('est-internet').value,
            
            rep_nombres: document.getElementById('rep-nombres').value,
            rep_cedula: document.getElementById('rep-cedula').value,
            rep_parentesco: document.getElementById('rep-parentesco').value,
            rep_telefono: document.getElementById('rep-telefono').value,
            rep_direccion: document.getElementById('rep-direccion').value,
            
            corp_condicion: document.getElementById('corp-condicion').value,
            corp_nomina: document.getElementById('corp-nomina').value,
            corp_filial: document.getElementById('corp-filial').value,
            corp_gerencia: document.getElementById('corp-gerencia').value,
            
            id_ruta_transporte: document.getElementById('log-ruta').value,
            id_parada_transporte: document.getElementById('log-parada').value
        };

        window.Aplicacion.mostrarCarga();
        
        window.Aplicacion.peticion(payload, (res) => {
            window.Aplicacion.ocultarCarga();
            if(res && res.status === "success") {
                Swal.fire({
                    title: '¡Expediente Guardado!',
                    text: 'Toda la sábana de datos se ha registrado con éxito en la base de datos.',
                    icon: 'success',
                    confirmButtonColor: '#8B5CF6'
                }).then(() => {
                    // Limpiar el formulario y regresar al paso 1
                    document.getElementById('form-actualizacion').reset();
                    this.init();
                });
            } else {
                Swal.fire('Error', res ? res.message : 'No se pudo guardar el expediente.', 'error');
            }
        });
    }
};

window.init_Actualizacion_de_Datos = function() { window.ModActualizacion.init(); };
window.init_Actualización_de_Datos = function() { window.ModActualizacion.init(); };