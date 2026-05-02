/**
 * J.A.R.V.I.S. MARK IV - SISTEMA OPERATIVO CENTRAL V5.5
 * Propiedad de: Darling | EvoFinance Enterprise
 * Clave API: Jarvis (Activada)
 */

const API_KEY = "AIzaSyCNeA1MkGbR8ihwYGg2ldNG7_GAampQppw";
const btnEscuchar = document.getElementById('btn-escuchar');
const orb = document.getElementById('jarvis-orb');
const statusText = document.querySelector('.status-text');

// ==========================================
// 1. CONFIGURACIÓN DE VOZ Y RECONOCIMIENTO
// ==========================================
const ReconocimientoVoz = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!ReconocimientoVoz) {
    alert("Señor, su navegador no soporta el reconocimiento de voz. Recomiendo usar Chrome.");
}

const reconocimiento = new ReconocimientoVoz();
reconocimiento.lang = 'es-ES';
reconocimiento.continuous = false;
reconocimiento.interimResults = false;

// ==========================================
// 2. PROTOCOLOS DE INICIO
// ==========================================
btnEscuchar.addEventListener('click', () => {
    try {
        reconocimiento.start();
        actualizarInterfaz("ESCUCHANDO...", true);
    } catch (e) {
        console.error("Error al iniciar audio:", e);
    }
});

reconocimiento.onresult = (event) => {
    const mensaje = event.results[0][0].transcript.toLowerCase();
    actualizarInterfaz("PROCESANDO...", false);
    motorDeDecisiones(mensaje);
};

reconocimiento.onerror = (event) => {
    actualizarInterfaz("ERROR DE AUDIO", false);
    console.error("Error de reconocimiento:", event.error);
};

reconocimiento.onend = () => {
    orb.classList.remove('speaking-glow');
};

// ==========================================
// 3. MOTOR DE DECISIONES (LÓGICA DE COMANDOS)
// ==========================================
async function motorDeDecisiones(mensaje) {
    console.log(`[LOG]: Analizando entrada: "${mensaje}"`);

    // --- PROTOCOLO: ESTADO DEL SISTEMA ---
    if (mensaje.includes('estado del sistema') || mensaje.includes('cómo estás')) {
        responder("Todos los sistemas están operativos, Todos los satélites locales en orden señor Darling. La integridad del Mark IV está al 100%.");
    }

    // --- PROTOCOLO: TIEMPO Y FECHA ---
    else if (mensaje.includes('hora')) {
        const tiempo = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        responder(`Son exactamente las ${tiempo}, señor.`);
    }
    else if (mensaje.includes('fecha') || mensaje.includes('día')) {
        const fecha = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        responder(`Hoy es ${fecha}.`);
    }

    // --- PROTOCOLO: NAVEGACIÓN Y WEB ---
    else if (mensaje.includes('abre youtube')) {
        ejecutarAccion("Abriendo centro de medios.", "https://www.youtube.com");
    }
    else if (mensaje.includes('busca en google')) {
        const busqueda = mensaje.replace('busca en google', '').trim();
        ejecutarAccion(`Buscando Informacion en satélite local ${busqueda} en la red.`, `https://www.google.com/search?q=${busqueda}`);
    }
    else if (mensaje.includes('tradingview') || mensaje.includes('gráficos')) {
        ejecutarAccion("Accediendo a la terminal de EvoFinance.", "https://es.tradingview.com/chart");
    }

    // --- PROTOCOLO: MERCADOS CRYPTO ---
    else if (mensaje.includes('bitcoin') || mensaje.includes('precio de btc')) {
        ejecutarAccion("Consultando con WALL STREET para obtener el valor actual del Bitcoin... Listo me pasaron la informacion", "https://www.binance.com/es/price/bitcoin");
    }

    // --- PROTOCOLO: CEREBRO NEURONAL (GEMINI API) ---
    else {
        actualizarInterfaz("PENSANDO...", true);
        const respuestaIA = await consultarCerebroGemini(mensaje);
        responder(respuestaIA);
    }
}

// ==========================================
// 4. CONEXIÓN CON GEMINI API (INTELIGENCIA)
// ==========================================
async function consultarCerebroGemini(pregunta) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    
    const configuracion = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: `Contexto: Eres J.A.R.V.I.S., la inteligencia artificial de Tony Stark. 
                    Tu creador es el señor Darling. Sé sofisticado, un poco sarcástico pero muy leal. 
                    Respuesta corta y eficiente. Pregunta: ${pregunta}`
                }]
            }]
        })
    };

    try {
        const response = await fetch(endpoint, configuracion);
        if (!response.ok) throw new Error("Fallo en la matriz de datos.");
        
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Error en enlace neuronal:", error);
        return "Señor Darling, me temo que la conexión con el servidor de Google AI ha sido interrumpida.";
    }
}

// ==========================================
// 5. NÚCLEO DE SALIDA (VOZ Y UI)
// ==========================================
function responder(texto) {
    const sintesis = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(texto);
    
    utterance.lang = 'es-ES';
    utterance.rate = 1.0; 
    utterance.pitch = 0.85; // Voz más grave tipo Jarvis

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

// ==========================================
// 6. AUTO-DIAGNÓSTICO AL CARGAR
// ==========================================
window.onload = () => {
    console.log("J.A.R.V.I.S. satélite Mark IV iniciado satisfactoriamente.");
    actualizarInterfaz("SISTEMAS LISTOS", false);
};