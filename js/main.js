/* Portfolio — Agustín Campos */

(function () {
  'use strict';

  var quieto = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Menú mobile ------------------------------------------------------- */
  var toggle = document.querySelector('.navtoggle');
  var nav = document.getElementById('nav');

  if (toggle && nav) {
    var cerrarMenu = nav.querySelector('.nav__cerrar');

    function abrirMenu(abrir) {
      nav.dataset.open = String(abrir);
      toggle.setAttribute('aria-expanded', String(abrir));
      /* El panel ocupa toda la pantalla: se bloquea el scroll de atrás */
      document.body.style.overflow = abrir ? 'hidden' : '';
      /* El panel entra con una transición de visibility: enfocar antes
         de que sea visible no tiene efecto. */
      if (abrir && cerrarMenu) requestAnimationFrame(function () { cerrarMenu.focus(); });
      else if (!abrir) toggle.focus();
    }

    toggle.addEventListener('click', function () {
      abrirMenu(nav.dataset.open !== 'true');
    });
    if (cerrarMenu) cerrarMenu.addEventListener('click', function () { abrirMenu(false); });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) abrirMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.dataset.open === 'true') abrirMenu(false);
    });

    /* Si se agranda la ventana con el panel abierto, se cierra solo */
    window.matchMedia('(min-width: 1101px)').addEventListener('change', function (e) {
      if (e.matches && nav.dataset.open === 'true') {
        nav.dataset.open = 'false';
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* Sección activa en el menú ----------------------------------------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
  var targets = links
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && targets.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + entry.target.id));
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    targets.forEach(function (t) { observer.observe(t); });
  }

  /* Video: se reproduce solo mientras está a la vista ------------------
     Se saltea si el visitante pidió ahorrar datos o está en una conexión
     lenta: el video pesa 460 KB y no vale la pena imponérselo.          */
  var videos = Array.prototype.slice.call(document.querySelectorAll('.case__media video'));
  var red = navigator.connection || {};
  var ahorrando = red.saveData === true || /^([23]g|slow-2g)$/.test(red.effectiveType || '');

  if (videos.length && 'IntersectionObserver' in window && !quieto.matches && !ahorrando) {
    var vObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var v = entry.target;
        if (entry.isIntersecting) {
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        } else {
          v.pause();
        }
      });
    }, { threshold: 0.4 });

    videos.forEach(function (v) { vObs.observe(v); });
  }

  /* Panel de caso ------------------------------------------------------
     La tarjeta queda compacta y el detalle se abre en un <dialog>. Los nodos
     se mueven al panel y se devuelven a su lugar al cerrar, así no hay
     contenido duplicado ni ids repetidos. Sin <dialog> ni JS, la página
     muestra todos los casos completos, como antes.                     */

  var modal = document.getElementById('modal-caso');
  var soportaDialog = modal && typeof modal.showModal === 'function';

  if (soportaDialog) {
    document.documentElement.classList.add('js-modal');

    var cuerpo = modal.querySelector('.modal__cuerpo');
    var elTitulo = modal.querySelector('#modal-titulo');
    var elMeta = modal.querySelector('#modal-meta');
    var cerrar = modal.querySelector('.modal__cerrar');
    var prestados = [];   // nodos movidos al panel, con su lugar de origen
    var carrusel = null;  // limpieza del carrusel activo
    var disparador = null;

    function prestar(nodo) {
      if (!nodo) return null;
      prestados.push({ nodo: nodo, padre: nodo.parentNode, siguiente: nodo.nextSibling });
      cuerpo.appendChild(nodo);
      return nodo;
    }

    function devolverTodo() {
      prestados.forEach(function (p) {
        p.padre.insertBefore(p.nodo, p.siguiente);
      });
      prestados = [];
    }

    function montarCarrusel(media) {
      var figuras = Array.prototype.slice.call(media.children);
      if (figuras.length < 2) return null;

      var caja = document.createElement('div');
      caja.className = 'carrusel';
      media.parentNode.insertBefore(caja, media);
      caja.appendChild(media);

      var prev = document.createElement('button');
      prev.type = 'button';
      prev.className = 'carrusel__nav carrusel__nav--prev';
      prev.setAttribute('aria-label', 'Imagen anterior');
      prev.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">'
        + '<path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2"'
        + ' stroke-linecap="round" stroke-linejoin="round"/></svg>';

      var next = prev.cloneNode(true);
      next.className = 'carrusel__nav carrusel__nav--next';
      next.setAttribute('aria-label', 'Imagen siguiente');
      next.querySelector('path').setAttribute('d', 'M9 5l7 7-7 7');

      var dots = document.createElement('div');
      dots.className = 'carrusel__dots';
      var botones = figuras.map(function (_, i) {
        var d = document.createElement('button');
        d.type = 'button';
        d.className = 'carrusel__dot';
        d.setAttribute('aria-label', 'Ver la imagen ' + (i + 1) + ' de ' + figuras.length);
        d.addEventListener('click', function () { ir(i); });
        dots.appendChild(d);
        return d;
      });

      caja.appendChild(prev);
      caja.appendChild(next);
      caja.parentNode.insertBefore(dots, caja.nextSibling);

      function indice() {
        return Math.round(media.scrollLeft / Math.max(media.clientWidth, 1));
      }
      function ir(i) {
        media.scrollTo({
          left: i * media.clientWidth,
          behavior: quieto.matches ? 'auto' : 'smooth'
        });
      }
      function pintar() {
        var i = Math.min(Math.max(indice(), 0), figuras.length - 1);
        botones.forEach(function (b, n) { b.setAttribute('aria-current', String(n === i)); });
        prev.disabled = i === 0;
        next.disabled = i === figuras.length - 1;
      }

      prev.addEventListener('click', function () { ir(indice() - 1); });
      next.addEventListener('click', function () { ir(indice() + 1); });
      media.addEventListener('scroll', pintar, { passive: true });
      pintar();

      return function desmontar() {
        media.removeEventListener('scroll', pintar);
        caja.parentNode.insertBefore(media, caja);
        dots.remove();
        caja.remove();
      };
    }

    function abrir(caso, boton) {
      disparador = boton;

      var meta = caso.querySelector('.case__meta');
      var titulo = caso.querySelector('h3');
      elMeta.textContent = meta ? meta.textContent.trim() : '';
      elTitulo.textContent = titulo ? titulo.textContent.trim() : 'Caso';

      var media = prestar(caso.querySelector('.case__media'));
      prestar(caso.querySelector('.case__detalle'));

      if (media) carrusel = montarCarrusel(media);

      cuerpo.scrollTop = 0;
      modal.showModal();
    }

    /* Idempotente: se puede llamar más de una vez sin duplicar nada. */
    function alCerrar() {
      if (carrusel) { carrusel(); carrusel = null; }
      cuerpo.querySelectorAll('video').forEach(function (v) { v.pause(); });
      devolverTodo();
      if (disparador) { disparador.focus(); disparador = null; }
    }

    function cerrarPanel() {
      if (modal.open) modal.close();
      alCerrar();
    }

    document.querySelectorAll('.case').forEach(function (caso) {
      var boton = caso.querySelector('.case__abrir');
      if (!boton) return;
      var titulo = caso.querySelector('h3');
      if (titulo) {
        var prefijo = document.documentElement.lang === 'en'
          ? 'View the full case: '
          : 'Ver el caso completo: ';
        boton.setAttribute('aria-label', prefijo + titulo.textContent.trim());
      }
      boton.addEventListener('click', function () { abrir(caso, boton); });
    });

    cerrar.addEventListener('click', cerrarPanel);

    /* Cerrar al hacer clic fuera de la caja */
    modal.addEventListener('click', function (e) {
      if (!e.target.closest('.modal__caja')) cerrarPanel();
    });

    /* Escape: el navegador dispara 'cancel' antes de cerrar */
    modal.addEventListener('cancel', function (e) {
      e.preventDefault();
      cerrarPanel();
    });

    /* Y por si el cierre nativo con Escape no llega al diálogo */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.open) {
        e.preventDefault();
        cerrarPanel();
      }
    });

    /* Red de seguridad por si el cierre viene por otra vía */
    modal.addEventListener('close', alCerrar);
  }

  /* Email -------------------------------------------------------------- */
  document.querySelectorAll('.mail').forEach(function (el) {
    var dir = el.dataset.u + String.fromCharCode(64) + el.dataset.d;
    var a = document.createElement('a');
    a.href = 'mailto:' + dir;
    a.textContent = dir;
    el.textContent = '';
    el.appendChild(a);
  });

  /* Año del footer ----------------------------------------------------- */
  var anio = document.getElementById('anio');
  if (anio) anio.textContent = new Date().getFullYear();
}());
