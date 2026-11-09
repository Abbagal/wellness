/* Depth in the page itself: headings that rise word by word, cards that lean toward the pointer,
   and scroll-linked perspective on the big set pieces. Everything here is skipped when motion is off. */
(function () {
  'use strict';
  var root = document.documentElement;
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // pause / play control (always available, remembered per browser)
  var pause = document.getElementById('motionToggle');
  if (pause) {
    if (root.classList.contains('reduced')) {
      pause.setAttribute('aria-pressed', 'true');
      pause.setAttribute('aria-label', 'Play animations');
      pause.title = 'Play animations';
      pause.querySelector('use').setAttribute('href', '#i-play');
    }
    pause.addEventListener('click', function () {
      try { localStorage.setItem('sw-motion', root.classList.contains('reduced') ? 'on' : 'off'); } catch (e) {}
      location.reload();
    });
  }

  if (root.classList.contains('reduced')) return;
  var hasIO = 'IntersectionObserver' in window;
  if (!hasIO) return;

  /* ---- headings rise word by word ---- */
  function split(el) {
    var n = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 1) { walk(c); return; }
        if (c.nodeType !== 3 || !c.textContent.trim()) return;
        var frag = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          var s = document.createElement('span');
          s.className = 'w'; s.style.setProperty('--w', n++); s.textContent = part;
          frag.appendChild(s);
        });
        node.replaceChild(frag, c);
      });
    })(el);
    el.classList.add('words');
  }
  var headIO = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); headIO.unobserve(e.target); } });
  }, { threshold: .2 });
  $$('.hero h1, .page-hero:not(.alert) h1, .sec-head h2').forEach(function (h) {
    split(h);
    headIO.observe(h);
  });

  /* ---- cards lean toward the pointer ---- */
  if (matchMedia('(pointer: fine)').matches) {
    $$('.task, .news-card, .channel, .place, .team-card, .reach-card, .feature, .sign, .unit, .rf, .rm-item, .doc-card, .ws').forEach(function (el) {
      var raf = 0, x = 0, y = 0;
      function paint() {
        raf = 0;
        el.style.transform = 'perspective(900px) rotateX(' + (-y * 5).toFixed(2) + 'deg) rotateY(' + (x * 6).toFixed(2) + 'deg) translateZ(10px)';
        el.style.setProperty('--lx', ((x + .5) * 100).toFixed(1) + '%');
        el.style.setProperty('--ly', ((y + .5) * 100).toFixed(1) + '%');
      }
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        x = (e.clientX - r.left) / r.width - .5; y = (e.clientY - r.top) / r.height - .5;
        if (!raf) raf = requestAnimationFrame(paint);
      });
      el.addEventListener('pointerleave', function () { if (raf) cancelAnimationFrame(raf); raf = 0; el.style.transform = ''; });
    });
  }

  /* ---- scroll-linked perspective, only for what is on screen ---- */
  function clamp(v) { return Math.max(0, Math.min(1, v)); }
  var wide = function () { return innerWidth > 860; };
  var conts = $$('.cont'), jobs = [];
  if (conts.length) jobs.push({
    el: conts[0].parentNode,
    run: function (p) {
      var q = 1 - clamp(p * 1.9);
      conts.forEach(function (c, i) {
        var side = i - 1;
        c.style.transform = wide()
          ? 'translate3d(' + (-side * q * 70).toFixed(1) + 'px,' + (q * 40).toFixed(1) + 'px,' + (-q * 180).toFixed(1) + 'px) rotateY(' + (-side * q * 26).toFixed(2) + 'deg)'
          : 'translateY(' + (q * 30).toFixed(1) + 'px)';
      });
    }
  });
  $$('.phone').forEach(function (ph) {
    jobs.push({ el: ph, run: function (p) {
      var q = (.5 - p) * 2;
      ph.style.transform = 'perspective(1200px) rotateY(' + (q * 16).toFixed(2) + 'deg) rotateX(' + (Math.abs(q) * 5).toFixed(2) + 'deg)';
    } });
  });
  $$('.media-card img').forEach(function (img) {
    jobs.push({ el: img.parentNode, run: function (p) { img.style.transform = 'scale(1.14) translate3d(0,' + ((p - .5) * -9).toFixed(2) + '%,0)'; } });
  });
  $$('.hours-card, .peer-stage, .wq-core').forEach(function (el) {
    jobs.push({ el: el, run: function (p) {
      var q = 1 - clamp(p * 2.2);
      el.style.transform = 'perspective(1400px) rotateX(' + (q * 9).toFixed(2) + 'deg) translate3d(0,' + (q * 30).toFixed(1) + 'px,0)';
    } });
  });

  var live = [], ticking = false;
  var jobIO = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      var j = e.target.__job;
      var i = live.indexOf(j);
      if (e.isIntersecting && i < 0) live.push(j);
      else if (!e.isIntersecting && i > -1) live.splice(i, 1);
    });
    request();
  }, { rootMargin: '10% 0px' });
  jobs.forEach(function (j) { j.el.__job = j; jobIO.observe(j.el); });

  function paintJobs() {
    ticking = false;
    var vh = innerHeight;
    live.forEach(function (j) {
      var r = j.el.getBoundingClientRect();
      j.run(clamp((vh - r.top) / (vh + r.height)));
    });
  }
  function request() { if (!ticking) { ticking = true; requestAnimationFrame(paintJobs); } }
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request);
})();
