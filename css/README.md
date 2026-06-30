# Arquitectura CSS

El sitio carga **SEIS** hojas de estilo, en este orden, desde [`index.html`](../index.html):

1. `styles.css` (raíz) — Hoja consolidada principal. ~253KB con todos los estilos base del proyecto: hero, cards, calendario, mapa, super-galería, modales, lightbox, contador, etc.
2. `css/polish.css` — Capa V1 de mejoras visuales (intro, scroll reveals, partículas, back-to-top, divisores, cursor trail, badge HOY, confetti, easter eggs, etc.).
3. `css/cinematic.css` — Capa premium (mesh background, título letra-a-letra, marco cónico del foto, glass cards, cursor custom, fireworks).
4. `css/fixes.css` — Capa de correcciones (reubica el panel del love-counter al hero como tarjeta horizontal, fila de FABs uniforme, esconde botones residuales).
5. `css/nightsky.css` — Sección "Nuestro cielo" con luna del día (SVG con fase calculada) y estrellas-evento. Cada estrella representa un mensajito diario, foto o nota. Modular, independiente del resto del sitio. La maneja `js/nightsky.js`.
6. `css/mejoras.css` — Capa final actual:
   - **Sección 1**: love-counter como pestañita escondida a la derecha + panel slide-out con hover/click.
   - **Sección 2**: botón "Quitar filtro" floating centrado arriba (sólo aparece con filtro activo).
   - **Secciones 3-11**: polish galería, header, hero, scroll-progress, cards, dividers, extras.
   - **Sección V2.x**: hero ambient, foto con marco doble, modal del contador rediseñado, calendario con bounce, lightbox premium, scrollbars suaves.
   - **Sección V3.x**: fixes responsive (gallery-actions wrap, pestañita más discreta, breakpoints en cards/grid/hero/extras, prevenir overflow horizontal).

## Carpeta `_legacy/`

Contiene los CSS módulares originales **antes** de consolidar en `styles.css`:

- `base.css`, `variables.css`, `hero.css`, `messages.css`, `calendar.css`, `gallery.css`, `superGallery.css`, `modals.css`

**Estos archivos NO se cargan** en producción — están aquí sólo como referencia histórica. Si se necesita recuperar un estilo, ir a `styles.css` (que ya los contiene a todos consolidados).

## Cache busting

Cuando edites `mejoras.css` o `fixes.css`, sube el `?v=N` en [`index.html`](../index.html) para forzar refresh.
