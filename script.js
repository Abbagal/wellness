/* ---- Update the site here. Values stay null until the SWC office confirms them. ---- */
const WELLNESS_DATA = {
  counsellors: null,
  instructors: null,
  workshops: null,
  wellbeingAmbassadors: null,
  studentMentors: null,
  facultyTeam: null,
  studentsReachedThisYear: null,
  onlineCounsellingSessions: null,
  helplines: {
    wrtPhoneWhatsApp: "+91 8356-810252", // confirm before publishing
    wrtEmail: "wellness@iitb.ac.in",     // confirm before publishing
    psychiatry24x7: null,
    teleManas: "14416",                  // Government of India mental health helpline
    emergency: "112"                     // all-India police, fire and ambulance
  },
  links: {
    careBooking: "https://swc.iitb.ac.in", // confirm the direct booking link
    guidance: null
  },
  asOf: "2026-10"
};

// The numbers in the "Get help now" panel and on the Get Help page, in this order.
// key points into WELLNESS_DATA.helplines; a null number shows as "to be confirmed".
const CALL_LIST = [
  { key: "wrtPhoneWhatsApp", name: "Wellness Response Team", note: "24x7, on campus. Call or WhatsApp." },
  { key: "psychiatry24x7", name: "Psychiatry", note: "24x7, a psychiatrist on call." },
  { key: "teleManas", name: "Tele-MANAS", note: "Government of India mental health helpline. Free, 24x7, in many Indian languages." },
  { key: "emergency", name: "Emergency", note: "Police, fire and ambulance, anywhere in India." }
];

// Services on the Get Help page. null shows a placeholder until the office confirms it.
// how: "Walk in", "Book ahead", "Walk in or book ahead", "Call or WhatsApp", and so on.
const SERVICES = [
  { name: "CARE: Counselling", what: "One-to-one sessions with a professional counsellor.",
    when: null, how: "Walk in or book ahead", where: null, link: "careBooking", linkLabel: "Book a slot" },
  { name: "Online Counselling", what: "Private video sessions, for when you are off campus, on internship, or simply prefer it.",
    when: null, how: "Book ahead", where: "Online, from anywhere", link: "careBooking", linkLabel: "Book online" },
  { name: "24x7 Wellness Response Team", what: "A trained team that comes to you anywhere on campus when it cannot wait.",
    when: "24x7, every day of the year", how: "Call or WhatsApp", where: "Comes to you", tel: "wrtPhoneWhatsApp" },
  { name: "24x7 Psychiatry Support", what: "A psychiatrist on call for urgent and ongoing clinical care.",
    when: "24x7, every day of the year", how: null, where: null, tel: "psychiatry24x7" },
  { name: "Wellbeing Ambassadors and Student Mentors", what: "Trained students in your hostel and department. Often the easiest first conversation.",
    when: null, how: "Talk to them directly", where: "Your hostel and department", link: "guidance", linkLabel: "Find your contact" },
  { name: "SHINE", what: "Quiet support for academic or personal difficulty, starting in your own department.",
    when: "Launching soon", how: null, where: "Your department" }
];

// Newest first within each category. { title: "", year: 2026, category: "Annual Reports", file: "reports/name.pdf" }
const REPORTS = [];
const REPORT_CATEGORIES = ["Annual Reports", "Activity Reports", "Workshop Calendars", "Newsletters"];

// { name: "", designation: "", affiliation: "", photo: "images/name.webp" }
const ADVISORY_BOARD = [];
const BOARD_VISIBLE = 6;

// Counselling teams on the Our People page, below the Advisory Board.
// { name: "", designation: "Counsellor" or ["Line 1", "Line 2"], photo: "images/name.webp" }. An empty list shows placeholder cards.
const COUNSELLING_TEAMS = {
  wellness: [],     // Wellness Counselling Team (CARE)
  flourishing: [    // Flourishing Counselling Team (Flourishing Hub)
    { name: "Chaitali Phadke", designation: ["Wellness Instructor", "Psychologist (Spl. Counseling)"], photo: "images/chaitali-phadke.webp" },
    { name: "Revati Shinde", designation: ["Wellness Instructor", "Psychologist (Spl. Clinical)"] },
    { name: "Charvi Joshi", designation: ["Wellness Instructor", "Psychologist (Spl. Industrial)"], photo: "images/charvi-joshi.webp" },
    { name: "Malvika Singhal", designation: ["Wellness Instructor", "Psychologist (Spl. Counseling)"], photo: "images/malvika-singhal.webp" }
  ]
};
const COUNSELLING_VISIBLE = 8;

// Student Body on the Our People page. { name: "", place: "Hostel 12" or "Department of Physics", photo: "images/name.webp" }
// An empty list shows placeholder cards until the names are supplied.
const STUDENT_BODY = {
  institute: [],   // Institute Wellbeing Ambassadors
  hostel: [],      // Hostel Wellbeing Ambassadors
  department: []   // Department Wellbeing Ambassadors
};
const STUDENT_BODY_VISIBLE = 10;

// { caption: "", photo: "images/name.webp", alt: "" }. Captions below mark the six events the brief asks for.
const HIGHLIGHTS = [
  { caption: "[A workshop in progress]" },
  { caption: "[Wellbeing Ambassador training]" },
  { caption: "[A yoga or breathwork session]" },
  { caption: "[An orientation or hostel wellbeing event]" },
  { caption: "[A student mentors' meet]" },
  { caption: "[A Flourishing Hub gathering]" }
];

/* ---- Page behaviour below; no content to edit. ---- */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PLACEHOLDER = "[XX]";
  const digits = (n) => n.replace(/[^\d+]/g, "");
  const fmt = (n) => Number(n).toLocaleString("en-IN");
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  };
  const icon = (name) => {
    const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("class", "ic");
    s.setAttribute("aria-hidden", "true");
    const u = document.createElementNS("http://www.w3.org/2000/svg", "use");
    u.setAttribute("href", "#i-" + name);
    s.appendChild(u);
    return s;
  };

  /* shared header is already in place; add the footer and help panel before filling data */
  if (window.SITE_CHROME) window.SITE_CHROME.fill();

  /* numbers to call: help panel and Get Help page */
  $$("[data-call-list]").forEach((list) => {
    CALL_LIST.forEach((c) => {
      const v = WELLNESS_DATA.helplines[c.key];
      const li = el("li");
      const row = el(v ? "a" : "div", "call" + (v ? "" : " pending"));
      if (v) row.href = "tel:" + digits(v);
      const text = el("span", "call-text");
      text.append(el("b", "", c.name), el("span", "", c.note), el("span", "call-number", v || "[number to be confirmed]"));
      row.appendChild(text);
      if (v) row.appendChild(icon("phone"));
      li.appendChild(row);
      list.appendChild(li);
    });
  });

  /* services with times, how to reach and where */
  const services = $("#services");
  if (services) {
    SERVICES.forEach((sv) => {
      const card = el("article", "service reveal");
      const head = el("div", "service-head");
      head.append(el("h3", "", sv.name), el("span", "tag", "Confidential"));
      card.append(head, el("p", "", sv.what));
      const dl = el("dl", "facts");
      [["When", sv.when, "[hours]"], ["How", sv.how, "[how to reach]"], ["Where", sv.where, "[location]"]].forEach(([k, v, ph]) => {
        const row = el("div");
        row.append(el("dt", "", k), el("dd", v ? "" : "ph", v || ph));
        dl.appendChild(row);
      });
      card.appendChild(dl);
      if (sv.tel) {
        const v = WELLNESS_DATA.helplines[sv.tel];
        if (v) { const a = el("a", "learn", "Call " + v); a.href = "tel:" + digits(v); card.appendChild(a); }
      } else if (sv.link) {
        const url = WELLNESS_DATA.links[sv.link];
        if (url) { const a = el("a", "learn", sv.linkLabel); a.href = url; a.target = "_blank"; a.rel = "noopener"; card.appendChild(a); }
      }
      services.appendChild(card);
    });
  }

  /* data into the page */
  $$("[data-bind]").forEach((n) => {
    const v = WELLNESS_DATA[n.dataset.bind];
    n.textContent = v === null ? PLACEHOLDER : fmt(v);
  });
  const [y, m] = WELLNESS_DATA.asOf.split("-").map(Number);
  if ($("#asOf")) $("#asOf").textContent = new Date(y, m - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const lines = WELLNESS_DATA.helplines;
  $$("[data-tel]").forEach((a) => {
    a.href = "tel:" + digits(lines.wrtPhoneWhatsApp);
    if ("showNumber" in a.dataset) a.textContent = lines.wrtPhoneWhatsApp;
  });
  $$("[data-wa]").forEach((a) => { a.href = "https://wa.me/" + digits(lines.wrtPhoneWhatsApp).replace("+", ""); });
  $$("[data-mail]").forEach((a) => { a.href = "mailto:" + lines.wrtEmail; a.textContent = a.textContent.includes("@") ? lines.wrtEmail : a.textContent; });
  $$("[data-phone]").forEach((n) => {
    const v = lines[n.dataset.phone];
    if (v === null) { n.textContent = n.dataset.empty; return; }
    const a = el("a", "", v);
    a.href = "tel:" + digits(v);
    n.replaceChildren(a);
  });
  $$("[data-link]").forEach((n) => {
    const url = WELLNESS_DATA.links[n.dataset.link];
    if (!url) return;
    const a = el("a", n.dataset.class || "", n.dataset.label);
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener";
    n.replaceWith(a);
  });

  /* one observer helper: each block runs once when it enters view */
  function once(nodes, fn, threshold = 0.12) {
    if (reduced || !("IntersectionObserver" in window)) { nodes.forEach(fn); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { fn(e.target); io.unobserve(e.target); } });
    }, { threshold });
    nodes.forEach((n) => io.observe(n));
  }
  once($$(".reveal"), (n) => n.classList.add("in"));

  /* counters: null shows the placeholder and does not animate */
  once($$("[data-count]"), (n) => {
    const to = WELLNESS_DATA[n.dataset.count];
    if (to === null) { n.textContent = PLACEHOLDER; return; }
    if (reduced) { n.textContent = fmt(to); return; }
    const start = performance.now(), dur = 1500;
    (function tick(now) {
      const p = Math.min(1, (now - start) / dur);
      n.textContent = fmt(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }, 0.5);

  /* mobile menu */
  const nav = $("#mainNav"), toggle = $("#menuToggle");
  function setMenu(open) {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    $("use", toggle).setAttribute("href", open ? "#i-close" : "#i-menu");
  }
  toggle.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
  /* dropdowns: hover or focus opens them on wide screens; the arrow button opens them anywhere */
  const subs = $$(".has-sub", nav);
  function setSub(li, open) {
    li.classList.toggle("sub-open", open);
    $(".sub-toggle", li).setAttribute("aria-expanded", String(open));
  }
  subs.forEach((li) => {
    $(".sub-toggle", li).addEventListener("click", () => {
      const open = !li.classList.contains("sub-open");
      subs.forEach((o) => setSub(o, false));
      setSub(li, open);
    });
    li.addEventListener("mouseleave", () => setSub(li, false));
    li.addEventListener("focusout", (e) => { if (!li.contains(e.relatedTarget)) setSub(li, false); });
  });
  $$("a", nav).forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* slide-in help panel: available on every page */
  const panel = $("#helpPanel"), scrim = $("#helpScrim"), opener = $("#helpOpen");
  const focusables = () => $$("a[href], button", panel);
  function openPanel() {
    setMenu(false);
    panel.hidden = scrim.hidden = false;
    void panel.offsetWidth;
    panel.classList.add("open");
    document.body.classList.add("locked");
    $("#helpClose").focus();
  }
  function closePanel() {
    if (panel.hidden) return;
    panel.classList.remove("open");
    scrim.hidden = true;
    document.body.classList.remove("locked");
    setTimeout(() => { panel.hidden = true; }, reduced ? 0 : 300);
    opener.focus();
  }
  opener.addEventListener("click", (e) => { e.preventDefault(); openPanel(); });
  $("#helpClose").addEventListener("click", closePanel);
  scrim.addEventListener("click", closePanel);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const inSub = document.activeElement && document.activeElement.closest(".has-sub");
      subs.forEach((o) => setSub(o, false));
      if (inSub) $(".sub-toggle", inSub).focus(); // back to the arrow that opened the list
      closePanel(); setMenu(false); return;
    }
    if (e.key !== "Tab" || panel.hidden) return;
    const f = focusables(), first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* messages expand in place */
  $$("[data-expand]").forEach((b) => {
    b.addEventListener("click", () => {
      const t = document.getElementById(b.dataset.expand), open = t.hidden;
      t.hidden = !open;
      b.setAttribute("aria-expanded", String(open));
      b.textContent = open ? "Show less" : "Read full message";
    });
  });

  /* people grids (people page): advisory board and student body, with "View all" past a limit */
  function personCard(p) {
    const li = el("li");
    if (p.photo) {
      const img = el("img", "avatar");
      img.src = p.photo; img.alt = p.name; img.loading = "lazy"; img.width = img.height = 112;
      li.appendChild(img);
    } else {
      const ph = el("span", "avatar");
      ph.setAttribute("role", "img");
      ph.setAttribute("aria-label", "Photograph to be supplied");
      ph.appendChild(icon("user"));
      li.appendChild(ph);
    }
    li.appendChild(el("b", "", p.name));
    p.lines.forEach((t) => li.appendChild(el("span", "", t)));
    return li;
  }
  function peopleGrid(list, visible) {
    const ul = document.getElementById(list.id), btn = document.getElementById(list.id + "Toggle");
    if (!ul) return;
    list.people.forEach((p, i) => {
      const li = personCard(p);
      if (i >= visible) li.hidden = true;
      ul.appendChild(li);
    });
    if (btn && list.people.length > visible) {
      btn.hidden = false;
      btn.addEventListener("click", () => {
        const open = btn.getAttribute("aria-expanded") !== "true";
        $$("li", ul).slice(visible).forEach((li) => { li.hidden = !open; });
        btn.setAttribute("aria-expanded", String(open));
        btn.textContent = open ? "Show fewer" : "View all";
      });
    }
  }
  const placeholders = (n, place) => Array.from({ length: n }, () => ({ name: "[Name]", lines: [place] }));
  peopleGrid({ id: "board", people: ADVISORY_BOARD.length
    ? ADVISORY_BOARD.map((p) => ({ name: p.name, photo: p.photo, lines: [p.designation, p.affiliation] }))
    : Array.from({ length: 10 }, () => ({ name: "[Name]", lines: ["[Designation]", "[Affiliation]"] })) }, BOARD_VISIBLE);
  [["wellness", "wellnessCounsellors"], ["flourishing", "flourishingCounsellors"]].forEach(([key, id]) => {
    const list = COUNSELLING_TEAMS[key];
    peopleGrid({ id, people: list.length
      ? list.map((p) => ({ name: p.name, photo: p.photo, lines: [].concat(p.designation) }))
      : placeholders(4, "[Designation]") }, COUNSELLING_VISIBLE);
  });
  [["institute", "ambInstitute", "[Programme, year]"], ["hostel", "ambHostel", "[Hostel]"], ["department", "ambDepartment", "[Department]"]]
    .forEach(([key, id, place]) => {
      const list = STUDENT_BODY[key];
      peopleGrid({ id, people: list.length
        ? list.map((p) => ({ name: p.name, photo: p.photo, lines: [p.place] }))
        : placeholders(5, place) }, STUDENT_BODY_VISIBLE);
    });

  /* report tabs (reports page) */
  const tabs = $("#reportTabs"), reportPanel = $("#reportPanel");
  if (tabs) {
  function showCategory(i, focus) {
    const cat = REPORT_CATEGORIES[i];
    $$(".tab", tabs).forEach((t, j) => {
      t.setAttribute("aria-selected", String(j === i));
      t.tabIndex = j === i ? 0 : -1;
      if (j === i) { reportPanel.setAttribute("aria-labelledby", t.id); if (focus) t.focus(); }
    });
    const items = REPORTS.filter((r) => r.category === cat).sort((a, b) => b.year - a.year);
    reportPanel.replaceChildren();
    (items.length ? items : [null]).forEach((r) => {
      const row = el("div", "report");
      const title = el("div", "report-title");
      title.append(el("b", "", r ? r.title : "[" + cat + ": title]"), el("span", "", r ? String(r.year) : "[Year]"));
      row.append(icon("file"), title);
      if (r) {
        const a = el("a", "btn outline", "Download");
        a.href = r.file;
        a.download = "";
        a.setAttribute("aria-label", "Download " + r.title + ", " + r.year);
        row.appendChild(a);
      } else {
        row.appendChild(el("span", "", "[PDF to be added]"));
      }
      reportPanel.appendChild(row);
    });
  }
  REPORT_CATEGORIES.forEach((cat, i) => {
    const t = el("button", "tab", cat);
    t.type = "button"; t.id = "tab-" + i;
    t.setAttribute("role", "tab");
    t.setAttribute("aria-controls", "reportPanel");
    t.addEventListener("click", () => showCategory(i));
    t.addEventListener("keydown", (e) => {
      const n = REPORT_CATEGORIES.length;
      if (e.key === "ArrowRight") { e.preventDefault(); showCategory((i + 1) % n, true); }
      if (e.key === "ArrowLeft") { e.preventDefault(); showCategory((i - 1 + n) % n, true); }
    });
    tabs.appendChild(t);
  });
  showCategory(0);
  }

  /* highlights: native swipe with scroll snap, plus buttons (reports page) */
  const slides = $("#slides");
  if (slides) {
  HIGHLIGHTS.forEach((h) => {
    const li = el("li");
    if (h.photo) {
      const img = el("img", "slide-img");
      img.src = h.photo; img.alt = h.alt || h.caption; img.loading = "lazy"; img.width = 1600; img.height = 900;
      li.appendChild(img);
    } else {
      const ph = el("div", "slide-img");
      ph.setAttribute("role", "img");
      ph.setAttribute("aria-label", "Event photograph to be supplied");
      ph.appendChild(icon("image"));
      li.appendChild(ph);
    }
    li.appendChild(el("p", "", h.caption));
    slides.appendChild(li);
  });
  function step(dir) {
    const w = slides.clientWidth + 12;
    const max = slides.scrollWidth - slides.clientWidth;
    let to = slides.scrollLeft + dir * w;
    if (to > max + 4) to = 0;
    if (to < -4) to = max;
    slides.scrollTo({ left: to, behavior: reduced ? "auto" : "smooth" });
  }
  $("#prevSlide").addEventListener("click", () => step(-1));
  $("#nextSlide").addEventListener("click", () => step(1));
  }
})();
