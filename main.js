/**
 * ARCHIVO: main.js
 * Lógica completa para el Portal UE Libertador Bolívar
 */

// ==========================================
// ⚠️ CONFIGURACIÓN OBLIGATORIA ⚠️
// PEGA AQUÍ ABAJO TU URL DE GOOGLE APPS SCRIPT (La que termina en /exec)
// ==========================================
const API_URL = "PEGAR_AQUI_TU_URL_DE_APPS_SCRIPT"; 


// ==========================================
// VARIABLES DE ESTADO (CACHE)
// ==========================================
let noticiasCargadas = false;
let guiasCache = [];


// ==========================================
// 1. INICIALIZACIÓN (Se ejecuta al abrir la web)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    
    // --- LÓGICA DEL CONTADOR DE VISITAS ---
    // Busca el elemento en el HTML
    const contadorElement = document.getElementById('contadorVisitas');
    
    if(contadorElement) {
        // Llama a la API inmediatamente para registrar visita y obtener el número
        fetch(`${API_URL}?action=registrar_visita`)
            .then(response => response.json())
            .then(data => {
                // Actualiza el número en la pantalla de bienvenida
                contadorElement.innerText = data.visitas;
                console.log("Visita registrada. Total: " + data.visitas);
            })
            .catch(error => {
                console.error("Error conectando contador:", error);
                contadorElement.innerText = "(Offline)";
            });
    }
});


// ==========================================
// 2. SISTEMA DE BIENVENIDA Y ACCESO
// ==========================================

function entrarAlSistema(e) {
    e.preventDefault();
    
    // Obtener datos del formulario de bienvenida
    const nombre = document.getElementById('userName').value.trim();
    const genero = document.getElementById('userGender').value;
    
    if(!nombre || !genero) {
        alert("Por favor completa tus datos para ingresar.");
        return;
    }

    // Personalizar la interfaz con los datos
    personalizarInterfaz(nombre, genero);

    // Efecto visual: Desvanecer pantalla de bienvenida
    const welcomeScreen = document.getElementById('welcome-screen');
    welcomeScreen.style.opacity = '0';
    welcomeScreen.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        welcomeScreen.style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
    }, 500);
}

function personalizarInterfaz(nombre, genero) {
    // Tomamos solo el primer nombre para que no sea muy largo
    const primerNombre = nombre.split(" ")[0];
    
    // Lógica para definir el ícono según el género
    let iconoHTML = "";
    if (genero === "M") {
        // Ícono Masculino (Azul/Primario)
        iconoHTML = '<i class="bi bi-person-standing text-primary"></i>'; 
    } else {
        // Ícono Femenino (Rojo/Rosado - usando text-danger de bootstrap)
        iconoHTML = '<i class="bi bi-person-standing-dress text-danger"></i>'; 
    }

    // Inyectar los datos en la barra superior y en el título de inicio
    document.getElementById('displayUserName').innerText = primerNombre;
    document.getElementById('userIcon').innerHTML = iconoHTML;
    document.getElementById('welcomeName').innerText = primerNombre;
}


// ==========================================
// 3. NAVEGACIÓN (Cambio de Pestañas)
// ==========================================

function nav(vista) {
    // 1. Ocultar todas las vistas
    document.querySelectorAll('.section-view').forEach(el => el.style.display = 'none');
    
    // 2. Mostrar la vista seleccionada
    const vistaActiva = document.getElementById('view-' + vista);
    if(vistaActiva) {
        vistaActiva.style.display = 'block';
    }
    
    // 3. Actualizar botones del menú (Visualmente activo)
    document.querySelectorAll('.btn-nav').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
}


// ==========================================
// 4. MÓDULOS DE GESTIÓN ESCOLAR
// ==========================================

// --- A. CONSULTAR ALUMNO ---
function consultarAlumno() {
    let ced = document.getElementById('cedulaInput').value;
    let res = document.getElementById('resAlumno');
    
    if(!ced) { alert("Escribe una cédula"); return; }

    res.innerHTML = '<div class="alert alert-info mt-3">⏳ Buscando en secretaría...</div>';
    
    fetch(`${API_URL}?action=consultar_alumno&cedula=${ced}`)
        .then(r => r.json())
        .then(d => {
            if(d.length > 0) {
                // Alumno encontrado
                res.innerHTML = `
                <div class="alert alert-success mt-3 shadow-sm border-0">
                    <h4 class="alert-heading">✅ ¡Encontrado!</h4>
                    <p class="mb-0 fs-5"><b>${d[0].nombre}</b></p>
                    <hr>
                    <div class="d-flex justify-content-between">
                        <span>${d[0].grado}</span>
                        <span class="badge bg-success">${d[0].status}</span>
                    </div>
                </div>`;
            } else {
                // No encontrado
                res.innerHTML = `<div class="alert alert-danger mt-3">❌ Cédula no encontrada en sistema.</div>`;
            }
        })
        .catch(err => {
            res.innerHTML = `<div class="alert alert-warning mt-3">⚠️ Error de conexión.</div>`;
        });
}

// --- B. NOTICIAS ---
function cargarNoticias() {
    if(noticiasCargadas) return; // Si ya cargó, no repetir
    
    const contenedor = document.getElementById('contenedorNoticias');
    contenedor.innerHTML = '<div class="text-center w-100 py-4"><div class="spinner-border text-primary"></div><p>Cargando cartelera...</p></div>';
    
    fetch(`${API_URL}?action=ver_noticias`)
        .then(r => r.json())
        .then(data => {
            let html = '';
            if(data.length === 0) {
                html = '<div class="alert alert-info">No hay noticias recientes.</div>';
            } else {
                data.forEach(n => {
                    let img = n.imagen || 'https://via.placeholder.com/400x200?text=Noticias+UELB';
                    html += `
                    <div class="col-md-6">
                        <div class="card shadow-sm h-100 news-card">
                            <img src="${img}" class="card-img-top" style="height:180px; object-fit:cover">
                            <div class="card-body">
                                <small class="text-muted">📅 ${new Date(n.fecha).toLocaleDateString()}</small>
                                <h5 class="card-title mt-1">${n.titulo}</h5>
                                <p class="card-text small">${n.contenido}</p>
                            </div>
                        </div>
                    </div>`;
                });
            }
            contenedor.innerHTML = html;
            noticiasCargadas = true;
        });
}

// --- C. GUÍAS ---
function cargarGuias() {
    if(guiasCache.length > 0) return; // Usar memoria si ya existen
    
    document.getElementById('contenedorGuias').innerHTML = '<div class="text-center py-4 text-muted">Conectando con la biblioteca...</div>';
    
    fetch(`${API_URL}?action=ver_guias`)
        .then(r => r.json())
        .then(d => {
            guiasCache = d;
            filtrarGuias(); // Mostrar todas inicialmente
        });
}

function filtrarGuias() {
    let f = document.getElementById('filtroAno').value;
    let container = document.getElementById('contenedorGuias');
    container.innerHTML = '';
    
    // Filtrar en memoria
    let datos = guiasCache.filter(g => f === 'Todos' || g.ano === f);
    
    if(datos.length === 0) {
        container.innerHTML = '<div class="alert alert-warning w-100">No hay guías cargadas para este año.</div>';
        return;
    }

    datos.forEach(g => {
        container.innerHTML += `
        <div class="col-6 col-md-4">
            <div class="card guide-card h-100 p-3 text-center position-relative">
                <div class="mb-2"><i class="bi bi-file-earmark-pdf fs-1 text-danger"></i></div>
                <small class="d-block text-muted text-uppercase fw-bold" style="font-size:0.7rem">${g.materia}</small>
                <h6 class="text-primary my-2" style="font-size:0.9rem">${g.titulo}</h6>
                <a href="${g.link}" target="_blank" class="btn btn-sm btn-outline-primary w-100 rounded-pill stretched-link">Descargar</a>
            </div>
        </div>`;
    });
}

// --- D. INSCRIPCIÓN ---
function enviarInscripcion(e) {
    e.preventDefault();
    let btn = document.getElementById('btnEnviar');
    let aviso = document.getElementById('avisoForm');
    
    // Convertir datos del formulario a objeto JSON
    let formData = new FormData(e.target);
    let datos = Object.fromEntries(formData.entries());

    btn.disabled = true; 
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Enviando...';

    fetch(API_URL, { 
        method: 'POST', 
        body: JSON.stringify(datos) 
    })
    .then(r => r.json())
    .then(resp => {
        if(resp.status === 'success') {
            aviso.innerHTML = `<div class="alert alert-success">✅ ¡Solicitud recibida! Te contactaremos pronto.</div>`;
            e.target.reset();
        } else {
            aviso.innerHTML = `<div class="alert alert-danger">⚠️ Error en el servidor. Intenta de nuevo.</div>`;
        }
        btn.disabled = false; 
        btn.innerText = "ENVIAR DATOS";
    })
    .catch(err => {
        aviso.innerHTML = `<div class="alert alert-danger">⚠️ Error de conexión.</div>`;
        btn.disabled = false;
        btn.innerText = "ENVIAR DATOS";
    });
}


// ==========================================
// 5. CHATBOT "SIMÓN"
// ==========================================

function toggleChat() {
    const chat = document.getElementById('chatbot-container');
    const icon = document.getElementById('chatIcon');
    
    if (chat.classList.contains('chatbot-closed')) {
        chat.classList.remove('chatbot-closed');
        icon.classList.replace('bi-chevron-up', 'bi-chevron-down');
    } else {
        chat.classList.add('chatbot-closed');
        icon.classList.replace('bi-chevron-down', 'bi-chevron-up');
    }
}

function chatAsk(tema) {
    const chatBox = document.getElementById('chatMessages');
    let respuesta = "";

    // 1. Mostrar lo que el usuario preguntó
    let preguntaTexto = event.target.innerText;
    chatBox.innerHTML += `<div class="user-msg">${preguntaTexto}</div>`;

    // 2. Cerebro de respuestas de Simón
    switch(tema) {
        case 'requisitos':
            respuesta = "Para inscribirte necesitamos: Copia de Cédula (o escolar), Partida de Nacimiento y el Boletín del año pasado. ¡Todo se sube aquí mismo!";
            break;
        case 'notas':
            respuesta = "Es fácil. Ve a la pestaña 'Inicio', coloca tu cédula en el buscador y verás tu boleta actualizada.";
            break;
        case 'ubicacion':
            respuesta = "La UE Libertador Bolívar está siempre abierta para ti. Estamos en la dirección principal de tu comunidad.";
            break;
        case 'contacto':
            respuesta = "Si necesitas hablar con dirección, acércate en horario de oficina (7am - 12pm) o déjanos tus datos en 'Inscripción' para llamarte.";
            break;
        default:
            respuesta = "Disculpa, no entendí bien. ¿Puedes probar con los botones de abajo?";
    }

    // 3. Simular "Escribiendo..."
    chatBox.innerHTML += `<div class="text-muted small ms-2 mb-1 id='typing'">Simón está escribiendo...</div>`;
    chatBox.scrollTop = chatBox.scrollHeight; 

    setTimeout(() => {
        // Eliminar mensaje de escribiendo (truco rápido borrando el último elemento si fuera un div, 
        // pero aquí simplemente agregamos la respuesta al final para simplificar)
        // Lo ideal es remover el 'typing', pero para simplificar agregamos la respuesta directa.
        
        chatBox.innerHTML += `<div class="bot-msg">${respuesta}</div>`;
        chatBox.scrollTop = chatBox.scrollHeight; // Bajar scroll al final
    }, 800);
}
