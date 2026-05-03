/**
 * J.A.R.V.I.S. MARK IV - SISTEMA OPERATIVO CENTRAL V5.6
 * Propiedad de: Darling | EvoFinance Enterprise
 * Estado: Nueva Conexión Neuronal Establecida
 */

const API_KEY = "AIzaSyCK3Ky2mAoZNIWN6LUqWTU6jz3W4iwgPeQ";
const btnEscuchar = document.getElementById('btn-escuchar');
const orb = document.getElementById('jarvis-orb');
const statusText = document.querySelector('.status-text');

// ==========================================
// 1. CONFIGURACIÓN DE VOZ
// ==========================================
const ReconocimientoVoz = window.SpeechRecognition || window.webkitSpeechRecognition;
const reconocimiento = new ReconocimientoVoz();
reconocimiento.lang = 'es-ES';

btnEscuchar.addEventListener('click', () => {
    try {
        reconocimiento.start();
        actualizarInterfaz("ESCUCHANDO...", true);
    } catch (e) { console.error("Error de audio:", e); }
});

reconocimiento.onresult = (event) => {
    const mensaje = event.results[0][0].transcript.toLowerCase();
    actualizarInterfaz("PROCESANDO...", false);
    motorDeDecisiones(mensaje);
};

// ==========================================
// 2. MOTOR DE DECISIONES
// ==========================================
async function motorDeDecisiones(mensaje) {
    console.log(`[JARVIS]: Analizando: "${mensaje}"`);

    if (mensaje.includes('estado del sistema') || mensaje.includes('cómo estás')) {
        responder("Todos los sistemas están operativos, señor Darling. Mark IV al 100%.");
    } 
    else if (mensaje.includes('hora')) {
        const tiempo = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        responder(`Son las ${tiempo}, señor.`);
    }
    else if (mensaje.includes('busca en google')) {
        const busqueda = mensaje.replace('busca en google', '').trim();
        ejecutarAccion(`Buscando ${busqueda} en la red.`, `https://www.google.com/search?q=${busqueda}`);
    }
    else if (mensaje.includes('bitcoin') || mensaje.includes('precio')) {
        ejecutarAccion("Consultando Wall Street para usted.", "https://www.binance.com/es/price/bitcoin");
    }
    else {
        // LLAMADA DIRECTA AL CEREBRO GEMINI
        actualizarInterfaz("PENSANDO...", true);
        const respuestaIA = await obtenerRespuestaGemini(mensaje);
        responder(respuestaIA);
    }
}

// ==========================================
// 3. CONEXIÓN CON GEMINI API
// ==========================================
async function obtenerRespuestaGemini(pregunta) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Eres JARVIS. Responde de forma breve al señor Darling: ${pregunta}` }] }]
            })
        });

        const result = await response.json();
        
        if (result.candidates && result.candidates.length > 0) {
            return result.candidates[0].content.parts[0].text;
        } else {
            return "Señor, la API devolvió un formato inesperado. Verifique el panel de control.";
        }
    } catch (error) {
        return "Me temo que hay una interferencia en mi servidor central, señor.";
    }
}

// ==========================================
// 4. SALIDA DE VOZ Y UI
// ==========================================
function responder(texto) {
    const sintesis = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-ES';
    utterance.pitch = 0.85;

    utterance.onstart = () => orb.classList.add('speaking-glow');
    utterance.onend = () => {
        orb.classList.remove('speaking-glow');
        actualizarInterfaz("EN LÍNEA", false);
    };
    sintesis.speak(utterance);
}

function actualizarInterfaz(texto, animar) {
    statusText.innerText = texto;
    if (animar) orb.classList.add('speaking-glow');
    else orb.classList.remove('speaking-glow');
}

function ejecutarAccion(confirmacion, url) {
    responder(confirmacion);
    setTimeout(() => window.open(url, '_blank'), 1500);
}