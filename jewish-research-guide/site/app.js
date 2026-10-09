(function () {
  "use strict";

  var STATUS = {
    reachable: ["HTTP reachable", "s-ok", "Server returned 2xx. Content was not verified."],
    redirected: ["Redirected", "s-warn", "Request was redirected; destination may differ from the original resource."],
    blocked_or_restricted: ["Blocked or restricted", "s-warn", "Server refused automated access (e.g. 401/403/429). May work in a browser."],
    not_found: ["Not found", "s-bad", "Server returned 404/410."],
    network_error: ["Network error", "s-bad", "DNS, TLS, timeout, or connection failure."],
    http_error: ["HTTP error", "s-bad", "Other non-success HTTP response."],
    manual_review: ["Needs manual review", "s-warn", "Automated result was ambiguous."],
    not_http: ["Not an HTTP link", "s-warn", "Not an http/https URL; not rendered as a link."],
    unchecked: ["Unchecked", "", "Not yet checked."]
  };

  var state = { data: [], q: "", cat: "", origin: "", status: "", all: false, view: "table" };
  var $ = function (id) { return document.getElementById(id); };

  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (attrs[k] == null) continue;
      if (k === "class") n.className = attrs[k]; else n.setAttribute(k, attrs[k]);
    }
    (children || []).forEach(function (c) {
      if (c == null || c === "") return;
      n.appendChild(typeof c === "string" || typeof c === "number" ? document.createTextNode(String(c)) : c);
    });
    return n;
  }
  function safeUrl(u) {
    if (typeof u !== "string") return null;
    try { var p = new URL(u.trim()); return (p.protocol === "http:" || p.protocol === "https:") ? p.href : null; }
    catch (e) { return null; }
  }
  function str(v) { return v == null ? "" : String(v); }
  function link(u, text, cls) {
    var s = safeUrl(u);
    if (!s) return el("span", { class: cls }, [text || str(u)]);
    return el("a", { href: s, rel: "noopener noreferrer", target: "_blank", class: cls }, [text || s]);
  }
  function statusTag(s) {
    var m = STATUS[s] || [str(s) || "Unknown", "", ""];
    return el("span", { class: "tag status " + m[1], title: m[2] }, [m[0]]);
  }
  function fmtDate(d) {
    if (!d) return "";
    var t = new Date(d);
    return isNaN(t) ? str(d) : t.toISOString().slice(0, 10);
  }
  function errorBox(msg, retry) {
    var b = el("div", { class: "error", role: "alert" }, [el("p", { style: "margin:0" }, [msg])]);
    if (retry) { var btn = el("button", { type: "button" }, ["Try again"]); btn.addEventListener("click", retry); b.appendChild(btn); }
    return b;
  }
  function fetchJson(path) {
    return fetch(path, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  }

  /* ---------- directory ---------- */
  function fillSelect(sel, values, labeler) {
    var first = sel.options[0]; sel.innerHTML = ""; sel.appendChild(first);
    values.forEach(function (v) { sel.appendChild(el("option", { value: v }, [labeler ? labeler(v) : v])); });
  }
  function uniq(key) {
    var s = {}; state.data.forEach(function (r) { var v = str(r[key]); if (v) s[v] = 1; });
    return Object.keys(s).sort(function (a, b) { return a.localeCompare(b); });
  }

  function filtered() {
    var q = state.q.toLowerCase().trim();
    return state.data.filter(function (r) {
      if (!state.all && r.featured !== true) return false;
      if (state.cat && str(r.category) !== state.cat) return false;
      if (state.origin && str(r.origin) !== state.origin) return false;
      if (state.status && str(r.status) !== state.status) return false;
      if (q) {
        var hay = [r.title, r.description, r.url, r.category, r.caution, r.access, r.origin].map(str).join(" ").toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function provenance(r) {
    var dl = el("dl");
    function row(k, v) { if (v == null || v === "") return; dl.appendChild(el("dt", null, [k])); dl.appendChild(el("dd", null, [v])); }
    row("Origin", str(r.origin));
    if (r.sourceUrl || r.sourceLabel) row("Listed in", link(r.sourceUrl, str(r.sourceLabel) || str(r.sourceUrl)));
    if (Array.isArray(r.sourcePages) && r.sourcePages.length) row("2023 guide pages", r.sourcePages.filter(function (n) { return typeof n === "number"; }).join(", "));
    row("Access", str(r.access));
    row("Link check", statusTag(r.status));
    row("Checked", fmtDate(r.checkedAt));
    if (r.finalUrl && r.finalUrl !== r.url) row("Redirect destination", link(r.finalUrl, r.finalUrl));
    if (r.alternativeUrl) row("Suggested alternative", link(r.alternativeUrl, r.alternativeUrl));
    if (r.repairNote) row("Repair note", str(r.repairNote));
    return el("details", null, [el("summary", null, ["Provenance and link check"]), dl]);
  }

  function card(r) {
    var featured = r.featured === true;
    return el("article", { class: "card" + (featured ? " featured" : "") }, [
      el("div", { class: "meta" }, [
        r.category ? el("span", { class: "tag" }, [str(r.category)]) : null,
        r.origin ? el("span", { class: "tag" }, [str(r.origin)]) : null,
        statusTag(r.status)
      ]),
      el("h3", { dir: "auto" }, [link(r.url, str(r.title) || "Untitled resource")]),
      r.description ? el("p", { class: "desc", dir: "auto" }, [str(r.description)]) : null,
      el("span", { class: "url" }, [str(r.url)]),
      r.caution ? el("p", { class: "caution" }, [el("strong", null, ["Caution: "]), str(r.caution)]) : null,
      provenance(r)
    ]);
  }

  function table(rows) {
    var heads = ["Resource", "Category", "Origin", "Link status", "Notes"];
    var tbody = el("tbody");
    rows.forEach(function (r) {
      var notes = el("div");
      if (r.caution) notes.appendChild(el("p", { class: "caution" }, [str(r.caution)]));
      notes.appendChild(provenance(r));
      tbody.appendChild(el("tr", null, [
        el("td", { "data-label": heads[0], dir: "auto" }, [
          el("strong", null, [link(r.url, str(r.title) || "Untitled resource")]),
          r.description ? el("div", { class: "desc" }, [str(r.description)]) : null,
          el("span", { class: "url" }, [str(r.url)])
        ]),
        el("td", { "data-label": heads[1] }, [str(r.category)]),
        el("td", { "data-label": heads[2] }, [str(r.origin)]),
        el("td", { "data-label": heads[3] }, [statusTag(r.status)]),
        el("td", { "data-label": heads[4] }, [notes])
      ]));
    });
    var thead = el("thead", null, [el("tr", null, heads.map(function (h) { return el("th", { scope: "col" }, [h]); }))]);
    return el("div", { class: "table-wrap" }, [el("table", null, [el("caption", null, ["Resources matching current filters"]), thead, tbody])]);
  }

  function render() {
    var rows = filtered();
    var out = $("results"); out.innerHTML = "";
    var scope = state.all ? "all historical links" : "curated entries";
    $("result-count").textContent = "Showing " + rows.length + " of " + state.data.length + " records (" + scope + ").";
    if (!rows.length) {
      var e = el("div", { class: "empty" }, [el("p", null, ["No resources match these filters."])]);
      if (!state.all) {
        var b = el("button", { type: "button", class: "link-btn" }, ["Include all historical links"]);
        b.addEventListener("click", function () { $("f-all").checked = true; state.all = true; render(); });
        e.appendChild(b);
      }
      out.appendChild(e); return;
    }
    if (state.view === "table") out.appendChild(table(rows));
    else { var g = el("div", { class: "cards" }); rows.forEach(function (r) { g.appendChild(card(r)); }); out.appendChild(g); }
  }

  function loadResources() {
    $("results").innerHTML = '<div class="skeleton"></div><div class="skeleton"></div>';
    $("result-count").textContent = "";
    fetchJson("data/resources.json").then(function (d) {
      if (!Array.isArray(d)) throw new Error("unexpected format");
      state.data = d.filter(function (r) { return r && typeof r === "object"; });
      fillSelect($("f-cat"), uniq("category"));
      fillSelect($("f-origin"), uniq("origin"));
      fillSelect($("f-status"), uniq("status"), function (v) { return (STATUS[v] || [v])[0]; });
      render();
    }).catch(function (err) {
      $("results").innerHTML = "";
      $("results").appendChild(errorBox("The resource data (data/resources.json) could not be loaded: " + err.message + ". No placeholder data is shown.", loadResources));
    });
  }

  /* ---------- audit ---------- */
  function num(v) { return typeof v === "number" && isFinite(v) ? v.toLocaleString("en-US") : null; }
  function loadAudit() {
    var box = $("audit-body"); box.innerHTML = '<div class="skeleton"></div>';
    fetchJson("data/audit-summary.json").then(function (a) {
      if (!a || typeof a !== "object") throw new Error("unexpected format");
      box.innerHTML = "";
      if (a.checkedAt) box.appendChild(el("p", { class: "audit-date" }, ["Last automated check: " + fmtDate(a.checkedAt)]));
      var stats = el("div", { class: "stats" });
      [["total", "Links checked"], ["originalUniqueUrls", "Unique URLs in 2023 guide"], ["pdfPages", "PDF pages"],
       ["annotations", "PDF link annotations"], ["internalLinks", "Internal links"], ["newResources", "2026 additions"]]
        .forEach(function (p) { var v = num(a[p[0]]); if (v != null) stats.appendChild(el("div", { class: "stat" }, [el("b", null, [v]), el("span", null, [p[1]])])); });
      if (a.counts && typeof a.counts === "object") Object.keys(a.counts).forEach(function (k) {
        var v = num(a.counts[k]); if (v == null) return;
        stats.appendChild(el("div", { class: "stat" }, [el("b", null, [v]), el("span", null, [(STATUS[k] || [k])[0]])]));
      });
      box.appendChild(stats.childNodes.length ? stats : el("p", null, ["The audit file contained no numeric results."]));
    }).catch(function (err) {
      box.innerHTML = "";
      box.appendChild(errorBox("The audit summary (data/audit-summary.json) could not be loaded: " + err.message + ".", loadAudit));
    });
  }
  function legend() {
    var dl = $("legend");
    Object.keys(STATUS).forEach(function (k) { dl.appendChild(el("dt", null, [statusTag(k)])); dl.appendChild(el("dd", null, [STATUS[k][2]])); });
  }

  /* ---------- wiring ---------- */
  var t;
  $("q").addEventListener("input", function (e) { clearTimeout(t); var v = e.target.value; t = setTimeout(function () { state.q = v; render(); }, 120); });
  $("f-cat").addEventListener("change", function (e) { state.cat = e.target.value; render(); });
  $("f-origin").addEventListener("change", function (e) { state.origin = e.target.value; render(); });
  $("f-status").addEventListener("change", function (e) { state.status = e.target.value; render(); });
  $("f-all").addEventListener("change", function (e) { state.all = e.target.checked; render(); });
  function setView(v) {
    state.view = v;
    $("v-cards").setAttribute("aria-pressed", String(v === "cards"));
    $("v-table").setAttribute("aria-pressed", String(v === "table"));
    if (state.data.length) render();
  }
  $("v-cards").addEventListener("click", function () { setView("cards"); });
  $("v-table").addEventListener("click", function () { setView("table"); });
  $("reset").addEventListener("click", function () {
    clearTimeout(t);
    $("controls").reset(); state.q = state.cat = state.origin = state.status = ""; state.all = false; render();
  });

  legend();
  setView("table");
  loadResources();
  loadAudit();
})();
