// Interakcje strony. Działa na treści wyrenderowanej przez serwer albo (tryb lokalny) przez przeglądarkę.
import { normalize, renderApp } from "./render.js";

const LOCAL_KEY = "hp-cms-local";
const reduce = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const fmt = (n) => Math.round(n).toLocaleString("pl-PL");
let cleanups = [];

/* ---------- tryb lokalny (bez bazy): treść zapisana w tej przeglądarce ---------- */
function applyLocal() {
  if (document.documentElement.dataset.db === "1") return; // serwer z bazą – treść już jest w HTML
  let raw = null;
  try { raw = JSON.parse(localStorage.getItem(LOCAL_KEY) || "null"); } catch (e) {}
  if (!raw) return;
  const state = normalize(raw);
  document.getElementById("app").innerHTML = renderApp(state);
  document.title = state.settings.seoTitle;
}

/* ---------- efekt otwarcia ---------- */
function intro() {
  const d = document.documentElement;
  if (!d.classList.contains("hp-intro")) return;
  const done = () => d.classList.add("hp-intro-done");
  const skip = () => { d.classList.add("skip-anim"); done(); };
  const c = document.querySelector(".curtain");
  if (!c) { d.classList.remove("hp-intro"); return; }
  c.addEventListener("click", skip, { once: true });
  window.addEventListener("keydown", skip, { once: true });
  setTimeout(done, 2700);
}

/* ---------- menu mobilne ---------- */
function menu() {
  const b = document.querySelector(".burger"), m = document.getElementById("mnav");
  if (!b || !m) return;
  const set = (open) => {
    b.setAttribute("aria-expanded", String(open));
    m.classList.toggle("open", open);
    document.body.classList.toggle("menu-open", open);
    b.querySelector(".sr").textContent = open ? "Zamknij menu" : "Menu";
  };
  b.addEventListener("click", () => set(b.getAttribute("aria-expanded") !== "true"));
  $$("a", m).forEach((a) => a.addEventListener("click", () => set(false)));
  const esc = (e) => { if (e.key === "Escape" && m.classList.contains("open")) { set(false); b.focus(); } };
  document.addEventListener("keydown", esc);
  const mq = matchMedia("(min-width: 1101px)");
  const onMq = () => mq.matches && set(false);
  mq.addEventListener ? mq.addEventListener("change", onMq) : mq.addListener(onMq);
  cleanups.push(() => document.removeEventListener("keydown", esc));
}

/* ---------- pojawianie, oś czasu, licznik, aktywne menu, pasek mobilny ---------- */
function observers() {
  const els = $$(".reveal, .tl-i");
  if (!("IntersectionObserver" in window) || reduce()) { els.forEach((e) => e.classList.add("in")); }
  else {
    const io = new IntersectionObserver((ents) => ents.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    }), { rootMargin: "0px 0px -10% 0px" });
    els.forEach((e) => io.observe(e));
    cleanups.push(() => io.disconnect());
  }

  // postęp linii osi czasu
  const tls = $$(".tl");
  if (tls.length) {
    let tick = false;
    const upd = () => {
      tick = false;
      const vh = innerHeight;
      tls.forEach((t) => {
        const r = t.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (vh * 0.62 - r.top) / r.height));
        t.style.setProperty("--prog", reduce() ? 1 : p.toFixed(3));
      });
    };
    const on = () => { if (!tick) { tick = true; requestAnimationFrame(upd); } };
    addEventListener("scroll", on, { passive: true }); addEventListener("resize", on);
    upd();
    cleanups.push(() => { removeEventListener("scroll", on); removeEventListener("resize", on); });
  }

  // licznik dużej liczby (np. 1993)
  $$(".countup").forEach((el) => {
    const to = parseInt(el.dataset.to, 10);
    if (!Number.isFinite(to) || String(to) !== el.dataset.to.trim() || reduce() || !("IntersectionObserver" in window)) return;
    const from = to > 1900 ? to - 70 : 0;
    el.textContent = from;
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now(), dur = 1700;
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
        el.textContent = Math.round(from + (to - from) * e);
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.6 });
    io.observe(el);
    cleanups.push(() => io.disconnect());
  });

  // aktywna pozycja menu
  const links = $$('.top nav a[href^="#"], .mnav a[href^="#"]');
  if (links.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((ents) => ents.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => a.getAttribute("href") === "#" + en.target.id ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current"));
    }), { rootMargin: "-45% 0px -50% 0px" });
    $$("main section[id]").forEach((s) => io.observe(s));
    cleanups.push(() => io.disconnect());
  }

  // pasek „Zadzwoń / Sklep” po przewinięciu ekranu powitalnego
  const bar = document.querySelector(".mbar"), hero = document.querySelector(".hero");
  if (bar) {
    if (!hero || !("IntersectionObserver" in window)) bar.classList.add("show");
    else {
      const io = new IntersectionObserver(([en]) => bar.classList.toggle("show", !en.isIntersecting), { rootMargin: "-40% 0px 0px 0px" });
      io.observe(hero);
      cleanups.push(() => io.disconnect());
    }
  }
}

/* ---------- kalkulator ---------- */
function calculators() {
  $$(".calc").forEach((c) => {
    const r = c.querySelector("input[type=range]"), out = c.querySelector("output");
    const bottle = parseFloat(c.dataset.bottle) || 12;
    const upd = () => {
      const m = +r.value;
      out.textContent = fmt(m) + " zł";
      c.querySelector('[data-r="1"]').textContent = fmt(m * 12) + " zł";
      c.querySelector('[data-r="5"]').textContent = fmt(m * 60) + " zł";
      c.querySelector('[data-r="b"]').textContent = "≈ " + fmt((m * 60) / bottle);
      r.style.setProperty("--fill", ((m - r.min) / (r.max - r.min)) * 100 + "%");
    };
    r.addEventListener("input", upd); upd();
  });
}

/* ---------- dobór produktów ---------- */
function quizzes() {
  $$(".quiz").forEach((q) => {
    const opts = $$(".opt", q), res = $$(".result", q);
    opts.forEach((b) => b.addEventListener("click", () => {
      opts.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      res.forEach((r) => (r.hidden = r.dataset.i !== b.dataset.i));
      const shown = res.find((r) => !r.hidden);
      if (shown && shown.getBoundingClientRect().bottom > innerHeight) shown.scrollIntoView({ behavior: reduce() ? "auto" : "smooth", block: "nearest" });
    }));
  });
}

/* ---------- formularz kontaktowy ---------- */
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
function forms() {
  $$(".cform").forEach((f) => {
    const t0 = Date.now();
    const mode = f.dataset.mode, to = f.dataset.email;
    const note = f.querySelector(".f-note"), btn = f.querySelector("button[type=submit]");
    const field = (n) => f.elements[n];
    const rules = {
      name: (v) => (v.trim().length < 2 ? "Podaj imię (min. 2 znaki)." : /\d/.test(v) ? "Imię nie powinno zawierać cyfr." : ""),
      phone: (v) => {
        if (!v.trim()) return "";
        if (/[^\d\s+()-]/.test(v)) return "Numer może zawierać tylko cyfry.";
        const d = v.replace(/\D/g, "").replace(/^48(?=\d{9}$)/, "");
        return d.length === 9 || (v.trim().startsWith("+") && d.length >= 9 && d.length <= 15) ? "" : "Podaj 9-cyfrowy numer, np. 510 085 688.";
      },
      email: (v) => (!v.trim() ? (mode === "formsubmit" ? "Podaj e-mail, żebym mógł odpowiedzieć." : "") : RE_EMAIL.test(v.trim()) ? "" : "Sprawdź adres e-mail."),
      msg: (v) => (v.trim().length < 10 ? "Napisz kilka słów (min. 10 znaków)." : "")
    };
    const check = (n) => {
      const el = field(n); if (!el) return true;
      const e = rules[n](el.value);
      el.setAttribute("aria-invalid", e ? "true" : "false");
      const box = el.parentElement.querySelector(".err"); if (box) box.textContent = e;
      return !e;
    };
    Object.keys(rules).forEach((n) => {
      const el = field(n); if (!el) return;
      el.addEventListener("blur", () => el.value && check(n));
      el.addEventListener("input", () => el.getAttribute("aria-invalid") === "true" && check(n));
    });
    const okBox = f.querySelector(".err-ok");
    field("ok").addEventListener("change", () => field("ok").checked && (okBox.textContent = ""));

    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      let first = null;
      Object.keys(rules).forEach((n) => { if (!check(n) && !first) first = field(n); });
      if (!field("ok").checked) { okBox.textContent = "Zaznacz zgodę na kontakt."; first = first || field("ok"); }
      if (first) { first.focus(); note.textContent = "Popraw zaznaczone pola."; return; }
      if (field("website").value || Date.now() - t0 < 2500) { note.textContent = "Dziękuję! Wiadomość wysłana."; f.reset(); return; } // antyspam
      const data = { name: field("name").value.trim(), phone: field("phone").value.trim(), email: field("email").value.trim(), topic: field("topic") ? field("topic").value : "Wiadomość", msg: field("msg").value.trim() };
      if (mode === "formsubmit") {
        btn.disabled = true; note.textContent = "Wysyłam…";
        try {
          const r = await fetch("https://formsubmit.co/ajax/" + encodeURIComponent(to), {
            method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ Imię: data.name, Telefon: data.phone, "E-mail": data.email, Temat: data.topic, Wiadomość: data.msg, _subject: data.topic + " – strona www", _replyto: data.email, _template: "table", _captcha: "false" })
          });
          if (!r.ok) throw new Error(r.status);
          note.innerHTML = '<span class="ok">Dziękuję! Wiadomość wysłana – odezwę się wkrótce.</span>'; f.reset();
        } catch (err) {
          note.innerHTML = 'Nie udało się wysłać. Zadzwoń lub napisz na <a href="mailto:' + to + '">' + to + "</a>.";
        } finally { btn.disabled = false; }
      } else {
        const body = `${data.msg}\n\n—\n${data.name}${data.phone ? "\nTel.: " + data.phone : ""}${data.email ? "\nE-mail: " + data.email : ""}`;
        location.href = `mailto:${to}?subject=${encodeURIComponent(data.topic + " – strona www")}&body=${encodeURIComponent(body)}`;
        note.textContent = "Otwieram program pocztowy…";
      }
    });
  });
}

/* ---------- przejścia do sekcji ---------- */
let busy = false;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
function targetY(el) {
  if (el.classList.contains("hero") || el.id === "tresc") return 0;
  const head = document.querySelector(".top"), hh = head ? head.offsetHeight : 0;
  const pad = parseFloat(getComputedStyle(el).paddingTop) || 0;
  const y = el.getBoundingClientRect().top + scrollY + pad - hh - (innerWidth < 760 ? 16 : 26);
  return Math.max(0, Math.min(y, document.documentElement.scrollHeight - innerHeight));
}
function arrive(el) {
  el.classList.remove("arrive"); void el.offsetWidth; el.classList.add("arrive");
  $$(".reveal, .tl-i", el).forEach((x) => x.classList.add("in"));
  setTimeout(() => el.classList.remove("arrive"), 1600);
  const h = el.querySelector("h2, h1");
  if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
}
function glide(to) {
  return new Promise((res) => {
    const from = scrollY, dist = to - from, head = document.querySelector(".top");
    const dur = Math.min(1300, Math.max(550, Math.abs(dist) * 0.45));
    const t0 = performance.now();
    let stop = false;
    const cancel = () => { stop = true; };
    addEventListener("wheel", cancel, { passive: true, once: true }); addEventListener("touchstart", cancel, { passive: true, once: true });
    head && head.classList.add("gliding");
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      if (!stop) scrollTo(0, from + dist * ease(k));
      head && head.style.setProperty("--glide", k.toFixed(3));
      if (k < 1 && !stop) requestAnimationFrame(step);
      else { removeEventListener("wheel", cancel); removeEventListener("touchstart", cancel); setTimeout(() => { head && head.classList.remove("gliding"); head && head.style.removeProperty("--glide"); }, 250); res(); }
    };
    requestAnimationFrame(step);
  });
}
async function goTo(el, mode, pt) {
  if (busy) return;
  busy = true;
  try {
    if (reduce() || mode === "none" || !document.body.animate) { scrollTo(0, targetY(el)); arrive(el); return; }
    if (mode === "glide") { await glide(targetY(el)); arrive(el); return; }
    const mono = document.querySelector(".mono b"), role = document.querySelector(".mono span");
    const ov = document.createElement("div");
    ov.className = "navfx navfx-" + mode; ov.setAttribute("aria-hidden", "true");
    const m = document.createElement("span"), sm = document.createElement("small");
    m.className = "m"; m.textContent = mono ? mono.textContent : "";
    sm.textContent = (el.querySelector(".kicker") || el.querySelector("h2") || {}).textContent || (role ? role.textContent : "");
    m.append(sm); ov.append(m);
    document.body.append(ov);
    const W = innerWidth, H = innerHeight, opt = { easing: "cubic-bezier(.7,0,.3,1)", fill: "forwards" };
    if (mode === "curtain") {
      await ov.animate([{ transform: "translateY(100%)" }, { transform: "translateY(0)" }], Object.assign({ duration: 460 }, opt)).finished;
      scrollTo(0, targetY(el)); arrive(el);
      await new Promise((r) => setTimeout(r, 160));
      await ov.animate([{ transform: "translateY(0)" }, { transform: "translateY(-100%)" }], Object.assign({ duration: 560 }, opt)).finished;
    } else {
      const x = pt && pt.x ? pt.x : W / 2, y = pt && pt.y ? pt.y : H / 2;
      const r = Math.hypot(Math.max(x, W - x), Math.max(y, H - y)) + 20;
      await ov.animate([{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${r}px at ${x}px ${y}px)` }], Object.assign({ duration: 560 }, opt)).finished;
      scrollTo(0, targetY(el)); arrive(el);
      await new Promise((r2) => setTimeout(r2, 140));
      const cx = W / 2, cy = H * 0.45, R = Math.hypot(W, H);
      await ov.animate([{ clipPath: `circle(${R}px at ${cx}px ${cy}px)` }, { clipPath: `circle(0px at ${cx}px ${cy}px)` }], Object.assign({ duration: 620 }, opt)).finished;
    }
    ov.remove();
  } finally {
    busy = false;
    if (history.replaceState) history.replaceState(null, "", "#" + el.id);
  }
}
function navigation() {
  const onClick = (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey || a.classList.contains("skip")) return;
    const id = decodeURIComponent(a.getAttribute("href").slice(1));
    const el = id && document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const head = document.querySelector(".top");
    const pt = e.clientX || e.clientY ? { x: e.clientX, y: e.clientY } : null;
    goTo(el, (head && head.dataset.fx) || "iris", pt);
  };
  document.addEventListener("click", onClick);
  cleanups.push(() => document.removeEventListener("click", onClick));
}

export function init() {
  cleanups.forEach((f) => f()); cleanups = [];
  menu(); navigation(); observers(); calculators(); quizzes(); forms();
  $$(".year").forEach((y) => (y.textContent = new Date().getFullYear()));
}

applyLocal();
intro();
init();
window.__hpInit = init;
