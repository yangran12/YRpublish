/* ==========================================================================
   Sign in / Register page
   ========================================================================== */

(function () {
  "use strict";

  var CFG = window.TDF_CONFIG || {};
  var AUTH = window.TDF_AUTH;
  var t = function (k) { return window.I18N.t(k); };
  var show = window.TDF.message;

  var signinForm = document.getElementById("signin-form");
  var signupForm = document.getElementById("signup-form");
  var msg        = document.getElementById("auth-msg");
  var disabled   = document.getElementById("auth-disabled");

  /* ---------------------------------------------------------------- tabs -- */

  function selectTab(which) {
    document.querySelectorAll(".tab[data-tab]").forEach(function (tab) {
      var on = tab.getAttribute("data-tab") === which;
      tab.setAttribute("aria-selected", on ? "true" : "false");
      var panel = document.getElementById("panel-" + tab.getAttribute("data-tab"));
      if (panel) { panel.hidden = !on; }
    });
    if (msg) { msg.hidden = true; }
  }

  document.querySelectorAll(".tab[data-tab]").forEach(function (tab) {
    tab.addEventListener("click", function () { selectTab(tab.getAttribute("data-tab")); });
  });

  /* ----------------------------------------------------------- redirect --- */

  function destination() {
    var params = new URLSearchParams(window.location.search);
    var next = params.get("next");
    // Only ever follow a bare page name — never an absolute or protocol-relative URL.
    if (next && /^[A-Za-z0-9._-]+\.html$/.test(next)) { return next; }
    return "dashboard.html";
  }

  /* --------------------------------------------------------------- forms -- */

  if (signinForm) {
    signinForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("in-email").value.trim();
      var pw    = document.getElementById("in-password").value;

      show(msg, t("common.loading"), "info");

      AUTH.signIn(email, pw)
        .then(function (res) {
          if (res.error) {
            var m = /invalid/i.test(res.error.message) ? t("auth.badCreds") : res.error.message;
            show(msg, m, "err");
            return;
          }
          window.location.href = destination();
        })
        .catch(function (err) {
          show(msg, err.message || t("submit.fail"), "err");
        });
    });
  }

  if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var name  = document.getElementById("up-name").value.trim();
      var affil = document.getElementById("up-affil").value.trim();
      var role  = document.getElementById("up-role").value;
      var email = document.getElementById("up-email").value.trim();
      var pw    = document.getElementById("up-password").value;
      var pw2   = document.getElementById("up-password2").value;

      if (pw.length < 8)   { show(msg, t("auth.pwShort"), "err");    return; }
      if (pw !== pw2)      { show(msg, t("auth.pwMismatch"), "err"); return; }

      show(msg, t("common.loading"), "info");

      AUTH.signUp(email, pw, { full_name: name, affiliation: affil, role: role })
        .then(function (res) {
          if (res.error) {
            var m = /already/i.test(res.error.message) ? t("auth.emailTaken") : res.error.message;
            show(msg, m, "err");
            return;
          }
          show(msg, t("auth.signupOk"), "ok");
          signupForm.reset();
          // If the project has email confirmation switched off, a session exists
          // already and we can go straight through.
          setTimeout(function () {
            if (res.data && res.data.session) { window.location.href = destination(); }
          }, 900);
        })
        .catch(function (err) {
          show(msg, err.message || t("submit.fail"), "err");
        });
    });
  }

  /* --------------------------------------------------------------- boot --- */

  if (window.location.hash === "#register") { selectTab("signup"); }

  if (!CFG.authEnabled) {
    if (disabled) {
      show(disabled, t("auth.notConfigured"), "warn");
      if (CFG.contactEmail) {
        disabled.insertAdjacentHTML(
          "beforeend",
          ' <a href="mailto:' + CFG.contactEmail + '">' + CFG.contactEmail + "</a>"
        );
      }
    }
    // Nothing to sign in to — drop the tab bar rather than leave an empty panel.
    var tabsEl = document.querySelector(".tabs");
    if (tabsEl) { tabsEl.hidden = true; }
    document.querySelectorAll(".tabpanel").forEach(function (p) { p.hidden = true; });
    return;
  }

  // Already signed in? Skip the form.
  AUTH.ready.then(function () {
    if (AUTH.session) { window.location.href = destination(); }
  });

  document.addEventListener("tdf:langchange", function () {
    if (!CFG.authEnabled && disabled) { show(disabled, t("auth.notConfigured"), "warn"); }
  });
})();
