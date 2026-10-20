#!/usr/bin/env python3
"""
Laboratorio de IA para tu Negocio · Bosa Porvenir — app web local.

Portea las 7 herramientas de IA del taller "Growth con IA" a una app Flask
real que corre en tu computador, usando el nivel GRATUITO de la API de
Google Gemini (https://aistudio.google.com/apikey) en vez de una API paga.
La clave vive en un archivo .env local (nunca expuesta al navegador).

IMPORTANTE: esta app es SOLO para uso local. No la subas a GitHub Pages ni a
ningún hosting estático — el backend guarda una clave de API real.

Corré:
  python3 app.py

Y abrí http://127.0.0.1:5057 en el navegador.
"""

import base64
import os
from pathlib import Path

import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request

BASE_DIR = Path(__file__).resolve().parent

load_dotenv(BASE_DIR / ".env", override=True)

app = Flask(__name__)

# Google Gemini — nivel gratuito, vía el endpoint compatible con la API de OpenAI.
# El mismo modelo multimodal sirve tanto para texto como para visión (foto).
GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai"
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.8-flash")
MAX_FOTO_BYTES = 8 * 1024 * 1024  # 8MB

ERROR_SIN_CLAVE = (
    "No encontré GEMINI_API_KEY. Creá un archivo .env en bosa-porvenir-marketing-ia/ "
    "con GEMINI_API_KEY=tu_clave (gratis en https://aistudio.google.com/apikey) "
    "y reiniciá la app."
)


def obtener_clave():
    """Devuelve la clave de Gemini, o None si no hay ninguna configurada."""
    return os.environ.get("GEMINI_API_KEY") or None


def llamar_gemini(mensajes, max_tokens):
    """Llama al endpoint chat/completions (estilo OpenAI) de Gemini."""
    api_key = obtener_clave()
    respuesta = requests.post(
        f"{GEMINI_BASE_URL}/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": GEMINI_MODEL,
            "messages": mensajes,
            "max_tokens": max_tokens,
        },
        timeout=90,
    )
    if respuesta.status_code != 200:
        detalle = respuesta.text[:500]
        raise RuntimeError(f"Gemini respondió {respuesta.status_code}: {detalle}")
    cuerpo = respuesta.json()
    return cuerpo["choices"][0]["message"]["content"]


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/generar", methods=["POST"])
def api_generar():
    """Usada por las herramientas 1 a 6: recibe {prompt, system} y devuelve {texto}."""
    if obtener_clave() is None:
        return jsonify({"error": ERROR_SIN_CLAVE}), 400

    datos = request.get_json(silent=True) or {}
    prompt = (datos.get("prompt") or "").strip()
    system = (datos.get("system") or "").strip()

    if not prompt:
        return jsonify({"error": "Falta el prompt."}), 400

    mensajes = []
    if system:
        mensajes.append({"role": "system", "content": system})
    mensajes.append({"role": "user", "content": prompt})

    try:
        texto = llamar_gemini(mensajes, max_tokens=2000)
        return jsonify({"texto": texto})
    except Exception as e:  # noqa: BLE001 — no queremos tumbar el proceso
        return jsonify({"error": str(e)}), 400


# Herramienta 7 — prompt y system armados en el servidor, no en el navegador.
SYSTEM_FOTO = (
    "Eres un fotógrafo de producto y director de arte que asesora a tenderos y "
    "emprendedores de Bosa Porvenir, en la localidad de Bosa, Bogotá. Das feedback "
    "honesto, concreto y accionable con el celular que ya tienen, sin pedir equipos "
    "caros. Hablas claro y en español colombiano, sin tecnicismos ni anglicismos."
)


def construir_prompt_foto(tipo, donde):
    return (
        f"Analiza esta foto de un negocio pequeño.\n\n"
        f"Qué muestra: {tipo}\n"
        f"Dónde se va a publicar: {donde}\n\n"
        "FORMATO:\n\n"
        "👀 LO QUE VEO:\n[descripción breve y objetiva]\n\n"
        "✅ LO QUE ESTÁ BIEN:\n[2 puntos concretos]\n\n"
        "⚠️ LO QUE HAY QUE CORREGIR:\n[2-3 puntos concretos, en orden de importancia]\n\n"
        "🎯 EL CAMBIO CON MÁS IMPACTO:\n[la única cosa que si la arregla mejora más la foto]\n\n"
        "📱 CÓMO REPETIRLA CON EL CELULAR:\n"
        "[instrucciones paso a paso: dónde pararse, qué luz, qué fondo, qué encuadre]\n\n"
        "💰 ¿ESTÁ LISTA PARA PUBLICAR?\n"
        "[Sí / No / Con ajustes - y por qué, pensando en que esta foto tiene que vender]"
    )


@app.route("/api/foto", methods=["POST"])
def api_foto():
    """Usada por la herramienta 7: multipart con 'foto', 'tipo' y 'donde'."""
    if obtener_clave() is None:
        return jsonify({"error": ERROR_SIN_CLAVE}), 400

    archivo = request.files.get("foto")
    tipo = (request.form.get("tipo") or "").strip()
    donde = (request.form.get("donde") or "").strip()

    if archivo is None or archivo.filename == "":
        return jsonify({"error": "Subí una foto."}), 400

    datos_binarios = archivo.read()
    if len(datos_binarios) > MAX_FOTO_BYTES:
        return jsonify({"error": "La foto pesa más de 8MB. Subí una versión más liviana."}), 400

    media_type = archivo.mimetype or "image/jpeg"
    datos_b64 = base64.b64encode(datos_binarios).decode("ascii")
    prompt = construir_prompt_foto(tipo or "Producto para vender", donde or "Post de Instagram")

    mensajes = [
        {"role": "system", "content": SYSTEM_FOTO},
        {
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": f"data:{media_type};base64,{datos_b64}"}},
            ],
        },
    ]

    try:
        texto = llamar_gemini(mensajes, max_tokens=1500)
        return jsonify({"texto": texto})
    except Exception as e:  # noqa: BLE001
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5057, debug=True)
