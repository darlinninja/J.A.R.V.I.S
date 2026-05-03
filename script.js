// J.A.R.V.I.S. MARK V - NÚCLEO DE DIAGNÓSTICO
const API_KEY = "AIzaSyCK3Ky2mAoZNIWN6LUqWTU6jz3W4iwgPeQ";
const btnEscuchar = document.getElementById('btn-escuchar');
const statusText = document.querySelector('.status-text');
const orb = document.getElementById('jarvis-orb');

const ReconocimientoVoz = window.SpeechRecognition || window.webkitSpeechRecognition;
const reconocimiento = new ReconocimientoVoz();
reconocimiento.lang = 'es-ES';

// 1. ESCUCHANDO
btnEscuchar.addEventListener('click', () => {
    statusText.innerText = "ESCUCHANDO...";
    if (orb) orb.classList.add('speaking-glow');
    reconocimiento.start();
});

// 2. PROCESANDO
reconocimiento.onresult = async (event) => {
    const pregunta = event.results[0][0].transcript.toLowerCase();
    statusText.innerText = `TÚ: "${pregunta}" | PENSANDO...`;
    
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
        const respuesta = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Eres la IA de asistencia Jarvis. Responde brevemente al señor Darling: ${pregunta}` }] }]
            })
        });

        // SI GOOGLE RECHAZA LA LLAVE, LO VEREMOS AQUÍ
        if (!respuesta.ok) {
            const errorData = await respuesta.json();
            statusText.innerText = `ERROR API: ${errorData.error.message}`;
            hablar("Señor, Google rechazó la conexión. Lea la pantalla.");
            return;
        }

        const datos = await respuesta.json();
        const textoJarvis = datos.candidates[0].content.parts[0].text;
        
        statusText.innerText = "RESPONDIENDO...";
        hablar(textoJarvis);

    } catch (error) {
        // SI EL NAVEGADOR BLOQUEA EL INTERNET, LO VEREMOS AQUÍ
        statusText.innerText = `ERROR DE RED: Navegador o Antivirus bloqueando la señal.`;
        hablar("Señor, mi conexión a internet ha sido bloqueada localmente.");
    }
};

reconocimiento.onerror = (event) => {
    statusText.innerText = `ERROR DE MICRÓFONO: ${event.error}`;
    if (orb) orb.classList.remove('speaking-glow');
};

// 3. HABLANDO
function hablar(texto) {
    const sintesis = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-ES';
    utterance.pitch = 0.8;
    
    utterance.onend = () => { 
        statusText.innerText = "SISTEMA LISTO"; 
        if (orb) orb.classList.remove('speaking-glow');
    };
    
    sintesis.speak(utterance);
}