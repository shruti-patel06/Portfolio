/* Interactions: navigation, ID badge, project filters and dialog, contact form, back to top. */
(function () {
  "use strict";
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function save(k, v) { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Toast */
  var toastEl = $("#toast"), toastT;
  function toast(msg) { toastEl.textContent = msg; toastEl.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { toastEl.hidden = true; }, 3200); }

  /* Placeholder links in the prototype */
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-ph]");
    if (a) { e.preventDefault(); toast(a.getAttribute("data-ph")); }
  });

  /* Mobile menu */
  var menuBtn = $("#menu-btn"), mmenu = $("#mmenu"), scrim = $("#menu-scrim"), navBar = $(".nav"), menuT;
  function menuOpen() { return menuBtn.getAttribute("aria-expanded") === "true"; }
  function setMenu(open) {
    clearTimeout(menuT);
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.textContent = open ? "Close" : "Menu";
    if (open) {
      /* The bar drops its own blur while open, so the glass panel can blur the page behind it */
      navBar.classList.add("menu-open");
      mmenu.hidden = false; scrim.hidden = false;
      void mmenu.offsetWidth;
      mmenu.classList.add("is-open"); scrim.classList.add("is-open");
    } else {
      mmenu.classList.remove("is-open"); scrim.classList.remove("is-open");
      menuT = setTimeout(function () { mmenu.hidden = true; scrim.hidden = true; navBar.classList.remove("menu-open"); }, reduce ? 0 : 260);
    }
  }
  menuBtn.addEventListener("click", function () { setMenu(!menuOpen()); });
  scrim.addEventListener("click", function () { setMenu(false); });
  $$("#mmenu a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menuOpen()) { setMenu(false); menuBtn.focus(); } });
  var wide = window.matchMedia("(min-width: 881px)");
  function onWide(e) { if (e.matches && menuOpen()) setMenu(false); }
  if (wide.addEventListener) wide.addEventListener("change", onWide); else if (wide.addListener) wide.addListener(onWide);

  /* Work: filters and layout */
  var work = $("#work"), grid = $("#cards"), cards = $$(".card"), chips = $$(".chip"), empty = $("#empty"), live = $("#work-live");
  var filter = "all";
  function applyFilters(announce) {
    var n = 0;
    cards.forEach(function (c) {
      var tags = (c.getAttribute("data-tags") || "").split(" ");
      c.hidden = !(filter === "all" || tags.indexOf(filter) > -1);
      if (!c.hidden) n++;
    });
    /* Wide cards only span two columns in the full, curated list */
    grid.classList.toggle("is-filtered", filter !== "all");
    chips.forEach(function (ch) { ch.setAttribute("aria-pressed", ch.getAttribute("data-filter") === filter ? "true" : "false"); });
    empty.hidden = n > 0;
    if (announce) live.textContent = n + (n === 1 ? " project shown" : " projects shown");
  }
  /* Cards glide to their new places when the filter changes (FLIP) */
  function flip(change) {
    if (!document.documentElement.classList.contains("motion") || !Element.prototype.animate) { change(); return; }
    var before = new Map();
    cards.forEach(function (c) { if (!c.hidden) before.set(c, c.getBoundingClientRect()); });
    change();
    cards.forEach(function (c, i) {
      if (c.hidden) return;
      var now = c.getBoundingClientRect(), was = before.get(c);
      if (was && Math.abs(was.width - now.width) < 4) {
        var dx = was.left - now.left, dy = was.top - now.top;
        if (dx || dy) c.animate([{ transform: "translate(" + dx + "px," + dy + "px)" }, { transform: "none" }], { duration: 520, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" });
      } else {
        c.animate([{ opacity: 0, transform: "translateY(18px) scale(0.97)" }, { opacity: 1, transform: "none" }], { duration: 480, delay: 40 * i, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", fill: "backwards" });
      }
    });
  }
  chips.forEach(function (ch) { ch.addEventListener("click", function () { filter = ch.getAttribute("data-filter"); flip(function () { applyFilters(true); }); }); });
  $("#empty-reset").addEventListener("click", function () { filter = "all"; flip(function () { applyFilters(true); }); });

  var viewBtns = $$(".views button");
  function setView(v) {
    work.classList.toggle("is-list", v === "list");
    viewBtns.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-view") === v ? "true" : "false"); });
    save("sp.view", v);
  }
  viewBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var v = b.getAttribute("data-view");
      if (work.classList.contains("is-list") === (v === "list")) return;
      setView(v);
      if (document.documentElement.classList.contains("motion") && grid.animate) grid.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 420, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" });
    });
  });
  if (load("sp.view") === "list") setView("list");

  /* Case study dialog. Each entry was written from the project's code. */
  var PROJECTS = window.PROJECTS || {};
  var dlg = $("#case"), opener = null, liveA = $("#case-live"), codeA = $("#case-code");
  function openCase(el, btn) {
    var p = PROJECTS[el.getAttribute("data-id")];
    if (!p) return;
    var type = el.querySelector(".card-type");
    $("#case-meta").textContent = p.meta || type.textContent;
    $("#case-title").textContent = p.title;
    $("#case-tldr").textContent = p.tldr;
    var dl = $("#case-dl"); dl.textContent = "";
    p.rows.forEach(function (r, i) {
      var d = document.createElement("div"), dt = document.createElement("dt"), dd = document.createElement("dd");
      d.style.setProperty("--i", i);
      dt.textContent = r[0]; dd.textContent = r[1]; d.appendChild(dt); d.appendChild(dd); dl.appendChild(d);
    });
    var tags = $("#case-tags"); tags.textContent = "";
    $$(".tags li", el).forEach(function (li) { tags.appendChild(li.cloneNode(true)); });
    liveA.hidden = !p.live;
    if (p.live) liveA.href = p.live;
    codeA.href = p.code;
    codeA.classList.toggle("btn-primary", !p.live);
    opener = btn;
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
    dlg.scrollTop = 0;
  }
  $$(".feature").forEach(function (feature) {
    var featureBtn = feature.querySelector(".feature-open"); featureBtn.addEventListener("click", function () { openCase(feature, featureBtn); });
  });
  cards.forEach(function (c) { var b = c.querySelector(".card-open"); b.addEventListener("click", function () { openCase(c, b); }); });
  function closeCase() {
    if (!dlg.open || dlg.classList.contains("is-closing")) return;
    if (reduce || !("onanimationend" in window)) { dlg.close(); return; }
    dlg.classList.add("is-closing");
    dlg.addEventListener("animationend", function done(e) {
      if (e.target !== dlg) return;
      dlg.removeEventListener("animationend", done);
      dlg.classList.remove("is-closing");
      dlg.close();
    });
  }
  $("#case-close").addEventListener("click", closeCase);
  dlg.addEventListener("click", function (e) { if (e.target === dlg) closeCase(); });
  dlg.addEventListener("cancel", function (e) { e.preventDefault(); closeCase(); });
  dlg.addEventListener("close", function () { if (opener) opener.focus(); });

  /* Scroll reveal: sections, cards and lists ease in once as they enter the viewport */
  var motion = document.documentElement.classList.contains("motion");
  if (motion) {
    [["#cards", ".card"], [".facts", "div"], [".xp", "li"], [".elsewhere", "li"], [".highlights", "li"], [".pillars", ".pillar"]].forEach(function (g) {
      $$(g[0]).forEach(function (parent) { $$(g[1], parent).forEach(function (el, i) { if (el.parentNode === parent) { el.setAttribute("data-reveal", ""); el.style.setProperty("--d", Math.min(i, 6)); } }); });
    });
    $$(".sk-group").forEach(function (g, gi) { g.style.setProperty("--d", gi); $$(".sk", g).forEach(function (li, i) { li.style.setProperty("--i", i); }); });
    $$(".learn-list li").forEach(function (li, i) { li.style.setProperty("--i", i); });
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); revealer.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
    $$("[data-reveal], .sec-head, .sk-group, .learning, [data-words]").forEach(function (el) { revealer.observe(el); });
  }
  window.__spReady = true;

  /* Click feedback: a ripple that grows from the pointer */
  if (motion) document.addEventListener("pointerdown", function (e) {
    var b = e.target.closest(".btn, .chip, .views button, .to-top");
    if (!b || e.button !== 0) return;
    var r = b.getBoundingClientRect(), size = Math.max(r.width, r.height) * 2.2, dot = document.createElement("span");
    dot.className = "ripple";
    dot.style.width = dot.style.height = size + "px";
    dot.style.left = (e.clientX - r.left - size / 2) + "px";
    dot.style.top = (e.clientY - r.top - size / 2) + "px";
    b.appendChild(dot);
    dot.addEventListener("animationend", function () { dot.remove(); });
  });

  /* Lanyard badge: drops in, swings like a pendulum, and can be dragged, flicked or tapped */
  (function () {
    var wrap = $("#lanyard");
    if (!wrap) return;
    var pivot = $(".lanyard-pivot", wrap), card = $("#id-card"), hint = $("#lanyard-hint");
    var st = { a: 0, v: 0, y: 0, vy: 0, rx: 0, ry: 0, tx: 0, ty: 0, gx: 22, gy: 0 };
    var raf = 0, last = 0, drag = null;
    var K = 30, C = 2.4, KY = 130, CY = 15;
    function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }
    function render() {
      pivot.style.transform = "translate3d(0," + st.y.toFixed(2) + "px,0) rotate(" + st.a.toFixed(3) + "deg)";
      wrap.style.setProperty("--pull", st.y.toFixed(1) + "px");
      card.style.setProperty("--rx", st.rx.toFixed(2) + "deg");
      card.style.setProperty("--ry", st.ry.toFixed(2) + "deg");
      card.style.setProperty("--gx", st.gx.toFixed(1) + "%");
      card.style.setProperty("--gy", st.gy.toFixed(1) + "%");
    }
    function tick(t) {
      var dt = Math.min(0.034, Math.max(0.001, (t - last) / 1000)); last = t;
      if (!drag) {
        st.v += (-K * st.a - C * st.v) * dt; st.a += st.v * dt;
        st.vy += (-KY * st.y - CY * st.vy) * dt; st.y += st.vy * dt;
      }
      var k = Math.min(1, dt * 9);
      st.rx += (st.tx - st.rx) * k; st.ry += (st.ty - st.ry) * k;
      render();
      if (!drag && Math.abs(st.a) < 0.01 && Math.abs(st.v) < 0.03 && Math.abs(st.y) < 0.05 && Math.abs(st.vy) < 0.05 && Math.abs(st.rx - st.tx) < 0.02 && Math.abs(st.ry - st.ty) < 0.02) {
        st.a = st.v = st.y = st.vy = 0; st.rx = st.tx; st.ry = st.ty; render(); raf = 0; return;
      }
      raf = requestAnimationFrame(tick);
    }
    function wake() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } }
    function shine() { card.classList.remove("is-shine"); void card.offsetWidth; card.classList.add("is-shine"); }
    card.addEventListener("animationend", function (e) { if (e.animationName === "shine") card.classList.remove("is-shine"); });
    if (reduce) return;

    /* Drop in from under the navigation bar, then settle */
    st.y = -64; st.a = 10; render(); wake();
    setTimeout(shine, 700);

    card.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      var r = wrap.getBoundingClientRect();
      drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, t0: performance.now(), a0: st.a, moved: false, hist: [],
               radius: Math.max(150, e.clientY - (r.top + pivot.offsetTop)), type: e.pointerType };
      st.tx = st.ty = 0;
      wrap.classList.add("is-held");
      try { card.setPointerCapture(e.pointerId); } catch (err) {}
      wake();
    });
    card.addEventListener("pointermove", function (e) {
      if (!drag) {
        if (e.pointerType !== "mouse") return;
        var b = card.getBoundingClientRect(), px = (e.clientX - b.left) / b.width, py = (e.clientY - b.top) / b.height;
        st.tx = (0.5 - py) * 10; st.ty = (px - 0.5) * 14; st.gx = px * 100; st.gy = py * 100;
        wake(); return;
      }
      if (e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
      if (!drag.moved && Math.abs(dx) + Math.abs(dy) > 6) drag.moved = true;
      st.a = clamp(drag.a0 - (dx / drag.radius) * 57.3, -42, 42);
      st.y = drag.type === "mouse" ? clamp(dy * 0.35, -14, 64) : 0;
      var now = performance.now();
      drag.hist.push([now, st.a]);
      while (drag.hist.length > 2 && now - drag.hist[0][0] > 90) drag.hist.shift();
    });
    function release(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var h = drag.hist;
      if (drag.moved) {
        if (h.length > 1) { var span = (h[h.length - 1][0] - h[0][0]) / 1000; st.v = span > 0.008 ? clamp((h[h.length - 1][1] - h[0][1]) / span, -480, 480) : 0; }
        if (hint) hint.classList.add("is-done");
      } else if (e.type === "pointerup" && performance.now() - drag.t0 < 450) {
        var b = card.getBoundingClientRect();
        st.v += (e.clientX < b.left + b.width / 2 ? -1 : 1) * 150;
        st.vy += 120;
        shine();
        if (hint) hint.classList.add("is-done");
      }
      drag = null;
      wrap.classList.remove("is-held");
      wake();
    }
    card.addEventListener("pointerup", release);
    card.addEventListener("pointercancel", release);
    card.addEventListener("pointerleave", function () { if (!drag) { st.tx = st.ty = 0; st.gx = 22; st.gy = 0; wake(); } });

    /* Scrolling gives the badge a gentle bounce, as if the page moved under it */
    var lastY = window.scrollY, visible = true;
    if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(wrap);
    window.addEventListener("scroll", function () {
      var y = window.scrollY, d = y - lastY; lastY = y;
      if (!visible || drag) return;
      st.vy += clamp(d * 2.2, -140, 140);
      st.v += clamp(d * 0.25, -18, 18);
      wake();
    }, { passive: true });
  })();

  /* Back to top: a floating button that fills with scroll progress, plus the big one in the footer */
  var toTop = $("#to-top"), prg = $("#to-top .prg"), navEl = $(".nav"), footIn = false, ticking = false;
  function onScroll() {
    ticking = false;
    var doc = document.documentElement, max = doc.scrollHeight - doc.clientHeight, p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    prg.style.strokeDashoffset = (100 - p * 100).toFixed(2);
    toTop.classList.toggle("is-shown", window.scrollY > window.innerHeight * 0.9 && !footIn);
    navEl.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { footIn = en[0].isIntersecting; onScroll(); }).observe($(".foot"));
  onScroll();
  function goTop(e) {
    e.preventDefault();
    var el = e.currentTarget;
    el.classList.remove("is-launch"); void el.offsetWidth; el.classList.add("is-launch");
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    setTimeout(function () { var logo = $(".logo"); if (logo) logo.focus({ preventScroll: true }); }, reduce ? 0 : 700);
  }
  toTop.addEventListener("click", goTop);
  $("#top-link").addEventListener("click", goTop);
  $$("#to-top, #top-link").forEach(function (el) { el.addEventListener("animationend", function () { el.classList.remove("is-launch"); }); });

  /* Contact form: sends through Web3Forms. If the request can't go out, say so and point to the Email link. */
  (function () {
    var form = $("#contact-form");
    if (!form) return;
    var endpoint = form.getAttribute("data-endpoint"), status = $("#cf-status"), send = $("#cf-send"), done = $("#cf-done");
    var fields = { name: $("#cf-name"), email: $("#cf-email"), message: $("#cf-message") };
    var rules = {
      name: function (v) { return v.trim() ? "" : "Enter your name."; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Enter an email address like name@example.com."; },
      message: function (v) { return v.trim().length >= 10 ? "" : "Write a message of at least 10 characters."; }
    };
    function setError(key, msg) {
      var input = fields[key], err = $("#" + input.id + "-err");
      err.textContent = msg; err.hidden = !msg;
      input.setAttribute("aria-invalid", msg ? "true" : "false");
    }
    function setStatus(msg, kind) { status.textContent = msg; status.className = "form-status" + (kind ? " is-" + kind : ""); }
    Object.keys(fields).forEach(function (k) {
      fields[k].addEventListener("input", function () { if (fields[k].getAttribute("aria-invalid") === "true") setError(k, rules[k](fields[k].value)); });
      fields[k].addEventListener("blur", function () { if (fields[k].value) setError(k, rules[k](fields[k].value)); });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var first = null;
      Object.keys(fields).forEach(function (k) { var m = rules[k](fields[k].value); setError(k, m); if (m && !first) first = fields[k]; });
      if (first) { setStatus("Check the highlighted fields.", "error"); first.focus(); return; }
      send.disabled = true; send.classList.add("is-busy"); setStatus("Sending…");
      var ctrl = "AbortController" in window ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 15000);
      var payload = new FormData(form);
      payload.set("subject", "Portfolio: " + (payload.get("topic") || "Message") + " from " + fields.name.value.trim());
      fetch(endpoint, { method: "POST", body: payload, headers: { Accept: "application/json" }, signal: ctrl ? ctrl.signal : undefined })
        .then(function (res) { return res.json().catch(function () { return {}; }).then(function (data) { return { ok: res.ok && data.success !== false, data: data }; }); })
        .then(function (r) {
          if (r.ok) {
            $("#cf-done-name").textContent = fields.name.value.trim().split(/\s+/)[0];
            form.reset(); setStatus("");
            form.hidden = true; done.hidden = false; done.focus();
          } else {
            var tidy = function (m) { m = String(m || "").trim(); m = m.charAt(0).toUpperCase() + m.slice(1); return /[.!?]$/.test(m) ? m : m + "."; };
            var why = tidy((r.data && r.data.message) || "The form service returned an error");
            setStatus(why + " Please try again, or use the Email link instead.", "error");
          }
        })
        .catch(function () { setStatus("Your message couldn't be sent from this page. Please use the Email link instead; what you wrote is still in the form.", "error"); })
        .then(function () { clearTimeout(timer); send.disabled = false; send.classList.remove("is-busy"); });
    });
    $("#cf-again").addEventListener("click", function () { done.hidden = true; form.hidden = false; fields.name.focus(); });
  })();

  /* Highlight the current section in the navigation */
  if ("IntersectionObserver" in window) {
    var navLinks = $$(".links a, #mmenu a"), byId = {};
    navLinks.forEach(function (a) { var id = a.getAttribute("href").slice(1); (byId[id] = byId[id] || []).push(a); });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) { a.removeAttribute("aria-current"); });
        (byId[en.target.id] || []).forEach(function (a) { a.setAttribute("aria-current", "true"); });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    $$("main section[id]").forEach(function (s) { spy.observe(s); });
  }

  applyFilters();
})();
