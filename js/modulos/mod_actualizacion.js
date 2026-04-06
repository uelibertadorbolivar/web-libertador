/**
 * MÓDULO: ACTUALIZACIÓN DE DATOS (WIZARD ESTUDIANTES)
 * Actualiza directamente las columnas de la tabla 'expedientes'.
 * ✨ INCLUYE AUTO-COPIADO DE PADRES, DIRECCIONES Y LECTURA INVERSA ✨
 */

window.ModActualizacion = {
    pasoActual: 1,
    totalPasos: 6,
    datosEmpresa: [],
    rutasTransporte: [],
    paradasTransporte: [],
    diccionarioVzla: {},
    misEstudiantes: [],
    estudianteActivo: null,
    timeoutDireccion: null,

    init: function() {
        if (!window.Aplicacion.permiso('Actualización de Datos', 'ver')) {
            let contenedor = document.getElementById('fase-selector');
            if (contenedor) {
                contenedor.innerHTML = `
                <div class="col-12 text-center py-5 animate__animated animate__fadeIn mt-5">
                    <div class="bg-light d-inline-flex justify-content-center align-items-center rounded-circle mb-3 shadow-sm border" style="width: 100px; height: 100px;">
                        <i class="bi bi-shield-lock-fill text-muted" style="font-size: 3.5rem;"></i>
                    </div>
                    <h4 class="text-dark fw-bold mb-2">Área Restringida</h4>
                    <p class="text-muted mb-0">No tienes permisos asignados para visualizar el módulo de Actualización de Datos.</p>
                </div>`;
            }
            return; 
        }

        this.pasoActual = 1;
        this.cargarDiccionarios();
        this.aplicarEventosFormateo();
    },

    cargarDiccionarios: async function() {
        let cedulaUsr = window.Aplicacion.usuario ? String(window.Aplicacion.usuario.cedula) : "";
        window.Aplicacion.mostrarCarga();
        
        try {
            const [empRes, rutRes, parRes, divRes, estRes] = await Promise.all([
                window.supabaseDB.from('diccionarios_empresa').select('*'),
                window.supabaseDB.from('rutas').select('*'),
                window.supabaseDB.from('paradas').select('*'),
                window.supabaseDB.from('div_pol_vzla').select('*'),
                window.supabaseDB.from('expedientes').select('*').eq('rep_cedula', cedulaUsr)
            ]);

            window.Aplicacion.ocultarCarga();

            this.datosEmpresa = empRes.data || [];
            this.rutasTransporte = rutRes.data || [];
            this.paradasTransporte = parRes.data || [];
            this.misEstudiantes = estRes.data || [];
            
            this.construirDiccionarioGeografico(divRes.data || []);
            
            this.llenarSelect('Parentesco', 'rep-parentesco');
            this.llenarSelect('Condición', 'corp-condicion');
            this.llenarSelect('Nómina', 'corp-nomina');
            this.llenarSelect('Negocio/Filial', 'corp-filial');
            this.llenarSelect('Organización/Gerencia', 'corp-gerencia');
            this.llenarSelectRutas();
            this.cargarEstadosUI(); 
            
            this.renderizarSelectorEstudiantes();

        } catch (error) {
            window.Aplicacion.ocultarCarga();
            console.error("Error al armar diccionarios:", error);
            document.getElementById('contenedor-tarjetas-estudiantes').innerHTML = `<div class="col-12 text-center py-5"><h4 class="text-danger fw-bold">Error de conexión</h4></div>`;
        }
    },

    renderizarSelectorEstudiantes: function() {
        let divSpinner = document.getElementById('cargando-estudiantes');
        if(divSpinner) divSpinner.style.display = 'none';
        
        const contenedor = document.getElementById('contenedor-tarjetas-estudiantes');
        if(!contenedor) return;

        if (this.misEstudiantes.length === 0) {
            contenedor.innerHTML = `
            <div class="col-12 text-center py-5 animate__animated animate__fadeIn">
                <div class="bg-light d-inline-flex justify-content-center align-items-center rounded-circle mb-3" style="width: 100px; height: 100px;">
                    <i class="bi bi-person-x text-muted" style="font-size: 3.5rem;"></i>
                </div>
                <h4 class="text-dark fw-bold mb-2">Usted no tiene estudiantes registrados en el sistema</h4>
                <p class="text-muted mb-0">Si considera que esto es un error, por favor diríjase al departamento de Control de Estudios.</p>
            </div>`;
            return;
        }

        let html = '';
        this.misEstudiantes.forEach((est, index) => {
            let nivel = est.nivel_educativo || "No asignado";
            let gradoSec = (est.grado_actual || "") + " " + (est.seccion_actual || "");
            if(gradoSec.trim() === "") gradoSec = "Sección no asignada";
            
            let charN = (est.nombres && est.nombres.length > 0) ? est.nombres.charAt(0).toUpperCase() : '';
            let charA = (est.apellidos && est.apellidos.length > 0) ? est.apellidos.charAt(0).toUpperCase() : '';
            
            let estatusFicha = est.ficha_actualizada === true ? '<span class="badge bg-success ms-2"><i class="bi bi-check-circle-fill"></i> Actualizado</span>' : '<span class="badge bg-warning text-dark ms-2"><i class="bi bi-exclamation-circle-fill"></i> Pendiente</span>';

            html += `
            <div class="col-md-6 col-xl-4 animate__animated animate__fadeInUp" style="animation-delay: 0.${index}s">
                <div class="tarjeta-estudiante" onclick="window.ModActualizacion.abrirFormulario(${index})">
                    <div class="header-tarjeta d-flex align-items-center">
                        <div class="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center fw-bold fs-4 me-3 shadow-sm" style="width: 50px; height: 50px;">
                            ${charN}${charA}
                        </div>
                        <div>
                            <h6 class="mb-0 fw-bold text-dark text-truncate" style="max-width: 180px;">${est.nombres} ${est.apellidos}</h6>
                            <span class="badge bg-secondary mt-1"><i class="bi bi-person-vcard me-1"></i>${est.cedula_escolar}</span>
                            ${estatusFicha}
                        </div>
                    </div>
                    <div class="p-3 bg-white">
                        <div class="d-flex justify-content-between mb-2">
                            <span class="small text-muted fw-bold">Nivel:</span>
                            <span class="small fw-bold text-dark">${nivel}</span>
                        </div>
                        <div class="d-flex justify-content-between mb-3 border-bottom pb-2">
                            <span class="small text-muted fw-bold">Grado y Sección:</span>
                            <span class="small fw-bold text-primary">${gradoSec}</span>
                        </div>
                        <button class="btn btn-sm btn-outline-primary w-100 fw-bold rounded-pill">Ver y Actualizar Ficha <i class="bi bi-arrow-right ms-1"></i></button>
                    </div>
                </div>
            </div>`;
        });
        
        contenedor.innerHTML = html;
    },

    abrirFormulario: function(index) {
        if (!window.Aplicacion.permiso('Actualización de Datos', 'modificar')) {
            return Swal.fire({ title: 'Acceso Restringido', text: 'No tienes permisos para modificar expedientes. Solo posees permisos de lectura.', icon: 'warning', confirmButtonColor: '#8b5cf6' });
        }

        this.estudianteActivo = this.misEstudiantes[index];
        let est = this.estudianteActivo;

        document.getElementById('fase-selector').style.display = 'none';
        document.getElementById('subtitulo-modulo').innerText = "Verifique o edite los datos almacenados.";
        document.getElementById('fase-formulario').style.display = 'block';
        document.getElementById('lbl-nombre-estudiante-activo').innerText = `${est.nombres} ${est.apellidos}`;
        
        document.getElementById('form-actualizacion').reset();
        
        // Limpiar estilos de bloqueos visuales
        ['chk-dir-rep', 'chk-dir-madre', 'chk-dir-padre', 'chk-rep-es-madre', 'chk-rep-es-padre'].forEach(id => {
            let el = document.getElementById(id); if(el) { el.checked = false; el.disabled = false; }
        });
        ['rep-direccion', 'madre-dir', 'padre-dir', 'madre-nombres', 'madre-cedula', 'madre-tel', 'madre-correo', 'padre-nombres', 'padre-cedula', 'padre-tel', 'padre-correo'].forEach(id => {
            let el = document.getElementById(id); if(el) { el.removeAttribute('readonly'); el.classList.remove('bg-light'); }
        });
        ['madre-cod-tel', 'madre-pdvsa', 'padre-cod-tel', 'padre-pdvsa'].forEach(id => {
            let el = document.getElementById(id); if(el) { el.removeAttribute('disabled'); el.classList.remove('bg-light'); }
        });

        // Datos Inamovibles
        document.getElementById('est-codigo').value = est.id; 
        document.getElementById('est-nombres').value = est.nombres;
        document.getElementById('est-apellidos').value = est.apellidos;
        document.getElementById('est-cedula').value = est.cedula_escolar;
        document.getElementById('est-nivel').value = est.nivel_educativo || "No asignado";
        document.getElementById('est-grado-sec').value = (est.grado_actual || "") + " " + (est.seccion_actual || "");
        
        document.getElementById('rep-cedula').value = window.Aplicacion.usuario.cedula;
        document.getElementById('rep-nombres').value = window.Aplicacion.usuario.nombre;

        // Poblamos todo el formulario
        if (est.ficha_actualizada) {
            this.llenarFormularioDesdeFicha(est);
        }

        this.irAPaso(1);
    },

    // ✨ AUTO-COPIAR DIRECCIÓN DEL ESTUDIANTE ✨
    copiarDireccionEstudiante: function(idCheckbox, idTarget) {
        let chk = document.getElementById(idCheckbox);
        let target = document.getElementById(idTarget);
        let dirEst = document.getElementById('est-direccion').value.trim();

        if (chk.checked) {
            if (!dirEst) {
                Swal.fire({toast: true, position: 'top-end', icon: 'warning', title: 'Complete la dirección del estudiante en el Paso 2 primero', showConfirmButton: false, timer: 3000});
                chk.checked = false;
                return;
            }
            target.value = dirEst;
            target.classList.add('bg-light');
            target.setAttribute('readonly', 'true');
        } else {
            target.value = '';
            target.classList.remove('bg-light');
            target.removeAttribute('readonly');
        }
    },

    // ✨ AUTO-COPIAR DATOS DEL REPRESENTANTE A LOS PADRES ✨
    copiarDatosRepresentante: function(tipo, modoCarga = false) {
        let chk = document.getElementById(`chk-rep-es-${tipo}`);
        
        let repNom = document.getElementById('rep-nombres').value;
        let repCed = document.getElementById('rep-cedula').value;
        let repCodTel = document.getElementById('rep-cod-tel').value;
        let repTel = document.getElementById('rep-telefono').value;
        let repCor = document.getElementById('rep-correo').value;
        let repDir = document.getElementById('rep-direccion').value;
        let repRel = document.getElementById('rep-relacion').value;
        
        let isPdvsa = (repRel === 'Activo' || repRel === 'Jubilado' || repRel === 'Fallecido') ? 'Si' : 'No';

        let fieldsText = [`${tipo}-nombres`, `${tipo}-cedula`, `${tipo}-tel`, `${tipo}-correo`, `${tipo}-dir`];
        let fieldsSelect = [`${tipo}-cod-tel`, `${tipo}-pdvsa`];

        if (chk.checked) {
            if (!modoCarga && (!repTel || !repDir)) {
                Swal.fire({toast: true, position: 'top-end', icon: 'warning', title: 'Complete los datos del Representante primero (Paso 4)', showConfirmButton: false, timer: 3500});
                chk.checked = false;
                return;
            }

            document.getElementById(`${tipo}-nombres`).value = repNom;
            document.getElementById(`${tipo}-cedula`).value = repCed;
            document.getElementById(`${tipo}-cod-tel`).value = repCodTel;
            document.getElementById(`${tipo}-tel`).value = repTel;
            document.getElementById(`${tipo}-correo`).value = repCor;
            document.getElementById(`${tipo}-dir`).value = repDir;
            document.getElementById(`${tipo}-pdvsa`).value = isPdvsa;

            fieldsText.forEach(id => { let el = document.getElementById(id); if(el) { el.setAttribute('readonly', 'true'); el.classList.add('bg-light'); } });
            fieldsSelect.forEach(id => { let el = document.getElementById(id); if(el) { el.setAttribute('disabled', 'true'); el.classList.add('bg-light'); } });
            
            let dirChk = document.getElementById(`chk-dir-${tipo}`);
            if (dirChk) { dirChk.checked = true; dirChk.disabled = true; }
        } else {
            if (!modoCarga) {
                document.getElementById(`${tipo}-nombres`).value = '';
                document.getElementById(`${tipo}-cedula`).value = '';
                document.getElementById(`${tipo}-tel`).value = '';
                document.getElementById(`${tipo}-correo`).value = '';
                document.getElementById(`${tipo}-dir`).value = '';
                document.getElementById(`${tipo}-pdvsa`).value = '';
            }
            fieldsText.forEach(id => { let el = document.getElementById(id); if(el) { el.removeAttribute('readonly'); el.classList.remove('bg-light'); } });
            fieldsSelect.forEach(id => { let el = document.getElementById(id); if(el) { el.removeAttribute('disabled'); el.classList.remove('bg-light'); } });
            
            let dirChk = document.getElementById(`chk-dir-${tipo}`);
            if (dirChk) { dirChk.disabled = false; }
        }
    },

    // ✨ LECTURA INVERSA ✨
    llenarFormularioDesdeFicha: function(ficha) {
        if (!ficha) return;

        const setVal = (id, val) => { let el = document.getElementById(id); if(el && val !== null && val !== undefined) el.value = val; };
        const setChk = (clase, valStr) => {
            if(!valStr) return;
            let arr = valStr.split(',').map(s => s.trim());
            document.querySelectorAll('.' + clase).forEach(c => { c.checked = arr.includes(c.value); });
        };
        const setTel = (idSelect, idInput, valFull) => {
            if(!valFull) return;
            let parts = valFull.split(' ');
            if (parts.length > 1 && parts[0].startsWith('+')) {
                setVal(idSelect, parts[0]);
                setVal(idInput, parts.slice(1).join(''));
            } else {
                setVal(idInput, valFull.replace(/\D/g, ''));
            }
        };

        // Identidad
        setVal('est-genero', ficha.genero);
        setVal('est-nacimiento', ficha.fecha_nac);
        setVal('est-nacionalidad', ficha.nacionalidad);
        this.cambiarNacionalidad();

        if (ficha.nacionalidad === 'Venezolana') {
            setVal('est-estado-nac', ficha.estado_nac);
            this.cargarMunicipiosUI('nac'); 
            setVal('est-municipio-nac', ficha.municipio_nac);
            this.cargarParroquiasUI('nac'); 
            setVal('est-parroquia-nac', ficha.parroquia_nac);
            setVal('est-lugar-nac', ficha.lugar_nac);
        } else {
            setVal('est-pais-ext', ficha.pais_origen);
            setVal('est-ciudad-ext', ficha.ciudad_origen);
        }

        // Partida Nac.
        setVal('est-folio', ficha.folio);
        setVal('est-acta', ficha.acta);
        setVal('est-fecha-acta', ficha.fecha_acta);

        // Habitación
        setVal('est-estado-hab', ficha.estado_hab || 'Monagas');
        this.cargarMunicipiosUI('hab');
        setVal('est-municipio-hab', ficha.municipio_hab);
        this.cargarParroquiasUI('hab');
        setVal('est-parroquia-hab', ficha.parroquia_hab);
        setVal('est-direccion', ficha.direccion_origen);
        setChk('vive-chk', ficha.vive_con);

        let dirEstudianteGuardada = ficha.direccion_origen || '';

        // Salud y Físico
        setVal('est-talla-f', ficha.talla_franela);
        setVal('est-talla-p', ficha.talla_pantalon);
        setVal('est-talla-z', ficha.talla_zapato);
        setVal('est-estatura', ficha.estatura);
        setVal('est-peso', ficha.peso);
        setVal('est-alergias', ficha.alergias);
        setVal('est-medico', ficha.condicion_medica);
        setVal('est-pc', ficha.pc);
        setVal('est-internet', ficha.internet);
        setVal('est-celular', ficha.celular);

        // Representante
        setVal('rep-parentesco', ficha.rep_parentesco);
        setVal('rep-relacion', ficha.rep_relacion);
        this.cambiarRelacionLaboral();
        setTel('rep-cod-tel', 'rep-telefono', ficha.rep_telefono);
        setVal('rep-correo', ficha.rep_correo);

        setVal('rep-direccion', ficha.rep_direccion);
        if (dirEstudianteGuardada && ficha.rep_direccion === dirEstudianteGuardada) {
            document.getElementById('chk-dir-rep').checked = true;
            document.getElementById('rep-direccion').setAttribute('readonly', 'true');
            document.getElementById('rep-direccion').classList.add('bg-light');
        }

        if (ficha.rep_relacion === 'Activo' || ficha.rep_relacion === 'Jubilado' || ficha.rep_relacion === 'Fallecido') {
            setVal('rep-correo-pdvsa', ficha.rep_correo_pdvsa);
            setVal('corp-nomina', ficha.corp_nomina);
            setVal('corp-filial', ficha.corp_filial);
            setVal('corp-gerencia', ficha.corp_gerencia);
            setVal('rep-localidad', ficha.rep_localidad);
        }

        // Padres
        setVal('padre-reconoce', ficha.reconocido_por);
        this.cambiarReconocido();
        
        let rMadre = (ficha.reconocido_por === 'Ambos Padres' || ficha.reconocido_por === 'Solo la Madre');
        let rPadre = (ficha.reconocido_por === 'Ambos Padres' || ficha.reconocido_por === 'Solo el Padre');
        let cedulaRepFicha = document.getElementById('rep-cedula').value;

        if (rMadre) {
            // Evaluamos si el representante guardado es la misma madre
            if (cedulaRepFicha && ficha.madre_cedula === cedulaRepFicha) {
                document.getElementById('chk-rep-es-madre').checked = true;
                this.copiarDatosRepresentante('madre', true);
            } else {
                setVal('madre-nombres', ficha.madre_nombres);
                setVal('madre-cedula', ficha.madre_cedula);
                setTel('madre-cod-tel', 'madre-tel', ficha.madre_telefono);
                setVal('madre-correo', ficha.madre_correo);
                setVal('madre-dir', ficha.madre_direccion);
                setVal('madre-pdvsa', ficha.madre_pdvsa);
                
                // Switch de direccion estática
                if (dirEstudianteGuardada && ficha.madre_direccion === dirEstudianteGuardada) {
                    document.getElementById('chk-dir-madre').checked = true;
                    document.getElementById('madre-dir').setAttribute('readonly', 'true');
                    document.getElementById('madre-dir').classList.add('bg-light');
                }
            }
            // Estos campos no los tiene el rep, los llenamos normal
            setVal('madre-nacionalidad', ficha.madre_nacionalidad);
            setVal('madre-fecha', ficha.madre_fecha_nac);
            setVal('madre-lugar', ficha.madre_lugar_nac);
            setVal('madre-nivel-acad', ficha.madre_nivel_acad);
            setVal('madre-profesion', ficha.madre_profesion);
            setVal('madre-hidro', ficha.madre_hidro);
            setVal('madre-docente', ficha.madre_docente);
        }

        if (rPadre) {
            // Evaluamos si el representante guardado es el mismo padre
            if (cedulaRepFicha && ficha.padre_cedula === cedulaRepFicha) {
                document.getElementById('chk-rep-es-padre').checked = true;
                this.copiarDatosRepresentante('padre', true);
            } else {
                setVal('padre-nombres', ficha.padre_nombres);
                setVal('padre-cedula', ficha.padre_cedula);
                setTel('padre-cod-tel', 'padre-tel', ficha.padre_telefono);
                setVal('padre-correo', ficha.padre_correo);
                setVal('padre-dir', ficha.padre_direccion);
                setVal('padre-pdvsa', ficha.padre_pdvsa);
                
                // Switch de direccion estática
                if (dirEstudianteGuardada && ficha.padre_direccion === dirEstudianteGuardada) {
                    document.getElementById('chk-dir-padre').checked = true;
                    document.getElementById('padre-dir').setAttribute('readonly', 'true');
                    document.getElementById('padre-dir').classList.add('bg-light');
                }
            }
            // Estos campos no los tiene el rep, los llenamos normal
            setVal('padre-nacionalidad', ficha.padre_nacionalidad);
            setVal('padre-fecha', ficha.padre_fecha_nac);
            setVal('padre-lugar', ficha.padre_lugar_nac);
            setVal('padre-nivel-acad', ficha.padre_nivel_acad);
            setVal('padre-profesion', ficha.padre_profesion);
            setVal('padre-hidro', ficha.padre_hidro);
            setVal('padre-docente', ficha.padre_docente);
        }

        // Transporte y Encuesta
        setVal('est-ruta', ficha.id_ruta_transporte);
        this.filtrarParadas();
        setTimeout(() => { setVal('est-parada', ficha.id_parada_transporte); }, 50);

        setVal('enc-metodologia', ficha.enc_metodologia);
        setChk('enc-rec', ficha.enc_recursos);
        setChk('enc-med', ficha.enc_medios);
        setVal('enc-portal', ficha.enc_portal);
        setVal('enc-boletines', ficha.enc_boletines);
        setVal('enc-actualizacion', ficha.enc_actualizacion);
        setVal('enc-aportes', ficha.enc_aportes);

        // Terminos Legales
        let btnAcepto = document.getElementById('acepto-contrato');
        if(btnAcepto) btnAcepto.checked = true;
    },

    volverAlSelector: function() {
        document.getElementById('fase-formulario').style.display = 'none';
        document.getElementById('fase-selector').style.display = 'flex';
        document.getElementById('subtitulo-modulo').innerText = "Seleccione a su representado para completar su expediente.";
        this.estudianteActivo = null;
    },

    aplicarEventosFormateo: function() {
        let txtEls = document.querySelectorAll('.txt-format');
        txtEls.forEach(el => {
            if (el) el.addEventListener('blur', (e) => { this.formatearTexto(e.target); });
        });
    },

    formatearTexto: function(inputElement) {
        if(!inputElement.value) return;
        let texto = inputElement.value.trim().replace(/\s+/g, ' ');
        const conectores = ['de', 'del', 'la', 'las', 'el', 'los', 'y', 'e', 'o', 'u', 'a', 'ante', 'con', 'en', 'para', 'por', 'sin', 'un', 'una', 'unos', 'unas'];
        const siglasEducativas = ['cei', 'c.e.i', 'ue', 'u.e', 'u.e.', 'uen', 'u.e.n', 'u.e.n.', 'pdvsa', 's.a', 's.a.', 'c.a', 'c.a.', 'mppe'];
        let palabras = texto.split(' ');
        for (let i = 0; i < palabras.length; i++) {
            let p = palabras[i];
            if(p.length === 0) continue;
            let pLower = p.toLowerCase();
            if (siglasEducativas.includes(pLower)) { palabras[i] = pLower.toUpperCase(); } 
            else if (conectores.includes(pLower) && i > 0) { palabras[i] = pLower; } 
            else { palabras[i] = pLower.charAt(0).toUpperCase() + pLower.slice(1); }
        }
        inputElement.value = palabras.join(' ');
    },

    formatearCedula: function(inputElement) {
        let val = inputElement.value.replace(/\D/g, ''); 
        if (val.length > 9) val = val.substring(0, 9); 
        inputElement.value = val;
    },

    buscarDireccionWeb: function(query, idInputDestino, idListaResultados) {
        let lista = document.getElementById(idListaResultados);
        if (!query || query.length < 4) { lista.classList.add('d-none'); return; }

        lista.innerHTML = '<li class="list-group-item text-center text-muted small"><div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>Buscando en el mapa...</li>';
        lista.classList.remove('d-none');
        clearTimeout(this.timeoutDireccion);
        
        this.timeoutDireccion = setTimeout(async () => {
            try {
                let busquedaExacta = encodeURIComponent(`${query}, Monagas, Venezuela`);
                let response = await fetch(`https://photon.komoot.io/api/?q=${busquedaExacta}&limit=5`);
                let data = await response.json();

                if (data.features && data.features.length > 0) {
                    let html = '';
                    data.features.forEach(f => {
                        let props = f.properties;
                        let nombreLugar = props.name ? `<b>${props.name}</b>, ` : '';
                        let calle = props.street ? `${props.street}, ` : '';
                        let ciudad = props.city || props.town || props.village || props.county || '';
                        let dCompleta = `${nombreLugar}${calle}${ciudad}`.replace(/,\s*$/, ''); 
                        let txtPlano = `${props.name ? props.name+', ' : ''}${calle}${ciudad}`.replace(/,\s*$/, '');

                        html += `<li class="list-group-item list-group-item-action hover-efecto" style="cursor:pointer; font-size: 0.9rem;" onclick="window.ModActualizacion.seleccionarDireccionWeb('${txtPlano}', '${idInputDestino}', '${idListaResultados}')"><i class="bi bi-geo-alt-fill text-danger me-2"></i>${dCompleta}</li>`;
                    });
                    lista.innerHTML = html;
                } else {
                    lista.innerHTML = '<li class="list-group-item text-center text-muted small"><i class="bi bi-emoji-frown fs-5 d-block mb-1"></i>Escriba manualmente.</li>';
                    setTimeout(() => lista.classList.add('d-none'), 3000);
                }
            } catch(e) { lista.classList.add('d-none'); }
        }, 600); 
    },

    seleccionarDireccionWeb: function(direccion, idInputDestino, idListaResultados) {
        let inputDir = document.getElementById(idInputDestino);
        inputDir.value = direccion;
        this.formatearTexto(inputDir);
        document.getElementById(idListaResultados).classList.add('d-none');
    },

    construirDiccionarioGeografico: function(datosPlanos) {
        let dicc = {};
        datosPlanos.forEach(fila => {
            let e = fila.estado; let m = fila.municipio; let p = fila.parroquia;
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
        const bloqNacVzla = document.getElementById('bloque-nac-vzla');
        const bloqNacExt = document.getElementById('bloque-nac-ext');

        if(nacion === "Venezolana") {
            bloqNacExt.style.display = "none"; bloqNacVzla.style.display = "flex";
        } else if (nacion === "Extranjera") {
            bloqNacVzla.style.display = "none"; bloqNacExt.style.display = "flex";
        } else {
            bloqNacVzla.style.display = "none"; bloqNacExt.style.display = "none";
        }
    },

    cargarEstadosUI: function() {
        let estados = Object.keys(this.diccionarioVzla).sort();
        let htmlNac = '<option value="">Seleccione Estado...</option>';
        if(estados.length > 0) estados.forEach(e => { htmlNac += `<option value="${e}">${e}</option>`; });
        
        let elNac = document.getElementById('est-estado-nac');
        if(elNac) elNac.innerHTML = htmlNac;

        let elHab = document.getElementById('est-estado-hab');
        if(elHab) {
            elHab.innerHTML = '<option value="Monagas" selected>Monagas</option>';
            elHab.disabled = true; 
            this.cargarMunicipiosUI('hab'); 
        }
    },

    cargarMunicipiosUI: function(origen) {
        let estado = document.getElementById(`est-estado-${origen}`).value;
        let selMuni = document.getElementById(`est-municipio-${origen}`);
        let selParr = document.getElementById(`est-parroquia-${origen}`);
        
        if(!estado) { 
            selMuni.disabled = true; selMuni.innerHTML = '<option value="">Estado primero...</option>'; 
            selParr.disabled = true; selParr.innerHTML = '<option value="">Municipio primero...</option>'; 
            return; 
        }
        let html = '<option value="">Seleccione Municipio...</option>';
        if (this.diccionarioVzla[estado]) {
            let municipios = Object.keys(this.diccionarioVzla[estado]).sort();
            municipios.forEach(muni => { html += `<option value="${muni}">${muni}</option>`; });
        }
        selMuni.innerHTML = html; selMuni.disabled = false;
        selParr.disabled = true; selParr.innerHTML = '<option value="">Municipio primero...</option>';
    },

    cargarParroquiasUI: function(origen) {
        let estado = document.getElementById(`est-estado-${origen}`).value;
        let muni = document.getElementById(`est-municipio-${origen}`).value;
        let selParr = document.getElementById(`est-parroquia-${origen}`);
        
        if(!muni) { selParr.disabled = true; selParr.innerHTML = '<option value="">Municipio primero...</option>'; return; }
        let html = '<option value="">Seleccione Parroquia...</option>';
        if (this.diccionarioVzla[estado] && this.diccionarioVzla[estado][muni]) {
            let parroquias = this.diccionarioVzla[estado][muni].sort();
            parroquias.forEach(parr => { html += `<option value="${parr}">${parr}</option>`; });
        }
        selParr.innerHTML = html; selParr.disabled = false;
    },

    llenarSelect: function(categoria, idElemento) {
        const select = document.getElementById(idElemento); if(!select) return;
        const filtrados = this.datosEmpresa.filter(d => d.categoria === categoria);
        select.innerHTML = '<option value="">Seleccione...</option>' + filtrados.map(d => `<option value="${d.valor}">${d.valor}</option>`).join('');
    },

    cambiarRelacionLaboral: function() {
        const rel = document.getElementById('rep-relacion').value;
        const bloquePDVSA = document.getElementById('bloque-pdvsa');
        if (rel === 'Activo' || rel === 'Jubilado' || rel === 'Fallecido') { bloquePDVSA.style.display = 'flex'; } 
        else { bloquePDVSA.style.display = 'none'; }
    },

    cambiarReconocido: function() {
        const val = document.getElementById('padre-reconoce').value;
        const bMadre = document.getElementById('bloque-madre');
        const bPadre = document.getElementById('bloque-padre');
        bMadre.style.display = 'none'; bPadre.style.display = 'none';
        
        if (val === 'Ambos Padres') { bMadre.style.display = 'block'; bPadre.style.display = 'block'; } 
        else if (val === 'Solo la Madre') { bMadre.style.display = 'block'; } 
        else if (val === 'Solo el Padre') { bPadre.style.display = 'block'; }
    },

    llenarSelectRutas: function() {
        const sel = document.getElementById('est-ruta'); if(!sel) return;
        let html = '<option value="No requiere">No requiere transporte</option>';
        this.rutasTransporte.forEach(r => { let idSeguro = r.id_ruta ? r.id_ruta : r.nombre_ruta; html += `<option value="${idSeguro}">${r.nombre_ruta}</option>`; });
        sel.innerHTML = html;
    },

    filtrarParadas: function() {
        const idRuta = document.getElementById('est-ruta').value;
        const selParada = document.getElementById('est-parada');
        if(!idRuta || idRuta === "No requiere") { selParada.innerHTML = '<option value="No aplica">No aplica...</option>'; selParada.disabled = true; return; }
        
        let ruta = this.rutasTransporte.find(r => String(r.id_ruta) === String(idRuta) || String(r.nombre_ruta) === String(idRuta));
        if(ruta && ruta.paradas_json && ruta.paradas_json.trim() !== "") {
            try {
                let arrayIds = typeof ruta.paradas_json === "string" ? JSON.parse(ruta.paradas_json) : ruta.paradas_json;
                if (Array.isArray(arrayIds) && arrayIds.length > 0) {
                    let html = '<option value="">Seleccione una parada...</option>';
                    arrayIds.forEach(id => { 
                        let paradaObj = this.paradasTransporte.find(p => String(p.id_parada) === String(id));
                        if(paradaObj) html += `<option value="${paradaObj.id_parada}">${paradaObj.nombre_parada}</option>`; 
                    });
                    selParada.innerHTML = html; selParada.disabled = false;
                } else { selParada.innerHTML = '<option value="Sin paradas">La ruta no tiene paradas</option>'; selParada.disabled = false; }
            } catch(e) { selParada.innerHTML = '<option value="">Error de lectura</option>'; selParada.disabled = true; }
        } else { selParada.innerHTML = '<option value="Directa">Ruta Directa (Sin paradas)</option>'; selParada.disabled = false; }
    },

    irAPaso: function(pasoDestino) {
        if (pasoDestino === this.pasoActual) return;
        
        if (this.pasoActual === 1 && pasoDestino > 1) {
            let rdoAcepto = document.getElementById('acepto-contrato');
            if (!rdoAcepto.checked) {
                Swal.fire('Términos Legales', 'Debe aceptar los términos de la Declaración Jurada para poder continuar con la actualización.', 'warning');
                return;
            }
        }

        document.getElementById(`paso-${this.pasoActual}`).style.display = 'none';
        
        for(let i=1; i<=this.totalPasos; i++) {
            let wrapper = document.getElementById(`ind-wrapper-${i}`);
            let step = document.getElementById(`ind-${i}`);
            if(wrapper && step) {
                if(i < pasoDestino) { 
                    step.classList.add('completado'); step.classList.remove('activo'); wrapper.classList.remove('activo');
                } else if (i === pasoDestino) { 
                    step.classList.add('activo'); step.classList.remove('completado'); wrapper.classList.add('activo');
                } else { 
                    step.classList.remove('activo', 'completado'); wrapper.classList.remove('activo');
                }
            }
        }
        
        this.pasoActual = pasoDestino;
        let elDestino = document.getElementById(`paso-${this.pasoActual}`);
        if(elDestino) elDestino.style.display = 'block';
        this.actualizarUI();
    },

    cambiarPaso: function(direccion) { 
        let destino = this.pasoActual + direccion;
        if(destino >= 1 && destino <= this.totalPasos) this.irAPaso(destino);
    },

    actualizarUI: function() {
        let prev = document.getElementById('btn-prev');
        let next = document.getElementById('btn-next');
        let save = document.getElementById('btn-save');
        if(prev) prev.style.display = this.pasoActual === 1 ? 'none' : 'block';
        if(next && save) {
            if (this.pasoActual === this.totalPasos) { next.style.display = 'none'; save.style.display = 'block'; } 
            else { next.style.display = 'block'; save.style.display = 'none'; }
        }
    },

    validarPasoSilencioso: function(paso) {
        let requeridos = [];
        if (paso === 2) requeridos = ['est-nacimiento', 'est-nacionalidad'];
        if (paso === 4) requeridos = ['rep-parentesco', 'rep-relacion', 'rep-telefono'];
        if (paso === 5) requeridos = ['padre-reconoce'];

        for (let id of requeridos) {
            let el = document.getElementById(id);
            if (el && !el.value.trim()) return false;
        }
        return true;
    },

    getCheckedValues: function(clase) {
        let arr = [];
        document.querySelectorAll('.' + clase + ':checked').forEach(c => arr.push(c.value));
        return arr.join(', ');
    },

    guardarActualizacion: async function() {
        if (!window.Aplicacion.permiso('Actualización de Datos', 'modificar')) {
            return Swal.fire('Error de Seguridad', 'Operación bloqueada. No posees privilegios de modificación.', 'error');
        }

        if(!this.validarPasoSilencioso(2)) { this.irAPaso(2); return Swal.fire('Atención', 'Faltan datos en Identidad.', 'warning'); }
        if(!this.validarPasoSilencioso(4)) { this.irAPaso(4); return Swal.fire('Atención', 'Faltan datos del Representante.', 'warning'); }
        if(!this.validarPasoSilencioso(5)) { this.irAPaso(5); return Swal.fire('Atención', 'Seleccione el reconocimiento legal de los padres.', 'warning'); }

        let nacion = document.getElementById('est-nacionalidad').value;
        let idExpediente = document.getElementById('est-codigo').value; 
        let cedula = document.getElementById('est-cedula').value;
        
        let repTelStr = document.getElementById('rep-cod-tel').value + " " + document.getElementById('rep-telefono').value;
        let madreTelStr = document.getElementById('madre-cod-tel').value + " " + document.getElementById('madre-tel').value;
        let padreTelStr = document.getElementById('padre-cod-tel').value + " " + document.getElementById('padre-tel').value;

        let payloadExpediente = {
            fecha_nac: document.getElementById('est-nacimiento').value || null,
            genero: document.getElementById('est-genero').value,
            nacionalidad: nacion,
            estado_nac: document.getElementById('est-estado-nac') ? document.getElementById('est-estado-nac').value : '',
            municipio_nac: document.getElementById('est-municipio-nac') ? document.getElementById('est-municipio-nac').value : '',
            parroquia_nac: document.getElementById('est-parroquia-nac') ? document.getElementById('est-parroquia-nac').value : '',
            lugar_nac: document.getElementById('est-lugar-nac') ? document.getElementById('est-lugar-nac').value : '',
            pais_origen: document.getElementById('est-pais-ext') ? document.getElementById('est-pais-ext').value : '',
            ciudad_origen: document.getElementById('est-ciudad-ext') ? document.getElementById('est-ciudad-ext').value : '',
            folio: document.getElementById('est-folio').value,
            acta: document.getElementById('est-acta').value,
            fecha_acta: document.getElementById('est-fecha-acta').value || null,
            
            estado_hab: 'Monagas',
            municipio_hab: document.getElementById('est-municipio-hab') ? document.getElementById('est-municipio-hab').value : '',
            parroquia_hab: document.getElementById('est-parroquia-hab') ? document.getElementById('est-parroquia-hab').value : '',
            direccion_origen: document.getElementById('est-direccion').value,
            vive_con: this.getCheckedValues('vive-chk'),
            
            talla_franela: document.getElementById('est-talla-f').value,
            talla_pantalon: document.getElementById('est-talla-p').value,
            talla_zapato: document.getElementById('est-talla-z').value,
            estatura: document.getElementById('est-estatura').value,
            peso: document.getElementById('est-peso').value,
            alergias: document.getElementById('est-alergias').value,
            condicion_medica: document.getElementById('est-medico').value,
            pc: document.getElementById('est-pc').value,
            internet: document.getElementById('est-internet').value,
            celular: document.getElementById('est-celular').value,
            
            rep_parentesco: document.getElementById('rep-parentesco').value,
            rep_relacion: document.getElementById('rep-relacion').value,
            rep_telefono: repTelStr,
            rep_direccion: document.getElementById('rep-direccion').value,
            rep_correo: document.getElementById('rep-correo').value,
            rep_correo_pdvsa: document.getElementById('rep-correo-pdvsa').value,
            corp_nomina: document.getElementById('corp-nomina').value,
            corp_filial: document.getElementById('corp-filial').value,
            corp_gerencia: document.getElementById('corp-gerencia').value,
            rep_localidad: document.getElementById('rep-localidad').value,
            
            reconocido_por: document.getElementById('padre-reconoce').value,
            
            madre_nombres: document.getElementById('madre-nombres').value,
            madre_cedula: document.getElementById('madre-cedula').value,
            madre_nacionalidad: document.getElementById('madre-nacionalidad').value,
            madre_fecha_nac: document.getElementById('madre-fecha').value || null,
            madre_lugar_nac: document.getElementById('madre-lugar').value,
            madre_telefono: madreTelStr,
            madre_correo: document.getElementById('madre-correo').value,
            madre_direccion: document.getElementById('madre-dir').value,
            madre_nivel_acad: document.getElementById('madre-nivel-acad').value,
            madre_profesion: document.getElementById('madre-profesion').value,
            madre_pdvsa: document.getElementById('madre-pdvsa').value,
            madre_hidro: document.getElementById('madre-hidro').value,
            madre_docente: document.getElementById('madre-docente').value,
            
            padre_nombres: document.getElementById('padre-nombres').value,
            padre_cedula: document.getElementById('padre-cedula').value,
            padre_nacionalidad: document.getElementById('padre-nacionalidad').value,
            padre_fecha_nac: document.getElementById('padre-fecha').value || null,
            padre_lugar_nac: document.getElementById('padre-lugar').value,
            padre_telefono: padreTelStr,
            padre_correo: document.getElementById('padre-correo').value,
            padre_direccion: document.getElementById('padre-dir').value,
            padre_nivel_acad: document.getElementById('padre-nivel-acad').value,
            padre_profesion: document.getElementById('padre-profesion').value,
            padre_pdvsa: document.getElementById('padre-pdvsa').value,
            padre_hidro: document.getElementById('padre-hidro').value,
            padre_docente: document.getElementById('padre-docente').value,
            
            id_ruta_transporte: document.getElementById('est-ruta').value,
            id_parada_transporte: document.getElementById('est-parada').value,
            
            enc_metodologia: document.getElementById('enc-metodologia').value,
            enc_recursos: this.getCheckedValues('enc-rec'),
            enc_medios: this.getCheckedValues('enc-med'),
            enc_portal: document.getElementById('enc-portal').value,
            enc_boletines: document.getElementById('enc-boletines').value,
            enc_actualizacion: document.getElementById('enc-actualizacion').value,
            enc_aportes: document.getElementById('enc-aportes').value,
            
            ficha_actualizada: true,
            updated_at: new Date().toISOString()
        };

        window.Aplicacion.mostrarCarga();
        
        try {
            const { error } = await window.supabaseDB.from('expedientes')
                .update(payloadExpediente)
                .eq('id', idExpediente);

            window.Aplicacion.ocultarCarga();
            
            if (error) throw error;
            
            window.Aplicacion.auditar('Actualización de Datos', 'Actualizar Expediente', `Se actualizó la ficha estructurada del estudiante: ${cedula}`);

            Swal.fire({
                title: '¡Actualización Exitosa!',
                text: 'El expediente ha sido procesado y guardado en las columnas reales de la base de datos.',
                icon: 'success',
                confirmButtonColor: '#8b5cf6'
            }).then(() => {
                this.volverAlSelector();
                this.cargarDiccionarios(); 
            });

        } catch (err) {
            window.Aplicacion.ocultarCarga();
            console.error(err);
            Swal.fire('Error', 'No se pudo guardar la información. Verifique la conexión.', 'error');
        }
    }
};

window.init_Actualizacion_de_Datos = function() { window.ModActualizacion.init(); };