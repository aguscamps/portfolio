# Portfolio — Agustín Campos

Sitio personal de un frontend developer y diseñador de interfaz.
Español e inglés, con casos de trabajo en e-commerce sobre Adobe Commerce.

**En vivo:** _pendiente de publicar_

## Cómo está hecho

Sitio estático, **sin dependencias, sin build y sin backend**. Se abre con doble clic
y se publica subiendo la carpeta tal cual.

```
index.html          página en español
en/index.html       página en inglés
css/style.css       un único archivo de estilos, compartido por las dos
js/main.js          ~110 líneas de JavaScript sin librerías
fonts/              Space Grotesk e Inter, servidas desde el propio sitio
img/                imágenes en WebP
video/              una pieza de motion graphics
cv/                 los PDF que se descargan desde la página
```

## Decisiones técnicas

- **Cero dependencias.** Ni framework, ni bundler, ni librería de terceros.
- **HTML semántico** y jerarquía de encabezados sin saltos.
- **Accesibilidad:** enlace para saltar al contenido, `alt` descriptivos, foco visible,
  nombres accesibles en los controles y respeto por `prefers-reduced-motion`.
- **Sin salto de layout:** todas las imágenes declaran `width` y `height`.
- **Tipografías propias**, subconjunto latino, con `preload` de las dos críticas: no se
  pide nada a servidores de terceros y no se filtran visitas.
- **Modo claro y oscuro** según la preferencia del sistema.
- **El correo no está escrito en el HTML:** se arma en el cliente, con alternativa
  para quien navegue sin JavaScript.

## Para verlo en local

```bash
python3 -m http.server 8000
# http://localhost:8000
```

---

© Agustín Campos · [linkedin.com/in/aguscamps](https://linkedin.com/in/aguscamps)
