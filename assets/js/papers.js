/* ==========================================================================
   Papers index — renders assets/data/papers.json into the table on papers.html
   ========================================================================== */

(function () {
  "use strict";

  var mount = document.getElementById("papers-mount");
  var empty = document.getElementById("papers-empty");
  if (!mount) { return; }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function row(p) {
    var doi = p.doi
      ? '<a class="mono" href="https://doi.org/' + esc(p.doi) + '" rel="noopener">' +
        esc(p.doi) + "</a>"
      : '<span class="faint">—</span>';

    var review = p.review
      ? '<a href="' + esc(p.review) + '" rel="noopener">' + window.I18N.t("papers.th.review") + "</a>"
      : '<span class="faint">—</span>';

    return "<tr>" +
      '<td class="nowrap mono">' + esc(p.no) + "</td>" +
      "<td>" +
        '<span class="paper-title">' + esc(p.title) + "</span>" +
        '<span class="paper-authors">' + esc(p.authors) + "</span>" +
      "</td>" +
      '<td class="nowrap">' + esc(p.date) + "</td>" +
      "<td>" + doi + "</td>" +
      "<td>" + review + "</td>" +
    "</tr>";
  }

  function render(papers) {
    var list = (papers || []).slice().sort(function (a, b) {
      return String(b.date || "").localeCompare(String(a.date || ""));
    });

    if (!list.length) {
      mount.hidden = true;
      if (empty) { empty.hidden = false; }
      return;
    }

    mount.querySelector("tbody").innerHTML = list.map(row).join("");
    mount.hidden = false;
    if (empty) { empty.hidden = true; }
  }

  function load() {
    fetch("assets/data/papers.json", { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) { throw new Error("HTTP " + r.status); }
        return r.json();
      })
      .then(function (data) { render(data.papers); })
      .catch(function (err) {
        console.error("[TDF] could not load papers.json:", err);
        render([]);
      });
  }

  load();

  // Re-render labels when the language flips.
  document.addEventListener("tdf:langchange", load);
})();
