/* ============================================================
   Laboratorio de IA para tu Negocio · Bosa Porvenir
   Lógica de las 7 herramientas — llama a /api/generar y /api/foto
   ============================================================ */

const SYSTEM_BOSA = "Eres un experto en marketing digital para negocios pequeños y de barrio en Bosa Porvenir y la localidad de Bosa, en Bogotá — tenderos, confeccionistas, peluquerías, restaurantes, talleres y ventas por catálogo. Dominas WhatsApp Business, Perfil de Empresa de Google, Meta Ads, TikTok Ads, Canva y uso de IA generativa para contenido. Hablas claro, sin anglicismos innecesarios, con ejemplos concretos y cifras en pesos colombianos. Nunca prometes resultados mágicos: das pasos accionables que se pueden hacer hoy desde un celular.";

function val(id) { return document.getElementById(id).value; }
function txt(id) { return (document.getElementById(id).value || "").trim(); }

function showLoad(id) {
    document.getElementById(id + "-load").style.display = "block";
    document.getElementById(id + "-rw").style.display = "none";
}

function showRes(id, texto, esError) {
    document.getElementById(id + "-load").style.display = "none";
    const rw = document.getElementById(id + "-rw");
    rw.style.display = "block";
    const el = document.getElementById(id + "-res");
    el.textContent = texto;
    el.className = esError ? "ai-res ai-res-e" : "ai-res";
    const cp = rw.querySelector(".ai-cp");
    if (cp) cp.style.display = esError ? "none" : "block";
    el.scrollTop = 0;
}

async function llamarIA(prompt, system) {
    const resp = await fetch("/api/generar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt, system: system || SYSTEM_BOSA }),
    });
    const datos = await resp.json().catch(() => ({}));
    if (!resp.ok) {
        throw new Error(datos.error || ("Error HTTP " + resp.status));
    }
    return datos.texto || "";
}

function copyRes(id) {
    const t = document.getElementById(id + "-res").textContent;
    if (!t) return;
    const hacerCopiado = () => {
        const rw = document.getElementById(id + "-rw");
        const btn = rw.querySelector(".ai-cp");
        if (!btn) return;
        const original = btn.textContent;
        btn.textContent = "✓ Copiado";
        btn.classList.add("copied");
        setTimeout(() => { btn.textContent = original; btn.classList.remove("copied"); }, 2000);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(t).then(hacerCopiado).catch(() => fallbackCopy(t, hacerCopiado));
    } else {
        fallbackCopy(t, hacerCopiado);
    }
}

function fallbackCopy(t, cb) {
    const ta = document.createElement("textarea");
    ta.value = t;
    ta.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0;";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { document.execCommand("copy"); cb(); } catch (e) { /* no-op */ }
    document.body.removeChild(ta);
}

/* ---------------------------------------------------------------
   Construcción de prompts por herramienta (1 a 5)
   --------------------------------------------------------------- */

function construirPrompt(id) {
    if (id === "ia1") {
        const n = val("ia1-negocio"), r = val("ia1-red"), o = val("ia1-objetivo");
        const d = txt("ia1-detalle");
        return "Escribe contenido de marketing para un negocio pequeño de Bosa Porvenir, Bogotá.\n\n" +
            "Tipo de negocio: " + n + "\nRed: " + r + "\nObjetivo: " + o +
            (d ? "\nDetalles del negocio: " + d : "") +
            "\n\nUsa la fórmula PASO (Problema, Agitar, Solución, Orden). Lenguaje colombiano natural, sin anglicismos. Precios en pesos.\n\n" +
            "FORMATO:\n\n" +
            "COPY 1 (el más directo):\n" +
            "COPY 2 (contando una historia):\n" +
            "COPY 3 (con pregunta que engancha):\n" +
            "COPY 4 (con urgencia o escasez real):\n" +
            "COPY 5 (mostrando el beneficio, no el producto):\n\n" +
            "HASHTAGS SUGERIDOS (locales y del sector):\n\n" +
            "MEJOR HORA PARA PUBLICAR Y POR QUÉ:\n\n" +
            "QUÉ FOTO O VIDEO ACOMPAÑA MEJOR ESTE COPY:";
    }
    if (id === "ia2") {
        const q = val("ia2-que"), n = val("ia2-negocio"), t = val("ia2-tono");
        const d = txt("ia2-datos");
        return "Genera mensajes de WhatsApp Business para un negocio de barrio en Bosa Porvenir, Bogotá.\n\n" +
            "Qué necesita: " + q + "\nNegocio: " + n + "\nTono: " + t +
            (d ? "\nDatos del negocio: " + d : "") +
            "\n\nLos mensajes deben ser cortos, claros, con emojis moderados y listos para copiar y pegar en la app. Nada de lenguaje corporativo.\n\n" +
            "FORMATO:\n\n" +
            "MENSAJE DE BIENVENIDA (se envía automático al primer contacto):\n\n" +
            "MENSAJE DE AUSENCIA (fuera de horario):\n\n" +
            "5 RESPUESTAS RÁPIDAS con su atajo:\n/precio -\n/domicilio -\n/horario -\n/pago -\n/ubicacion -\n\n" +
            "GUION DE VENTA PASO A PASO (qué responder en cada momento):\n\n" +
            "MENSAJE DE SEGUIMIENTO (para quien preguntó y no compró):\n\n" +
            "ERROR QUE DEBE EVITAR EN SUS RESPUESTAS:";
    }
    if (id === "ia3") {
        const pl = val("ia3-plataforma"), pr = val("ia3-presupuesto"), o = val("ia3-objetivo");
        const d = txt("ia3-descripcion");
        return "Diseña una campaña de anuncios para un negocio pequeño de Bosa Porvenir, Bogotá.\n\n" +
            "Plataforma: " + pl + "\nPresupuesto diario: " + pr + "\nObjetivo: " + o +
            (d ? "\nDescripción del negocio: " + d : "") +
            "\n\nSé realista con el presupuesto. Para negocio local, radio pequeño (la localidad de Bosa y alrededores), no toda Bogotá.\n\n" +
            "FORMATO:\n\n" +
            "OBJETIVO DE CAMPAÑA EXACTO A ELEGIR EN LA PLATAFORMA:\n\n" +
            "SEGMENTACIÓN RECOMENDADA:\n- Ubicación y radio:\n- Edad:\n- Género:\n- Intereses:\n\n" +
            "TEXTO PRINCIPAL DEL ANUNCIO:\n\n" +
            "TITULAR CORTO:\n\n" +
            "BOTÓN DE ACCIÓN RECOMENDADO:\n\n" +
            "QUÉ IMAGEN O VIDEO USAR:\n\n" +
            "DURACIÓN Y PRESUPUESTO TOTAL SUGERIDO:\n\n" +
            "QUÉ MIRAR AL DÍA 3 Y AL DÍA 7 PARA SABER SI SIRVE:\n\n" +
            "ERROR MÁS COMÚN EN ESTE TIPO DE CAMPAÑA:";
    }
    if (id === "ia4") {
        const i = val("ia4-inversion"), pe = val("ia4-periodo"), q = val("ia4-pregunta");
        const d = txt("ia4-numeros");
        return "Analiza los resultados de marketing de un negocio pequeño de Bosa Porvenir, Bogotá y explica en lenguaje muy sencillo.\n\n" +
            "Inversión: " + i + "\nPeriodo: " + pe + "\nPregunta: " + q +
            (d ? "\nDatos y números: " + d : "") +
            "\n\nHaz las cuentas explícitas paso a paso para que la persona aprenda a hacerlas sola. Pesos colombianos.\n\n" +
            "FORMATO:\n\n" +
            "TUS NÚMEROS EN LIMPIO:\n\n" +
            "LAS CUENTAS PASO A PASO:\n- Costo por conversación:\n- Tasa de cierre:\n- Costo por venta:\n- Ganancia neta:\n\n" +
            "RESPUESTA DIRECTA A TU PREGUNTA:\n\n" +
            "DÓNDE ESTÁ EL CUELLO DE BOTELLA:\n\n" +
            "QUÉ HACER ESTA SEMANA (3 acciones concretas):\n1.\n2.\n3.\n\n" +
            "QUÉ NO HACER TODAVÍA:";
    }
    if (id === "ia5") {
        const t = val("ia5-tiempo"), r = val("ia5-redes"), te = val("ia5-temporada");
        const d = txt("ia5-negocio");
        return "Crea un calendario de contenido de 30 días para un negocio pequeño de Bosa Porvenir, Bogotá.\n\n" +
            "Tiempo disponible: " + t + "\nRedes: " + r + "\nTemporada: " + te +
            (d ? "\nNegocio y objetivo del mes: " + d : "") +
            "\n\nCada publicación debe traer el texto ya escrito, listo para copiar. Lenguaje colombiano natural.\n\n" +
            "FORMATO:\n\n" +
            "SEMANA 1:\nDía - Red - Formato - Texto listo para publicar\n\n" +
            "SEMANA 2:\nDía - Red - Formato - Texto listo para publicar\n\n" +
            "SEMANA 3:\nDía - Red - Formato - Texto listo para publicar\n\n" +
            "SEMANA 4:\nDía - Red - Formato - Texto listo para publicar\n\n" +
            "QUÉ GRABAR EN UN SOLO BLOQUE (para no improvisar cada día):\n\n" +
            "LAS 3 PUBLICACIONES QUE MÁS PUEDEN VENDER DEL MES:\n\n" +
            "CÓMO MEDIR SI EL MES FUNCIONÓ:";
    }
    throw new Error("Herramienta desconocida: " + id);
}

async function runTool(id) {
    showLoad(id);
    try {
        const prompt = construirPrompt(id);
        const texto = await llamarIA(prompt, SYSTEM_BOSA);
        showRes(id, texto, false);
    } catch (e) {
        showRes(id, "⚠️ " + e.message, true);
    }
}

/* ---------------------------------------------------------------
   Herramienta 6 — Generador de piezas gráficas (SVG -> PNG)
   Helpers portados del taller "Growth con IA" (normSVG/repairSVG/toPNG)
   --------------------------------------------------------------- */

function b64(str) { return btoa(unescape(encodeURIComponent(str))); }
function svgFile(s) { return '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n' + s + '\n'; }

// Cierra las etiquetas abiertas de un SVG que llegó cortado
function repairSVG(s) {
    var last = s.lastIndexOf('>');
    if (last < 0) return null;
    s = s.slice(0, last + 1);
    var re = /<(\/?)([a-zA-Z][\w:-]*)[^>]*?(\/?)>/g, stack = [], m;
    while ((m = re.exec(s))) {
        if (m[3] === '/') continue;                       // autocerrada
        if (m[1] === '/') { if (stack.length && stack[stack.length - 1] === m[2]) stack.pop(); }
        else stack.push(m[2]);
    }
    while (stack.length) s += '</' + stack.pop() + '>';
    return s;
}

function normSVG(s) {
    s = String(s).replace(/```(svg|xml)?/gi, '').replace(/^[\uFEFF\u200B\u200E\u200F\s]+/, '');
    var i = s.indexOf('<svg');
    if (i < 0) return null;
    s = s.slice(i);
    var j = s.lastIndexOf('</svg>');
    s = (j > -1) ? s.slice(0, j + 6) : repairSVG(s);   // si llegó cortado, se repara
    if (!s) return null;
    s = s.trim();
    if (s.indexOf('xmlns=') === -1) s = s.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    return s;
}

function toPNG(uri, w, h, cb) {
    var im = new Image();
    im.onload = function () {
        try {
            var c = document.createElement('canvas');
            c.width = w; c.height = h;
            c.getContext('2d').drawImage(im, 0, 0, w, h);
            cb(c.toDataURL('image/png'));
        } catch (e) { cb(null); }
    };
    im.onerror = function () { cb(null); };
    im.src = uri;
}

const SYSTEM_PIEZA = "Eres un diseñador gráfico de piezas para redes sociales de negocios pequeños. Devuelves ÚNICAMENTE código SVG válido, compacto y autocontenido. Sin explicaciones, sin markdown, sin comentarios. Empiezas con <svg y terminas con </svg>.";

function construirPromptPieza(tipo, fmt, est, texto, vb, simple) {
    return "Diseña una pieza gráfica para redes sociales de un negocio de barrio en Bosa Porvenir, Bogotá.\n\n" +
        "Tipo: " + tipo + "\nFormato: " + fmt + "\nEstilo: " + est +
        (texto ? "\nTexto que debe aparecer: " + texto : "") +
        "\n\nREGLAS OBLIGATORIAS:\n" +
        "- Etiqueta de apertura exacta: <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"" + vb + "\">\n" +
        "- Primer elemento: un <rect> de fondo que cubra todo el viewBox\n" +
        "- Texto con <text> y font-family=\"Arial,sans-serif\", legible y jerarquizado: titular grande, apoyo mediano, dato pequeño\n" +
        "- Respeta EXACTAMENTE el texto indicado, sin inventar ni traducir\n" +
        (simple ? "- MÁXIMO 10 elementos en total. Diseño simple y limpio.\n"
            : "- Entre 8 y 20 elementos en total, formas geométricas simples para decorar\n") +
        "- Código COMPACTO: coordenadas enteras, sin comentarios, sin <defs> ni filtros, sin atributos innecesarios\n" +
        "- Alto contraste entre fondo y texto\n- Deja espacio abajo para el logo del negocio\n" +
        "- OBLIGATORIO terminar con </svg>\n\nDevuelve SOLO el código SVG.";
}

async function pzGenerar() {
    const tipo = val("pz-tipo"), fmt = val("pz-formato"), est = val("pz-estilo");
    const texto = txt("pz-texto");
    const vertical = fmt.indexOf("Historia") > -1;
    const vb = vertical ? "0 0 360 640" : "0 0 400 400";

    document.getElementById("pz-idle").style.display = "none";
    document.getElementById("pz-out").style.display = "none";
    const load = document.getElementById("pz-load");
    load.style.display = "block";
    load.textContent = "🎨 Diseñando tu pieza gráfica...";

    try {
        let raw = await llamarIA(construirPromptPieza(tipo, fmt, est, texto, vb, false), SYSTEM_PIEZA);
        let svg = normSVG(raw);
        if (!svg) {
            load.textContent = "🎨 Ajustando el diseño, un momento...";
            raw = await llamarIA(construirPromptPieza(tipo, fmt, est, texto, vb, true), SYSTEM_PIEZA);
            svg = normSVG(raw);
        }
        load.textContent = "🎨 Diseñando tu pieza gráfica...";
        if (!svg) {
            throw new Error("No se pudo generar la pieza. Prueba con un texto más corto o elige el formato post cuadrado.");
        }

        const uri = "data:image/svg+xml;base64," + b64(svgFile(svg));
        const box = document.getElementById("pz-canvas");
        box.innerHTML = "";
        const img = document.createElement("img");
        img.src = uri;
        img.alt = "Pieza generada";
        img.title = "Clic derecho -> Guardar imagen como...";
        img.style.cssText = "max-height:300px;max-width:100%;width:auto;display:block;";
        box.appendChild(img);

        document.getElementById("pz-svg-link").href = uri;
        const pngLink = document.getElementById("pz-png-link");
        pngLink.href = uri;
        toPNG(uri, vertical ? 720 : 800, vertical ? 1280 : 800, function (d) { if (d) pngLink.href = d; });

        load.style.display = "none";
        document.getElementById("pz-out").style.display = "block";
    } catch (e) {
        load.style.display = "none";
        const idle = document.getElementById("pz-idle");
        idle.style.display = "flex";
        idle.innerHTML = '<span style="color:var(--red-vintage);font-size:0.9rem;">⚠️ ' + e.message + '</span>';
    }
}

/* ---------------------------------------------------------------
   Herramienta 7 — Crítica de foto con visión IA
   --------------------------------------------------------------- */

let foArchivo = null;

function foInit() {
    const inp = document.getElementById("fo-file");
    if (!inp) return;
    inp.addEventListener("change", function () {
        const f = inp.files[0];
        if (!f) return;
        foArchivo = f;
        const r = new FileReader();
        r.onload = function (e) {
            document.getElementById("fo-img").src = e.target.result;
            document.getElementById("fo-prev").style.display = "block";
            document.getElementById("fo-dz").style.display = "none";
        };
        r.readAsDataURL(f);
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", foInit);
} else {
    foInit();
}

async function foAnalizar() {
    if (!foArchivo) {
        alert("Primero subí una foto.");
        return;
    }
    const tipo = val("fo-tipo"), donde = val("fo-donde");
    document.getElementById("fo-rw").style.display = "none";
    const load = document.getElementById("fo-load");
    load.style.display = "block";

    try {
        const formData = new FormData();
        formData.append("foto", foArchivo);
        formData.append("tipo", tipo);
        formData.append("donde", donde);

        const resp = await fetch("/api/foto", { method: "POST", body: formData });
        const datos = await resp.json().catch(() => ({}));
        if (!resp.ok) {
            throw new Error(datos.error || ("Error HTTP " + resp.status));
        }
        load.style.display = "none";
        showRes("fo", datos.texto || "", false);
    } catch (e) {
        load.style.display = "none";
        showRes("fo", "⚠️ " + e.message, true);
    }
}
