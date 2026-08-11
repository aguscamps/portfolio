/* Portfolio — Agustín Campos
   Lo mínimo indispensable: menú mobile, sección activa y año del footer.
   Sin librerías. */

(function () {
  'use strict';

  /* Menú mobile ------------------------------------------------------- */
  var toggle = document.querySelector('.navtoggle');
  var nav = document.getElementById('nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.dataset.open === 'true';
      nav.dataset.open = String(!open);
      toggle.setAttribute('aria-expanded', String(!open));
    });

    // Al elegir una sección, cerrar el menú.
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.dataset.open = 'false';
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Escape cierra y devuelve el foco al botón.
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.dataset.open === 'true') {
        nav.dataset.open = 'false';
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
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

  /* Video: se reproduce solo mientras está a la vista ------------------ */
  var quieto = window.matchMedia('(prefers-reduced-motion: reduce)');
  var videos = Array.prototype.slice.call(document.querySelectorAll('.case__media video'));

  if (videos.length && 'IntersectionObserver' in window && !quieto.matches) {
    var vObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var v = entry.target;
        if (entry.isIntersecting) {
          // play() devuelve una promesa que rechaza si el navegador lo bloquea.
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        } else {
          v.pause();
        }
      });
    }, { threshold: 0.4 });

    videos.forEach(function (v) { vObs.observe(v); });
  }

  /* Email ---------------------------------------------------------------
     La dirección no viaja entera en el HTML: se arma acá. Los rastreadores de
     spam leen el fuente buscando "mailto:" o algo@algo y no encuentran nada.
     Sin JavaScript queda el <noscript> con la dirección en palabras. */
  Array.prototype.forEach.call(document.querySelectorAll('.mail'), function (el) {
    var dir = el.dataset.u + String.fromCharCode(64) + el.dataset.d;
    var a = document.createElement('a');
    a.href = 'mailto:' + dir;
    a.textContent = dir;
    el.textContent = '';
    el.appendChild(a);
  });

  /* Aparición al hacer scroll -------------------------------------------
     La clase en <html> evita el parpadeo: sin JS nada se oculta. */
  if (!quieto.matches && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js-anim');

    var piezas = document.querySelectorAll(
      '.case, .marcas, .grid-otros li, .cols4 > div, .stack dt, .timeline li, .contacto__list li');

    var aparecer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);          // una sola vez: no reaparece al volver
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(piezas, function (el, i) {
      el.classList.add('revelar');
      el.style.transitionDelay = (i % 3) * 70 + 'ms';   // escalonado corto dentro de cada fila
      aparecer.observe(el);
    });
  }

  /* Año del footer ----------------------------------------------------- */
  var anio = document.getElementById('anio');
  if (anio) anio.textContent = new Date().getFullYear();
}());
