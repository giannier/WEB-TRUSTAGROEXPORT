# Guía Completa de Arquitectura Web Profesional

## Objetivos

-   Escalable
-   Mantenible
-   Optimizada para SEO
-   Alto rendimiento
-   Accesible
-   Modular

------------------------------------------------------------------------

# Estructura de carpetas

``` text
/
├── index.html
├── nosotros.html
├── servicios.html
├── lineas.html
├── proyectos.html
├── blog.html
├── contacto.html
├── cotizar.html
├── assets/
│   ├── css/
│   │   ├── reset.css
│   │   ├── variables.css
│   │   ├── typography.css
│   │   ├── grid.css
│   │   ├── animations.css
│   │   ├── components.css
│   │   ├── sections.css
│   │   ├── utilities.css
│   │   └── main.css
│   ├── js/
│   │   ├── app.js
│   │   ├── navigation.js
│   │   ├── slider.js
│   │   ├── animations.js
│   │   ├── forms.js
│   │   ├── counters.js
│   │   ├── lazyload.js
│   │   └── seo.js
│   ├── images/
│   ├── videos/
│   ├── fonts/
│   └── svg/
├── components/
├── data/
├── uploads/
├── sitemap.xml
├── robots.txt
├── manifest.json
└── favicon.ico
```

# Arquitectura del sitio

-   Inicio
-   Nosotros
-   Servicios
    -   Servicio 1
    -   Servicio 2
    -   Servicio N
-   Líneas de Negocio
-   Proyectos
-   Blog
-   Contacto
-   Cotizar

# Header

-   Logo
-   Barra superior (correo, teléfono, redes)
-   Navegación
-   Botón Cotizar
-   Selector de idioma (opcional)
-   Buscador (si aplica)
-   Botón WhatsApp flotante

# Home

1.  Hero (H1, CTA principal y secundario)
2.  Clientes
3.  Servicios destacados
4.  Líneas de negocio
5.  Beneficios
6.  Indicadores
7.  Proyectos
8.  Testimonios
9.  Blog
10. FAQ
11. CTA final
12. Footer

# Nosotros

-   Hero
-   Historia
-   Quiénes somos
-   Misión
-   Visión
-   Valores
-   Equipo
-   Metodología
-   Certificaciones
-   Clientes
-   CTA
-   Footer

# Servicios

-   Hero
-   Introducción
-   Catálogo de servicios
-   Proceso de trabajo
-   Beneficios
-   Casos de éxito
-   FAQ
-   CTA
-   Footer

# Líneas de Negocio

-   Hero
-   Introducción
-   Tarjetas
-   Detalle
-   Galería
-   Beneficios
-   CTA
-   Footer

# Proyectos

-   Hero
-   Filtros
-   Grid
-   Casos de éxito
-   Resultados
-   CTA
-   Footer

# Blog

-   Hero
-   Buscador
-   Categorías
-   Artículos
-   Sidebar
-   CTA
-   Footer

# Contacto

-   Hero
-   Formulario
-   Datos
-   Mapa
-   Horarios
-   Redes
-   FAQ
-   Footer

# Footer

-   Logo
-   Descripción
-   Enlaces
-   Servicios
-   Empresa
-   Blog
-   Contacto
-   Redes
-   Políticas
-   Cookies
-   Sitemap

# SEO

## Meta etiquetas

``` html
<title></title>
<meta name="description">
<meta name="robots" content="index,follow">
<link rel="canonical">
<meta property="og:title">
<meta property="og:description">
<meta property="og:image">
<meta property="og:url">
<meta name="twitter:card">
<script type="application/ld+json"></script>
```

## Jerarquía

-   Un solo H1
-   H2 para secciones
-   H3 para subsecciones
-   H4 cuando sea necesario

## URLs

-   Cortas
-   Descriptivas
-   Sin parámetros innecesarios

## Sitemap

-   sitemap.xml
-   robots.txt

## Schema.org

-   Organization
-   LocalBusiness
-   Service
-   Article
-   FAQPage
-   BreadcrumbList

# Rendimiento

-   CSS minificado
-   JS defer
-   Lazy Loading
-   WebP/AVIF
-   preload
-   CDN
-   GZIP/Brotli
-   Caché

# Accesibilidad

-   HTML semántico
-   aria-label cuando aplique
-   Labels en formularios
-   Navegación por teclado
-   Alto contraste
-   Alt descriptivos

# Escalabilidad

-   Componentes reutilizables
-   CSS modular
-   JS por módulos
-   Datos en JSON
-   Convención de nombres consistente
-   Separación entre presentación, contenido y comportamiento

# Checklist

-   Responsive
-   Mobile First
-   Core Web Vitals
-   SEO On Page
-   SEO Técnico
-   Accesibilidad WCAG
-   Seguridad HTTPS
-   Analítica
-   Mantenimiento sencillo
