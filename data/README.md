# 📚 Base de conocimiento — Doctor Trust

Aquí se define **qué información necesita el agente** y **cómo cargarla**. Esta base es lo que
determina si Doctor Trust responde como un agrónomo experto o como un chatbot genérico.

> Plan general del proyecto → [`../DOCTOR-TRUST.md`](../DOCTOR-TRUST.md)

---

## ⚠️ Importante: esta carpeta NO se sube al sitio

`data/` es **documentación y contrato de datos** (esquemas + ejemplos). **No va a `public_html`.**
El catálogo con dosis, márgenes y notas internas **no debe ser público** (la competencia lo leería).

**La fuente operativa real será privada** (Google Sheets o base de datos), y n8n la lee desde ahí.

---

## 🎯 Dónde cargar la información (recomendación)

| Opción | Para quién | Recomendación |
|---|---|---|
| **Google Sheets** (1 pestaña por biblioteca) | Equipo comercial / agrónomos | ✅ **Recomendado.** Cualquiera puede editar, n8n lo lee directo con el nodo Google Sheets, tiene historial de cambios |
| Archivos JSON en esta carpeta | Desarrollador | Solo para el esquema y ejemplos |
| Panel de administración propio | — | ❌ No vale la pena aún (mucho desarrollo para poco beneficio) |

**Flujo:** `Google Sheet (privado)` → n8n lee → genera *embeddings* → guarda en el **vector store** →
el agente consulta ahí en cada pregunta.

Las **columnas del Sheet = los campos de las plantillas** de esta carpeta. Manteniendo los mismos
nombres, el sync a n8n es directo.

---

## 📦 Las 6 bibliotecas (por prioridad)

### 1. Catálogo de productos ⭐⭐⭐⭐⭐ — LA MÁS IMPORTANTE
Plantilla: [`plantillas/producto.json`](plantillas/producto.json) · Ejemplo: [`ejemplos/ynsufert-calcio-plus.json`](ejemplos/ynsufert-calcio-plus.json)

**No basta con la ficha técnica en PDF.** El agente necesita información **estructurada** para poder
razonar: cruzar cultivo + etapa + síntoma → producto correcto.

Campos clave (los que hacen la diferencia):
- `problemas_que_soluciona` y `sintomas_asociados` → **así encuentra el producto desde el síntoma**
- `cultivos` + `etapas` → para recomendar en el momento correcto
- `dosis` por cultivo → respuesta concreta, no "consulte la etiqueta"
- `compatibilidad` / `no_mezclar` → evita recomendaciones peligrosas

### 2. Biblioteca agronómica ⭐⭐⭐⭐
Nutrientes y su manejo:
- **Macro:** Nitrógeno, Fósforo, Potasio, Calcio, Magnesio, Azufre
- **Micro:** Hierro, Zinc, Boro, Manganeso, Cobre, Molibdeno
- Para cada uno: **función, síntomas de deficiencia, síntomas de exceso, causas, corrección**
- Suelos: pH, conductividad, materia orgánica, texturas (arena/arcilla/limo)
- Manejo: fertirriego, riego, poda, floración, polinización, postcosecha

Se carga con la plantilla de **problema** (`tipo: "deficiencia"`) + entradas de glosario.

### 3. Biblioteca por cultivo ⭐⭐⭐⭐
Plantilla: [`plantillas/cultivo.json`](plantillas/cultivo.json)

Uno por cultivo: uva, palta, mango, arándano, cítricos, espárrago, banano, café, cacao…
Incluye etapas fenológicas, necesidades nutricionales, plagas/enfermedades comunes, suelo, riego y
**el programa nutricional con productos Trust**.

### 4. Enfermedades y plagas ⭐⭐⭐⭐
Plantilla: [`plantillas/problema.json`](plantillas/problema.json)

- **Hongos:** Antracnosis, Alternaria, Oídio, Mildiu, Botrytis, Fusarium, Phytophthora
- **Plagas:** mosca blanca, trips, araña roja, minador, pulgón…
- **También:** bacterias, virus, nematodos

Campo crítico: **`se_confunde_con` + `como_diferenciar`** → es lo que hace que el agente no se
equivoque entre dos problemas de síntomas parecidos.

### 5. Biblioteca visual ⭐⭐⭐
Se usa cuando el cliente **sube una foto**. Es un mapa *síntoma visible → causas probables*:

| Lo que se ve | Puede ser |
|---|---|
| Hoja amarilla (nervaduras verdes, hojas nuevas) | Deficiencia de **Hierro** |
| Hoja amarilla (hojas viejas, uniforme) | Deficiencia de **Nitrógeno** |
| Hoja amarilla entre nervaduras (hojas viejas) | Deficiencia de **Magnesio** |
| Manchas marrones | Alternaria · Antracnosis · Quemadura solar |

Se carga en el campo `sintomas_visuales` de cada problema. **Mientras más ejemplos visuales, mejor
razona el modelo.** Ideal: adjuntar fotos propias de casos reales.

### 6. Preguntas frecuentes ⭐⭐⭐
Plantilla: [`plantillas/faq.json`](plantillas/faq.json)

¿Cuánto aplicar? ¿Cuándo? ¿Se puede mezclar? ¿Cuánto dura? ¿Cuántos litros? ¿Cuánto cubre?
¿Cuándo volver a aplicar? ¿Cuánto cuesta?

> 💡 Las mejores FAQ salen de **consultas reales**. En Fase 7 se mide qué pregunta la gente y se
> alimenta esta biblioteca con eso.

---

## 🚀 Plan de carga: MVP primero

No intentes cargar 500 productos antes de lanzar. **Orden sugerido:**

| Semana | Tarea | Cantidad |
|---|---|---|
| 1 | Productos más vendidos, completos | **20–30** |
| 1 | Cultivos principales | **5** (uva, palta, mango, arándano, cítricos) |
| 2 | Problemas más consultados | **20–30** |
| 2 | FAQ reales | **30–50** |
| 3 | Entrevistas a los agrónomos → volcar a las plantillas | — |
| 4+ | Crecer según lo que la gente realmente pregunte | — |

Con eso el agente ya resuelve el **70–80%** de las consultas.

---

## 📖 De dónde sacar la información

| Fuente | Valor | Qué aporta |
|---|---|---|
| **Tus ingenieros agrónomos** | ⭐⭐⭐⭐⭐⭐ | El criterio práctico. **La fuente más valiosa.** No está en ningún PDF |
| **Fichas técnicas de fabricantes** (Yara, ICL, Haifa, SQM, Stoller, Timac, BASF, Bayer, Syngenta, FMC, UPL) | ⭐⭐⭐⭐⭐ | Programas nutricionales, dosis, manuales — publicados gratis |
| **Organismos oficiales** (SENASA, INIA, FAO, CIP, CGIAR) | ⭐⭐⭐⭐⭐ | Fichas de plagas, manejo integrado, manuales de fertilización y suelos |
| **Universidades** (La Molina, UC Davis, Texas A&M, Cornell, EMBRAPA) | ⭐⭐⭐⭐⭐ | Tesis y manuales técnicos por cultivo |
| **Libros de agronomía** | ⭐⭐⭐ | Conceptos base — ⚠️ **elaborar resúmenes propios, no copiar literal** (derechos de autor) |

### 🎤 Entrevista a los agrónomos — preguntas que rinden
- ¿Qué recomiendas cuando un arándano presenta clorosis férrica?
- ¿Qué errores comete más el agricultor?
- ¿Qué producto **nuestro** usas para ese problema y a qué dosis?
- **¿Qué preguntas haces tú antes de recomendar algo?** ← esto define cómo debe conversar el agente
- ¿Qué dos problemas se confunden más entre sí y cómo los diferencias?

---

## ✅ Reglas de calidad (para que el agente no falle)

1. **Nada de "consultar etiqueta"** → si el campo `dosis` está vacío, el agente no podrá responder.
2. **Un dato incierto es peor que ningún dato** → si no estás seguro de una dosis, déjala vacía.
   El agente está configurado para decir "no tengo ese dato, te derivo a un asesor".
3. **Escribe los síntomas como los diría un agricultor**, no en lenguaje técnico
   ("hojas amarillas con venitas verdes", no solo "clorosis intervenal").
4. **Sinónimos y nombres locales** → si a la palta le dicen "aguacate", ponlo. El cliente escribirá
   como habla.
5. **Un producto sin `problemas_que_soluciona` es invisible** para el agente.
