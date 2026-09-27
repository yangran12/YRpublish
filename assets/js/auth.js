/* ==========================================================================
   Accounts — thin wrapper over Supabase Auth
   --------------------------------------------------------------------------
   Everything degrades gracefully: if supabaseUrl / supabaseAnonKey are empty
   in config.js, TDF_AUTH.enabled is false, the nav shows no account links,
   and pages that need an account explain how to turn it on.

   Setup instructions: docs/supabase-setup.md
   ========================================================================== */

(function () {
  "use strict";

  var CFG = window.TDF_CONFIG || {};
  var SDK_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js";

  var client = null;
  var session = null;
  var readyResolve;
  var ready = new Promise(function (res) { readyResolve = res; });

  /* ----------------------------------------------------------- SDK loader -- */

  function loadSdk() {
    return new Promise(function (resolve, reject) {
      if (window.supabase && window.supabase.createClient) { return resolve(); }
      var s = document.createElement("script");
      s.src = SDK_URL;
      s.async = true;
      s.onload = function () {
        (window.supabase && window.supabase.createClient) ? resolve() : reject(new Error("bad sdk"));
      };
      s.onerror = function () { reject(new Error("sdk load failed")); };
      document.head.appendChild(s);
    });
  }

  /* --------------------------------------------------------------- nav ----- */

  /** Paint the account area of the nav bar. Called by site.js on re-render. */
  function renderNav() {
    var host = document.getElementById("nav-auth");
    if (!host) { return; }

    var t = window.I18N.t;

    if (!TDF_AUTH.enabled) {
      host.innerHTML = '<a href="login.html" data-i18n="nav.signin">' + t("nav.signin") + "</a>";
      return;
    }

    if (!session) {
      host.innerHTML =
        '<a href="login.html" data-i18n="nav.signin">' + t("nav.signin") + "</a>" +
        '<a href="login.html#register" data-i18n="nav.register">' + t("nav.register") + "</a>";
      return;
    }

    var who = (session.user.user_metadata && session.user.user_metadata.full_name) || session.user.email;
    host.innerHTML =
      '<a href="dashboard.html" data-i18n="nav.dashboard">' + t("nav.dashboard") + "</a>" +
      '<a href="#" id="nav-signout" title="' + who + '" data-i18n="nav.signout">' + t("nav.signout") + "</a>";

    var out = document.getElementById("nav-signout");
    if (out) {
      out.addEventListener("click", function (e) {
        e.preventDefault();
        TDF_AUTH.signOut().then(function () { window.location.href = "index.html"; });
      });
    }
  }

  /* --------------------------------------------------------------- core ---- */

  var TDF_AUTH = {

    enabled: Boolean(CFG.authEnabled),
    ready: ready,

    get client() { return client; },
    get session() { return session; },

    /** Current user, or null. */
    user: function () { return session ? session.user : null; },

    /** Where to send a visitor who needs an account. */
    redirectToLogin: function () {
      var back = encodeURIComponent(window.location.pathname.split("/").pop() || "index.html");
      window.location.href = "login.html?next=" + back;
    },

    /** Resolve once we know whether there is a session. Rejects if unconfigured. */
    requireAuth: function () {
      return ready.then(function () {
        if (!session) { TDF_AUTH.redirectToLogin(); throw new Error("no session"); }
        return session.user;
      });
    },

    signUp: function (email, password, meta) {
      return ready.then(function () {
        return client.auth.signUp({
          email: email,
          password: password,
          options: { data: meta || {} },
        });
      });
    },

    signIn: function (email, password) {
      return ready.then(function () {
        return client.auth.signInWithPassword({ email: email, password: password });
      });
    },

    signOut: function () {
      if (!client) { return Promise.resolve(); }
      return client.auth.signOut();
    },

    renderNav: renderNav,
  };

  /* --------------------------------------------------------------- boot ---- */

  if (!TDF_AUTH.enabled) {
    readyResolve();
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", renderNav);
    } else {
      renderNav();
    }
    window.TDF_AUTH = TDF_AUTH;
    return;
  }

  loadSdk()
    .then(function () {
      client = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey);

      return client.auth.getSession().then(function (res) {
        session = res.data.session || null;
        readyResolve();

        client.auth.onAuthStateChange(function (_event, newSession) {
          session = newSession || null;
          renderNav();
        });

        renderNav();
      });
    })
    .catch(function (err) {
      // SDK unreachable — behave as if accounts were off, but say why in the console.
      console.error("[TDF] Supabase unavailable:", err);
      TDF_AUTH.enabled = false;
      readyResolve();
      renderNav();
    });

  /* Let the language toggle repaint the nav labels. */
  document.addEventListener("tdf:langchange", renderNav);

  window.TDF_AUTH = TDF_AUTH;
})();
