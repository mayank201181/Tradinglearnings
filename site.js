/* Trading Learnings — lightbox + search. No external dependencies. */
(function () {
  "use strict";

  /* ---------- lightbox ---------- */
  var items = Array.prototype.slice.call(document.querySelectorAll("[data-full]"));
  if (items.length) {
    var lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML =
      '<button class="lb-btn close" aria-label="Close">✕</button>' +
      '<button class="lb-btn prev" aria-label="Previous">‹</button>' +
      '<img alt="">' +
      '<button class="lb-btn next" aria-label="Next">›</button>' +
      '<div class="lb-cap"></div>';
    document.body.appendChild(lb);
    var img = lb.querySelector("img");
    var cap = lb.querySelector(".lb-cap");
    var idx = 0;

    function show(i) {
      idx = (i + items.length) % items.length;
      img.src = items[idx].getAttribute("data-full");
      cap.textContent = items[idx].getAttribute("data-cap") || "";
      lb.classList.add("open");
      document.body.style.overflow = "hidden";
    }
    function hide() {
      lb.classList.remove("open");
      img.src = "";
      document.body.style.overflow = "";
    }
    items.forEach(function (el, i) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        show(i);
      });
    });
    lb.querySelector(".close").addEventListener("click", hide);
    lb.querySelector(".prev").addEventListener("click", function () { show(idx - 1); });
    lb.querySelector(".next").addEventListener("click", function () { show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) hide(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") hide();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
  }

  /* ---------- search (index page) ---------- */
  var input = document.getElementById("search");
  if (!input) return;
  var resultsEl = document.getElementById("search-results");
  var index = null;

  function load(cb) {
    if (index) return cb();
    fetch("search-index.json")
      .then(function (r) { return r.json(); })
      .then(function (data) { index = data; cb(); })
      .catch(function () { index = []; cb(); });
  }

  function render(hits) {
    if (!hits.length) {
      resultsEl.style.display = "none";
      resultsEl.innerHTML = "";
      return;
    }
    resultsEl.innerHTML = hits
      .slice(0, 12)
      .map(function (h) {
        return (
          '<a href="' + h.u + '"><span class="k">' + h.k + "</span>" +
          h.t + "</a>"
        );
      })
      .join("");
    resultsEl.style.display = "block";
  }

  input.addEventListener("input", function () {
    var q = input.value.trim().toLowerCase();
    if (q.length < 2) { render([]); return; }
    load(function () {
      var terms = q.split(/\s+/);
      var hits = index.filter(function (item) {
        var hay = (item.t + " " + (item.x || "")).toLowerCase();
        return terms.every(function (t) { return hay.indexOf(t) !== -1; });
      });
      render(hits);
    });
  });
  document.addEventListener("click", function (e) {
    if (!resultsEl.contains(e.target) && e.target !== input) render([]);
  });
})();
