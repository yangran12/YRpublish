/* ==========================================================================
   My submissions — reads the signed-in user's own rows from Supabase
   ========================================================================== */

(function () {
  "use strict";

  var CFG = window.TDF_CONFIG || {};
  var AUTH = window.TDF_AUTH;
  var t = function (k, vars) { return window.I18N.t(k, vars); };
  var show = window.TDF.message;

  var whoEl   = document.getElementById("dash-who");
  var msgEl   = document.getElementById("dash-msg");
  var mount   = document.getElementById("dash-mount");
  var emptyEl = document.getElementById("dash-empty");

  var BADGE = {
    submitted: "badge-submitted",
    screening: "badge-review",
    review:    "badge-review",
    revision:  "badge-revision",
    accepted:  "badge-accepted",
    rejected:  "badge-rejected",
  };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escAttr(s) { return esc(s).replace(/'/g, "&#39;"); }

  function row(item) {
    var status = item.status || "submitted";
    var badgeClass = BADGE[status] || "badge-submitted";
    var labelKey = "status." + status;
    var label = t(labelKey);
    if (label === labelKey) { label = status; }   // unknown status: show it raw

    var title = esc(item.title);
    if (item.file_url) {
      title = '<a href="' + escAttr(item.file_url) + '" rel="noopener">' + title + "</a>";
    }

    var date = item.created_at ? String(item.created_at).slice(0, 10) : "—";

    return "<tr>" +
      "<td>" +
        '<span class="paper-title">' + title + "</span>" +
        (item.keywords ? '<span class="paper-authors">' + esc(item.keywords) + "</span>" : "") +
      "</td>" +
      '<td class="nowrap"><span class="badge ' + badgeClass + '">' + esc(label) + "</span></td>" +
      '<td class="nowrap">' + esc(date) + "</td>" +
    "</tr>";
  }

  function render(rows) {
    if (!rows || !rows.length) {
      mount.hidden = true;
      emptyEl.hidden = false;
      return;
    }
    mount.querySelector("tbody").innerHTML = rows.map(row).join("");
    mount.hidden = false;
    emptyEl.hidden = true;
  }

  function load() {
    show(msgEl, t("common.loading"), "info");

    AUTH.client
      .from("submissions")
      .select("title, keywords, status, file_url, created_at")
      .order("created_at", { ascending: false })
      .then(function (res) {
        if (res.error) { throw res.error; }
        msgEl.hidden = true;
        render(res.data);
      })
      .catch(function (err) {
        console.error("[TDF] dashboard query failed:", err);
        show(msgEl, t("dash.loadFail"), "err");
        render([]);
      });
  }

  /* ---------------------------------------------------------------- boot -- */

  if (!CFG.authEnabled) {
    show(msgEl, t("auth.notConfigured"), "warn");
    if (emptyEl) { emptyEl.hidden = true; }
    return;
  }

  AUTH.requireAuth()
    .then(function (user) {
      var name = (user.user_metadata && user.user_metadata.full_name) || user.email;
      if (whoEl) { whoEl.textContent = name; }
      load();
    })
    .catch(function () { /* requireAuth already redirected */ });

  document.addEventListener("tdf:langchange", function () {
    if (AUTH.session) { load(); }
  });
})();
