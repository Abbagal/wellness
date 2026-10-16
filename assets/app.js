(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var SVGNS = 'http://www.w3.org/2000/svg';
  var root = document.documentElement;
  var reduced = root.classList.contains('reduced');
  var hasIO = 'IntersectionObserver' in window;
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

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
  function restart(el) { el.classList.remove('fade-in'); void el.offsetWidth; el.classList.add('fade-in'); }
  function store(key, val) {
    try { if (val === undefined) return localStorage.getItem(key); localStorage.setItem(key, val); } catch (e) { return null; }
  }

  /* ================= 3D depth ================= */

  // floating orbs in every photo hero; they drift with the pointer
  $$('.hero, .page-hero').forEach(function (h) {
    var o = document.createElement('div');
    o.className = 'orbs'; o.setAttribute('aria-hidden', 'true');
    o.innerHTML = '<i class="orb-ring"></i><i class="orb orb-a"></i><i class="orb orb-b"></i><i class="orb orb-c"></i>';
    h.insertBefore(o, h.querySelector('.wrap'));
    if (reduced) return;
    h.addEventListener('pointermove', function (e) {
      var r = h.getBoundingClientRect();
      o.style.setProperty('--px', ((e.clientX - r.left) / r.width - .5).toFixed(3));
      o.style.setProperty('--py', ((e.clientY - r.top) / r.height - .5).toFixed(3));
    });
  });

  // cards tilt toward the pointer, with a moving highlight (mouse/trackpad only)
  if (!reduced && window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.task, .news-card, .channel, .feature, .place, .team-card, .reach-card, .unit, .rf, .cont, .media-card, .sign, .rm-item').forEach(function (c) {
      c.classList.add('tilt');
      var g = document.createElement('span');
      g.className = 'glare'; g.setAttribute('aria-hidden', 'true');
      c.appendChild(g);
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.classList.add('tilting');
        c.style.transform = 'perspective(900px) rotateX(' + ((.5 - y) * 10).toFixed(2) + 'deg) rotateY(' + ((x - .5) * 12).toFixed(2) + 'deg) translateY(-6px)';
        c.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
        c.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
      });
      c.addEventListener('pointerleave', function () { c.classList.remove('tilting'); c.style.transform = ''; });
    });
  }

  /* ================= site chrome ================= */

  // announcement bar (dismissible, remembered per browser)
  var ann = $('#announce');
  if (ann && store('sw-announce') !== 'closed') ann.hidden = false;
  if (ann) $('#announceClose').addEventListener('click', function () { ann.hidden = true; store('sw-announce', 'closed'); });

  // header shadow + back-to-top
  var header = $('#siteHeader'), toTop = $('#toTop');
  function onScroll() {
    header.classList.toggle('scrolled', scrollY > 10);
    toTop.classList.toggle('show', scrollY > 900);
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', function () { scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); });

  // mega menu: hover on pointer devices, click/keyboard everywhere
  var megaItems = $$('.main-nav .has-mega');
  function closeMegas(except) {
    megaItems.forEach(function (li) {
      if (li === except) return;
      li.classList.remove('open');
      li.querySelector('.nav-top').setAttribute('aria-expanded', 'false');
    });
  }
  megaItems.forEach(function (li) {
    var top = li.querySelector('.nav-top'), timer;
    function open() { clearTimeout(timer); closeMegas(li); li.classList.add('open'); top.setAttribute('aria-expanded', 'true'); }
    function close() { timer = setTimeout(function () { li.classList.remove('open'); top.setAttribute('aria-expanded', 'false'); }, 160); }
    li.addEventListener('mouseenter', open);
    li.addEventListener('mouseleave', close);
    li.addEventListener('focusin', open);
    li.addEventListener('focusout', function (e) { if (!li.contains(e.relatedTarget)) close(); });
    top.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); open(); var f = li.querySelector('.mega a'); if (f) f.focus(); }
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeMegas(); closeDrawer(); closeSearch();
  });

  // mobile drawer
  var drawer = $('#drawer');
  function closeDrawer() { if (!drawer.hidden) { drawer.hidden = true; document.body.style.overflow = ''; } }
  $('#menuOpen').addEventListener('click', function () {
    drawer.hidden = false; document.body.style.overflow = 'hidden';
    var cur = document.body.dataset.page, d = $$('details', drawer);
    var idx = ['help', 'care', 'flourish', 'initiatives', 'vision', 'about'].indexOf(cur);
    if (idx > -1 && d[idx]) d[idx].open = true;
    $('#menuClose').focus();
  });
  $('#menuClose').addEventListener('click', closeDrawer);
  drawer.addEventListener('click', function (e) { if (e.target === drawer || e.target.closest('a')) closeDrawer(); });

  /* ================= site search ================= */
  var INDEX = [
    ['Get help now', 'Urgent support, day or night', 'get-help.html#now', 'Help', 'crisis emergency urgent danger suicide panic now 112 help'],
    ['Helplines', '112 emergency and Tele-MANAS 14416, 24/7', 'get-help.html#lines', 'Help', 'helpline phone number call tele manas 14416 112 hotline'],
    ['Worried about a friend', 'Signs to notice and what to do', 'get-help.html#friend', 'Help', 'friend roommate worried someone else support refer'],
    ['Signs someone needs support', 'Loss, backlogs, withdrawal and more', 'get-help.html#signs', 'Help', 'signs warning symptoms withdrawal backlog'],
    ['Students Wellness Centre', 'Counsellors, a clinical psychologist and outreach', 'care.html#swc', 'Care', 'swc counselling counsellor therapist psychologist team'],
    ['Book a counselling session', 'One-to-one, confidential, booked online', 'care.html#ways', 'Care', 'book appointment session slot counselling talk therapy'],
    ['Walk-in counselling', 'Weekdays and weekends', 'care.html#ways', 'Care', 'walk in drop in no appointment'],
    ['Online counselling', 'Through the Talk to Angel platform', 'care.html#ways', 'Care', 'online video talk to angel remote virtual'],
    ['24/7 psychiatry', 'A psychiatrist at the IIT Bombay Hospital, day and night', 'care.html#psychiatry', 'Care', 'psychiatrist psychiatry hospital medication night doctor'],
    ['Empanelled hospitals', 'Treatment with bills reimbursed', 'care.html#ways', 'Care', 'hospital reimbursement bills insurance treatment'],
    ['Gatekeeper training', 'For wardens, security staff and faculty', 'care.html#outreach', 'Care', 'training warden faculty security gatekeeper workshop'],
    ['Flourishing Hub', '700+ workshops in its first year', 'flourish.html#hub', 'Flourish', 'flourishing hub wellbeing skills resilience'],
    ['Wellness courses NOCS 01 & 02', 'Mandatory for first-year students', 'flourish.html#courses', 'Flourish', 'nocs course first year curriculum credit'],
    ['Stress Management workshop', 'Flourishing Hub workshop series', 'flourish.html#workshops', 'Flourish', 'stress exam pressure anxiety calm workshops'],
    ['Emotional Fitness', 'Flourishing Hub workshop series', 'flourish.html#workshops', 'Flourish', 'emotional fitness feelings mood workshops'],
    ['Career Readiness & Interview Psychology', 'Workshops for placements and careers', 'flourish.html#workshops', 'Flourish', 'career placement interview job productivity communication workshops'],
    ['Yoga and meditation', 'Yogastha and Flourishing Hub programmes', 'flourish.html#community', 'Flourish', 'yoga meditation mindfulness breathe yogastha sleep'],
    ['NSS', 'Service and community', 'flourish.html#community', 'Flourish', 'nss volunteer service community'],
    ['Wellbeing Ambassadors', 'A friendly first point of contact in every hostel', 'initiatives.html#ambassadors', 'Initiatives', 'ambassador hostel department peer volunteer become'],
    ['SHINE Committee', 'Coordinated support for students who need more', 'initiatives.html#shine', 'Initiatives', 'shine backlog academic loss illness grades recover support'],
    ['Peer Circles & mentorship', 'Mentors and Faculty Advisors together', 'initiatives.html#peer', 'Initiatives', 'mentor mentorship faculty advisor peer circle smp'],
    ['Wellbeing Quick Response Team', 'One number for every crisis (planned)', 'vision.html#wqrt', 'Vision', 'wqrt quick response team emergency vehicle'],
    ['RISE IITB app', 'One app and universal screening (planned)', 'vision.html#rise', 'Vision', 'rise app screening mobile ai chatbot self help'],
    ['Longer counselling hours', 'Till 10 pm on weekdays and at weekends (planned)', 'vision.html#hours', 'Vision', 'hours timing evening weekend night'],
    ['Counsellor for every hostel', 'A familiar contact counsellor (planned)', 'vision.html#assigned', 'Vision', 'hostel department counsellor assigned local'],
    ['Roadmap', 'Current status, ongoing plans and future targets', 'vision.html#roadmap', 'Vision', 'roadmap plan summary future'],
    ['October 2026 Update', 'The full update: current status, ongoing plans, future targets', 'report.html', 'Update', 'report update pdf document october 2026 marla full summary'],
    ['Prof. Deepak Marla', 'Associate Dean of Student Wellness, IIT Bombay', 'about.html#leadership', 'About', 'deepak marla dean associate professor leadership head who'],
    ['About the office', 'Associate Dean, Student Wellness', 'about.html#office', 'About', 'about office associate dean marla leadership contact'],
    ['The wellness ecosystem', 'Five units working as one', 'about.html#ecosystem', 'About', 'units ecosystem swc yogastha nss structure']
  ];
  function score(entry, q) {
    var hay = (entry[0] + ' ' + entry[1] + ' ' + entry[4]).toLowerCase(), s = 0;
    q.split(/\s+/).forEach(function (w) {
      if (!w) return;
      if (entry[0].toLowerCase().indexOf(w) > -1) s += 3;
      if (hay.indexOf(w) > -1) s += 1; else s -= 2;
    });
    return s;
  }
  function esc(t) { return t.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  $$('[data-finder]').forEach(function (box) {
    var input = $('input', box), list = $('.finder-results', box), sel = -1, items = [];
    function render() {
      var q = input.value.trim().toLowerCase();
      if (!q) {
        if (list.closest('.search-panel')) items = INDEX.slice(0, 6); else { list.hidden = true; return; }
      } else {
        items = INDEX.map(function (e) { return [score(e, q), e]; }).filter(function (x) { return x[0] > 0; })
          .sort(function (a, b) { return b[0] - a[0]; }).slice(0, 7).map(function (x) { return x[1]; });
      }
      sel = -1;
      list.hidden = false;
      list.innerHTML = items.length
        ? items.map(function (e, i) { return '<li><a role="option" href="' + e[2] + '" data-i="' + i + '"><span class="tag">' + e[3] + '</span><span><b>' + esc(e[0]) + '</b><span>' + esc(e[1]) + '</span></span></a></li>'; }).join('')
        : '<li class="finder-empty">No matches. Try “counselling”, “stress” or <a href="get-help.html">see all help options</a>.</li>';
    }
    function highlight() { $$('a', list).forEach(function (a, i) { a.setAttribute('aria-selected', i === sel); }); }
    input.addEventListener('input', render);
    input.addEventListener('focus', render);
    input.addEventListener('keydown', function (e) {
      var n = items.length;
      if (e.key === 'ArrowDown' && n) { e.preventDefault(); sel = (sel + 1) % n; highlight(); }
      else if (e.key === 'ArrowUp' && n) { e.preventDefault(); sel = (sel - 1 + n) % n; highlight(); }
      else if (e.key === 'Enter') { e.preventDefault(); var t = items[sel > -1 ? sel : 0]; if (t) location.href = t[2]; }
    });
    var form = input.closest('form');
    if (form) form.addEventListener('submit', function () { var t = items[0]; if (t) location.href = t[2]; });
    document.addEventListener('click', function (e) { if (!box.contains(e.target) && !list.closest('.search-panel')) list.hidden = true; });
    list.addEventListener('click', function () { closeSearch(); });
  });
  $$('.popular [data-q]').forEach(function (b) {
    b.addEventListener('click', function () { var i = $('#heroQuery'); i.value = b.dataset.q; i.focus(); i.dispatchEvent(new Event('input')); });
  });
  var overlay = $('#searchOverlay');
  function openSearch() { overlay.hidden = false; var i = $('#overlayQuery'); i.value = ''; i.focus(); i.dispatchEvent(new Event('input')); }
  function closeSearch() { if (overlay && !overlay.hidden) overlay.hidden = true; }
  $('#searchOpen').addEventListener('click', openSearch);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeSearch(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
  });

  /* ================= page helpers ================= */

  // on-page jump bar
  var jumpLinks = $$('.jump a, .doc-toc a');
  if (jumpLinks.length && hasIO) {
    var map = jumpLinks.map(function (a) { return { a: a, el: document.querySelector(a.getAttribute('href')) }; }).filter(function (m) { return m.el; });
    var jio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        map.forEach(function (m) {
          var on = m.el === e.target; m.a.classList.toggle('active', on);
          if (on && m.a.closest('.jump') && innerWidth < 900) m.a.parentNode.scrollTo({ left: m.a.offsetLeft - 16, behavior: 'smooth' });
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    map.forEach(function (m) { jio.observe(m.el); });
  }

  // copy buttons for phone numbers
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var txt = b.dataset.copy, done = function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, function () { done(); });
      else done();
    });
  });

  // reveal on scroll; anything already on screen stays visible
  var revealEls = $$('.sec-head, .sec-head-row, .tasks, .continuum, .stats, .news, .targets, .grid-2, .grid-3, .grid-4, .split, .channels, .team-wrap, .tree, .stepper, .signs, .peer-stage, .wqrt, .crisis, .rise, .screening, .hours-card, .org, .roadmap, .curriculum, .workshops, .units, .cta, .helplines, .steps-list');
  if (!reduced && hasIO) {
    revealEls.forEach(function (el) { if (el.getBoundingClientRect().top > innerHeight && !el.closest('.reveal')) el.classList.add('reveal'); });
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
    }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach(function (el) { rio.observe(el); });
  }

  // counters
  function fmt(n) { return n.toLocaleString('en-IN'); }
  $$('.count').forEach(function (el) {
    var to = +el.dataset.to;
    if (reduced) { el.textContent = fmt(to); return; }
    onView(el, function () {
      var t0 = performance.now(), dur = 1500;
      (function tick(t) {
        var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(Math.round(to * e));
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }, { threshold: 0.6 });
  });

  $$('.meter').forEach(function (m) { onView(m, function () { m.classList.add('in'); }); });

  // SWC team people
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

  // workshop filter
  $$('.chip').forEach(function (c) {
    c.addEventListener('click', function () {
      $$('.chip').forEach(function (x) { x.classList.toggle('is-on', x === c); });
      var f = c.dataset.filter;
      $$('.ws').forEach(function (w) { w.classList.toggle('dim', f !== 'all' && w.dataset.cat !== f); });
    });
  });

  /* ================= about: units + orbit ================= */
  var UNITS = {
    swc: { name: 'Students Wellness Centre', stage: 'Care', text: "The institute's clinical front door. A dedicated team of mental-health professionals offers confidential one-to-one counselling, group sessions and crisis support to every student.", list: ['10 counsellors, 1 clinical psychologist, 4 outreach counsellors', 'One-to-one, walk-in and online counselling', '24/7 crisis support and empanelled hospitals'], link: ['care.html', 'Care & Counselling'] },
    fh: { name: 'Flourishing Hub', stage: 'Flourish', text: 'Launched in March 2025 with alumni support. A preventive, strengths-based approach that equips every student with skills for resilience, wellbeing, and personal and professional growth.', list: ['700+ workshops in its inaugural year', '15 instructors', 'NOCS 01 and NOCS 02 for every first-year student'], link: ['flourish.html', 'Explore the Flourishing Hub'] },
    yoga: { name: 'Yogastha', stage: 'Flourish', text: 'Yoga and mindfulness for the campus community, part of the everyday wellbeing that helps every student flourish.', list: ['Part of the Flourish stage, for every student', 'Now coordinated by the Office of the Associate Dean'], link: ['flourish.html#community', 'Yoga & mindfulness'] },
    nss: { name: 'NSS', stage: 'Flourish', text: 'Service and community. Belonging and purpose through working with others are part of wellbeing for every student.', list: ['Part of the Flourish stage, for every student', 'Now coordinated by the Office of the Associate Dean'], link: ['flourish.html#community', 'More ways to flourish'] },
    smp: { name: 'Student Mentorship Program', stage: 'Support', text: 'Peer mentoring and belonging. Mentors are being organised into peer circles, each nested under a Faculty Advisor, so every student is known by name.', list: ['1,000+ students reached through mentorship training courses', 'Peer Circles with Faculty Advisors: restructuring under way'], link: ['initiatives.html#peer', 'About Peer Circles'] }
  };
  var panel = $('#unitPanel'), unitBtns = $$('.unit');
  function showUnit(key) {
    if (!panel) return;
    var u = UNITS[key];
    unitBtns.forEach(function (b) { b.setAttribute('aria-selected', b.dataset.unit === key); });
    panel.innerHTML = '<div><span class="up-stage">' + u.stage + ' stage</span><h3>' + u.name + '</h3><p>' + u.text + '</p></div>' +
      '<div><p class="up-label">At a glance</p><ul class="ticks">' + u.list.map(function (l) { return '<li>' + l + '</li>'; }).join('') +
      '</ul><p style="margin-top:16px"><a class="link-arrow" href="' + u.link[0] + '">' + u.link[1] + ' →</a></p></div>';
    restart(panel);
    $$('.o-node').forEach(function (n) { n.classList.toggle('on', n.dataset.unit === key); });
  }
  unitBtns.forEach(function (b) { b.addEventListener('click', function () { showUnit(b.dataset.unit); }); });
  showUnit('swc');

  (function orbit() {
    var nodesG = $('#orbitNodes'), linksG = $('#orbitLinks');
    if (!nodesG) return;
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
      svg('circle', { class: 'dot', cx: -w / 2, cy: 0, r: 5 }, g);
      svg('text', { x: 0, y: -3, 'text-anchor': 'middle' }, g).textContent = it.t;
      svg('text', { class: 'o-sub', x: 0, y: 13, 'text-anchor': 'middle' }, g).textContent = it.s;
      function pick() { showUnit(it.k); var p = $('#unitPanel'); if (p && innerWidth < 900) p.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }); }
      g.addEventListener('click', pick);
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
      nodes.push({ g: g, line: line, base: -90 + i * 72 });
    });
    var sats = [svg('circle', { r: 7, fill: '#f2b134' }, nodesG), svg('circle', { r: 4.5, fill: '#2a9df4' }, nodesG), svg('circle', { r: 5.5, fill: '#f2b134' }, nodesG)];
    var angle = 0, paused = false, last = performance.now(), o = $('#orbit');
    o.addEventListener('mouseenter', function () { paused = true; });
    o.addEventListener('mouseleave', function () { paused = false; });
    o.addEventListener('focusin', function () { paused = true; });
    o.addEventListener('focusout', function () { paused = false; });
    function place() {
      nodes.forEach(function (n) {
        var a = (n.base + angle) * Math.PI / 180, x = C + R * Math.cos(a), y = C + R * Math.sin(a);
        n.g.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')');
        n.line.setAttribute('x2', x.toFixed(1)); n.line.setAttribute('y2', y.toFixed(1));
      });
      sats.forEach(function (s, i) {
        var a = (angle * -1.6 + i * 120 + 30) * Math.PI / 180, r = i === 1 ? 110 : 236;
        s.setAttribute('cx', (C + r * Math.cos(a)).toFixed(1)); s.setAttribute('cy', (C + r * Math.sin(a)).toFixed(1));
      });
    }
    function frame(t) { var dt = Math.min(64, t - last); last = t; if (!paused) angle += dt * 0.0045; place(); requestAnimationFrame(frame); }
    place();
    $$('.o-node').forEach(function (n) { n.classList.toggle('on', n.dataset.unit === 'swc'); });
    if (!reduced) requestAnimationFrame(frame);
  })();

  /* ================= initiatives ================= */
  (function shine() {
    var steps = $$('#shineSteps .step-btn'), sd = $('#shineDetail'), auto = null;
    if (!steps.length) return;
    var DATA = [
      ['Identify', 'Academic signals, plus referrals from students, mentors and advisors.'],
      ['Department review', 'Head, Faculty Advisor and mentors review the case close to the student.'],
      ['Institute committee', 'Case-by-case discussion; action plan finalised; meets every month.']
    ];
    function show(i) {
      steps.forEach(function (s, j) { s.classList.toggle('is-on', j === i); s.classList.toggle('done', j < i); });
      sd.innerHTML = '<span class="sd-n">' + (i + 1) + '</span><div><b>' + DATA[i][0] + '</b><p>' + DATA[i][1] + '</p></div>';
      restart(sd);
    }
    steps.forEach(function (s, i) { s.addEventListener('click', function () { clearInterval(auto); show(i); }); });
    if (!reduced) onView($('#shineSteps'), function () { var i = 0; auto = setInterval(function () { i = (i + 1) % 3; show(i); }, 3200); });
  })();
  onView($('.acronym'), function (el) { el.classList.add('in'); });

  (function peer() {
    var s = $('#peerSvg'); if (!s) return;
    var FA = { x: 300, y: 64 }, mentors = [{ x: 120, y: 236 }, { x: 300, y: 236 }, { x: 480, y: 236 }], BOX = { x: 600, y: 64 };
    var edges = svg('g', {}, s), nodes = svg('g', {}, s);
    svg('line', { class: 'edge', x1: FA.x, y1: FA.y, x2: BOX.x - 52, y2: BOX.y, 'stroke-dasharray': '5 5' }, edges);
    var faEdges = mentors.map(function (m) { return svg('line', { class: 'fa-edge', x1: FA.x, y1: FA.y + 30, x2: m.x, y2: m.y - 24 }, edges); });
    var menteeEls = [];
    mentors.forEach(function (m, mi) {
      for (var i = 0; i < 6; i++) {
        var ang = (-15 + i * 42) * Math.PI / 180, x = m.x + 68 * Math.cos(ang), y = m.y + 58 * Math.sin(ang);
        svg('line', { class: 'edge', x1: m.x, y1: m.y, x2: x, y2: y }, edges);
        menteeEls.push({ el: svg('circle', { class: 'mentee', cx: x, cy: y, r: 11 }, nodes), x: x, y: y, m: mi });
      }
    });
    function personIcon(cx, cy, r, cls) {
      var base = svg('circle', { class: cls, cx: cx, cy: cy, r: r }, nodes), k = r / 24;
      svg('circle', { class: 'ico', cx: cx, cy: cy - 5 * k, r: 6 * k }, nodes);
      svg('path', { class: 'ico', d: 'M' + (cx - 10 * k) + ' ' + (cy + 12 * k) + 'c0 ' + (-6 * k) + ' ' + (4.5 * k) + ' ' + (-9 * k) + ' ' + (10 * k) + ' ' + (-9 * k) + 's' + (10 * k) + ' ' + (3 * k) + ' ' + (10 * k) + ' ' + (9 * k) }, nodes);
      return base;
    }
    var mentorEls = mentors.map(function (m) { return personIcon(m.x, m.y, 24, 'mentor'); });
    var faEl = personIcon(FA.x, FA.y, 30, 'fa');
    svg('text', { x: FA.x - 42, y: FA.y - 4, 'text-anchor': 'end' }, nodes).textContent = 'Faculty Advisor';
    svg('text', { class: 'small', x: FA.x - 42, y: FA.y + 14, 'text-anchor': 'end' }, nodes).textContent = '20–30 students, three circles';
    var boxRect = svg('rect', { x: BOX.x - 52, y: BOX.y - 24, width: 112, height: 48, rx: 12, fill: '#ffffff', stroke: '#d5e3f6' }, nodes);
    svg('text', { x: BOX.x + 4, y: BOX.y - 3, 'text-anchor': 'middle' }, nodes).textContent = 'Counsellor';
    svg('text', { class: 'small', x: BOX.x + 4, y: BOX.y + 14, 'text-anchor': 'middle' }, nodes).textContent = '/ SHINE';
    var tag1 = svg('g', { class: 'tag' }, nodes);
    svg('rect', { x: 18, y: 120, width: 156, height: 24, rx: 12 }, tag1);
    svg('text', { x: 96, y: 136, 'text-anchor': 'middle' }, tag1).textContent = 'Regular FA–mentor meetings';
    var tag2 = svg('g', { class: 'tag' }, nodes);
    svg('rect', { x: 528, y: 334, width: 160, height: 24, rx: 12 }, tag2);
    svg('text', { x: 608, y: 350, 'text-anchor': 'middle' }, tag2).textContent = 'Mentor–mentee check-ins';
    var pulse = svg('circle', { class: 'pulse', r: 7, cx: -20, cy: -20 }, s);
    var flow = $$('#peerFlow li'), btn = $('#peerPlay');
    function move(from, to, ms) {
      return new Promise(function (res) {
        if (reduced) { pulse.setAttribute('cx', to.x); pulse.setAttribute('cy', to.y); res(); return; }
        var t0 = performance.now();
        (function f(t) {
          var p = Math.min(1, (t - t0) / ms), e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
          pulse.setAttribute('cx', from.x + (to.x - from.x) * e); pulse.setAttribute('cy', from.y + (to.y - from.y) * e);
          if (p < 1) requestAnimationFrame(f); else res();
        })(t0);
      });
    }
    function setFlow(i) { flow.forEach(function (li, j) { li.classList.toggle('on', j === i); }); }
    btn.addEventListener('click', function () {
      btn.disabled = true;
      var me = menteeEls[Math.floor(Math.random() * menteeEls.length)], mt = mentors[me.m], edge = faEdges[me.m];
      me.el.classList.add('lit'); setFlow(0);
      pulse.setAttribute('cx', me.x); pulse.setAttribute('cy', me.y);
      wait(700).then(function () { return move(me, mt, 700); })
        .then(function () { setFlow(1); mentorEls[me.m].classList.add('lit'); return wait(600); })
        .then(function () { edge.classList.add('hl'); return move(mt, FA, 800); })
        .then(function () { setFlow(2); faEl.classList.add('lit'); return wait(600); })
        .then(function () { return move(FA, { x: BOX.x - 52, y: BOX.y }, 700); })
        .then(function () { setFlow(3); boxRect.setAttribute('stroke', '#c42a3a'); boxRect.setAttribute('stroke-width', '2.5'); return wait(1800); })
        .then(function () {
          setFlow(-1); me.el.classList.remove('lit'); mentorEls[me.m].classList.remove('lit'); faEl.classList.remove('lit'); edge.classList.remove('hl');
          boxRect.setAttribute('stroke', '#d5e3f6'); boxRect.setAttribute('stroke-width', '1');
          pulse.setAttribute('cx', -20); pulse.setAttribute('cy', -20); btn.disabled = false;
        });
    });
  })();

  /* ================= vision ================= */
  (function crisis() {
    var lis = $$('#crisis li'), btn = $('#crisisPlay');
    if (!btn) return;
    btn.addEventListener('click', function () {
      btn.disabled = true;
      var p = Promise.resolve();
      lis.forEach(function (li, i) { p = p.then(function () { lis.forEach(function (x, j) { x.classList.toggle('on', j === i); }); return wait(1100); }); });
      p.then(function () { return wait(600); }).then(function () { lis.forEach(function (x) { x.classList.remove('on'); }); btn.disabled = false; });
    });
  })();

  (function rise() {
    var screen = $('#phoneScreen'); if (!screen) return;
    var SCREENS = [
      '<p class="ps-title">Semester check-in</p><div class="ps-card"><b>Wellbeing screening</b>Every student, every semester, using validated tools.<div class="ps-bar"><span></span></div></div><div class="ps-card">Every result is followed up by a person.</div>',
      '<p class="ps-title">Courses &amp; workshops</p><div class="ps-card"><b>Stress Management</b>Flourishing Hub · self-paced</div><div class="ps-card"><b>Emotional Fitness</b>Flourishing Hub · self-paced</div><div class="ps-card"><b>Career Readiness</b>Flourishing Hub · self-paced</div>',
      '<p class="ps-title">Community</p><div class="ps-card"><b>Your peer circle</b>Your mentor and circle, under your Faculty Advisor</div><div class="ps-row"><div class="ps-card"><b>Events</b>Wellbeing</div><div class="ps-card"><b>Circles</b>Check-ins</div></div>',
      '<p class="ps-title">Counselling</p><div class="ps-row"><div class="ps-card"><b>In person</b>at SWC</div><div class="ps-card"><b>Online</b>sessions</div></div><div class="ps-card"><b>Book a slot</b>Confidential, with an SWC counsellor</div><div class="ps-card"><b>WQRT</b>One number, any crisis, any hour</div>',
      '<p class="ps-title">Self-help, 24/7</p><div class="ps-chat">Hi! How are you feeling today?</div><div class="ps-chat me">Exams are piling up and I can\'t sleep.</div><div class="ps-chat">Let\'s try a short wind-down exercise. I can also help you book a counsellor.</div><div class="ps-card" style="font-size:.74rem">AI for self-help only. Any risk is handed to a counsellor; people make every decision.</div>'
    ];
    var rfs = $$('.rf'), auto = null;
    function show(i) {
      rfs.forEach(function (b) { b.classList.toggle('is-on', +b.dataset.f === i); });
      screen.innerHTML = '<div class="ps-brand"><b>RISE</b><small>IITB · one login</small></div>' + SCREENS[i] + '<p class="ps-foot">Illustrative preview · planned app</p>';
      restart(screen);
    }
    rfs.forEach(function (b) { b.addEventListener('click', function () { clearInterval(auto); show(+b.dataset.f); }); });
    show(0);
    if (!reduced) onView($('.rise'), function () { var order = [0, 3, 1, 4, 2], k = 0; auto = setInterval(function () { k = (k + 1) % order.length; show(order[k]); }, 3400); });
  })();

  (function screening() {
    var ld = $('#lvlDetail'); if (!ld) return;
    var LEVELS = [
      { c: 'var(--g)', when: 'Ongoing', h: 'Thriving · no concern', p: 'Wellbeing content, reminders and workshop invitations.' },
      { c: 'var(--y)', when: 'Within 7 days', h: 'Check-in · a mild change', p: 'A gentle nudge and self-check; a mentor checks in within 7 days.' },
      { c: 'var(--o)', when: 'Within 48 hours', h: 'Support · several signals', p: 'A counsellor reaches out within 48 hours; a slot is held.' },
      { c: 'var(--r)', when: 'Within 1 hour', h: 'Urgent · serious risk', p: 'Emergency protocol and the WQRT, within 1 hour.' }
    ];
    var lvls = $$('.lvl');
    function show(i) {
      var L = LEVELS[i];
      lvls.forEach(function (b, j) { b.classList.toggle('is-on', j === i); b.setAttribute('aria-selected', j === i); });
      ld.style.setProperty('--lc', L.c);
      ld.innerHTML = '<div class="ld-time"><small>Follow-up</small>' + L.when + '</div><b>' + L.h + '</b><p>' + L.p + '</p>';
      restart(ld);
    }
    lvls.forEach(function (b, i) { b.addEventListener('click', function () { show(i); }); });
    show(0);
  })();

  (function hoursChart() {
    var hours = $('#hoursChart'); if (!hours) return;
    var segs = $$('.seg-btn'), touched = false;
    function set(mode) {
      hours.dataset.mode = mode;
      segs.forEach(function (b) { var on = b.dataset.mode === mode; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', on); });
    }
    segs.forEach(function (b) { b.addEventListener('click', function () { touched = true; set(b.dataset.mode); }); });
    if (!reduced) onView(hours, function () { setTimeout(function () { if (!touched) set('proposed'); }, 1400); }, { threshold: 0.5 });
  })();

  (function hub() {
    var s = $('#hubSvg'); if (!s) return;
    var C = { x: 380, y: 200 }, spokes = [], ends = [];
    var gE = svg('g', {}, s), gN = svg('g', {}, s);
    svg('text', { class: 'head', x: 130, y: 22, 'text-anchor': 'middle' }, gN).textContent = 'HOSTELS';
    svg('text', { class: 'head', x: 630, y: 22, 'text-anchor': 'middle' }, gN).textContent = 'DEPARTMENTS';
    for (var i = 0; i < 5; i++) {
      var y = 52 + i * 66;
      [[60, 'Hostel', 200], [560, 'Department', 560]].forEach(function (cfg) {
        var x = cfg[0], ex = cfg[2];
        spokes.push(svg('line', { class: 'spoke', x1: ex, y1: y + 18, x2: C.x, y2: C.y }, gE)); ends.push({ x: ex, y: y + 18 });
        svg('rect', { class: 'box-r', x: x, y: y, width: 140, height: 36, rx: 8 }, gN);
        svg('text', { x: x + 14, y: y + 23 }, gN).textContent = cfg[1];
        svg('circle', { class: 'cdot', cx: x + 120, cy: y + 18, r: 9 }, gN);
      });
    }
    svg('text', { class: 'muted', x: 130, y: 392, 'text-anchor': 'middle' }, gN).textContent = '⋮';
    svg('text', { class: 'muted', x: 630, y: 392, 'text-anchor': 'middle' }, gN).textContent = '⋮';
    svg('circle', { class: 'hub-halo', cx: C.x, cy: C.y, r: 86 }, gN);
    svg('circle', { class: 'hub', cx: C.x, cy: C.y, r: 72 }, gN);
    svg('text', { class: 'hub-t', x: C.x, y: C.y - 4, 'text-anchor': 'middle' }, gN).textContent = 'SWC';
    svg('text', { class: 'hub-s', x: C.x, y: C.y + 16, 'text-anchor': 'middle' }, gN).textContent = 'assigns one';
    svg('text', { class: 'hub-s', x: C.x, y: C.y + 32, 'text-anchor': 'middle' }, gN).textContent = 'contact counsellor';
    var trav = svg('circle', { class: 'travel', r: 6, cx: -20, cy: -20 }, s);
    if (reduced) return;
    var k = 0;
    function run() {
      var i = k++ % spokes.length, e = ends[i], line = spokes[i], t0 = performance.now();
      line.classList.add('on');
      (function f(t) {
        var p = Math.min(1, (t - t0) / 900);
        trav.setAttribute('cx', C.x + (e.x - C.x) * p); trav.setAttribute('cy', C.y + (e.y - C.y) * p);
        if (p < 1) requestAnimationFrame(f);
        else setTimeout(function () { line.classList.remove('on'); trav.setAttribute('cx', -20); run(); }, 350);
      })(t0);
    }
    onView(s, run, { threshold: 0.3 });
  })();
})();
