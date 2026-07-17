# 🩺 Doctor Trust — Plan de trabajo

Asistente agronómico con IA para el sitio de Trust Agro Export. Reemplaza el botón de WhatsApp por
una ventana de chat (abajo a la derecha) donde el cliente consulta sobre su cultivo, **sube una foto
de su planta** y recibe un diagnóstico + recomendación basada en **nuestro catálogo de productos**.

> **Estado:** ✅ **Fase 1 lista** (widget funcionando en modo demo) · ⏳ Esperando webhook de n8n
> **Última actualización:** 2026-07-16

---

## 1. Resumen ejecutivo

| | |
|---|---|
| **Qué es** | Chat widget con un agente IA ("Doctor Trust") especializado en agronomía + catálogo Trust |
| **Frontend** | HTML + Tailwind + JS vanilla (mismo stack del sitio, sin dependencias) |
| **Backend** | **n8n** (webhook) → orquesta RAG + modelo |
| **Cerebro** | **ChatGPT 4.1 mini** (texto + visión para analizar fotos) |
| **Conocimiento** | Base de conocimiento propia (catálogo + biblioteca agronómica) vía **RAG** |
| **Objetivo comercial** | Resolver la consulta **y** recomendar el producto Trust adecuado → generar leads |

### ⚠️ Recomendación clave: MVP primero
La base de conocimiento ideal (300–500 productos, 150–250 plagas, 100–150 deficiencias, 50–100
cultivos, 500–1.000 FAQ) es **el objetivo final, no el punto de partida**. Construirla completa antes
de lanzar retrasaría el proyecto **meses**.

**Propuesta:** lanzar con un **MVP acotado** y crecer con datos reales de uso.

| | MVP (lanzamiento) | Objetivo (6–12 meses) |
|---|---|---|
| Productos | **20–30** (los más vendidos) | 300–500 |
| Cultivos | **5** (uva, palta, mango, arándano, cítricos) | 50–100 |
| Problemas (plagas/enfermedades/deficiencias) | **20–30** (los más consultados) | 400–500 |
| FAQ | **30–50** | 500–1.000 |

Con eso el agente ya responde bien el 70–80% de las consultas reales. Lo demás se prioriza según
lo que la gente realmente pregunte (se mide en Fase 7).

---

## 2. Arquitectura

```
┌──────────────────────────┐
│  WIDGET (sitio web)      │  botón flotante → ventana de chat abajo-derecha
│  HTML + JS vanilla       │  · texto  · subir foto  · historial de sesión
└───────────┬──────────────┘
            │  POST JSON  (mensaje + imagen + sessionId)
            ▼
┌──────────────────────────┐
│  n8n — WEBHOOK           │  1. valida origen y tamaño
│                          │  2. rate limit (anti-abuso)
│                          │  3. normaliza entrada
└───────────┬──────────────┘
            ▼
┌──────────────────────────┐
│  RAG (Vector Store)      │  busca en la base de conocimiento los fragmentos
│  Supabase pgvector /     │  relevantes: productos, cultivo, síntomas, FAQ
│  Qdrant                  │
└───────────┬──────────────┘
            ▼
┌──────────────────────────┐
│  ChatGPT 4.1 mini        │  system prompt + contexto RAG + historial + imagen
│  (+ visión)              │  → diagnóstico + recomendación de producto Trust
└───────────┬──────────────┘
            ▼
┌──────────────────────────┐
│  n8n — POST-PROCESO      │  · guarda conversación   · detecta lead
│                          │  · formatea respuesta JSON
└───────────┬──────────────┘
            │  JSON respuesta
            ▼
      Widget muestra la respuesta
```

---

## 3. Contrato Widget ↔ n8n (la interfaz entre ambos)

Esto es lo que hay que respetar de ambos lados. **El widget envía:**

```json
POST {WEBHOOK_URL}
Content-Type: application/json

{
  "sessionId": "9f1c-...-a3",          // uuid, se guarda en localStorage del navegador
  "message": "Mi palto tiene las hojas amarillas",
  "image": "data:image/jpeg;base64,/9j/4AAQ...",   // opcional (null si no hay foto)
  "history": [                          // últimos N turnos, para dar contexto
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "meta": {
    "page": "/lineas.html",
    "ts": "2026-07-16T18:30:00Z"
  }
}
```

**n8n responde:**

```json
{
  "ok": true,
  "reply": "Por lo que veo en la foto, tu palto presenta **clorosis férrica**...",
  "products": [                          // productos recomendados (opcional)
    { "nombre": "Calcio Plus", "linea": "Ynsufert", "url": "lineas.html#ynsufert" }
  ],
  "needsHuman": false,                   // true → el widget ofrece WhatsApp/asesor
  "sessionId": "9f1c-...-a3"
}
```

**En caso de error:**
```json
{ "ok": false, "error": "rate_limited", "reply": "Estamos recibiendo muchas consultas..." }
```

### Decisiones técnicas del contrato
- **Imagen:** el widget la **comprime en el navegador** (canvas → máx. 1024px, JPEG 80%) antes de
  enviarla → ~100–300 KB en base64. Evita payloads gigantes y acelera la respuesta.
- **Historial:** se envían solo los últimos **6–8 turnos** para no inflar tokens ni costo.
- **sessionId:** generado en el navegador (`crypto.randomUUID()`), guardado en `localStorage`.

---

## 3.bis Configuración de n8n (Fase 2) — ⚠️ PENDIENTE

**Webhook conectado:** `https://n8n.corporacionyanayacu.com/webhook/34105e6c-f769-4c35-83aa-d98110b92352`
Ya está pegado en `assets/js/doctor-trust.js` → el widget salió de modo demo.

### Estado de la prueba (2026-07-16)
| Prueba | Resultado |
|---|---|
| El webhook recibe el POST | ✅ 200 OK |
| Devuelve la respuesta del agente | ❌ Devuelve `{"message":"Workflow was started"}` |

**Traducción:** n8n recibe el mensaje pero **no espera al agente ni devuelve su respuesta**. Con esto,
el widget muestra el mensaje de error y ofrece WhatsApp. Faltan 3 ajustes:

### ✅ 1. Nodo **Webhook** → cambiar el modo de respuesta
| Campo | Valor |
|---|---|
| HTTP Method | `POST` |
| **Respond** | **`Using 'Respond to Webhook' Node`** ← *esto es lo que falta* |

> Ahora está en "Immediately", por eso responde "Workflow was started" sin esperar al agente.

### ✅ 2. Nodo Webhook → habilitar **CORS** (si no, el navegador bloquea todo)
En las **Options** del nodo Webhook, agregar:
| Opción | Valor |
|---|---|
| **Allowed Origins (CORS)** | `https://www.trustagroexport.com` (o `*` para probar) |

> 🔴 **Crítico.** El widget llama desde el navegador del cliente (dominio del sitio → dominio de n8n).
> Sin CORS el navegador cancela la petición **antes de que llegue a n8n** y no verás ni el intento.

### ✅ 3. Cerrar el flujo con un nodo **Respond to Webhook**
Debe devolver **exactamente este JSON** (es el contrato del §3):

```json
{
  "ok": true,
  "reply": "={{ $json.output }}",
  "products": [],
  "needsHuman": false
}
```
- `reply` → el texto del agente (en el nodo AI Agent suele venir en `$json.output`).
- `products` → opcional, para pintar los chips de producto bajo la respuesta.
- `needsHuman` → `true` cuando deba ofrecer WhatsApp.

### Flujo mínimo en n8n
```
[Webhook POST]  →  [AI Agent / OpenAI  (GPT-4.1 mini)]  →  [Respond to Webhook]
   respond:            system prompt (§6)                      JSON del contrato
   "Respond to             + imagen si viene
    Webhook Node"
```
Lo que llega al Webhook: `{{ $json.body.message }}`, `{{ $json.body.image }}`,
`{{ $json.body.history }}`, `{{ $json.body.sessionId }}`.

> 💡 **Tip:** el widget tiene *timeout* natural del navegador. Si el agente tarda mucho (RAG + visión),
> mantener la respuesta por debajo de ~30 s.

---

## 4. Fases del proyecto

| Fase | Qué se hace | Responsable | Bloqueante |
|---|---|---|---|
| **0** | **Definiciones** (ver §10) | Cliente | ⛔ Sí |
| **1** | ✅ **HECHA** — Widget frontend en `assets/js/doctor-trust.js`. Botón + ventana + subir foto (con compresión) + historial + escalado a WhatsApp. **Modo demo** activo hasta pegar el webhook | Yo | No |
| **2** | **Conexión n8n básica** — webhook recibe → GPT 4.1 mini → responde. Sin RAG (solo system prompt) | Cliente (n8n) + yo (contrato) | Necesita webhook |
| **3** | **Base de conocimiento MVP** — cargar 20–30 productos + 5 cultivos + 20–30 problemas + FAQ (ver `data/README.md`) | Cliente + agrónomos | ⛔ Sí |
| **4** | **RAG** — chunking, embeddings, vector store, retrieval | Cliente (n8n) | Necesita Fase 3 |
| **5** | **Visión** — análisis de fotos + guía de captura | Cliente (n8n) + yo (UI) | Necesita Fase 2 |
| **6** | **Guardrails y tono** — system prompt, qué no responder, escalado a humano, disclaimer | Yo (redacción) + cliente (validación) | No |
| **7** | **Leads y métricas** — captura de contacto, historial, qué preguntan más | Cliente (n8n) | No |
| **8** | **Validación con agrónomos** — batería de casos reales, ajuste | Cliente | ⛔ Sí |
| **9** | **Producción** — rate limit, costos, monitoreo, legal | Ambos | ⛔ Sí |

> **Camino más corto a algo usable:** Fase 1 → 2 → 3 (MVP) → 4 → 6 → 8.
> Visión (5) puede ir después del primer lanzamiento si urge salir.

---

## 5. Base de conocimiento

**Toda la estructura, plantillas y guía de carga están en → [`data/README.md`](data/README.md)**

Resumen de las 6 bibliotecas:

| # | Biblioteca | Prioridad | Fuente |
|---|---|---|---|
| 1 | **Catálogo de productos** (estructurado, no PDF) | ⭐⭐⭐⭐⭐ | Interna (Trust) |
| 2 | **Biblioteca agronómica** (nutrientes, deficiencias, suelos, riego) | ⭐⭐⭐⭐ | FAO, INIA, universidades, fichas de fabricantes |
| 3 | **Por cultivo** (etapas, necesidades, plagas comunes) | ⭐⭐⭐⭐ | INIA, SENASA, universidades |
| 4 | **Enfermedades y plagas** (síntomas, diferenciación, control) | ⭐⭐⭐⭐ | SENASA, universidades |
| 5 | **Biblioteca visual** (síntoma → posibles causas) | ⭐⭐⭐ | Fotos propias + fuentes públicas |
| 6 | **FAQ** (dosis, mezclas, cobertura, precios) | ⭐⭐⭐ | Interna + consultas reales |

> ⭐ **La fuente más valiosa son tus propios ingenieros agrónomos.** Ese conocimiento práctico
> ("qué recomiendo yo cuando veo esto") no está en ningún PDF y es lo que diferencia al agente.
> Plan: entrevistarlos y volcarlo a las plantillas (§ `data/README.md`).

### ⚠️ Nota legal sobre fuentes
Las fichas técnicas de fabricantes (Yara, ICL, Haifa…) y los manuales de FAO/INIA/SENASA son
utilizables como **referencia** para elaborar contenido propio. **No copiar libros con derechos de
autor literalmente** — elaborar resúmenes propios. El contenido de la base debe ser **nuestro**.

---

## 6. El agente (comportamiento)

### System prompt — estructura
1. **Identidad:** "Eres Doctor Trust, asesor agronómico de Trust Agro Export (Lambayeque, Perú)."
2. **Misión:** diagnosticar y recomendar **productos del catálogo Trust** (Ynsufert, Ynsumaq, Ynsupack, Ynsugrow).
3. **Método de consulta** (imitar a un agrónomo real — preguntar antes de recomendar):
   - ¿Qué cultivo? ¿Qué edad/etapa fenológica?
   - ¿Qué síntoma y hace cuánto? ¿En hojas nuevas o viejas?
   - ¿Zona? ¿Tipo de riego? ¿Última fertilización?
4. **Formato de respuesta:** diagnóstico probable → por qué → **qué producto Trust** + dosis →
   siguiente paso.
5. **Tono:** técnico pero claro, de agrónomo a agricultor. Español de Perú. Sin tecnicismos vacíos.

### Guardrails (qué NO debe hacer) — crítico
- ❌ **No inventar productos, dosis ni registros.** Si no está en la base → decirlo y escalar.
- ❌ **No recomendar productos de la competencia.**
- ❌ No dar diagnósticos categóricos con una sola foto → hablar de **causas probables**.
- ❌ No aconsejar sobre agroquímicos peligrosos ni dosis fuera de etiqueta.
- ❌ No inventar precios ni stock → derivar a un asesor.
- ✅ **Escalar a humano** (`needsHuman: true`) cuando: baja confianza, reclamo, tema legal/precio, o
  el usuario lo pide.
- ✅ **Disclaimer** visible: *"Esta recomendación es orientativa. Para un diagnóstico definitivo,
  consulta a nuestro equipo técnico."*

---

## 7. Análisis de fotos (visión)

1. **UI guía la captura** (mejora radicalmente el diagnóstico):
   - Foto de la hoja/fruto afectado **de cerca y con luz natural**
   - Una foto general de la planta
   - Evitar fotos borrosas o de noche
2. El widget **comprime** la imagen antes de enviarla.
3. GPT-4.1 mini (visión) recibe imagen + contexto RAG del cultivo.
4. El prompt de visión debe pedir: **describir lo que se ve → hipótesis ordenadas por probabilidad
   → qué dato falta para confirmar → producto Trust recomendado.**
5. **Límite:** máx. 3 imágenes por sesión (control de costo).

---

## 8. Costos (orden de magnitud)

GPT-4.1 mini es de gama económica. Los costos dependen del volumen:

| Concepto | Estimación |
|---|---|
| Consulta de **texto** (con RAG) | fracciones de centavo de USD |
| Consulta con **imagen** (visión) | varias veces más cara que solo texto |
| **Embeddings** de la base | pago único por carga + incremental al actualizar |
| **Vector store** | Supabase tiene plan gratuito generoso para empezar |

> ⚠️ **Verificar precios actuales de OpenAI antes de cerrar presupuesto** (cambian con frecuencia).
> **Control de costo obligatorio:** rate limit por sesión/IP, máx. 3 imágenes por sesión, límite de
> tokens de salida, y un tope de gasto mensual configurado en la cuenta de OpenAI.

---

## 9. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| **Webhook público → spam/abuso** | 🔴 Alto (quema créditos) | Rate limit por IP y sesión en n8n, validar cabecera `Origin`, límite de tamaño, honeypot |
| **El agente inventa (alucina) dosis o productos** | 🔴 Alto (daño al cultivo + legal) | RAG estricto + guardrail "solo lo que está en la base" + validación con agrónomos (Fase 8) |
| **Base de conocimiento pobre → respuestas genéricas** | 🟠 Medio | MVP con los productos/problemas más consultados; crecer con datos reales |
| **Diagnóstico erróneo por foto** | 🟠 Medio | Hablar de "causas probables", pedir más datos, disclaimer, escalar a humano |
| **Costo se dispara** | 🟠 Medio | Tope de gasto, límites por sesión, historial acotado |
| **Datos personales del cliente** | 🟠 Medio | Aviso de privacidad, no pedir datos sensibles, definir retención |
| **n8n caído** | 🟡 Bajo | El widget muestra fallback → WhatsApp/formulario |

---

## 10. ⛔ Decisiones pendientes (necesito esto para avanzar)

| # | Pregunta | Necesario para |
|---|---|---|
| 1 | **URL del webhook de n8n** | Fase 2 |
| 2 | ¿Dónde se guardan las **imágenes**? (base64 directo / Supabase / Cloudinary) | Fase 5 |
| 3 | ¿Qué **vector store**? (recomiendo **Supabase pgvector**: gratis para empezar y n8n lo soporta) | Fase 4 |
| 4 | ¿Dónde se guarda el **historial** de conversaciones? | Fase 7 |
| 5 | ¿En qué formato está hoy el **catálogo**? (Excel, PDF, nada) y **¿cuántos productos reales** hay? | Fase 3 |
| 6 | ¿Hay **ingeniero agrónomo interno** que valide las respuestas? | Fase 8 |
| 7 | ¿A dónde van los **leads** que capture el chat? (correo, CRM, Sheet) | Fase 7 |
| 8 | ¿Se mantiene **WhatsApp** como opción de escalado a humano? | Fase 1 |
| 9 | ¿**Tope de gasto** mensual aceptable? | Fase 9 |

---

## 11. Próximo paso propuesto

**Empiezo por la Fase 1: el widget completo en modo demo.** No necesita el webhook — lo dejo
funcionando con respuestas simuladas y, cuando me pases la URL de n8n, es cambiar **una constante**
y queda conectado.

Así puedes ver y validar la experiencia (botón, ventana, subir foto, tono) mientras en paralelo
cargan la base de conocimiento (Fase 3, que es la más larga).
