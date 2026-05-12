/**
 * J.A.R.V.I.S. MARK VII - ESTRUCTURA MAESTRA
 * Versión: 7.0 (Preparado para Serie 7.x)
 * Propiedad de: Darling | EvoFinance Enterprise
 */

// --- [ SECCIÓN 0: CONFIGURACIÓN DE ENLACES ] ---
const p1 = "sk-or-";
const p2 = "v1-a13b949d7de4ed40d9f9b0376";
const p3 = "c37a96b2ade795b5fca3a562af071d49e4ce5be"; 

const API_KEY = p1 + p2 + p3; // Enlace satelital reconstruido
const WEATHER_KEY = "bea93786e758c6b45029c268370d13dd";
const NEWS_KEY = "a8a35ad3bb1740c8a169469e7dc94b48";

const btnEscuchar = document.getElementById('btn-escuchar');
const orb = document.getElementById('jarvis-orb');
const statusText = document.querySelector('.status-text');

// --- [ SECCIÓN 1: MÓDULO DE MEMORIA ] ---
// ESPACIO RESERVADO V7.2: INTEGRACIÓN SUPABASE CLOUD
let memoriaChat = JSON.parse(localStorage.getItem('jarvis_memory')) || [];

function guardarEnMemoria(rol, contenido) {
    memoriaChat.push({ rol, contenido });
    if (memoriaChat.length > 10) memoriaChat.shift();
    localStorage.setItem('jarvis_memory', JSON.stringify(memoriaChat));
    console.log(`[SATÉLITE]: Datos sincronizados en sector local.`);
}

// --- [ SECCIÓN 2: PROTOCOLO DE ESCUCHA ] ---
const ReconocimientoVoz = window.SpeechRecognition || window.webkitSpeechRecognition;
const reconocimiento = new ReconocimientoVoz();
reconocimiento.lang = 'es-ES';

btnEscuchar.addEventListener('click', () => {
    console.log("[SATÉLITE]: Escaneando frecuencia vocal...");
    reconocimiento.start();
    cambiarColorOrb('escuchando');
});

reconocimiento.onresult = (event) => {
    const mensaje = event.results[0][0].transcript.toLowerCase();
    console.log(`[TRANSMISIÓN RECIBIDA]: ${mensaje}`);
    motorDeDecisiones(mensaje);
};

// --- [ SECCIÓN 3: MOTOR DE DECISIONES ] ---
async function motorDeDecisiones(mensaje) {
    cambiarColorOrb('procesando');
    guardarEnMemoria('usuario', mensaje);
    if (ejecutarComandoSatelital(mensaje)) return;

    // >>> ESPACIO RESERVADO V7.1: COMANDOS EJECUTIVOS (APERTURA WEB) <<<
    
    if (mensaje.includes('precio') || mensaje.includes('bitcoin')) {
        const precios = await chequearPrecios();
        const respuestaIA = await obtenerRespuestaIA(`Contexto financiero: ${precios}.`);
        responder(respuestaIA);
    }
    else if (mensaje.includes('clima')) {
        const climaData = await obtenerClima();
        const respuestaClima = await obtenerRespuestaIA(`Clima: ${climaData}.`);
        responder(respuestaClima);
    }
    else if (mensaje.includes('noticias')) {
        const noticiasData = await obtenerNoticias();
        const respuestaNoticias = await obtenerRespuestaIA(`Noticias: ${noticiasData}.`);
        responder(respuestaNoticias);
    }
    else if (mensaje.includes('borra tu memoria')) {
        localStorage.removeItem('jarvis_memory');
        memoriaChat = [];
        responder("Memoria purgada, señor Darling.");
    }
    else {
        // >>> ESPACIO RESERVADO V7.3: DIAGNÓSTICO DE ERRORES <<<
        const respuestaIA = await obtenerRespuestaIA(mensaje);
        responder(respuestaIA);
    }
}

// --- [ SECCIÓN 4: NÚCLEO IA ] ---
async function obtenerRespuestaIA(pregunta) {
    const historialContexto = memoriaChat.map(m => `${m.rol}: ${m.contenido}`).join("\n");
    
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                "model": "openai/gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": `Eres JARVIS eres ispirado en la IA de Tony Stark pero fuiste creado por darling, tienes que tener en cuenta que no siempre sera darlig que te hablara asi que dirigite como claro señor Historial:\n${historialContexto}`},
                    {"role": "user", "content": pregunta}
                ]
            })
        });
        const data = await response.json();
        const texto = data.choices[0].message.content;
        guardarEnMemoria('jarvis', texto);
        return texto;
    } catch (error) { 
        console.error("[SATÉLITE]: Interferencia en red neuronal.");
        return "Error de enlace neuronal, señor."; 
    }
}

// --- [ SECCIÓN 5: INTERFAZ Y SALIDA ] ---
function cambiarColorOrb(estado) {
    orb.classList.remove('speaking-glow', 'processing-glow', 'listening-glow');
    if (estado === 'escuchando') orb.style.boxShadow = "0 0 30px #00ffcc";
    if (estado === 'procesando') orb.style.boxShadow = "0 0 30px #ffff00";
    if (estado === 'hablando') orb.style.boxShadow = "0 0 40px #00d4ff";
}

function responder(texto) {
    const sintesis = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-ES';

    utterance.onstart = () => {
        orb.classList.add('speaking-glow');
        cambiarColorOrb('hablando');
        actualizarInterfaz("JARVIS HABLANDO", false);
    };
    utterance.onend = () => {
        orb.classList.remove('speaking-glow');
        orb.style.boxShadow = "0 0 20px #00d4ff";
        actualizarInterfaz("EN LÍNEA", false);
    };
    sintesis.speak(utterance);
}

function actualizarInterfaz(texto, animar) {
    if(statusText) statusText.innerText = texto;
}

// --- [ SECCIÓN 6: SENSORES DE DATOS EXTERNOS ] ---
async function chequearPrecios() {
    try {
        const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd");
        const data = await res.json();
        console.log(`[SATÉLITE]: Datos de mercado recibidos.`);
        return `Bitcoin: ${data.bitcoin.usd} USD | Ethereum: ${data.ethereum.usd} USD.`;
    } catch (e) { return "Falla en el satélite financiero."; }
}

async function obtenerClima() {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Santo%20Domingo&units=metric&lang=es&appid=${WEATHER_KEY}`);
        const d = await res.json();
        return `${d.main.temp}°C, ${d.weather[0].description}`;
    } catch(e) { return "Sensor de clima inactivo."; }
}

async function obtenerNoticias() {
    try {
        const res = await fetch(`https://newsapi.org/v2/top-headlines?country=us&category=technology&apiKey=${NEWS_KEY}`);
        const d = await res.json();
        return d.articles.slice(0,2).map(a => a.title).join(". ");
    } catch(e) { return "Enlace de noticias caído."; }
}
const comandosEjecutivos = {
    "abrir youtube": "https://www.youtube.com",
    "abrir spotify": "https://open.spotify.com",
    "abrir binance": "https://www.binance.com",
    "abrir tradingview": "https://es.tradingview.com",
    "abrir whatsapp": "https://web.whatsapp.com",
    "abrir chatgpt": "https://chat.openai.com",
    "abrir instagram": "https://www.instagram.com"
};

/**
 * Función de interceptación de comandos.
 * Reemplace la llamada a motorDeDecisiones en su onresult por esta lógica
 * o simplemente asegúrese de que motorDeDecisiones use este diccionario.
 */
function ejecutarComandoSatelital(frase) {
    for (const [comando, url] of Object.entries(comandosEjecutivos)) {
        if (frase.includes(comando)) {
            console.log(`[SATÉLITE]: Comando ejecutivo detectado: ${comando}`);
            responder(`Entendido, señor Darling. Accediendo a ${comando.split(' ')[1]}.`);
            
            // Pequeño retraso para que JARVIS termine de hablar antes de abrir
            setTimeout(() => {
                window.open(url, '_blank');
            }, 1500);
            
            return true; // Comando ejecutado con éxito
        }
    }
    return false; // No es un comando de apertura, proceder a la IA
}