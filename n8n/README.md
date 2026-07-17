# ⚙️ n8n — Doctor Trust

Backend del chat. Plan general → [`../DOCTOR-TRUST.md`](../DOCTOR-TRUST.md)

| Archivo | Qué es |
|---|---|
| `doctor-trust-workflow.json` | **Workflow completo listo para importar** (AI Agent + memoria + visión) |
| `system-prompt.md` | El prompt del agente en versión legible |

---

## 🗺️ Arquitectura del flujo

```
                                        ┌─ (hay foto) → [Analizar foto (visión)] → [Fusionar foto + texto] ─┐
[Webhook] → [Preparar entrada] → [¿Hay foto?]                                                               ├→ [AI Agent] ─┬→ [Formatear respuesta] ─┐
                                        └─ (sin foto) → [Solo texto] ────────────────────────────────────────┘      ▲       │                          ├→ [Respond to Webhook]
                                                                                                                    │       └→(error)→ [Error seguro] ─┘
                                                                                          [OpenAI Chat Model] ──────┤
                                                                                          [Simple Memory]  ─────────┘
```

**Por qué la rama de visión:** el nodo AI Agent **no acepta imágenes base64**. Por eso, cuando llega
una foto, primero se describe con un modelo de visión y luego se le pasa esa descripción al agente
como texto. Así el agente conserva su memoria, sus tools y su prompt, y además "ve".

---

## 🚀 Instalación

1. **Importar** `doctor-trust-workflow.json` (⋮ → Import from File). Reemplaza el flujo anterior.
2. **Credenciales de OpenAI** — verifica que estén puestas en **dos** nodos:
   - `OpenAI Chat Model` (el cerebro del agente)
   - `Analizar foto (visión)` ← *este es nuevo, revísalo*
3. **CORS** — nodo `Webhook` → Options → Allowed Origins: `*` para probar, tu dominio en producción.
4. **Activar** el workflow.

> 🔒 La API key vive solo en n8n, nunca en el sitio.

---

## 🐛 Bugs corregidos en esta versión

| # | Problema | Solución |
|---|---|---|
| 1 | `Formatear respuesta` llamaba a `$('Preparar mensajes')`, un nodo que ya no existía | 💥 **Era la causa de la respuesta vacía.** Eliminada esa referencia |
| 2 | Leía `choices[0].message.content` (formato de la API cruda) | El AI Agent devuelve `$json.output` → corregido |
| 3 | El nodo de error colgaba de la salida **principal** del agente (se ejecutaba siempre) | Ahora usa `onError: continueErrorOutput` → salida de error separada |
| 4 | La foto se perdía: al agente solo le llegaba `body.message` | Nueva rama de visión (`¿Hay foto?` → `Analizar foto`) |
| 5 | El modelo suele envolver el JSON en ```` ```json ```` | El parser ahora limpia las comillas de código antes de parsear |

---

## 🧪 Probar

```bash
curl -X POST https://n8n.corporacionyanayacu.com/webhook/34105e6c-f769-4c35-83aa-d98110b92352 \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test-1","message":"Mi palto tiene las hojas nuevas amarillas con las venitas verdes","history":[],"meta":{}}'
```

**Respuesta esperada:**
```json
{
  "ok": true,
  "reply": "Por lo que describes, las **hojas nuevas amarillas con nervaduras verdes** apuntan a...",
  "products": [{ "nombre": "Ynsufert", "url": "lineas.html#ynsufert" }],
  "needsHuman": false
}
```

| Si responde… | Significa |
|---|---|
| `{"message":"Workflow was started"}` | El Webhook está en *Respond: Immediately* → debe ser `Using 'Respond to Webhook' Node` |
| **Cuerpo vacío (0 bytes)** | Un nodo reventó antes de responder → mira **Executions** y busca el nodo en rojo |
| El JSON esperado | ✅ Funciona. Prueba ahora desde el sitio, con foto incluida |

---

## 🧠 Editar el cerebro

El system prompt está en el nodo **AI Agent** → *Options* → **System Message** (texto plano, sin `=`
ni backticks: si le pones `=` n8n lo evalúa como expresión y puede romperse).
Versión legible en [`system-prompt.md`](system-prompt.md) — **si editas uno, actualiza el otro.**

| Parámetro | Dónde | Valor |
|---|---|---|
| Modelo | `OpenAI Chat Model` | `gpt-4.1-mini` |
| Temperatura | `OpenAI Chat Model` → Options | `0.3` (bajo = preciso). **No subir** |
| Memoria | `Simple Memory` | por `sessionId`, ventana de 15 |
| Modelo de visión | `Analizar foto (visión)` | `gpt-4.1-mini`, 400 tokens |

---

## ⚠️ Notas importantes

- **`Simple Memory` es volátil:** se borra si n8n reinicia. Para producción, cambiar a memoria en
  **Postgres o Redis** (mismo nodo, otra variante).
- **Doble historial:** el widget envía `history` *y* n8n tiene `Simple Memory`. Hoy manda la memoria
  de n8n (más confiable, sobrevive recargas de página). El `history` del widget queda como respaldo y
  para auditoría — no molesta.
- **Costo de las fotos:** cada foto son 2 llamadas al modelo (visión + agente). El widget ya limita a
  **3 fotos por sesión**.

---

## 🛡️ Antes de producción (Fase 9)

- [ ] **CORS** con el dominio real (no `*`)
- [ ] **Rate limit** por IP o sesión — el webhook es público y alguien puede quemarte los créditos
- [ ] **Tope de gasto mensual** en la cuenta de OpenAI
- [ ] Memoria persistente (Postgres) en vez de `Simple Memory`
- [ ] Respuestas **validadas por un agrónomo** (Fase 8)

---

## 🔜 Siguiente: RAG (Fase 4)

Ahora que el flujo usa el **AI Agent**, agregar el RAG es sencillo: se le **cuelga una tool** al agente,
sin rehacer nada.

1. Cargar la base de conocimiento → [`../data/README.md`](../data/README.md)
2. Agregar un **Vector Store Tool** (Supabase pgvector) conectado al puerto `ai_tool` del AI Agent
3. Añadir al system prompt el bloque *USO DE LA BASE DE CONOCIMIENTO* (está en `system-prompt.md`)

> Mientras no exista el RAG, el agente **no da dosis concretas**: el prompt se lo prohíbe y deriva a
> un asesor. Sabe conversar como agrónomo, pero todavía no conoce tu catálogo real.
