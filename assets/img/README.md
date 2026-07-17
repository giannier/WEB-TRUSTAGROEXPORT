# Imágenes del sitio — Trust Agro Export

Guía de las imágenes del sitio: **cuáles ya están puestas** y **cuáles faltan** (con las medidas
exactas para pedirlas a diseño). Última actualización: **2026-07-16**.

## 📁 Cómo se organizan

Todas las fotos van en `assets/img/<página>/`:

```
assets/img/
├── logo-light.png          Logo blanco (fondos oscuros) — en uso
├── logo.png                Logo oscuro (fondos claros + SEO) — en uso
├── favicon.svg             Ícono de la pestaña
├── inicio/
├── nosotros/
├── lineas/
├── sostenibilidad/
└── contacto/
```

> ⚠️ **El nombre del archivo debe ser exacto** (incluida la extensión), si no la imagen no carga.
> Si diseño entrega otra extensión (ej. `.png` en vez de `.jpg`), avísame: es un cambio de 1 línea.

---

## ✅ Ya conectadas

| Archivo | Dónde se usa |
|---|---|
| `inicio/hero-campo.png` | Hero de Inicio (campo con montañas) |
| `nosotros/nosotros-planta.png` | Collage de Nosotros (edificio + camión) |
| `nosotros/nosotros-tractor.jpg` | Collage de Nosotros (tractor) |
| `nosotros/nosotros-uva.jpg` | Collage de Nosotros (uvas) |
| `sostenibilidad/sostenibilidad-manos.png` | Hero de Sostenibilidad (manos con planta) |
| `lineas/hero-lineas.png` | Hero de Líneas (productos + tractor) |
| `lineas/ynsufert.png` | Card Ynsufert (Inicio y Líneas) + sección de detalle |
| `lineas/ynsumaq.png` | Card Ynsumaq (Inicio y Líneas) + sección de detalle |
| `lineas/ynsupack.png` | Card Ynsupack (Inicio y Líneas) + sección de detalle |
| `lineas/ynsugrow.png` | Card Ynsugrow (Inicio y Líneas) + sección de detalle |

---

## 🎯 FALTAN — Brief para diseño

Estas 4 piezas son las que faltan. **Exportar al doble (2×)** para que se vean nítidas en
pantallas retina. Formato: **JPG** (o WebP), calidad ~80%, peso ideal 200–400 KB.

| # | Pieza | Archivo (nombre exacto) | Bloque real | Ratio | **Exportar a** |
|---|---|---|---|---|---|
| 1 | Inicio → panel "Confianza que genera valor" (donde van las certificaciones) | `inicio/planta-logistica.jpg` | 678 × 380 px | 16:9 | **1360 × 760 px** |
| 2 | Inicio → fondo del banner de video | `inicio/uva-verde.jpg` | 810 × 263 px | ~3:1 | **1620 × 530 px** |
| 3 | Contacto → fondo del hero | `contacto/contacto-campo.jpg` | Todo el ancho | ~16:9 | **1920 × 1080 px** |
| 4 | Imagen al compartir el link (WhatsApp / Facebook / LinkedIn) | `og-cover.jpg` (en `assets/img/`) | — | 1.91:1 | **1200 × 630 px** |

**Notas por pieza:**
- **(2) Banner de video:** es muy apaisado (3:1) y lleva texto blanco grande encima a la izquierda.
  Conviene una foto con espacio "limpio" a la izquierda.
- **(3) Contacto:** hoy lleva un velo oscuro fuerte (funciona como textura, la foto casi no se
  aprecia). Si quieren que se vea nítida, se aclara el velo cuando esté la foto.
- **(4) og-cover:** hoy **no aparece ninguna imagen al compartir el link**. Debe incluir el logo y
  ser legible en miniatura. Se conectará en las 6 páginas.

### 🖼️ Pendiente aparte: bloque derecho de Nosotros
Diseño va a entregar **una sola imagen** para reemplazar las 3 tiras verticales actuales:
- Bloque real: **772 × 510 px** → **exportar a 1544 × 1020 px** (ratio **3:2**)
- Color de fondo de la sección (por si necesitan fundir la imagen): **`#061B0F`**
- Verdes de marca del arco: **`#7BC043`** (lima) y **`#5CA932`**

---

## 🎬 Video — falta definir (no es una imagen)

Hay **dos botones de video que hoy no hacen nada**:
1. El botón **"Ver video"** en el hero de Inicio.
2. El botón ▶ del banner *"Más que productos, ofrecemos soluciones que transforman el agro"*.

Hay que elegir una opción:
- **(A) YouTube / Vimeo** — se pasa el link y se abre en un modal. *Recomendado* (no pesa nada).
- **(B) MP4 propio** — se sube a `assets/videos/` y se reproduce embebido (ojo con el peso).
- **(C) Quitar** los botones de video por ahora.

---

## 🔄 Opcionales (no bloquean)

- **Líneas → secciones de detalle:** cada una reutiliza la misma foto de su card. Si quieren fotos
  distintas (ej. producto en primer plano para Ynsufert), se agregan.
- **Sostenibilidad → "Nuestro compromiso":** reutiliza la foto del hero (manos con planta).
- **Favicon:** hoy es un ícono de brote genérico. Si quieren uno derivado del logo oficial, se cambia.

---

## 🛠️ Notas técnicas (para quien edite el código)

- Las imágenes de **fondo** (`background-image`) se escriben con ruta **relativa al CSS compilado**
  (`assets/css/main.css`), por eso van como `url('../img/inicio/foto.jpg')` y **no** `assets/img/...`.
  Las etiquetas `<img src="assets/img/...">` del HTML sí van relativas al HTML.
- Después de cambiar cualquier ruta o clase hay que recompilar: **`npm run build`**.
- **Optimización pendiente:** los PNG actuales pesan 2–2.5 MB c/u (~10 MB en total). Antes de
  producción hay que pasarlos a **WebP/JPG** (~250 KB). Sirve https://squoosh.app
