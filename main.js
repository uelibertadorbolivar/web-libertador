// ==========================================
// CONFIGURACIÓN GENERAL
// ==========================================
const API_URL = "PEGAR_AQUI_TU_URL_DE_APPS_SCRIPT"; 

// Variables de Estado
let noticiasCargadas = false;
let guiasCache = [];

// ==========================================
// 1. SISTEMA DE BIENVENIDA Y ACCESO
// ==========================================

function entrarAlSistema(e) {
    e.preventDefault();
    
    // Obtener datos del formulario
    const nombre = document.getElementById('userName').value.trim();
    const genero = document.getElementById('userGender').value;
    
    if(!nombre || !genero) {
        alert("Por favor completa tus datos para ingresar.");
        return;
    }

    // Guardar en sesión (para que no se pierda al recargar, opcional)
    sessionStorage.setItem('usuarioNombre', nombre);
    sessionStorage.setItem('usuarioGenero', genero);

    // Personalizar Interfaz
    personalizarInterfaz(nombre, genero);

    // Ocultar Bienvenida y Mostrar App
    document.getElementById('welcome-screen').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('welcome-screen').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
    }, 500);

    // Registrar Visita en segundo plano (No hacemos esperar al usuario)
    registrarVisita();
}

function personalizarInterfaz(nombre, genero) {
    // Nombre corto (Primer nombre)
    const primerNombre = nombre.split(" ")[0];
    
    // Icono según género
    let iconoHTML = "";
    if (genero === "M") {
        iconoHTML = '<i class="bi bi-person-standing text-primary"></i>'; // Icono Masculino
    } else {
        iconoHTML = '<i class="bi bi-person-standing-dress text-danger"></i>'; // Icono Femenino
    }

    // Inyectar en el DOM
    document.getElementById('displayUserName').innerText = primerNombre;
    document.getElementById('userIcon').innerHTML = iconoHTML;
    document.getElementById('welcomeName').innerText = primerNombre;
}

function registrarVisita() {
    // Llama a la API para sumar +1 al contador
    fetch(`${API_URL}?action=registrar_visita`)
        .then(r => r.json())
        .then(data => {
            console.log("Visita registrada. Total: " + data.visitas);
        })
        .catch(err => console.log("Error contando visita", err));
}

// Cargar contador inicial (solo visual para la portada)
document.addEventListener("DOMContentLoaded", () => {
    // Si queremos mostrar el contador antes de entrar, podemos hacer un fetch rapido
    // De momento lo dejamos oculto o estático para no retrasar la carga
    document.getElementById('contadorVisitas').innerText = "Cargando...";
});


// ==========================================
// 2. NAVEGACIÓN Y MÓDULOS
// ==========================================

function nav(vista) {
    // Ocultar todas las vistas
    document.querySelectorAll('.section-view').forEach(el => el.style.display = 'none');
    // Mostrar la seleccionada
    document.getElementById('view-' + vista).style.display = 'block';
    
    // Actualizar botones menú
    document.querySelectorAll('.btn-nav').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

// --- CONSULTA ALUMNO ---
function consultarAlumno() {
    let ced = document.getElementById('cedulaInput').value;
    let res = document.getElementById('resAlumno');
    res.innerHTML = '<div class="alert alert-info mt-3">⏳ Buscando en la base de datos...</div>';
    
    fetch(`${API_URL}?action=consultar_alumno&cedula=${ced}`)
        .then(r => r.json())
        .then(d => {
            if(d.length > 0) {
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
                res.innerHTML = `<div class="alert alert-danger mt-3">❌ Cédula no encontrada. Verifique o pase por dirección.</div>`;
            }
        });
}

// --- NOTICIAS ---
function cargarNoticias() {
    if(noticiasCargadas) return;
    document.getElementById('contenedorNoticias').innerHTML = '<div class="text-center w-100"><div class="spinner-border text-primary"></div></div>';
    
    fetch(`${API_URL}?action=ver_noticias`)
        .then(r => r.json())
        .then(data => {
            let html = '';
            data.forEach(n => {
                let img = n.imagen || 'https://via.placeholder.com/400x200?text=Noticias+UE+LB';
                html += `
                <div class="col-md-6">
                    <div class="card shadow-sm h-100">
                        <img src="${img}" class="card-img-top" style="height:180px; object-fit:cover">
                        <div class="card-body">
                            <small class="text-muted">📅 ${new Date(n.fecha).toLocaleDateString()}</small>
                            <h5 class="card-title mt-1">${n.titulo}</h5>
                            <p class="card-text small">${n.contenido}</p>
                        </div>
                    </div>
                </div>`;
            });
            document.getElementById('contenedorNoticias').innerHTML = html;
            noticiasCargadas = true;
        });
}

// --- GUÍAS ---
function cargarGuias() {
    if(guiasCache.length > 0) return;
    document.getElementById('contenedorGuias').innerText = "Cargando biblioteca...";
    
    fetch(`${API_URL}?action=ver_guias`).then(r => r.json()).then(d => {
        guiasCache = d;
        filtrarGuias();
    });
}

function filtrarGuias() {
    let f = document.getElementById('filtroAno').value;
    let container = document.getElementById('contenedorGuias');
    container.innerHTML = '';
    
    let datos = guiasCache.filter(g => f === 'Todos' || g.ano === f);
    if(datos.length === 0) container.innerHTML = '<div class="alert alert-warning w-100">No hay guías para este año todavía.</div>';

    datos.forEach(g => {
        container.innerHTML += `
        <div class="col-6 col-md-4">
            <div class="card guide-card h-100 p-3 text-center">
                <div class="mb-2"><i class="bi bi-file-earmark-pdf fs-1 text-danger"></i></div>
                <small class="d-block text-muted text-uppercase fw-bold" style="font-size:0.7rem">${g.materia}</small>
                <h6 class="text-primary my-2" style="font-size:0.9rem">${g.titulo}</h6>
                <a href="${g.link}" target="_blank" class="btn btn-sm btn-outline-primary w-100 rounded-pill">Descargar</a>
            </div>
        </div>`;
    });
}

// --- INSCRIPCIÓN ---
function enviarInscripcion(e) {
    e.preventDefault();
    let btn = document.getElementById('btnEnviar');
    let aviso = document.getElementById('avisoForm');
    let datos = Object.fromEntries(new FormData(e.target).entries());

    btn.disabled = true; btn.innerText = "Enviando...";

    fetch(API_URL, { method: 'POST', body: JSON.stringify(datos) })
    .then(r => r.json())
    .then(resp => {
        if(resp.status === 'success') {
            aviso.innerHTML = `<div class="alert alert-success">✅ ¡Datos recibidos exitosamente!</div>`;
            e.target.reset();
        } else {
            aviso.innerHTML = `<div class="alert alert-danger">⚠️ Error. Intente de nuevo.</div>`;
        }
        btn.disabled = false; btn.innerText = "ENVIAR DATOS";
    });
}

// ==========================================
// 3. CHATBOT INTELIGENTE
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

    // 1. Mostrar pregunta del usuario
    let preguntaTexto = event.target.innerText;
    chatBox.innerHTML += `<div class="user-msg">${preguntaTexto}</div>`;

    // 2. Lógica de respuestas (Simulada)
    switch(tema) {
        case 'requisitos':
            respuesta = "Para inscribir necesitas: Copia de Cédula, Partida de Nacimiento, Fotos tipo carnet y Boletín del año anterior. Ve a la pestaña 'Inscribir'.";
            break;
        case 'notas':
            respuesta = "Puedes ver las notas en 'Inicio' ingresando la Cédula del estudiante en el buscador.";
            break;
        case 'ubicacion':
            respuesta = "Estamos ubicados en la Av. Principal, al lado de la Plaza Bolívar. Horario: 7am a 12pm.";
            break;
        case 'contacto':
            respuesta = "Escribe al correo: direccion@uelibertador.com o ve a la Dirección del plantel.";
            break;
        default:
            respuesta = "No entendí tu pregunta, intenta otra opción.";
    }

    // 3. Simular "Escribiendo..." y mostrar respuesta
    chatBox.innerHTML += `<div class="text-muted small ms-2 mb-1">Escribiendo...</div>`;
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll

    setTimeout(() => {
        // Borrar "Escribiendo" y poner respuesta
        chatBox.lastElementChild.remove();
        chatBox.innerHTML += `<div class="bot-msg">${respuesta}</div>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 1000);
}
