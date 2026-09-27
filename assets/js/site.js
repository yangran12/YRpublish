/* ==========================================================================
   Shared chrome: masthead, navigation, footer, language toggle.
   --------------------------------------------------------------------------
   Every page has two empty placeholders:
       <div id="site-header"></div>   ... <div id="site-footer"></div>
   and loads these scripts at the END of <body>, so injection happens after
   the placeholders exist — no flash of unstyled chrome.
   ========================================================================== */

(function () {
  "use strict";

  var CFG = window.TDF_CONFIG || {};

  /* Which nav item is the current page? ------------------------------------- */

  function currentPage() {
    var file = window.location.pathname.split("/").pop() || "index.html";
    return file.replace(/\.html$/, "") || "index";
  }

  var NAV = [
    { id: "index",   key: "nav.home",     href: "index.html" },
    { id: "papers",  key: "nav.papers",   href: "papers.html" },
    { id: "submit",  key: "nav.submit",   href: "submit.html" },
    { id: "review",  key: "nav.review",   href: "review.html" },
    { id: "about",   key: "nav.about",    href: "about.html" },
  ];

  /* Header ------------------------------------------------------------------ */

  function renderHeader() {
    var host = document.getElementById("site-header");
    if (!host) { return; }

    var here = currentPage();
    var t = window.I18N.t;

    var links = NAV.map(function (item) {
      var current = item.id === here ? ' aria-current="page"' : "";
      return '<a href="' + item.href + '"' + current +
             ' data-i18n="' + item.key + '">' + t(item.key) + "</a>";
    }).join("");

    host.innerHTML =
      '<a class="skip-link" href="#main" data-i18n="nav.skip">' + t("nav.skip") + "</a>" +
      '<header class="masthead">' +
        '<div class="wrap masthead-inner">' +
          '<div class="brand">' +
            '<div class="brand-rule"></div>' +
            '<h1 class="brand-title"><a href="index.html" data-i18n="brand.title">' + t("brand.title") + "</a></h1>" +
            '<p class="brand-sub" data-i18n="brand.subtitle">' + t("brand.subtitle") + "</p>" +
          "</div>" +
          '<div class="masthead-aside">' +
            '<button type="button" class="lang-toggle" id="lang-toggle" aria-label="Switch language">' +
              (window.I18N.lang === "zh" ? "EN" : "中文") +
            "</button>" +
          "</div>" +
        "</div>" +
      "</header>" +
      '<nav class="nav" aria-label="Primary">' +
        '<div class="wrap nav-inner">' +
          links +
          '<span class="nav-spacer"></span>' +
          '<span id="nav-auth"></span>' +
        "</div>" +
      "</nav>";

    var toggle = document.getElementById("lang-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        window.I18N.toggle();
        renderHeader();   // button label flips with the language
        renderFooter();
        applyConfig();    // re-fill config-driven nodes the fresh markup just created
        if (window.TDF_AUTH && window.TDF_AUTH.renderNav) { window.TDF_AUTH.renderNav(); }
      });
    }
  }

  /* Footer ------------------------------------------------------------------ */

  function renderFooter() {
    var host = document.getElementById("site-footer");
    if (!host) { return; }

    var t = window.I18N.t;
    var mail = CFG.contactEmail || "";

    host.innerHTML =
      '<footer class="footer">' +
        '<div class="wrap">' +
          '<div class="footer-grid">' +
            "<div>" +
              '<h4 data-i18n="brand.title">' + t("brand.title") + "</h4>" +
              '<p data-i18n="footer.about">' + t("footer.about") + "</p>" +
            "</div>" +
            "<div>" +
              '<h4 data-i18n="footer.nav">' + t("footer.nav") + "</h4>" +
              "<ul>" +
                NAV.map(function (i) {
                  return '<li><a href="' + i.href + '" data-i18n="' + i.key + '">' + t(i.key) + "</a></li>";
                }).join("") +
              "</ul>" +
            "</div>" +
            "<div>" +
              '<h4 data-i18n="footer.legal">' + t("footer.legal") + "</h4>" +
              "<ul>" +
                '<li><a href="about.html#ethics" data-i18n="footer.ethics">' + t("footer.ethics") + "</a></li>" +
                '<li><a href="about.html#contact" data-i18n="about.contact.heading">' + t("about.contact.heading") + "</a></li>" +
                (CFG.githubRepo ? '<li><a href="' + CFG.githubRepo + '" rel="noopener">GitHub</a></li>' : "") +
                (CFG.zenodoCommunity ? '<li><a href="' + CFG.zenodoCommunity + '" rel="noopener">Zenodo</a></li>' : "") +
              "</ul>" +
            "</div>" +
          "</div>" +
          '<div class="footer-bottom">' +
            "<span>" +
              (mail ? '<a href="mailto:' + mail + '">' + mail + "</a>" : "") +
              (mail && CFG.editorOrcid ? " &middot; " : "") +
              (CFG.editorOrcid ? '<a data-orcid href="#"></a>' : "") +
            "</span>" +
            '<span data-i18n="footer.rights">' + t("footer.rights") + "</span>" +
          "</div>" +
        "</div>" +
      "</footer>";
  }

  /* Page helpers ------------------------------------------------------------ */

  /** Fill any [data-cfg="key"] element from TDF_CONFIG. */
  function applyConfig() {
    document.querySelectorAll("[data-cfg]").forEach(function (el) {
      var val = CFG[el.getAttribute("data-cfg")];
      if (!val) { return; }

      if (el.tagName !== "A") { el.textContent = val; return; }

      // An href of "mailto:" in the markup means "prefix the configured address",
      // so one attribute drives both mail links and plain URLs.
      var existing = el.getAttribute("href") || "";
      el.setAttribute("href", /^mailto:/i.test(existing) ? "mailto:" + val : val);
    });

    // ORCID links: <a data-orcid></a> gets both the href and the visible iD,
    // so the identifier only ever has to be written down in one place.
    document.querySelectorAll("[data-orcid]").forEach(function (el) {
      var id = CFG.editorOrcid;
      if (!id) { el.hidden = true; return; }
      el.setAttribute("href", "https://orcid.org/" + id);
      el.setAttribute("rel", "noopener");
      el.textContent = "ORCID " + id;
    });
  }

  /** Show a status message inside `el`, translated. */
  function message(el, text, kind) {
    if (!el) { return; }
    if (!text) { el.hidden = true; el.textContent = ""; return; }
    el.className = "msg msg-" + (kind || "info");
    el.textContent = text;
    el.hidden = false;
  }

  window.TDF = {
    renderHeader: renderHeader,
    renderFooter: renderFooter,
    currentPage: currentPage,
    message: message,
    config: CFG,
  };

  /* Boot -------------------------------------------------------------------- */

  window.I18N.set(window.I18N.initial());   // also applies translations
  renderHeader();
  renderFooter();
  applyConfig();

  // Re-render when a page changes language programmatically.
  document.addEventListener("tdf:langchange", function () {
    // Chrome is re-rendered by the toggle handler; only page content needs this.
    applyConfig();
  });
})();
