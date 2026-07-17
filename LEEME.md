# Trust Agro Export — Sitio web

Sitio corporativo estático hecho con **HTML + Tailwind CSS + JavaScript vanilla**.
Se sube a **cPanel** (hosting Apache/LiteSpeed). No necesita Node ni base de datos
en el servidor: son archivos estáticos + un `enviar.php` para el formulario.

- **Repositorio:** https://github.com/giannier/WEB-TRUSTAGROEXPORT
- **Sitio en vivo:** https://trustagroexport.com

---

## 🚀 Desplegar en cPanel (por Git — recomendado)

El sitio se despliega **clonando el repositorio dentro de `public_html`**. Así,
para publicar cambios solo haces `git pull` en el servidor.

**Primera vez** (Terminal de cPanel, o cPanel → Git™ Version Control):
```bash
cd ~/public_html
git clone git@github.com:giannier/WEB-TRUSTAGROEXPORT.git .
```

**Actualizar** cuando haya cambios nuevos:
```bash
cd ~/public_html
git pull
```

> El repo completo queda en `public_html`, pero el **`.htaccess` bloquea** el
> acceso web a las carpetas de desarrollo (`src/`, `n8n/`, `data/`, `.git/`) y a
> los archivos `.json`/`.md`. No son públicos aunque estén ahí.

**Alternativa manual** (sin Git): sube por el Administrador de archivos **todo
EXCEPTO** `node_modules/`. El `.htaccess` sí debe subirse (protege lo interno).

> Si tu dominio aún no tiene SSL, deja comentada la sección "Forzar HTTPS" del
> `.htaccess`. Con SSL activo (ya es el caso), puedes descomentarla.

---

## 🔄 Si subes cambios y NO se ven (caché)

Es lo más común y **no es un error del sitio**:

1. **Tu navegador** guardó la versión vieja → **recarga forzada** `Ctrl`+`F5`, o
   ábrelo en **incógnito** (`Ctrl`+`Shift`+`N`) para confirmar.
2. **LiteSpeed** (caché del hosting) → cPanel → **LiteSpeed Web Cache Manager** →
   **Flush All / Purge**.
3. El `.htaccess` está en **MODO VALIDACIÓN** (`no-cache`) para que los cambios se
   vean al instante. Cuando el sitio esté final, pásalo a **MODO PRODUCCIÓN**
   (caché larga, mejor rendimiento) descomentando ese bloque dentro del `.htaccess`.

---

## ✉️ Configurar el formulario de contacto

El formulario de `contacto.html` envía a `enviar.php`. Edita las 2 primeras variables:

```php
$destinatario = 'info@trustagro.com';                 // dónde recibes las solicitudes
$remitente    = 'no-reply@trustagroexport.com';       // un correo DE TU dominio
```

> Recomendación: crea un buzón en tu dominio (ej. `no-reply@tudominio.com`) y úsalo
> como `$remitente` para que el correo no caiga en spam. Si `mail()` no funciona en
> tu hosting, se puede cambiar a SMTP con PHPMailer.

---

## 🩺 Doctor Trust (chat con IA)

Widget de asesor agronómico que reemplaza el botón de WhatsApp (`assets/js/doctor-trust.js`).
El launcher es el **personaje**; al abrir, se queda a un costado del chat. Permite
**tomar/subir foto** de la planta (la cámara en vivo **requiere HTTPS**). Se conecta
a un **webhook de n8n** (URL en `CONFIG.webhookUrl`).

- Plan y contrato → `DOCTOR-TRUST.md`
- Workflow n8n → `n8n/doctor-trust-workflow.json` · prompt → `n8n/system-prompt.md`
- Base de conocimiento (plantillas) → `data/README.md`

---

## 🎨 Editar el diseño / recompilar el CSS

El CSS final ya está en `assets/css/main.css`. Solo recompila si cambias **clases
de Tailwind** en el HTML o en `src/input.css`:

```bash
npm install        # solo la primera vez
npm run build      # genera assets/css/main.css minificado
npm run dev        # watch: recompila al guardar
```

- Colores/tipografías/sombras de marca: `tailwind.config.js`
- Componentes (botones, tarjetas, secciones): `src/input.css`
- Comportamiento (menú, animaciones, contadores, reproductor de video): `assets/js/main.js`
- Formulario: `assets/js/contact.js` + `enviar.php`
- Widget Doctor Trust: `assets/js/doctor-trust.js`

---

## 🧩 Estructura

```
/
├── index.html            Inicio (hero, líneas, por qué elegirnos, video)
├── nosotros.html         Nosotros (misión, visión, valores, trayectoria)
├── lineas.html           4 líneas: Ynsufert, Ynsumaq, Ynsupack, Ynsugrow
├── sostenibilidad.html   Compromiso ambiental + indicadores
├── contacto.html         Formulario de cotización
├── 404.html              Página de error
├── enviar.php            Procesa el formulario (cPanel/PHP)
├── assets/
│   ├── css/main.css      CSS compilado (NO editar a mano)
│   ├── js/               main.js, contact.js, doctor-trust.js
│   └── img/              Logo, favicon, og-cover, video y fotos por página (WebP)
├── .htaccess             GZIP, caché, seguridad, 404, protección de carpetas
├── robots.txt · sitemap.xml · manifest.json          SEO / PWA
├── src/input.css · tailwind.config.js · package.json (solo desarrollo)
├── n8n/                  Workflow y prompt del Doctor Trust (protegido)
├── data/                 Plantillas de la base de conocimiento (protegido)
└── *.md                  Documentación (LEEME, PROGRESO, DOCTOR-TRUST…) (protegido)
```

## 🌱 Las 4 líneas de negocio
| Marca | Rubro |
|---|---|
| **Ynsufert®** | Línea de fertilizantes |
| **Ynsumaq®** | Maquinaria agrícola |
| **Ynsupack®** | Insumos de empaque (jabas, parihuelas) |
| **Ynsugrow®** | Asistencia técnica en cultivos (uva, mango, palta) |

---

## ✅ Incluye
- Diseño responsive (móvil, tablet, escritorio) con menú móvil deslizable.
- Animaciones al hacer scroll (estilo Framer Motion) con IntersectionObserver + CSS.
- Contadores animados, parallax sutil, respeta `prefers-reduced-motion`.
- Reproductor de video (modal) y widget de chat con IA (Doctor Trust).
- Imágenes en WebP + `og-cover` para compartir en redes (Open Graph / Twitter).
- SEO: metaetiquetas, Open Graph, datos estructurados (JSON-LD), sitemap y robots.
- Accesibilidad: HTML semántico, foco visible, `aria-labels`, salto al contenido.
