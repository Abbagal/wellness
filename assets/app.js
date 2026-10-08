(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var SVGNS = 'http://www.w3.org/2000/svg';
  var root = document.documentElement;
  var reduced = root.classList.contains('reduced');
  var hasIO = 'IntersectionObserver' in window;

  function svg(tag, attrs, parent) {
    var el = document.createElementNS(SVGNS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  }
  function onView(el, cb, opts) {
    if (!el) return;
    if (!hasIO) { cb(el); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { cb(e.target); io.unobserve(e.target); } });
    }, opts || { threshold: 0.25 });
    io.observe(el);
  }
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  /* ---------------- theme ---------------- */
  var themeBtn = $('#themeToggle');
  function isDark() {
    var t = root.getAttribute('data-theme');
    if (t) return t === 'dark';
    return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function paintThemeIcon() {
    themeBtn.querySelector('use').setAttribute('href', isDark() ? '#i-sunny' : '#i-moon');
    themeBtn.setAttribute('aria-label', isDark() ? 'Switch to light theme' : 'Switch to dark theme');
  }
  themeBtn.addEventListener('click', function () {
    var next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('sw-theme', next); } catch (e) {}
    paintThemeIcon();
  });
  paintThemeIcon();

  /* ---------------- nav: progress, scrolled, menu, active ---------------- */
  var nav = $('.nav'), bar = $('#progressBar');
  function onScroll() {
    var h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, scrollY / h) : 0) + ')';
    nav.classList.toggle('scrolled', scrollY > 8);
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var menuBtn = $('#menuBtn'), links = $('#navLinks');
  menuBtn.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
  });
  $$('a', links).forEach(function (a) {
    a.addEventListener('click', function () { links.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); });
  });

  function spy(map, cls) {
    if (!hasIO) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        map.forEach(function (m) { m.link.classList.toggle(cls, m.el === e.target); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach(function (m) { io.observe(m.el); });
  }
  // top nav: a section counts toward a link until the next linked anchor
  var groups = [
    ['ecosystem', ['ecosystem']],
    ['current', ['current', 'swc', 'flourishing']],
    ['ongoing', ['ongoing', 'plans', 'ambassadors', 'shine', 'peer']],
    ['future', ['future', 'wqrt', 'rise', 'hours', 'assigned', 'admin']],
    ['roadmap', ['roadmap']]
  ];
  var navMap = [];
  groups.forEach(function (g) {
    var link = $('.nav-links a[href="#' + g[0] + '"]');
    g[1].forEach(function (id) { var el = document.getElementById(id); if (el && link) navMap.push({ el: el, link: link }); });
  });
  spy(navMap, 'active');
  spy($$('.targets-row a').map(function (a) { return { el: $(a.getAttribute('href')), link: a }; }), 'active');

  /* ---------------- reveal ---------------- */
  var revealSel = '.sec-head, .body-lg, .callout, .units, .continuum, .team, .channels, .also, .fh-intro, .curriculum, .reach, .workshops, .plans, .feature-note, .tree, .two-col, .grid3, .grid2, .stepper, .peer-stage, .wqrt, .crisis, .rise, .screening, .hours-card, .hub-svg, .org, .roadmap, .commitment, .why-grid';
  var revealEls = $$(revealSel);
  if (reduced || !hasIO) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    revealEls.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < innerHeight) return; // already on screen: leave it visible
      el.classList.add('reveal');
    });
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach(function (el) { rio.observe(el); });
  }

  /* ---------------- counters ---------------- */
  function fmt(n) { return n.toLocaleString('en-IN'); }
  $$('.count').forEach(function (el) {
    var to = +el.dataset.to;
    if (reduced || to < 2) { el.textContent = fmt(to); return; }
    onView(el, function () {
      var t0 = performance.now(), dur = 1400;
      el.textContent = '0';
      (function tick(t) {
        var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(Math.round(to * e));
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }, { threshold: 0.6 });
  });

  /* ---------------- meters ---------------- */
  $$('.meter').forEach(function (m) { onView(m, function () { m.classList.add('in'); }); });

  /* ---------------- people icons (SWC team) ---------------- */
  $$('.people').forEach(function (box) {
    var n = +box.dataset.n, dark = box.dataset.dark;
    for (var i = 0; i < n; i++) {
      var s = svg('svg', { viewBox: '0 0 26 30', class: 'person' + (dark ? ' dark' : ''), 'aria-hidden': 'true' }, box);
      svg('circle', { cx: 13, cy: 8, r: 6, fill: 'currentColor' }, s);
      svg('path', { d: 'M1 30c0-7 5.4-12 12-12s12 5 12 12z', fill: 'currentColor' }, s);
      s.style.transitionDelay = (i * 70) + 'ms';
    }
    onView(box, function () { box.classList.add('in'); }, { threshold: 0.5 });
  });

  /* ---------------- ecosystem units ---------------- */
  var UNITS = {
    swc: {
      name: 'Students Wellness Centre', stage: 'Care', tag: 'Counselling and clinical care',
      text: "The institute's clinical front door. A dedicated team of mental-health professionals offers confidential one-to-one counselling, group sessions and crisis support to every student.",
      list: ['10 counsellors, 1 clinical psychologist, 4 outreach counsellors', 'One-to-one, walk-in and online counselling', '24/7 crisis support and empanelled hospitals'],
      link: ['#swc', 'See the Students Wellness Centre']
    },
    fh: {
      name: 'Flourishing Hub', stage: 'Flourish', tag: 'Wellbeing skills for all',
      text: 'Launched in March 2025 with alumni support. A preventive, strengths-based approach that equips every student with skills for resilience, wellbeing, and personal and professional growth.',
      list: ['700+ workshops in its inaugural year', '15 instructors', 'NOCS 01 and NOCS 02 for every first-year student'],
      link: ['#flourishing', 'See the Flourishing Hub']
    },
    yoga: {
      name: 'Yogastha', stage: 'Flourish', tag: 'Yoga and mindfulness',
      text: 'Yoga and mindfulness for the campus community, part of the everyday wellbeing that keeps students flourishing.',
      list: ['Part of the Flourish stage, for every student', 'Brought under the Office of the Associate Dean, Student Wellness'],
      link: ['#ecosystem', 'One of five coordinated units']
    },
    nss: {
      name: 'NSS', stage: 'Flourish', tag: 'Service and community',
      text: 'Service and community. Belonging and purpose through working with others are part of wellbeing for every student.',
      list: ['Part of the Flourish stage, for every student', 'Brought under the Office of the Associate Dean, Student Wellness'],
      link: ['#ecosystem', 'One of five coordinated units']
    },
    smp: {
      name: 'Student Mentorship Program', stage: 'Support', tag: 'Peer mentoring and belonging',
      text: 'Peer mentoring and belonging. Mentors are now being organised into peer circles, each nested under a Faculty Advisor, so every student is known by name.',
      list: ['1,000+ students reached through mentorship training courses', 'Peer Circles with Faculty Advisors: restructuring under way'],
      link: ['#peer', 'See Peer Circles with Faculty Advisors']
    }
  };
  var panel = $('#unitPanel'), unitBtns = $$('.unit');
  function showUnit(key, focus) {
    var u = UNITS[key];
    unitBtns.forEach(function (b) { b.setAttribute('aria-selected', b.dataset.unit === key); });
    panel.innerHTML =
      '<div><span class="up-stage">' + u.stage + ' stage</span><h3>' + u.name + '</h3><p>' + u.text + '</p></div>' +
      '<div><p class="label">At a glance</p><ul class="ticks">' + u.list.map(function (l) { return '<li>' + l + '</li>'; }).join('') +
      '</ul><p style="margin-top:14px"><a href="' + u.link[0] + '">' + u.link[1] + ' →</a></p></div>';
    panel.classList.remove('fade-in'); void panel.offsetWidth; panel.classList.add('fade-in');
    $$('.o-node').forEach(function (n) { n.classList.toggle('on', n.dataset.unit === key); });
    if (focus) document.getElementById('ecosystem').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  }
  unitBtns.forEach(function (b) { b.addEventListener('click', function () { showUnit(b.dataset.unit); }); });
  showUnit('swc');

  /* ---------------- hero orbit ---------------- */
  (function orbit() {
    var nodesG = $('#orbitNodes'), linksG = $('#orbitLinks');
    var items = [
      { k: 'swc', t: 'Wellness Centre', s: 'Counselling & clinical care' },
      { k: 'fh', t: 'Flourishing Hub', s: 'Wellbeing skills for all' },
      { k: 'yoga', t: 'Yogastha', s: 'Yoga & mindfulness' },
      { k: 'nss', t: 'NSS', s: 'Service & community' },
      { k: 'smp', t: 'Mentorship', s: 'Peer mentoring' }
    ];
    var R = 178, C = 260, nodes = [];
    items.forEach(function (it, i) {
      var w = Math.max(it.t.length * 7.6, it.s.length * 6.1) + 28;
      var line = svg('line', { class: 'o-link', x1: C, y1: C, x2: C, y2: C }, linksG);
      var g = svg('g', { class: 'o-node', tabindex: '0', role: 'button', 'data-unit': it.k, 'aria-label': it.t + ': ' + it.s }, nodesG);
      svg('rect', { x: -w / 2, y: -22, width: w, height: 44, rx: 12 }, g);
      var dot = svg('circle', { class: 'dot', cx: -w / 2, cy: 0, r: 5 }, g);
      var t1 = svg('text', { x: 0, y: -3, 'text-anchor': 'middle' }, g); t1.textContent = it.t;
      var t2 = svg('text', { class: 'o-sub', x: 0, y: 13, 'text-anchor': 'middle' }, g); t2.textContent = it.s;
      g.addEventListener('click', function () { showUnit(it.k, true); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showUnit(it.k, true); } });
      nodes.push({ g: g, line: line, base: -90 + i * 72 });
    });
    // small free dots on the outer ring, like the cover page
    var sats = [svg('circle', { r: 7, fill: 'var(--sky)' }, nodesG), svg('circle', { r: 4.5, fill: 'var(--blue)' }, nodesG), svg('circle', { r: 5.5, fill: 'var(--sky)' }, nodesG)];
    var angle = 0, paused = false, last = performance.now();
    $('#orbit').addEventListener('mouseenter', function () { paused = true; });
    $('#orbit').addEventListener('mouseleave', function () { paused = false; });
    $('#orbit').addEventListener('focusin', function () { paused = true; });
    $('#orbit').addEventListener('focusout', function () { paused = false; });
    function place() {
      nodes.forEach(function (n) {
        var a = (n.base + angle) * Math.PI / 180, x = C + R * Math.cos(a), y = C + R * Math.sin(a);
        n.g.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')');
        n.line.setAttribute('x2', x.toFixed(1)); n.line.setAttribute('y2', y.toFixed(1));
      });
      sats.forEach(function (s, i) {
        var a = (angle * -1.6 + i * 120 + 30) * Math.PI / 180, r = i === 1 ? 110 : 232;
        s.setAttribute('cx', (C + r * Math.cos(a)).toFixed(1)); s.setAttribute('cy', (C + r * Math.sin(a)).toFixed(1));
      });
    }
    function frame(t) {
      var dt = Math.min(64, t - last); last = t;
      if (!paused) angle += dt * 0.0045;
      place();
      requestAnimationFrame(frame);
    }
    place();
    $$('.o-node').forEach(function (n) { n.classList.toggle('on', n.dataset.unit === 'swc'); });
    if (!reduced) requestAnimationFrame(frame);
  })();

  /* ---------------- workshop filter ---------------- */
  $$('.chip').forEach(function (c) {
    c.addEventListener('click', function () {
      $$('.chip').forEach(function (x) { x.classList.toggle('is-on', x === c); });
      var f = c.dataset.filter;
      $$('.ws').forEach(function (w) { w.classList.toggle('dim', f !== 'all' && w.dataset.cat !== f); });
    });
  });

  /* ---------------- SHINE stepper ---------------- */
  var SHINE = [
    ['Identify', 'Academic signals, plus referrals from students, mentors and advisors.'],
    ['Department review', 'Head, Faculty Advisor and mentors review the case close to the student.'],
    ['Institute committee', 'Case-by-case discussion; action plan finalised; meets every month.']
  ];
  var steps = $$('#shineSteps .step'), sd = $('#shineDetail'), shineAuto = null;
  function showStep(i) {
    steps.forEach(function (s, j) { s.classList.toggle('is-on', j === i); s.classList.toggle('done', j < i); });
    sd.innerHTML = '<span class="sd-n">' + (i + 1) + '</span><div><b>' + SHINE[i][0] + '</b><p>' + SHINE[i][1] + '</p></div>';
    sd.classList.remove('fade-in'); void sd.offsetWidth; sd.classList.add('fade-in');
  }
  steps.forEach(function (s, i) { s.addEventListener('click', function () { clearInterval(shineAuto); showStep(i); }); });
  showStep(0);
  if (!reduced) onView($('#shineSteps'), function () {
    var i = 0; shineAuto = setInterval(function () { i = (i + 1) % 3; showStep(i); }, 3200);
  });
  onView($('.acronym'), function (el) { el.classList.add('in'); });

  /* ---------------- Peer circles diagram ---------------- */
  (function peer() {
    var s = $('#peerSvg'); if (!s) return;
    var FA = { x: 300, y: 64 }, mentors = [{ x: 120, y: 236 }, { x: 300, y: 236 }, { x: 480, y: 236 }];
    var BOX = { x: 600, y: 64 };
    var edges = svg('g', {}, s), nodes = svg('g', {}, s);
    // FA → counsellor/SHINE link
    svg('line', { class: 'edge', x1: FA.x, y1: FA.y, x2: BOX.x - 52, y2: BOX.y, 'stroke-dasharray': '5 5', id: 'faBox' }, edges);
    var faEdges = mentors.map(function (m) {
      return svg('line', { class: 'fa-edge', x1: FA.x, y1: FA.y + 30, x2: m.x, y2: m.y - 24 }, edges);
    });
    var menteeEls = [];
    mentors.forEach(function (m, mi) {
      for (var i = 0; i < 6; i++) {
        var ang = (-15 + i * 42) * Math.PI / 180; // fan below the mentor, clear of the FA links
        var x = m.x + 68 * Math.cos(ang), y = m.y + 58 * Math.sin(ang);
        svg('line', { class: 'edge', x1: m.x, y1: m.y, x2: x, y2: y }, edges);
        var c = svg('circle', { class: 'mentee', cx: x, cy: y, r: 11 }, nodes);
        menteeEls.push({ el: c, x: x, y: y, m: mi });
      }
    });
    function personIcon(cx, cy, r, cls) {
      svg('circle', { class: cls, cx: cx, cy: cy, r: r }, nodes);
      var k = r / 24;
      svg('circle', { class: 'ico', cx: cx, cy: cy - 5 * k, r: 6 * k }, nodes);
      svg('path', { class: 'ico', d: 'M' + (cx - 10 * k) + ' ' + (cy + 12 * k) + 'c0 ' + (-6 * k) + ' ' + (4.5 * k) + ' ' + (-9 * k) + ' ' + (10 * k) + ' ' + (-9 * k) + 's' + (10 * k) + ' ' + (3 * k) + ' ' + (10 * k) + ' ' + (9 * k) }, nodes);
    }
    var mentorEls = mentors.map(function (m) { personIcon(m.x, m.y, 24, 'mentor'); return nodes.lastChild.previousSibling.previousSibling; });
    personIcon(FA.x, FA.y, 30, 'fa');
    var faEl = nodes.lastChild.previousSibling.previousSibling;
    var t = svg('text', { x: FA.x - 42, y: FA.y - 4, 'text-anchor': 'end' }, nodes); t.textContent = 'Faculty Advisor';
    var t2 = svg('text', { class: 'small', x: FA.x - 42, y: FA.y + 14, 'text-anchor': 'end' }, nodes); t2.textContent = '20–30 students, three circles';
    var boxG = svg('g', {}, nodes);
    var boxRect = svg('rect', { x: BOX.x - 52, y: BOX.y - 24, width: 112, height: 48, rx: 12, fill: 'var(--surface)', stroke: 'var(--line)' }, boxG);
    var bt = svg('text', { x: BOX.x + 4, y: BOX.y - 3, 'text-anchor': 'middle' }, boxG); bt.textContent = 'Counsellor';
    var bt2 = svg('text', { class: 'small', x: BOX.x + 4, y: BOX.y + 14, 'text-anchor': 'middle' }, boxG); bt2.textContent = '/ SHINE';
    var tag1 = svg('g', { class: 'tag' }, nodes);
    svg('rect', { x: 18, y: 120, width: 152, height: 24, rx: 12 }, tag1);
    var tt = svg('text', { x: 94, y: 136, 'text-anchor': 'middle' }, tag1); tt.textContent = 'Regular FA–mentor meetings';
    var tag2 = svg('g', { class: 'tag' }, nodes);
    svg('rect', { x: 528, y: 334, width: 160, height: 24, rx: 12 }, tag2);
    var tt2 = svg('text', { x: 608, y: 350, 'text-anchor': 'middle' }, tag2); tt2.textContent = 'Mentor–mentee check-ins';
    var pulse = svg('circle', { class: 'pulse', r: 7, cx: -20, cy: -20 }, s);

    var flow = $$('#peerFlow li'), btn = $('#peerPlay');
    function move(from, to, ms) {
      return new Promise(function (res) {
        if (reduced) { pulse.setAttribute('cx', to.x); pulse.setAttribute('cy', to.y); res(); return; }
        var t0 = performance.now();
        (function f(t) {
          var p = Math.min(1, (t - t0) / ms), e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
          pulse.setAttribute('cx', from.x + (to.x - from.x) * e);
          pulse.setAttribute('cy', from.y + (to.y - from.y) * e);
          if (p < 1) requestAnimationFrame(f); else res();
        })(t0);
      });
    }
    function setFlow(i) { flow.forEach(function (li, j) { li.classList.toggle('on', j === i); }); }
    btn.addEventListener('click', function () {
      btn.disabled = true;
      var me = menteeEls[Math.floor(Math.random() * menteeEls.length)], mt = mentors[me.m];
      var hl = [];
      me.el.classList.add('lit');
      setFlow(0);
      pulse.setAttribute('cx', me.x); pulse.setAttribute('cy', me.y);
      wait(700).then(function () { return move(me, mt, 700); })
        .then(function () { setFlow(1); mentorEls[me.m].classList.add('lit'); return wait(600); })
        .then(function () { faEdges[me.m].classList.add('hl'); hl.push(faEdges[me.m]); return move(mt, FA, 800); })
        .then(function () { setFlow(2); faEl.classList.add('lit'); return wait(600); })
        .then(function () { return move(FA, { x: BOX.x - 52, y: BOX.y }, 700); })
        .then(function () { setFlow(3); boxRect.setAttribute('stroke', 'var(--o)'); boxRect.setAttribute('stroke-width', '2.5'); return wait(1800); })
        .then(function () {
          setFlow(-1); me.el.classList.remove('lit'); mentorEls[me.m].classList.remove('lit'); faEl.classList.remove('lit');
          hl.forEach(function (h) { h.classList.remove('hl'); });
          boxRect.setAttribute('stroke', 'var(--line)'); boxRect.setAttribute('stroke-width', '1');
          pulse.setAttribute('cx', -20); pulse.setAttribute('cy', -20);
          btn.disabled = false;
        });
    });
  })();

  /* ---------------- WQRT crisis walkthrough ---------------- */
  (function crisis() {
    var lis = $$('#crisis li'), btn = $('#crisisPlay');
    btn.addEventListener('click', function () {
      btn.disabled = true;
      var p = Promise.resolve();
      lis.forEach(function (li, i) {
        p = p.then(function () { lis.forEach(function (x, j) { x.classList.toggle('on', j === i); }); return wait(1100); });
      });
      p.then(function () { return wait(600); }).then(function () { lis.forEach(function (x) { x.classList.remove('on'); }); btn.disabled = false; });
    });
  })();

  /* ---------------- RISE phone ---------------- */
  var SCREENS = [
    '<p class="ps-title">Semester check-in</p><div class="ps-card"><b>Wellbeing screening</b>Every student, every semester. Takes a few minutes, using validated tools.<div class="ps-bar"><span></span></div></div><div class="ps-card">Every result is followed up by a person.</div>',
    '<p class="ps-title">Courses &amp; workshops</p><div class="ps-card"><b>Stress Management</b>Flourishing Hub · self-paced</div><div class="ps-card"><b>Emotional Fitness</b>Flourishing Hub · self-paced</div><div class="ps-card"><b>Career Readiness</b>Flourishing Hub · self-paced</div>',
    '<p class="ps-title">Community</p><div class="ps-card"><b>Your peer circle</b>Your mentor and circle, under your Faculty Advisor</div><div class="ps-row"><div class="ps-card"><b>Events</b>Wellbeing</div><div class="ps-card"><b>Circles</b>Check-ins</div></div>',
    '<p class="ps-title">Counselling</p><div class="ps-row"><div class="ps-card"><b>In person</b>at SWC</div><div class="ps-card"><b>Online</b>video</div></div><div class="ps-card"><b>Book a slot</b>Confidential, with an SWC counsellor</div><div class="ps-card"><b>WQRT</b>One number, any crisis, any hour</div>',
    '<p class="ps-title">Self-help, 24/7</p><div class="ps-chat">Hi! How are you feeling today?</div><div class="ps-chat me">Exams are piling up and I can\'t sleep.</div><div class="ps-chat">Let\'s try a short wind-down exercise. I can also help you book a counsellor.</div><div class="ps-card" style="font-size:.74rem">AI for self-help only. Any risk is handed to a counsellor; people make every decision.</div>'
  ];
  var screen = $('#phoneScreen'), rfs = $$('.rf'), riseAuto = null;
  function showScreen(i) {
    rfs.forEach(function (b) { b.classList.toggle('is-on', +b.dataset.f === i); });
    screen.innerHTML = '<div class="ps-brand"><b>RISE</b><small>IITB · one login</small></div>' + SCREENS[i] + '<p class="ps-foot">One app · one login</p>';
    screen.classList.remove('fade-in'); void screen.offsetWidth; screen.classList.add('fade-in');
  }
  rfs.forEach(function (b) { b.addEventListener('click', function () { clearInterval(riseAuto); showScreen(+b.dataset.f); }); });
  showScreen(0);
  if (!reduced) onView($('.rise'), function () {
    var order = [0, 3, 1, 4, 2], k = 0;
    riseAuto = setInterval(function () { k = (k + 1) % order.length; showScreen(order[k]); }, 3400);
  });

  /* ---------------- Screening levels ---------------- */
  var LEVELS = [
    { c: 'var(--g)', when: 'Ongoing', h: 'Thriving · no concern', p: 'Wellbeing content, reminders and workshop invitations.' },
    { c: 'var(--y)', when: 'Within 7 days', h: 'Check-in · a mild change', p: 'A gentle nudge and self-check; a mentor checks in within 7 days.' },
    { c: 'var(--o)', when: 'Within 48 hours', h: 'Support · several signals', p: 'A counsellor reaches out within 48 hours; a slot is held.' },
    { c: 'var(--r)', when: 'Within 1 hour', h: 'Urgent · serious risk', p: 'Emergency protocol and the WQRT, within 1 hour.' }
  ];
  var lvls = $$('.lvl'), ld = $('#lvlDetail');
  function showLevel(i) {
    var L = LEVELS[i];
    lvls.forEach(function (b, j) { b.classList.toggle('is-on', j === i); b.setAttribute('aria-selected', j === i); });
    ld.style.setProperty('--lc', L.c);
    ld.innerHTML = '<div class="ld-time"><small>Follow-up</small>' + L.when + '</div><b>' + L.h + '</b><p>' + L.p + '</p>';
    ld.classList.remove('fade-in'); void ld.offsetWidth; ld.classList.add('fade-in');
  }
  lvls.forEach(function (b, i) { b.addEventListener('click', function () { showLevel(i); }); });
  showLevel(0);

  /* ---------------- Hours toggle ---------------- */
  var hours = $('#hoursChart'), segs = $$('.seg-btn'), hoursTouched = false;
  function setHours(mode) {
    hours.dataset.mode = mode;
    segs.forEach(function (b) { var on = b.dataset.mode === mode; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', on); });
  }
  segs.forEach(function (b) { b.addEventListener('click', function () { hoursTouched = true; setHours(b.dataset.mode); }); });
  if (!reduced) onView(hours, function () { setTimeout(function () { if (!hoursTouched) setHours('proposed'); }, 1400); }, { threshold: 0.5 });

  /* ---------------- Hostel / department hub ---------------- */
  (function hub() {
    var s = $('#hubSvg'); if (!s) return;
    var C = { x: 380, y: 200 }, spokes = [], ends = [];
    var gE = svg('g', {}, s), gN = svg('g', {}, s);
    var h1 = svg('text', { class: 'head', x: 130, y: 22, 'text-anchor': 'middle' }, gN); h1.textContent = 'HOSTELS';
    var h2 = svg('text', { class: 'head', x: 630, y: 22, 'text-anchor': 'middle' }, gN); h2.textContent = 'DEPARTMENTS';
    for (var i = 0; i < 5; i++) {
      var y = 52 + i * 66;
      [[60, 'Hostel', 200], [560, 'Department', 560]].forEach(function (cfg) {
        var x = cfg[0], ex = cfg[0] === 60 ? 200 : 560;
        var line = svg('line', { class: 'spoke', x1: ex, y1: y + 18, x2: C.x, y2: C.y }, gE);
        spokes.push(line); ends.push({ x: ex, y: y + 18 });
        svg('rect', { class: 'box-r', x: x, y: y, width: 140, height: 36, rx: 8 }, gN);
        var t = svg('text', { x: x + 14, y: y + 23 }, gN); t.textContent = cfg[1];
        svg('circle', { class: 'cdot', cx: x + 120, cy: y + 18, r: 9 }, gN);
      });
    }
    var dots1 = svg('text', { class: 'muted', x: 130, y: 392, 'text-anchor': 'middle' }, gN); dots1.textContent = '⋮';
    var dots2 = svg('text', { class: 'muted', x: 630, y: 392, 'text-anchor': 'middle' }, gN); dots2.textContent = '⋮';
    svg('circle', { class: 'hub-halo', cx: C.x, cy: C.y, r: 86 }, gN);
    svg('circle', { class: 'hub', cx: C.x, cy: C.y, r: 72 }, gN);
    var ht = svg('text', { class: 'hub-t', x: C.x, y: C.y - 4, 'text-anchor': 'middle' }, gN); ht.textContent = 'SWC';
    var hs = svg('text', { class: 'hub-s', x: C.x, y: C.y + 16, 'text-anchor': 'middle' }, gN); hs.textContent = 'assigns one';
    var hs2 = svg('text', { class: 'hub-s', x: C.x, y: C.y + 32, 'text-anchor': 'middle' }, gN); hs2.textContent = 'contact counsellor';
    var trav = svg('circle', { class: 'travel', r: 6, cx: -20, cy: -20 }, s);
    if (reduced) return;
    var k = 0;
    function run() {
      var i = k++ % spokes.length, e = ends[i], line = spokes[i];
      line.classList.add('on');
      var t0 = performance.now(), dur = 900;
      (function f(t) {
        var p = Math.min(1, (t - t0) / dur);
        trav.setAttribute('cx', C.x + (e.x - C.x) * p); trav.setAttribute('cy', C.y + (e.y - C.y) * p);
        if (p < 1) requestAnimationFrame(f);
        else setTimeout(function () { line.classList.remove('on'); trav.setAttribute('cx', -20); run(); }, 350);
      })(t0);
    }
    onView(s, run, { threshold: 0.3 });
  })();
})();
