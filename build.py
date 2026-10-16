"""Builds the static site: wraps every page in src/pages/ with the shared header, menus and footer.

Usage:  python build.py        (writes the .html files into the project root)
Each page starts with a JSON comment, e.g.
<!--{"title": "Get Help Now", "desc": "...", "nav": "help"}-->
"""
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).parent
PAGES = ROOT / "src" / "pages"

ICONS = {
    "calendar": '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><rect x="7" y="13" width="3" height="3"/>',
    "door": '<path d="M5 21V4a1 1 0 0 1 1-1h9v18M3 21h18M15 3l4 2v16"/><circle cx="12" cy="12" r=".8"/>',
    "clock": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    "laptop": '<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 19h20"/>',
    "hospital": '<path d="M4 21V9l8-5 8 5v12z"/><path d="M12 10v6M9 13h6"/>',
    "heart": '<path d="M12 20s-7-4.4-9-9a4.8 4.8 0 0 1 9-3 4.8 4.8 0 0 1 9 3c-2 4.6-9 9-9 9z"/>',
    "users": '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2c2.8.2 5 2.6 5 5.8"/>',
    "user": '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>',
    "shield": '<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
    "network": '<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="18" r="2.5"/><circle cx="19" cy="18" r="2.5"/><path d="M11 7.2 6.2 15.8M13 7.2l4.8 8.6M7.5 18h9"/>',
    "leaf": '<path d="M5 19C5 10 10 5 20 4c0 10-5 15-14 15z"/><path d="M5 19 13 11"/>',
    "sun": '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    "chat": '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
    "book": '<path d="M3 5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1-3-2-6-2-9-1z"/><path d="M12 6v14"/>',
    "flag": '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    "yoga": '<circle cx="12" cy="4.5" r="2"/><path d="M12 7v7M5 9l7 2 7-2M8 21l4-7 4 7"/>',
    "alert": '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17v.5"/>',
    "lock": '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    "plus": '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 8v8M8 12h8"/>',
    "check": '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
    "phone": '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/>',
    "car": '<path d="M3 16v-4l2.5-5h13L21 12v4z"/><circle cx="7.5" cy="16.5" r="1.8"/><circle cx="16.5" cy="16.5" r="1.8"/>',
    "sitemap": '<rect x="9" y="3" width="6" height="5" rx="1"/><rect x="2" y="16" width="6" height="5" rx="1"/><rect x="16" y="16" width="6" height="5" rx="1"/><path d="M12 8v4M5 16v-4h14v4"/>',
    "arrow": '<path d="M5 12h14M13 6l6 6-6 6"/>',
    "arrow-up": '<path d="M12 19V5M6 11l6-6 6 6"/>',
    "play": '<path d="M7 4.5v15l12-7.5z"/>',
    "search": '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    "chev": '<path d="M6 9l6 6 6-6"/>',
    "menu": '<path d="M4 7h16M4 12h16M4 17h16"/>',
    "close": '<path d="M6 6l12 12M18 6 6 18"/>',
    "external": '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    "pin": '<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    "globe": '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
    "hand": '<path d="M7 11V6a1.5 1.5 0 0 1 3 0v4M10 10V4.5a1.5 1.5 0 0 1 3 0V10M13 10V5.5a1.5 1.5 0 0 1 3 0V11M16 11V8a1.5 1.5 0 0 1 3 0v6c0 4-3 7-7 7-3 0-5-1.5-6.5-4L3 13.5a1.5 1.5 0 0 1 2.4-1.8L7 13.5"/>',
    "spark": '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
}

NAV = [
    {"key": "help", "label": "Get Help", "href": "get-help.html",
     "intro": "If you or someone you know needs support right now, start here.",
     "links": [("get-help.html#now", "Get help now", "Urgent support, day or night"),
               ("get-help.html#friend", "Worried about a friend", "Signs to notice and what to do"),
               ("get-help.html#lines", "Helplines", "Numbers you can call any time"),
               ("get-help.html#wqrt", "Quick Response Team", "One number for every crisis (planned)")]},
    {"key": "care", "label": "Care & Counselling", "href": "care.html",
     "intro": "Confidential counselling and clinical care at the Students Wellness Centre.",
     "links": [("care.html#swc", "Students Wellness Centre", "Our team and what we offer"),
               ("care.html#ways", "Ways to get help", "One-to-one, walk-in, online, 24/7"),
               ("care.html#psychiatry", "24/7 psychiatry", "A psychiatrist at the campus hospital"),
               ("care.html#outreach", "Outreach & training", "Hostels, faculty and gatekeepers")]},
    {"key": "flourish", "label": "Flourish", "href": "flourish.html",
     "intro": "Skills for resilience, wellbeing and growth, for every student.",
     "links": [("flourish.html#hub", "Flourishing Hub", "700+ workshops in year one"),
               ("flourish.html#courses", "Wellness courses", "NOCS 01, NOCS 02 and more"),
               ("flourish.html#workshops", "Workshops & programmes", "From stress to career readiness"),
               ("flourish.html#community", "Yogastha, NSS & mentorship", "Mind, body and belonging")]},
    {"key": "initiatives", "label": "Initiatives", "href": "initiatives.html",
     "intro": "Four measures completed or under way in 2026.",
     "links": [("initiatives.html#ambassadors", "Wellbeing Ambassadors", "A friendly face in every hostel"),
               ("initiatives.html#shine", "SHINE Committee", "Support for students who need more"),
               ("initiatives.html#peer", "Peer Circles", "Mentors and Faculty Advisors together"),
               ("initiatives.html#status", "Progress tracker", "Where each measure stands")]},
    {"key": "vision", "label": "Our Vision", "href": "vision.html", "edge": True,
     "intro": "Five priorities for the earliest action, and the roadmap ahead.",
     "links": [("vision.html#wqrt", "Wellbeing Quick Response Team", "24/7 team, vehicle and one number"),
               ("vision.html#rise", "RISE IITB app", "One app, universal screening"),
               ("vision.html#hours", "Longer hours", "Counselling till 10 pm and at weekends"),
               ("vision.html#roadmap", "Roadmap at a glance", "From foundation to full care")]},
    {"key": "about", "label": "About", "href": "about.html", "edge": True,
     "intro": "The Office of the Associate Dean, Student Wellness, created in September 2026.",
     "links": [("about.html#office", "Our office", "One office, five units"),
               ("about.html#why", "Why now", "A national priority"),
               ("about.html#ecosystem", "The ecosystem", "How the units work together"),
               ("about.html#leadership", "Prof. Deepak Marla", "Associate Dean of Student Wellness"),
               ("report.html", "October 2026 Update", "The full update, section by section")]},
]

LOGO = ('<svg class="logo-mark" viewBox="0 0 48 48" aria-hidden="true"><defs><clipPath id="lc{n}"><circle cx="24" cy="24" r="24"/></clipPath></defs>'
        '<g clip-path="url(#lc{n})"><rect width="48" height="48" fill="#1559d6"/><circle cx="24" cy="28" r="10" fill="#f2b134"/>'
        '<path d="M0 31c8-5 16-5 24 0s16 5 24 0v17H0z" fill="#2a9df4"/><path d="M0 37c8-4 16-4 24 0s16 4 24 0v11H0z" fill="#7cc3ff"/></g></svg>')


def icon(name, cls="ic"):
    return f'<svg class="{cls}" aria-hidden="true"><use href="#i-{name}"/></svg>'


def sprite():
    syms = "".join(f'<symbol id="i-{k}" viewBox="0 0 24 24">{v}</symbol>' for k, v in ICONS.items())
    return f'<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>{syms}</defs></svg>'


def logo(n):
    return (f'{LOGO.format(n=n)}<span class="logo-text"><small>IIT Bombay</small><b>Student Wellness</b></span>')


def header(active):
    items = []
    for i, item in enumerate(NAV):
        cur = ' aria-current="page"' if item["key"] == active or (active == "report" and item["key"] == "about") else ""
        links = "".join(f'<li><a href="{h}"><b>{t}</b><span>{d}</span></a></li>' for h, t, d in item["links"])
        edge = " edge" if item.get("edge") else ""
        items.append(
            f'<li class="has-mega{edge}"><a class="nav-top" href="{item["href"]}"{cur} aria-haspopup="true" aria-expanded="false">{item["label"]}{icon("chev", "ic chev")}</a>'
            f'<div class="mega"><div class="mega-intro"><h3>{item["label"]}</h3><p>{item["intro"]}</p>'
            f'<a class="link-arrow" href="{item["href"]}">Overview {icon("arrow")}</a></div><ul>{links}</ul></div></li>')
    return f"""
<div class="announce" id="announce" hidden>
  <div class="wrap"><p><b>New</b>A psychiatrist is now available 24/7 at the IIT Bombay Hospital. <a href="care.html#psychiatry">Learn more</a></p>
  <button class="announce-x" id="announceClose" type="button" aria-label="Dismiss announcement">{icon("close")}</button></div>
</div>
<div class="utility">
  <div class="wrap">
    <p class="inst"><b>IIT Bombay</b> <span>· Office of the Dean, Student Affairs</span></p>
    <a class="site-link" href="report.html">October 2026 Update</a>
    <a class="site-link" href="https://swc.iitb.ac.in" target="_blank" rel="noopener">SWC {icon("external")}</a>
    <a class="site-link" href="https://flourishing-iitb.org" target="_blank" rel="noopener">Flourishing Hub {icon("external")}</a>
    <a class="btn-help" href="get-help.html"><span class="pulse-dot" aria-hidden="true"></span>Get help now</a>
  </div>
</div>
<header class="site-header" id="siteHeader">
  <div class="wrap header-row">
    <a class="logo" href="index.html" aria-label="Student Wellness, IIT Bombay: home">{logo(1)}</a>
    <nav class="main-nav" aria-label="Main"><ul>{''.join(items)}</ul></nav>
    <button class="search-btn" id="searchOpen" type="button" aria-label="Search the site">{icon("search")}</button>
    <button class="menu-btn" id="menuOpen" type="button" aria-label="Open menu">{icon("menu")}</button>
  </div>
</header>"""


def drawer():
    groups = "".join(
        f'<details><summary>{n["label"]}{icon("chev")}</summary><ul><li><a href="{n["href"]}"><b>Overview</b></a></li>'
        + "".join(f'<li><a href="{h}">{t}</a></li>' for h, t, _ in n["links"]) + "</ul></details>" for n in NAV)
    return f"""
<div class="drawer" id="drawer" hidden>
  <div class="drawer-panel" role="dialog" aria-modal="true" aria-label="Menu">
    <div class="drawer-top"><a class="logo" href="index.html">{logo(2)}</a>
      <button class="menu-btn" style="display:grid" id="menuClose" type="button" aria-label="Close menu">{icon("close")}</button></div>
    {groups}
    <a class="btn-help" href="get-help.html"><span class="pulse-dot" aria-hidden="true"></span>Get help now</a>
  </div>
</div>
<div class="search-overlay" id="searchOverlay" hidden>
  <div class="search-panel" role="dialog" aria-modal="true" aria-label="Search">
    <div class="finder" data-finder>
      <label class="finder-field">{icon("search")}<input id="overlayQuery" type="search" placeholder="Search services, programmes, help…" autocomplete="off" aria-label="Search"></label>
      <ul class="finder-results" role="listbox"></ul>
    </div>
  </div>
</div>"""


def footer():
    cols = []
    for title, keys in (("Support", ["help", "care"]), ("Programmes", ["flourish", "initiatives"]), ("About", ["vision", "about"])):
        lis = "".join(f'<li><a href="{n["href"]}">{n["label"]}</a></li>' for n in NAV if n["key"] in keys)
        extra = {
            "Support": '<li><a href="https://swc.iitb.ac.in" target="_blank" rel="noopener">swc.iitb.ac.in</a></li>',
            "Programmes": '<li><a href="https://flourishing-iitb.org" target="_blank" rel="noopener">flourishing-iitb.org</a></li>',
            "About": '<li><a href="report.html">October 2026 Update</a></li><li><a href="vision.html#roadmap">Roadmap</a></li>',
        }[title]
        cols.append(f"<div><h4>{title}</h4><ul>{lis}{extra}</ul></div>")
    return f"""
<section class="foot-help" aria-label="Urgent help">
  <div class="wrap">
    <p><b>In an emergency, don't wait.</b>Call the national emergency number, or Tele-MANAS for free 24/7 mental health support.</p>
    <div class="lines"><span>112 · Emergency</span><span>14416 · Tele-MANAS</span></div>
    <a class="btn light" href="get-help.html">All help options {icon("arrow")}</a>
  </div>
</section>
<footer class="footer">
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <a class="logo" href="index.html">{logo(3)}</a>
        <p>Office of the Associate Dean, Student Wellness<br>Indian Institute of Technology Bombay, Powai, Mumbai</p>
        <p style="margin-top:14px">Students Wellness Centre · Flourishing Hub · Yogastha · NSS · Student Mentorship Program</p>
      </div>
      {''.join(cols)}
    </div>
    <div class="foot-bottom">
      <span>Based on <em>Student Wellness at IIT Bombay</em>, October 2026 update by Prof. Deepak Marla.</span>
      <span>Photos: <a href="https://unsplash.com" target="_blank" rel="noopener">Unsplash</a> (illustrative)</span>
    </div>
  </div>
</footer>
<button class="to-top" id="toTop" type="button" aria-label="Back to top">{icon("arrow-up")}</button>"""


def page(meta, body):
    title = meta["title"]
    full_title = "Student Wellness · IIT Bombay" if meta.get("home") else f"{title} · Student Wellness, IIT Bombay"
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{full_title}</title>
<meta name="description" content="{meta['desc']}">
<meta name="theme-color" content="#1559d6">
<meta property="og:title" content="{full_title}">
<meta property="og:description" content="{meta['desc']}">
<meta property="og:image" content="assets/img/hero.jpg">
<script>(function(){{var d=document.documentElement;d.classList.add('js');if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('reduced');}})();</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,500;0,8..60,600;0,8..60,700;1,8..60,500&display=swap">
<link rel="stylesheet" href="assets/style.css">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Ccircle cx='24' cy='24' r='24' fill='%231559d6'/%3E%3Ccircle cx='24' cy='28' r='10' fill='%23f2b134'/%3E%3Cpath d='M2 31c8-5 14-5 22 0s14 5 22 0c-2 9-10 17-22 17S4 40 2 31z' fill='%232a9df4'/%3E%3C/svg%3E">
</head>
<body data-page="{meta['nav']}">
<a class="skip" href="#main">Skip to main content</a>
{sprite()}
{header(meta['nav'])}
<main id="main">
{body}
</main>
{footer()}
{drawer()}
<script src="assets/app.js"></script>
</body>
</html>
"""


def expand_icons(html):
    # {{icon:name}} or {{icon:name:class}} shorthand inside page sources
    return re.sub(r"\{\{icon:([\w-]+)(?::([\w -]+))?\}\}", lambda m: icon(m.group(1), m.group(2) or "ic"), html)


def main():
    for src in sorted(PAGES.glob("*.html")):
        text = src.read_text(encoding="utf-8")
        m = re.match(r"\s*<!--(\{.*?\})-->\s*", text, re.S)
        meta = json.loads(m.group(1))
        out = ROOT / src.name
        out.write_text(page(meta, expand_icons(text[m.end():])), encoding="utf-8")
        print("built", out.name)


if __name__ == "__main__":
    main()
