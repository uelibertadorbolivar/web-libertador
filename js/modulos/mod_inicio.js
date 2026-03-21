/**
 * MÓDULO: PANEL PRINCIPAL (INICIO)
 * ADAPTADO AL DISEÑO 3D (FLIP CARDS) CON IMÁGENES ILUSTRATIVAS
 */

window.ModInicio = {
    init: function() {
        this.dibujarInterfaz();
    },

    dibujarInterfaz: function() {
        const contenedor = document.getElementById('area-dinamica');
        
        let html = `
        <style>
            /* Estilos del Banner Azul */
            .banner-inicio { background: linear-gradient(135deg, #0066FF 0%, #003399 100%); border-radius: 24px; position: relative; overflow: hidden; color: white; padding: 2.5rem; }
            .banner-orb { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.1); backdrop-filter: blur(5px); }
            
            /* Estilos de las Tarjetas Flip (Giratorias) */
            .flip-card { background-color: transparent; height: 300px; perspective: 1000px; margin-bottom: 20px; }
            .flip-card-inner { position: relative; width: 100%; height: 100%; text-align: center; transition: transform 0.6s; transform-style: preserve-3d; cursor: pointer; }
            .flip-card.flipped .flip-card-inner { transform: rotateY(180deg); }
            .flip-card-front, .flip-card-back { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; border-radius: 20px; border: 2px solid #e2e8f0; background: white; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; box-shadow: 0 10px 20px rgba(0,0,0,0.04); }
            
            /* ✨ IMÁGENES ILUSTRATIVAS (Con animación hover) ✨ */
            .img-tarjeta-inicio { height: 140px; object-fit: contain; margin-bottom: 15px; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.1)); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
            .flip-card:hover .img-tarjeta-inicio { transform: scale(1.1) translateY(-8px); }
            
            .flip-card-front h4 { font-weight: 800; margin-bottom: 15px; font-size: 1.6rem; }
            .btn-voltear { background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; border-radius: 50px; padding: 6px 18px; font-size: 0.85rem; font-weight: bold; transition: all 0.2s; pointer-events: none; }
            .flip-card:hover .btn-voltear { background: #e2e8f0; color: #1e293b; }
            
            .flip-card-back { background: #f8fafc; transform: rotateY(180deg); border-width: 2px; padding: 25px; overflow-y: auto; display: block; text-align: left; }
            .flip-card-back h5 { font-weight: bold; margin-bottom: 15px; text-align: center; border-bottom: 2px solid rgba(0,0,0,0.1); padding-bottom: 10px; }
            .flip-card-back p { font-size: 0.95rem; color: #334155; line-height: 1.5; text-align: justify; margin: 0; }
            
            /* Barra Inferior Organigrama */
            .barra-organigrama { background: #ffffff; border: 2px solid #e2e8f0; border-radius: 20px; padding: 20px 30px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px; }
        </style>

        <div class="animate__animated animate__fadeIn">
            <div class="banner-inicio mb-4 shadow-sm">
                <div class="banner-orb" style="width: 250px; height: 250px; top: -80px; left: 10%;"></div>
                <div class="banner-orb" style="width: 150px; height: 150px; bottom: -50px; right: 25%;"></div>
                
                <div class="row align-items-center position-relative z-1">
                    <div class="col-md-9">
                        <span class="badge bg-white bg-opacity-25 border border-light text-white mb-3 px-3 py-2 rounded-pill shadow-sm" style="backdrop-filter: blur(5px);">
                            <i class="bi bi-clock me-1"></i> <span id="reloj-vivo">Cargando fecha...</span>
                        </span>
                        <h1 class="fw-bolder mb-1" style="font-size: 3.5rem; text-shadow: 0 4px 6px rgba(0,0,0,0.2);">¡Bienvenido!</h1>
                        <h3 class="fw-bold mb-3">Unidad Educativa Libertador Bolívar</h3>
                        
                        <p class="mb-3 d-flex align-items-center opacity-75">
                            <i class="bi bi-geo-alt-fill text-danger fs-5 me-2"></i>
                            <span id="lbl-direccion-escuela">Vía Nacional Monagas - Sucre, Campo Monagas Miraflores, municipio Punceres, estado Monagas</span>
                        </p>
                        
                        <div class="d-flex gap-3 flex-wrap">
                            <span class="badge bg-white bg-opacity-10 border border-light px-3 py-2 fs-6 rounded-3 shadow-sm"><i class="bi bi-building me-1"></i> DEA: <span id="lbl-dea-escuela">S3255D1610</span></span>
                            <span class="badge bg-white bg-opacity-10 border border-light px-3 py-2 fs-6 rounded-3 shadow-sm"><i class="bi bi-hash me-1"></i> RIF: <span id="lbl-rif-escuela">J404012060</span></span>
                        </div>
                    </div>
                    <div class="col-md-3 text-end d-none d-md-block">
                        <img src="assets/img/logo.png" alt="Logo Escuela" style="max-height: 180px; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.4));">
                    </div>
                </div>
            </div>

            <div class="row g-4 mb-4">
                
                <div class="col-12 col-md-6 col-xl-3">
                    <div class="flip-card" onclick="this.classList.toggle('flipped')">
                        <div class="flip-card-inner">
                            <div class="flip-card-front">
                                <img src="assets/img/3.png" alt="Misión" class="img-tarjeta-inicio">
                                <h4 style="color: #0066FF;">Misión</h4>
                                <button class="btn-voltear"><i class="bi bi-arrow-repeat me-1"></i> Voltear tarjeta</button>
                            </div>
                            <div class="flip-card-back" style="border-color: #0066FF;">
                                <h5 style="color: #0066FF; border-bottom-color: rgba(0,102,255,0.2);"><i class="bi bi-bullseye me-2"></i>Misión Institucional</h5>
                                <p id="lbl-mision-back">Cargando misión de la institución...</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-12 col-md-6 col-xl-3">
                    <div class="flip-card" onclick="this.classList.toggle('flipped')">
                        <div class="flip-card-inner">
                            <div class="flip-card-front">
                                <img src="assets/img/4.png" alt="Visión" class="img-tarjeta-inicio">
                                <h4 style="color: #00C3FF;">Visión</h4>
                                <button class="btn-voltear"><i class="bi bi-arrow-repeat me-1"></i> Voltear tarjeta</button>
                            </div>
                            <div class="flip-card-back" style="border-color: #00C3FF;">
                                <h5 style="color: #00C3FF; border-bottom-color: rgba(0,195,255,0.2);"><i class="bi bi-eye me-2"></i>Visión Institucional</h5>
                                <p id="lbl-vision-back">Cargando visión de la institución...</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-12 col-md-6 col-xl-3">
                    <div class="flip-card" onclick="this.classList.toggle('flipped')">
                        <div class="flip-card-inner">
                            <div class="flip-card-front">
                                <img src="assets/img/5.png" alt="Valores" class="img-tarjeta-inicio">
                                <h4 style="color: #34A853;">Valores</h4>
                                <button class="btn-voltear"><i class="bi bi-arrow-repeat me-1"></i> Voltear tarjeta</button>
                            </div>
                            <div class="flip-card-back" style="border-color: #34A853;">
                                <h5 style="color: #34A853; border-bottom-color: rgba(52,168,83,0.2);"><i class="bi bi-gem me-2"></i>Valores</h5>
                                <p id="lbl-objetivo-back">Respeto, Responsabilidad, Empatía, Solidaridad, Honestidad, Igualdad y Sentido de Pertenencia hacia la institución y la comunidad.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-12 col-md-6 col-xl-3">
                    <div class="flip-card" onclick="this.classList.toggle('flipped')">
                        <div class="flip-card-inner">
                            <div class="flip-card-front">
                                <img src="assets/img/6.png" alt="PEIC" class="img-tarjeta-inicio">
                                <h4 style="color: #FF8D00;">PEIC</h4>
                                <button class="btn-voltear"><i class="bi bi-arrow-repeat me-1"></i> Voltear tarjeta</button>
                            </div>
                            <div class="flip-card-back" style="border-color: #FF8D00;">
                                <h5 style="color: #FF8D00; border-bottom-color: rgba(255,141,0,0.2);"><i class="bi bi-journal-bookmark me-2"></i>P.E.I.C.</h5>
                                <p id="lbl-peic-back">Cargando Proyecto Educativo Integral Comunitario...</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div class="barra-organigrama shadow-sm mb-2">
                <div class="d-flex align-items-center">
                    <div class="bg-primary bg-opacity-10 text-primary rounded-circle d-flex justify-content-center align-items-center me-3" style="width: 60px; height: 60px; font-size: 1.8rem;">
                        <i class="bi bi-diagram-3-fill"></i>
                    </div>
                    <div>
                        <h4 class="fw-bold mb-1 text-dark" style="font-size: 1.3rem;">Estructura Organizativa Institucional</h4>
                        <p class="text-muted mb-0">Consulte el mapa oficial de dependencias, la cadena supervisoria y el personal activo de la escuela.</p>
                    </div>
                </div>
                <button class="btn btn-primary rounded-pill px-4 py-3 fw-bold shadow-sm" onclick="Enrutador.navegar('Organización Escolar')">
                    <i class="bi bi-search me-2"></i> Explorar Organigrama
                </button>
            </div>
        </div>
        `;
        
        contenedor.innerHTML = html;
        document.getElementById('titulo-pagina').innerText = "Inicio";
        window.Aplicacion.marcarMenuActivo("Inicio");
        
        // Llamadas de carga de datos
        this.configurarFechaInmediata();
        this.cargarPerfilEscuela();
    },

    configurarFechaInmediata: function() {
        let opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        let fechaReal = window.Aplicacion.obtenerFechaReal(); 
        let textoFecha = fechaReal.toLocaleDateString('es-VE', opcionesFecha);
        textoFecha = textoFecha.charAt(0).toUpperCase() + textoFecha.slice(1);
        
        let cajaFecha = document.getElementById('reloj-vivo');
        if (cajaFecha) {
            cajaFecha.innerText = textoFecha;
        }
    },

    cargarPerfilEscuela: function() {
        window.Aplicacion.peticion({ action: "get_school_profile" }, (res) => {
            if (res && res.status === "success" && res.perfil) {
                let p = res.perfil;
                let inyectar = (id, texto) => { let el = document.getElementById(id); if (el && texto) el.innerText = texto; };
                
                inyectar('lbl-dea-escuela', p.dea);
                inyectar('lbl-rif-escuela', p.rif);
                inyectar('lbl-direccion-escuela', p.direccion);
                
                inyectar('lbl-mision-back', p.mision);
                inyectar('lbl-vision-back', p.vision);
                if(p.objetivo) inyectar('lbl-objetivo-back', p.objetivo); 
                if(p.peic) inyectar('lbl-peic-back', p.peic);
            }
        });
    }
};

window.init_Inicio = function() {
    window.ModInicio.init();
};