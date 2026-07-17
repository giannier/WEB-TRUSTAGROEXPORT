# PROGRESO — Trust Agro Export

Registro de avance del sitio web. Última actualización: **2026-07-17**.
Para instrucciones de despliegue y edición ver **`LEEME.md`**.

---

## 1. Resumen del proyecto

Sitio corporativo estático de **Trust Agro Export** (agroexportadora, Lambayeque – Perú).

- **Stack:** HTML + Tailwind CSS (compilado a `assets/css/main.css`) + JavaScript vanilla.
- **Hosting:** cPanel con **LiteSpeed** (Apache-compatible), archivos estáticos. Sin React/Vue/Node en el servidor.
- **Despliegue:** el repo se **clona/actualiza dentro de `public_html`** (`git pull`). El `.htaccess` protege las carpetas de desarrollo (`src/`, `n8n/`, `data/`) para que no sean públicas.
- **Dominio:** https://trustagroexport.com (con SSL activo).
- **Animaciones:** IntersectionObserver + CSS (equivalente a Framer Motion), en `assets/js/main.js`.
- **Líneas de negocio:** Ynsufert (fertilizantes), Ynsumaq (maquinaria), Ynsupack (empaque: jabas/parihuelas), Ynsugrow (asistencia en cultivos).

---

## 2. Estado de las páginas

| Página | Estado | Notas |
|---|---|---|
| `index.html` | ✅ Completa | Hero (foto + logo grande), indicadores, líneas, "por qué elegirnos", **reproductor de video (modal)** |
| `nosotros.html` | ✅ Completa | Arco verde + collage 3 fotos (ampliado) + Misión/Visión/Valores + trayectoria + CTA con foto |
| `lineas.html` | ✅ Completa | Hero con foto + 4 tarjetas dentro + secciones de detalle con anclas (#ynsufert, etc.) |
| `sostenibilidad.html` | ✅ Completa | Hero con foto real (manos+planta), pilares, indicadores |
| `contacto.html` | ✅ Completa | Hero con foto + formulario + `enviar.php` |
| `404.html` | ✅ Completa | Página de error de marca |

> **Nav:** Inicio · Nosotros · Líneas · Sostenibilidad · Contacto. (La página *Soluciones* y el bloque *Noticias* del inicio fueron eliminados.)

---

## 3. Sistema de diseño

- **Colores** (`tailwind.config.js`): `brand` (verde, primario `#74b33c`/lima `#7BC043`), `forest` (verde oscuro, `forest-950 #0a1c10`). Secciones oscuras usan degradado `#021508→#071F11→#03140A`.
- **Fuentes:** Sora (títulos, `font-display`) + Inter (cuerpo). Google Fonts por `<link>`.
- **Contenedor:** `.container-x` = `max-w-[1500px]` centrado con padding.
- **Componentes** (con `@apply` en `src/input.css`): botones, `.line-card`, `.card`, `.surface-dark`, `.surface-glass`, `.eyebrow`, `.chip`, `.icon-badge`, `.check-item`, `.field`, `.heading-1/2/3`, `.lede`, `.nav-link`, `.stat-value`, y utilidades de reveal (`[data-reveal]`).
- **Logo:**
  - `assets/img/LOGO TRUST AGRO EXPORT.png` — original del usuario (para fondos claros).
  - `assets/img/logo-light.png` — versión BLANCA (header, footer, menú, hero, 404).
  - `assets/img/logo.png` — original optimizado (fondos claros + SEO).

---

## 4. Cómo trabajar

```bash
npm install      # una sola vez
npm run build    # compila Tailwind -> assets/css/main.css (SIEMPRE tras cambiar clases)
npm run dev      # watch mientras desarrollas
```

- Verificación visual: Microsoft Edge headless para capturas.
  `msedge --headless --disable-gpu --force-device-scale-factor=1 --hide-scrollbars --window-size=1440,900 --virtual-time-budget=3500 --screenshot=out.png "file:///ruta/index.html"`
- **Truco:** para capturar el hero sin que `100svh` infle la altura, usa una ventana de alto normal (900). Para secciones de más abajo, renderiza un HTML temporal `_*.html` (están ignorados por git) con solo esa sección.

---

## 5. Imágenes y video

Todas las imágenes del sitio están en **WebP** (livianas). Fotos por página en `assets/img/<pagina>/`.

| Archivo | Uso |
|---|---|
| `inicio/hero-campo.webp` | Hero de inicio |
| `inicio/porque-elegirnos.webp` | Sección "¿Por qué elegirnos?" |
| `inicio/arandano-fresa.webp` | Fondo del panel de video |
| `inicio/trust-video.mp4` | Video institucional (reproductor modal) |
| `nosotros/nosotros-planta.webp` | Collage (edificio + camión; encuadre `85%` para mostrar el camión) |
| `nosotros/nosotros-tractor.webp` | Collage (tractor) |
| `nosotros/nosotros-uva.webp` | Collage (uvas) |
| `nosotros/CTA-nosotros.webp` | Fondo del CTA "¿Trabajamos juntos…?" |
| `sostenibilidad/sostenibilidad-manos.webp` | Hero sostenibilidad |
| `contacto/hero-contacto.webp` | Hero de contacto |
| `lineas/hero-lineas.webp` | Hero de Líneas |
| `lineas/ynsufert · ynsumaq · ynsupack · ynsugrow.webp` | Cards (index y líneas) + detalle |
| `og-cover.jpg` | Portada social (1200×630) — Open Graph / Twitter en las 5 páginas |
| `doctor-trust.png` | Personaje del widget (cuerpo completo) |
| `doctor-trust-avatar.png` | Rostro recortado (avatar del chat) |

> ⚠️ **Regla de rutas de fondos:** en el CSS compilado los `url()` se resuelven **relativos al CSS**, así que van `url('../img/...')`. Los `<img src="assets/img/...">` en HTML van relativos al HTML.

> ⚠️ **Cuidado con los paréntesis en degradados Tailwind:** `bg-[linear-gradient(...),url(...)]`. Un paréntesis de más invalida todo el `background` y la imagen no aparece (pasó una vez en el hero de contacto).

---

## 6. Doctor Trust (widget de chat con IA) — Fase 1 ✅

Reemplaza el botón de WhatsApp por un asesor agronómico con IA. **Implementado** (`assets/js/doctor-trust.js`):

- **Launcher = el personaje** (`doctor-trust.png`) con globo de diálogo que invita a conversar. Al abrir el chat, el personaje se queda parado **a un costado** de la ventana; en móvil se oculta (el chat ocupa toda la pantalla).
- **Avatar de perfil** con el rostro del personaje en la cabecera y en cada respuesta.
- **Foto de la planta**: menú con dos opciones —
  - **Tomar una foto** → cámara en vivo con `getUserMedia` (funciona en laptop y celular; **requiere HTTPS**). Si no hay cámara/permiso, cae a subir archivo.
  - **Subir una foto** → galería/archivos.
- Compresión de imagen en el navegador antes de enviar; límite de fotos por sesión.
- Conecta al **webhook de n8n** (URL en `CONFIG.webhookUrl`). Contrato JSON y flujo → **`DOCTOR-TRUST.md`**; workflow → `n8n/doctor-trust-workflow.json`; prompt → `n8n/system-prompt.md`.
- Base de conocimiento (plantillas de productos/cultivos/problemas/FAQ) → **`data/README.md`**.

Pendiente: cargar ~20 productos reales, RAG/vector store (Fase 4), rate limiting en n8n.

---

## 7. Despliegue y caché (IMPORTANTE)

- El sitio vive en `public_html` como **clon del repo**. Para actualizar: `git pull` en esa carpeta.
- El hosting usa **LiteSpeed** (carpetas `lscache`/`lscmData` en el home). Tiene caché de servidor; si tras subir cambios no se ven, **purga** desde *LiteSpeed Web Cache Manager → Flush All*.
- **Caché del navegador:** el `.htaccess` está en **MODO VALIDACIÓN** (`no-cache, must-revalidate`) para que los cambios se vean al instante. Aun así, un navegador que ya cacheó la versión vieja necesita **recarga forzada** (`Ctrl+F5`) o incógnito una vez.
- Cuando el sitio esté final, cambiar el `.htaccess` a **MODO PRODUCCIÓN** (caché larga) — ver comentarios dentro del archivo.
- El `.htaccess` bloquea el acceso web a `src/`, `n8n/`, `data/`, `.git/`, y a los `.json`/`.md` (excepto `manifest.json`), aunque el repo completo esté en `public_html`.

---

## 8. Pendientes / próximos pasos

- [ ] Configurar correo del formulario en `enviar.php` (`$destinatario`, `$remitente`).
- [ ] Reemplazar `href="#"` de redes sociales por las URLs reales.
- [ ] Doctor Trust: cargar catálogo de productos + RAG en n8n + rate limiting.
- [ ] Cuando el diseño esté aprobado: pasar el `.htaccess` a MODO PRODUCCIÓN (caché larga).
- [ ] (Opcional) Páginas de detalle por línea, blog, política de privacidad/términos.

---

## 9. Registro de cambios (changelog)

- **2026-07-15** — Estructura inicial, páginas, sistema de diseño, JS, SEO/PWA, PHP form. Nosotros clonada de la referencia.
- **2026-07-16** — Logo real (versión clara). Fotos reales conectadas. Fix rutas `url('../img/')` y z-index en heroes. Heroes alineados a la izquierda (contenedor 1500px). Menú hamburguesa con fondo sólido. Fix: panel del menú móvil se volvía transparente al scrollear (era `backdrop-blur` en el header). Conectadas imágenes de líneas + reestructura del hero. **Eliminadas** la página Soluciones y el bloque Noticias.
- **2026-07-17** — **Doctor Trust como personaje**: launcher con el personaje + globo de diálogo; al abrir, se queda al costado del chat. Avatar de perfil con su rostro en cabecera y respuestas. Menú de cámara (tomar foto con `getUserMedia` / subir foto).
- **2026-07-17** — Logo del hero de inicio más grande. Nosotros: bloque de 3 imágenes más alto/ancho; encuadre del 1er bloque para mostrar el camión.
- **2026-07-17** — **Todas las imágenes a WebP** (mucho más livianas). Imágenes nuevas conectadas: `porque-elegirnos`, `hero-contacto`, `CTA-nosotros`, `arandano-fresa`. Overlays de contacto y CTA aclarados (y fix de un paréntesis de más en el degradado de contacto).
- **2026-07-17** — **Reproductor de video (modal)** en inicio con `trust-video.mp4`; lo abren el botón de play y el enlace "Ver video".
- **2026-07-17** — **`og-cover.jpg`** (portada social 1200×630) creada + `og:image`/`twitter:image` en las 5 páginas.
- **2026-07-17** — Instalado Git + GitHub CLI + llave SSH. Repo: **github.com/giannier/WEB-TRUSTAGROEXPORT**. Despliegue por `git clone/pull` en `public_html`.
- **2026-07-17** — El `.htaccess` y la documentación (`.md`) ahora **sí** se versionan en el repo. `.htaccess` actualizado a MODO VALIDACIÓN + protección de `src/n8n/data`.
