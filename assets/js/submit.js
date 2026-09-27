/* ==========================================================================
   Submit page — form handling, tabs, and graceful fallback to email
   ========================================================================== */

(function () {
  "use strict";

  var CFG = window.TDF_CONFIG || {};
  var form    = document.getElementById("submit-form");
  var notice  = document.getElementById("submit-notice");
  var msgEl   = document.getElementById("submit-msg");
  var btn     = document.getElementById("submit-btn");

  var t = function (k, vars) { return window.I18N.t(k, vars); };
  var show = window.TDF.message;

  /* ---------------------------------------------------------------- tabs -- */

  function initTabs() {
    var tabs = document.querySelectorAll(".tab[data-tab]");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var target = tab.getAttribute("data-tab");

        tabs.forEach(function (other) {
          var on = other === tab;
          other.setAttribute("aria-selected", on ? "true" : "false");
          var panel = document.getElementById("panel-" + other.getAttribute("data-tab"));
          if (panel) { panel.hidden = !on; }
        });

        if (target === "email" && CFG.contactEmail) {
          var link = document.getElementById("email-link");
          var addr = document.getElementById("email-addr");
          if (link) { link.href = "mailto:" + CFG.contactEmail; }
          if (addr) { addr.textContent = CFG.contactEmail; }
        }
      });
    });
  }

  /* -------------------------------------------------------------- notice -- */

  function paintNotice() {
    if (!notice) { return; }

    var AUTH = window.TDF_AUTH;
    var configured = Boolean(CFG.authEnabled);
    var signedIn = AUTH && AUTH.session;

    if (!configured) {
      show(notice, t("auth.notConfigured"), "warn");
      if (btn) { btn.disabled = true; }
      return;
    }

    if (!signedIn) {
      show(
        notice,
        t("submit.authNeeded") + " ",
        "info"
      );
      notice.insertAdjacentHTML(
        "beforeend",
        '<a href="login.html" data-i18n="nav.signin">' + t("nav.signin") + "</a>"
      );
      if (btn) { btn.disabled = true; }
      return;
    }

    notice.hidden = true;
    if (btn) { btn.disabled = false; }
  }

  /* ------------------------------------------------------------ validate -- */

  function readForm() {
    return {
      title:       document.getElementById("f-title").value.trim(),
      authors:     document.getElementById("f-authors").value.trim(),
      affiliation: document.getElementById("f-affil").value.trim(),
      contact_email: document.getElementById("f-email").value.trim(),
      abstract:    document.getElementById("f-abstract").value.trim(),
      keywords:    document.getElementById("f-keywords").value.trim(),
      file_url:    document.getElementById("f-link").value.trim(),
    };
  }

  function firstProblem(d) {
    if (!d.title)    { return "submit.f.title"; }
    if (!d.authors)  { return "submit.f.authors"; }
    if (!d.abstract) { return "submit.f.abstract"; }
    // crude but adequate: one @, one dot after it
    if (d.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.contact_email)) {
      return "submit.f.email";
    }
    return null;
  }

  /* --------------------------------------------------------------- send --- */

  function send(e) {
    e.preventDefault();

    var AUTH = window.TDF_AUTH;
    if (!AUTH || !AUTH.enabled || !AUTH.session) { return; }

    var data = readForm();
    var problem = firstProblem(data);
    if (problem) {
      show(msgEl, t(problem), "err");
      return;
    }

    var original = btn ? btn.textContent : "";
    if (btn) { btn.disabled = true; btn.textContent = t("common.working"); }
    show(msgEl, t("common.loading"), "info");

    AUTH.client
      .from("submissions")
      .insert([Object.assign({}, data, {
        user_id: AUTH.session.user.id,
        status: "submitted",
      })])
      .then(function (res) {
        if (res.error) { throw res.error; }
        form.reset();
        show(msgEl, t("submit.ok", { days: CFG.initialScreeningDays }), "ok");
      })
      .catch(function (err) {
        console.error("[TDF] submission failed:", err);
        show(msgEl, t("submit.fail"), "err");
      })
      .then(function () {
        if (btn) { btn.disabled = false; btn.textContent = original; }
      });
  }

  /* --------------------------------------------------------------- boot --- */

  initTabs();

  if (form) { form.addEventListener("submit", send); }

  // Prefill the contact field from the signed-in account.
  var AUTH = window.TDF_AUTH;
  if (AUTH && AUTH.ready) {
    AUTH.ready.then(function () {
      paintNotice();
      var user = AUTH.session && AUTH.session.user;
      var emailField = document.getElementById("f-email");
      if (user && emailField && !emailField.value) { emailField.value = user.email || ""; }

      var nameField = document.getElementById("f-authors");
      var meta = user && user.user_metadata;
      if (meta && meta.full_name && nameField && !nameField.value) {
        nameField.value = meta.full_name;
      }
    });
  } else {
    paintNotice();
  }

  document.addEventListener("tdf:langchange", paintNotice);
})();
