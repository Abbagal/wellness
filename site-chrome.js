/* Shared site chrome: header, footer and the "Get help now" panel.
   Every page carries <script src="site-chrome.js"></script> right after the icon sprite
   (the header is written there) and <div data-site-footer></div> before script.js
   (the footer and panel are written there). Change them here and every page follows.
   Phone numbers and links are filled in by script.js from WELLNESS_DATA. */
(function () {
  "use strict";

  // sub: the dropdown shown on hover or focus (and behind the arrow button on phones).
  var NAV = [
    { href: "index.html", label: "Home" },
    { href: "about.html", label: "About" },
    { href: "initiatives.html", label: "Initiatives", wide: true, sub: [
      { href: "initiatives.html#care", label: "CARE: Counselling" },
      { href: "initiatives.html#online-counselling", label: "Online Counselling" },
      { href: "initiatives.html#wrt", label: "24x7 Wellness Response Team" },
      { href: "initiatives.html#psychiatry", label: "24x7 Psychiatry Support" },
      { href: "initiatives.html#flourishing-hub", label: "Flourishing Hub" },
      { href: "initiatives.html#shine", label: "SHINE" },
      { href: "initiatives.html#rise", label: "RISE IITB" },
      { href: "initiatives.html#ambassadors", label: "Wellbeing Ambassadors" },
      { href: "initiatives.html#mentors", label: "Student Mentors and Faculty Team" }
    ] },
    { href: "get-help.html", label: "Get Help", sub: [
      // filled by script.js: the booking link from WELLNESS_DATA.links, the number from helplines
      { html: '<span data-link="careBooking" data-label="Book a Counselling Session" data-class="sub-link">Book a Counselling Session</span>', note: "Talk to a CARE counsellor, in person or online" },
      { html: '<a class="sub-link" href="tel:+918356810252" data-tel>Wellness Response Team, 24x7</a>', note: "Call or WhatsApp at any hour" }
    ] },
    { href: "people.html", label: "Our People" },
    { href: "reports.html", label: "Reports" }
  ];

  var page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  if (page.indexOf(".") < 0) page += ".html";

  function icon(name) {
    return '<svg class="ic" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
  }

  var links = NAV.map(function (item, n) {
    var current = item.href === page ? ' aria-current="page"' : "";
    var top = '<a href="' + item.href + '"' + current + ">" + item.label + "</a>";
    if (!item.sub) return "<li>" + top + "</li>";
    var id = "sub-" + n;
    var rows = item.sub.map(function (s) {
      var link = s.html || '<a class="sub-link" href="' + s.href + '">' + s.label + "</a>";
      return "<li>" + link + (s.note ? '<span class="sub-note">' + s.note + "</span>" : "") + "</li>";
    }).join("");
    return '<li class="has-sub">' + top +
      '<button class="sub-toggle" type="button" aria-expanded="false" aria-controls="' + id + '" aria-label="Show ' + item.label + ' links">' + icon("right") + "</button>" +
      '<ul class="sub' + (item.wide ? " wide" : "") + '" id="' + id + '">' + rows + "</ul></li>";
  }).join("") + '<li><a href="#contact">Contact</a></li>';

  var header =
    '<header class="site-header">' +
      '<div class="wrap bar">' +
        '<a class="logo" href="index.html" aria-label="Wellness at IIT Bombay: home">' +
          '<span class="logo-mark" aria-hidden="true">' + icon("heart") + "</span>" +
          '<span class="logo-text"><small>IIT Bombay</small><b>Wellness</b></span>' +
        "</a>" +
        '<nav class="main-nav" id="mainNav" aria-label="Main"><ul>' + links + "</ul></nav>" +
        '<button class="menu-toggle" id="menuToggle" type="button" aria-expanded="false" aria-controls="mainNav" aria-label="Open menu">' + icon("menu") + "</button>" +
        '<a class="btn help-now" id="helpOpen" href="get-help.html">Get Help Now</a>' +
      "</div>" +
    "</header>";

  var footer =
    '<footer class="footer" id="contact">' +
      '<div class="wrap foot-grid">' +
        "<div>" +
          "<h2>Contact</h2>" +
          "<p>Student Wellness, Indian Institute of Technology Bombay, Powai, Mumbai</p>" +
          '<p><a href="mailto:wellness@iitb.ac.in" data-mail>wellness@iitb.ac.in</a></p>' +
          '<p><a href="https://www.google.com/maps/search/?api=1&amp;query=IIT+Bombay+Powai+Mumbai" target="_blank" rel="noopener">View location</a></p>' +
        "</div>" +
        "<div>" +
          "<h2>Helplines</h2>" +
          '<p>Wellness Response Team (24x7): <a href="tel:+918356810252" data-tel data-show-number>+91 8356-810252</a></p>' +
          '<p>Psychiatry (24x7): <span data-phone="psychiatry24x7" data-empty="[number]">[number]</span></p>' +
          '<p>Tele-MANAS (24x7, free): <span data-phone="teleManas" data-empty="[number]">[number]</span></p>' +
          '<p>Emergency: <span data-phone="emergency" data-empty="[number]">[number]</span></p>' +
        "</div>" +
        "<div>" +
          "<h2>Quick links</h2>" +
          "<ul>" +
            '<li><a href="get-help.html">How to get help</a></li>' +
            '<li><a href="https://swc.iitb.ac.in" target="_blank" rel="noopener">swc.iitb.ac.in</a></li>' +
            '<li><a href="https://flourishing-iitb.org" target="_blank" rel="noopener">flourishing-iitb.org</a></li>' +
            "<li>RISE IITB (coming soon)</li>" +
            '<li><a href="https://www.iitb.ac.in" target="_blank" rel="noopener">IIT Bombay</a></li>' +
          "</ul>" +
        "</div>" +
      "</div>" +
      '<div class="wrap foot-bottom">' +
        '<p class="safety">If you or someone you know is in immediate danger, call <span data-phone="emergency" data-empty="[emergency number]">[emergency number]</span>.</p>' +
        '<p class="privacy">' + icon("shield") + "<span>Your privacy comes first. This site has no sign-ups, no forms and no tracking, and keeps none of your data.</span></p>" +
        "<p>© IIT Bombay, Student Wellness</p>" +
        '<p class="credit">Photo: <a href="https://commons.wikimedia.org/wiki/File:Main_building_in_IIT_Bombay.jpg" target="_blank" rel="noopener">Main Building</a> by Shishirdasika, CC BY-SA 4.0, cropped.</p>' +
      "</div>" +
    "</footer>";

  var panel =
    '<div class="scrim" id="helpScrim" hidden></div>' +
    '<aside class="help-panel" id="helpPanel" role="dialog" aria-modal="true" aria-labelledby="helpPanelTitle" hidden>' +
      '<div class="help-panel-top">' +
        '<h2 id="helpPanelTitle">Get help now</h2>' +
        '<button class="round" id="helpClose" type="button" aria-label="Close help panel">' + icon("close") + "</button>" +
      "</div>" +
      '<p class="panel-intro">You do not have to explain or prove anything. Tap a number and it dials straight away.</p>' +
      '<ul class="call-list" data-call-list></ul>' +
      '<p class="panel-note">Prefer to write? <a href="https://wa.me/918356810252" target="_blank" rel="noopener" data-wa>WhatsApp the WRT</a> or email <a href="mailto:wellness@iitb.ac.in" data-mail>wellness@iitb.ac.in</a>.</p>' +
      '<div class="panel-actions">' +
        '<span data-link="careBooking" data-label="Book a counselling session" data-class="btn">Book a counselling session</span>' +
        '<a class="btn outline" href="get-help.html">Every way to get help</a>' +
      "</div>" +
      '<p class="panel-safe">' + icon("shield") + " Everything is confidential.</p>" +
    "</aside>";

  // The header goes where this script tag sits, so it is in place before the page paints.
  var me = document.currentScript;
  if (me) me.insertAdjacentHTML("afterend", header);

  // script.js calls this first, before it fills in numbers and wires up behaviour.
  window.SITE_CHROME = {
    fill: function () {
      var slot = document.querySelector("[data-site-footer]");
      if (slot) slot.outerHTML = footer + panel;
    }
  };
})();
