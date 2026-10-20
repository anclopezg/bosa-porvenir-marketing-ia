# 🚀 Laboratorio de IA para tu Negocio · Bosa Porvenir

Esta es una app web **local**, separada de la presentación pública
`marketing-digital-bosa-porvenir` (la que se publica en GitHub Pages).
Acá viven 7 herramientas de IA del taller, portadas a un backend Flask real,
para que los emprendedores de Bosa Porvenir las puedan practicar antes del
evento.

## ⚠️ Importante: esto NO se publica en internet

El archivo `app.py` carga tu clave de Google Gemini desde un `.env` local y
la usa del lado del servidor para llamar al nivel gratuito. **Nunca subas
esta carpeta a GitHub Pages ni a ningún hosting estático**: a diferencia de la
presentación pública (que es solo HTML/CSS/JS sin backend), esta app guarda
una clave de API real. Si la publicaras tal cual en un sitio estático, la
clave quedaría expuesta a cualquier visitante. Esta app está pensada para
correr únicamente en `127.0.0.1` (tu propio computador).

## Instalación

```bash
cd bosa-porvenir-marketing-ia
pip3 install -r requirements.txt
```

## Configuración

```bash
cp .env.example .env
```

Editá `.env` y poné tu clave real:

```
GEMINI_API_KEY=tu-clave-gratis-de-gemini
```

Conseguila gratis en **https://aistudio.google.com/apikey** (iniciás sesión
con una cuenta Google, click en "Create API key", sin necesidad de tarjeta).

## Cómo correrla

```bash
python3 app.py
```

Abrí tu navegador en **http://127.0.0.1:5057**

Si no configuraste la clave, la app sigue abriendo normalmente — simplemente
cada herramienta te va a avisar con un mensaje claro en español pidiéndote
que crees el `.env`, en vez de romperse.

## Las 7 herramientas

1. **✍️ Generador de Copys con IA** — A partir del tipo de negocio, la red
   social y el objetivo de la publicación, escribe 5 variantes de copy con
   la fórmula PASO (Problema, Agitar, Solución, Orden), hashtags sugeridos,
   mejor hora para publicar y qué foto o video acompaña mejor el texto.

2. **💬 Asistente de WhatsApp Business IA** — Genera mensaje de bienvenida,
   mensaje de ausencia, 5 respuestas rápidas con sus atajos, un guion de
   venta paso a paso, un mensaje de seguimiento para quien no compró, y el
   error más común a evitar — todo listo para pegar en WhatsApp Business.

3. **🎯 Planificador de Campañas IA** — Diseña una campaña de anuncios
   realista (Meta Ads, TikTok Ads o ambas) con segmentación recomendada,
   texto del anuncio, titular, botón de acción, qué imagen usar, presupuesto
   sugerido y qué mirar a los días 3 y 7 para saber si está funcionando.

4. **📊 Analizador de Métricas IA** — El dueño del negocio escribe sus
   números tal como los ve (alcance, mensajes, ventas, inversión) y la IA
   hace las cuentas paso a paso (costo por conversación, tasa de cierre,
   costo por venta, ganancia neta) y recomienda 3 acciones concretas para
   la semana.

5. **📅 Calendario de Contenido de 30 Días** — Arma un plan de publicación
   de un mes completo, semana por semana, con el texto de cada publicación
   ya escrito y listo para copiar, más qué grabar en un solo bloque y cómo
   medir si el mes funcionó.

6. **🎨 Generador de Piezas Gráficas IA** — Le pide a la IA un SVG
   compacto y autocontenido (post cuadrado o historia vertical) con el
   texto exacto del negocio, lo muestra en pantalla y permite descargarlo
   en SVG o convertido a PNG (vía un `<canvas>` oculto), para terminarlo en
   Canva. Si el SVG sale incompleto, reintenta una vez con un prompt más
   simple.

7. **📸 ¿Tu Foto Vende? — Crítica con Visión IA** — Subís una foto de tu
   producto, plato, fachada o pieza gráfica, elegís dónde la vas a publicar,
   y un modelo con visión te da una crítica honesta: qué ve, qué está bien,
   qué corregir, el cambio de mayor impacto, cómo repetir la foto con el
   celular, y si está lista para publicar.

## Cómo está construida

- **Backend**: Flask + `python-dotenv` + `requests` (llama directo a la API
  de OpenCode Zen, compatible con el formato de OpenAI).
- **Dos rutas**:
  - `POST /api/generar` — usada por las herramientas 1 a 6 (texto puro).
  - `POST /api/foto` — usada por la herramienta 7 (visión, multipart con
    archivo + campos de texto).
- **Frontend**: HTML + CSS + JS planos (sin frameworks), reutilizando la
  misma paleta cómic/vintage (`--red-vintage`, `--blue-vintage`,
  `--yellow-vintage`, `--cyan-amazon`, `--green-selva`, `--gold-amanecer`,
  tipografías Bangers / Comic Neue / Patrick Hand) de la presentación
  `marketing-digital-bosa-porvenir/index.html`, para que se vea como parte
  del mismo taller.

## Modelo usado (gratis, vía Google Gemini)

`gemini-3.8-flash` para las 7 herramientas (texto y visión, es el mismo
modelo multimodal), llamado a través del endpoint de Gemini compatible con
el formato de OpenAI. Es gratis dentro de los límites del nivel gratuito de
Google AI Studio — perfecto para una muestra/demo, aunque no tan potente
como un modelo pago de primer nivel.

Si tu cuenta no tiene acceso a `gemini-3.8-flash` todavía, podés forzar otro
modelo agregando `GEMINI_MODEL=gemini-2.5-flash` en tu `.env`.
