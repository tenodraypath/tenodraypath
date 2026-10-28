// Panel administracyjny strony Huberta Paszkiewicza.
import { defaultContent, DEFAULT_SECTIONS } from "/js/defaults.js";
import { TYPES, COMMON_FIELDS, SETTINGS_FIELDS, ICONS } from "/js/schema.js";
import { normalize, renderSection, renderApp, slug, safeImg } from "/js/render.js";

const TK = "hp-admin-token", LOCAL = "hp-cms-local", LAUTH = "hp-cms-local-auth", LOK = "hp-local-ok", DRAFT = "hp-cms-draft";
const DEF_USER = "admin", DEF_PASS = "hubert2026";
const DEV = { desktop: 1280, tablet: 820, phone: 390 };
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clone = (o) => JSON.parse(JSON.stringify(o));

const S = {
  mode: null, localReason: "", token: sessionStorage.getItem(TK), user: DEF_USER, isDefault: false,
  remote: null, rev: null, content: null, saved: "", dirty: false,
  view: "sections", sel: null, pmode: "section", device: "desktop", started: false
};

/* ---------- DOM ---------- */
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
    else if (k === "value") el.value = v;
    else if (k === "checked") el.checked = !!v;
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
  return el;
}
const ICO = {
  grip: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  off: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6C3.9 8.4 2 12 2 12s3.6 7 10 7a9.6 9.6 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>',
  up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 15 6-6 6 6"/></svg>',
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg>'
};
const ib = (icon, label, onclick, extra = {}) => { const b = h("button", Object.assign({ type: "button", class: "ib", "aria-label": label, title: label, onclick }, extra)); b.innerHTML = ICO[icon]; return b; };

function toast(msg, kind = "") {
  const t = h("div", { class: "toast " + kind }, msg);
  $("#toasts").append(t);
  setTimeout(() => t.remove(), kind === "err" ? 6000 : 3500);
}
let lastFocus = null;
function modal(title, body, actions = []) {
  lastFocus = document.activeElement;
  const box = $("#modal-body");
  box.replaceChildren(h("h2", { id: "modal-h" }, title), body,
    h("div", { class: "modal-acts" }, actions.map((a) => h("button", { type: "button", class: "b " + (a.cls || ""), onclick: () => { if (a.fn && a.fn() === false) return; closeModal(); } }, a.label))));
  $("#modal").hidden = false;
  const f = box.querySelector(".tcard,button.b-pri,button.b-danger,button"); f && f.focus();
}
function closeModal() { $("#modal").hidden = true; lastFocus && lastFocus.focus && lastFocus.focus(); }
const confirmBox = (title, text, label, fn, cls = "b-pri") => modal(title, h("p", null, text), [{ label: "Anuluj" }, { label, cls, fn }]);

/* ---------- API ---------- */
async function api(path, opts = {}) {
  const headers = Object.assign({}, opts.headers);
  if (S.token) headers.Authorization = "Bearer " + S.token;
  let body = opts.body;
  if (opts.json !== undefined) { headers["Content-Type"] = "application/json"; body = JSON.stringify(opts.json); }
  let r;
  try { r = await fetch(path, { method: opts.method || "GET", headers, body, cache: "no-store" }); }
  catch (e) { toast("Brak połączenia z serwerem.", "err"); return { ok: false, status: 0, data: null }; }
  let data = null;
  try { data = await r.json(); } catch (e) {}
  if (r.status === 401 && path !== "/api/login") expired();
  return { ok: r.ok, status: r.status, data };
}

async function detect() {
  try {
    const r = await fetch("/api/content", { cache: "no-store" });
    const ct = r.headers.get("content-type") || "";
    if (r.ok && ct.includes("json")) { const d = await r.json(); S.mode = "server"; S.remote = d.content; S.rev = d.rev; return; }
    if (r.status === 503) { S.mode = "local"; S.localReason = "db"; return; }
  } catch (e) {}
  S.mode = "local"; S.localReason = "static";
}

/* ---------- logowanie ---------- */
async function sha(s) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(b)).map((x) => x.toString(16).padStart(2, "0")).join("");
}
async function localCheck(user, pass) {
  const a = JSON.parse(localStorage.getItem(LAUTH) || "null");
  if (!a) return user === DEF_USER && pass === DEF_PASS;
  return user === a.user && (await sha(a.salt + pass)) === a.hash;
}
function showLogin(msg = "") {
  $("#login").hidden = false;
  $("#login-mode").textContent = S.mode === "local"
    ? (S.localReason === "db" ? "Baza na serwerze nie jest podłączona – tryb lokalny: zmiany zapiszą się tylko w tej przeglądarce."
      : "Tryb lokalny (strona uruchomiona bez serwera Cloudflare): zmiany zapiszą się tylko w tej przeglądarce.") : "";
  $("#login-err").textContent = msg;
  setTimeout(() => ($("#lg-user").value ? $("#lg-pass") : $("#lg-user")).focus(), 50);
}
function expired() {
  if (!S.started) return;
  S.token = null; sessionStorage.removeItem(TK);
  showLogin("Sesja wygasła – zaloguj się ponownie. Twoje zmiany są zachowane.");
}
$("#login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = $("#lg-user").value.trim(), pass = $("#lg-pass").value;
  const btn = e.submitter || $("#login-form button[type=submit]");
  btn.disabled = true; $("#login-err").textContent = "";
  try {
    if (S.mode === "server") {
      const r = await api("/api/login", { method: "POST", json: { user, pass } });
      if (!r.ok) { $("#login-err").textContent = (r.data && r.data.message) || "Nie udało się zalogować."; return; }
      S.token = r.data.token; sessionStorage.setItem(TK, S.token); S.user = r.data.user; S.isDefault = r.data.isDefault;
    } else {
      if (!(await localCheck(user, pass))) { $("#login-err").textContent = "Nieprawidłowy login lub hasło."; return; }
      sessionStorage.setItem(LOK, "1"); S.user = user; S.isDefault = !localStorage.getItem(LAUTH);
    }
    $("#lg-pass").value = "";
    $("#login").hidden = true;
    if (S.started) { toast("Zalogowano ponownie."); notices(); } else start();
  } finally { btn.disabled = false; }
});
$$("[data-toggle-pass]").forEach((b) => b.addEventListener("click", () => {
  const i = document.getElementById(b.dataset.togglePass); const show = i.type === "password";
  i.type = show ? "text" : "password"; b.textContent = show ? "Ukryj" : "Pokaż";
}));

/* ---------- start ---------- */
async function boot() {
  await detect();
  if (S.mode === "server" && S.token) {
    const r = await api("/api/me");
    if (r.ok) { S.user = r.data.user; S.isDefault = r.data.isDefault; return start(); }
    S.token = null; sessionStorage.removeItem(TK);
  }
  if (S.mode === "local" && sessionStorage.getItem(LOK)) { S.isDefault = !localStorage.getItem(LAUTH); return start(); }
  showLogin();
}

function start() {
  let raw = S.remote;
  if (S.mode === "local") { try { raw = JSON.parse(localStorage.getItem(LOCAL) || "null"); } catch (e) { raw = null; } }
  S.content = normalize(raw || defaultContent());
  S.saved = JSON.stringify(S.content);
  S.sel = (S.content.sections[0] || {}).id || null;
  S.started = true;
  $("#app").hidden = false;
  const mb = $("#mode-badge");
  mb.replaceChildren(S.mode === "server" ? "Serwer" : "Tryb lokalny", h("span", { class: "long" }, S.mode === "server" ? " · zmiany widzą wszyscy" : " · tylko ta przeglądarka"));
  if (matchMedia("(max-width: 820px)").matches) S.device = "phone";
  else if (matchMedia("(max-width: 1280px)").matches) S.device = "tablet";
  $$("[data-device]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.device === S.device)));
  mb.classList.toggle("local", S.mode === "local");
  bindOnce();
  const ping = () => { if (!pvReady && pv.contentWindow) pv.contentWindow.postMessage({ type: "ping" }, location.origin); };
  pv.addEventListener("load", ping); [100, 500, 1500, 4000].forEach((t) => setTimeout(ping, t));
  notices();
  draftCheck();
  renderAll();
}

function notices() {
  const n = $("#notice"); n.replaceChildren(); n.classList.remove("err");
  const parts = [];
  if (S.mode === "local") parts.push(h("span", null, S.localReason === "db"
    ? "Baza KV „CMS” nie jest podłączona w Cloudflare – zmiany zapisują się tylko w tej przeglądarce. Instrukcja jest w pliku README."
    : "Tryb lokalny – zmiany widać tylko w tej przeglądarce. Po wdrożeniu na Cloudflare z bazą KV zapis trafi na serwer."));
  if (S.isDefault) parts.push(h("span", null, h("b", null, "Używasz hasła startowego. "), "Zmień je, zanim udostępnisz panel komukolwiek."),
    h("button", { type: "button", class: "b", onclick: () => setView("password") }, "Zmień hasło"));
  if (!parts.length) { n.hidden = true; return; }
  n.append(...parts); n.hidden = false;
}

function draftCheck() {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(DRAFT) || "null"); } catch (e) {}
  if (!d || !d.content) return;
  const dc = normalize(d.content);
  if (JSON.stringify(dc) === S.saved) { localStorage.removeItem(DRAFT); return; }
  const when = new Date(d.at).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" });
  const n = $("#notice");
  n.hidden = false;
  n.append(h("span", null, `Masz niezapisane zmiany z ${when}.`),
    h("button", { type: "button", class: "b", onclick: () => { S.content = dc; changed({ list: true, editor: true }); notices(); toast("Przywrócono szkic – kliknij Zapisz, aby go opublikować."); } }, "Przywróć"),
    h("button", { type: "button", class: "b", onclick: () => { localStorage.removeItem(DRAFT); notices(); } }, "Odrzuć"));
}

/* ---------- zmiany i zapis ---------- */
let tDraft = 0, tPrev = 0;
function changed(o = {}) {
  S.dirty = JSON.stringify(S.content) !== S.saved;
  $("#dirty").hidden = !S.dirty;
  $("#save").disabled = !S.dirty;
  if (o.list) renderSide();
  if (o.editor) renderEditor();
  clearTimeout(tPrev); tPrev = setTimeout(() => sendPreview(!!o.scroll), o.now ? 0 : 220);
  clearTimeout(tDraft); tDraft = setTimeout(() => {
    try { S.dirty ? localStorage.setItem(DRAFT, JSON.stringify({ at: Date.now(), baseRev: S.rev, content: S.content })) : localStorage.removeItem(DRAFT); } catch (e) {}
  }, 800);
}
function markSaved() { S.saved = JSON.stringify(S.content); try { localStorage.removeItem(DRAFT); } catch (e) {} changed(); }

async function save(force = false) {
  if (!S.dirty && !force) return;
  const btn = $("#save"); btn.disabled = true; btn.textContent = "Zapisuję…";
  try {
    if (S.mode === "server") {
      const r = await api("/api/content", { method: "PUT", json: { content: S.content, baseRev: S.rev, force } });
      if (r.ok) { S.rev = r.data.rev; S.content.rev = r.data.rev; markSaved(); toast("Zapisano. Zmiany są już widoczne na stronie.", "ok"); }
      else if (r.status === 409) confirmBox("Ktoś zapisał zmiany w międzyczasie", "Na innym urządzeniu zapisano nowszą wersję strony. Zapisać Twoją wersję i nadpisać tamtą? (Poprzednia wersja trafi do zakładki Kopie.)", "Nadpisz i zapisz", () => { save(true); });
      else if (r.status !== 401) toast((r.data && r.data.message) || "Nie udało się zapisać.", "err");
    } else {
      try { localStorage.setItem(LOCAL, JSON.stringify(S.content)); markSaved(); toast("Zapisano w tej przeglądarce.", "ok"); }
      catch (e) { toast("Brak miejsca w przeglądarce – usuń lub zmniejsz zdjęcia.", "err"); }
    }
  } finally { btn.textContent = "Zapisz"; btn.disabled = !S.dirty; }
}

/* ---------- widoki ---------- */
function setView(v) {
  S.view = v;
  $$(".tabs button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.view === v)));
  if (v !== "sections") setPane("edit");
  renderAll();
}
function setPane(p) {
  document.body.dataset.pane = p;
  $$(".panes button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.pane === p)));
  if (p === "preview") requestAnimationFrame(fit);
}
function renderAll() { renderSide(); renderEditor(); sendPreview(true); }

const find = (id) => S.content.sections.find((s) => s.id === id);
const secName = (s) => s.menuLabel || s.title || (TYPES[s.type] || {}).label || s.id;

function renderSide() {
  const box = $("#side-body");
  if (S.view !== "sections") {
    const info = { settings: "Dane kontaktowe, adres sklepu, opis w Google i stopka – zmiany widać na całej stronie.", password: "Zmiana hasła do panelu. Po zmianie inne urządzenia zostaną wylogowane.", backup: "Pobieranie i wczytywanie kopii strony oraz historia zapisów z serwera." }[S.view];
    box.replaceChildren(h("p", { class: "side-help" }, info), h("button", { type: "button", class: "b b-wide", onclick: () => setView("sections") }, "← Wróć do sekcji"));
    return;
  }
  const ul = h("ul", { class: "slist", "aria-label": "Sekcje strony – przeciągnij, aby zmienić kolejność" });
  const secs = S.content.sections;
  secs.forEach((s, i) => {
    const T = TYPES[s.type] || {};
    const hd = h("span", { class: "hd", title: "Przeciągnij, aby zmienić kolejność", "aria-hidden": "true" }); hd.innerHTML = ICO.grip;
    const li = h("li", { class: "si" + (s.id === S.sel ? " sel" : "") + (s.visible ? "" : " off"), "data-id": s.id, tabindex: "0", role: "button", "aria-pressed": String(s.id === S.sel),
      "aria-label": `${secName(s)} – ${T.label}${s.visible ? "" : ", ukryta"}. Alt+strzałki zmieniają kolejność.` },
      hd,
      h("span", { class: "si-t" }, h("b", null, secName(s), s.visible ? null : h("span", { class: "tag" }, "ukryta")), h("small", null, T.label + (s.inMenu ? " · w menu" : ""))),
      h("span", { class: "si-a" },
        ib(s.visible ? "eye" : "off", s.visible ? "Ukryj sekcję" : "Pokaż sekcję", (e) => { e.stopPropagation(); s.visible = !s.visible; changed({ list: true, editor: s.id === S.sel }); }),
        ib("up", "Przesuń wyżej", (e) => { e.stopPropagation(); move(i, -1); }, { disabled: i === 0 }),
        ib("down", "Przesuń niżej", (e) => { e.stopPropagation(); move(i, 1); }, { disabled: i === secs.length - 1 })));
    li.addEventListener("click", () => select(s.id));
    li.addEventListener("keydown", (e) => {
      if (e.target !== li) return;
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(s.id); }
      if (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) { e.preventDefault(); move(i, e.key === "ArrowUp" ? -1 : 1, true); }
    });
    ul.append(li);
  });
  sortable(ul);
  box.replaceChildren(ul,
    h("button", { type: "button", class: "b b-pri b-wide", onclick: addSection }, "+ Dodaj sekcję"),
    h("p", { class: "side-help" }, "Przeciągnij sekcję za uchwyt albo użyj strzałek, żeby zmienić kolejność na stronie. Oko ukrywa sekcję bez usuwania."));
}

function move(i, d, keepFocus) {
  const a = S.content.sections, j = i + d;
  if (j < 0 || j >= a.length) return;
  [a[i], a[j]] = [a[j], a[i]];
  const id = a[j].id;
  changed({ list: true, scroll: true });
  if (keepFocus) { const li = $(`.si[data-id="${CSS.escape(id)}"]`); li && li.focus(); }
}

function sortable(ul) {
  ul.addEventListener("pointerdown", (e) => {
    const hd = e.target.closest(".hd"); if (!hd || e.button > 0) return;
    e.preventDefault();
    const li = hd.closest(".si"), scroller = $("#side-body");
    li.classList.add("drag");
    let raf = 0, y = e.clientY;
    const place = () => {
      const sibs = Array.from(ul.children).filter((x) => x !== li);
      const next = sibs.find((s) => { const r = s.getBoundingClientRect(); return y < r.top + r.height / 2; });
      if (next) { if (li.nextElementSibling !== next) ul.insertBefore(li, next); }
      else if (ul.lastElementChild !== li) ul.append(li);
      const r = scroller.getBoundingClientRect();
      if (y < r.top + 40) scroller.scrollTop -= 12; else if (y > r.bottom - 40) scroller.scrollTop += 12;
      raf = 0;
    };
    const mv = (ev) => { y = ev.clientY; if (!raf) raf = requestAnimationFrame(place); };
    const up = () => {
      if (raf) { cancelAnimationFrame(raf); place(); }
      removeEventListener("pointermove", mv); removeEventListener("pointerup", up); removeEventListener("pointercancel", up);
      li.classList.remove("drag");
      const order = Array.from(ul.children).map((x) => x.dataset.id);
      const before = S.content.sections.map((s) => s.id).join();
      if (order.join() !== before) {
        S.content.sections.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
        changed({ list: true, scroll: true });
        toast("Zmieniono kolejność sekcji.");
      } else renderSide();
    };
    addEventListener("pointermove", mv); addEventListener("pointerup", up); addEventListener("pointercancel", up);
  });
}

function select(id) {
  S.sel = id;
  if (S.view !== "sections") S.view = "sections";
  renderSide(); renderEditor(); sendPreview(true);
  if (matchMedia("(max-width: 820px)").matches) setPane("edit");
  $("#editor").scrollTop = 0;
}

function uniqueId(base, except) {
  let id = slug(base), n = 2;
  while (S.content.sections.some((s) => s.id === id && s !== except)) id = slug(base) + "-" + n++;
  return id;
}

function addSection() {
  const grid = h("div", { class: "typegrid" });
  Object.entries(TYPES).forEach(([type, T]) => {
    const exists = T.single && S.content.sections.some((s) => s.type === type);
    grid.append(h("button", { type: "button", class: "tcard", disabled: exists, title: exists ? "Ta sekcja może wystąpić tylko raz" : null, onclick: () => {
      const s = Object.assign({ id: uniqueId(T.label), type, visible: true, inMenu: false, menuLabel: T.label, theme: type === "cta" ? "dark" : "light" }, T.template());
      const at = S.content.sections.findIndex((x) => x.id === S.sel);
      S.content.sections.splice(at < 0 ? S.content.sections.length : at + 1, 0, s);
      closeModal(); S.sel = s.id; changed({ list: true, editor: true, scroll: true });
      toast(`Dodano sekcję „${T.label}”.`);
    } }, h("b", null, T.label), h("span", null, exists ? "Już jest na stronie" : T.desc)));
  });
  modal("Dodaj sekcję", h("div", null, h("p", null, "Wybierz rodzaj sekcji. Pojawi się pod aktualnie zaznaczoną."), grid), [{ label: "Anuluj" }]);
}

/* ---------- pola formularza ---------- */
function field(obj, f, after) {
  const id = "f" + Math.random().toString(36).slice(2, 9);
  const set = (v) => { obj[f.k] = v; after && after(v); changed({ list: f.k === "title" || f.k === "menuLabel" || f.k === "inMenu" }); };
  const wrap = h("div", { class: "fld" });
  const label = h("label", { for: id }, f.label);
  const help = f.help ? h("div", { class: "help" }, f.help) : null;
  const val = obj[f.k];

  if (f.type === "bool") {
    wrap.append(h("label", { class: "chk" }, h("input", { type: "checkbox", id, checked: val !== false, onchange: (e) => set(e.target.checked) }), f.label));
    return wrap;
  }
  if (f.type === "select") {
    const sel = h("select", { id, onchange: (e) => set(e.target.value) }, Object.entries(f.options).map(([k, l]) => h("option", { value: k }, l)));
    sel.value = val in f.options ? val : Object.keys(f.options)[0];
    wrap.append(...[label, sel, help].filter(Boolean)); return wrap;
  }
  if (f.type === "number") {
    wrap.append(...[label, h("input", { type: "number", id, value: val ?? "", inputmode: "decimal", oninput: (e) => set(e.target.value === "" ? "" : Number(e.target.value)) }), help].filter(Boolean));
    return wrap;
  }
  if (f.type === "link") return linkField(obj, f, id, label, set);
  if (f.type === "image") return imageField(obj, f, id, set);
  if (f.type === "list") return listField(obj, f);
  if (f.type === "slug") {
    const inp = h("input", { type: "text", id, value: val || "", autocapitalize: "none", spellcheck: "false" });
    inp.addEventListener("change", () => {
      const old = obj.id, nid = uniqueId(inp.value || obj.type, obj);
      inp.value = nid;
      if (nid === old) return;
      obj.id = nid; if (S.sel === old) S.sel = nid;
      // popraw odnośniki #stary-adres w całej treści
      const fix = (o) => { for (const k in o) { if (typeof o[k] === "string" && o[k] === "#" + old) o[k] = "#" + nid; else if (o[k] && typeof o[k] === "object") fix(o[k]); } };
      fix(S.content.sections);
      changed({ list: true });
    });
    wrap.append(label, inp, h("div", { class: "help" }, "Używany w menu i przyciskach (np. #kontakt). Tylko małe litery, cyfry i myślniki."));
    return wrap;
  }
  const big = f.type === "textarea" || f.type === "rich" || f.type === "lines";
  const inp = big ? h("textarea", { id, class: f.type === "rich" ? "rich" : "", rows: f.type === "rich" ? 8 : 3 }) : h("input", { type: "text", id, autocomplete: "off" });
  inp.value = val ?? "";
  const lim = { seoTitle: 60, seoDescription: 160 }[f.k];
  let cnt = null;
  if (lim) { cnt = h("span", { class: "count" }); label.append(cnt); }
  const upd = () => { if (cnt) { cnt.textContent = inp.value.length + " / " + lim; cnt.classList.toggle("over", inp.value.length > lim); } };
  inp.addEventListener("input", () => { set(inp.value); upd(); }); upd();
  wrap.append(...[label, inp, f.type === "rich" ? h("div", { class: "help" }, "Pusta linia zaczyna nowy akapit. **tekst** = pogrubienie.") : f.type === "lines" ? h("div", { class: "help" }, "Każdy punkt w osobnej linii.") : help].filter(Boolean));
  return wrap;
}

const LINK_KINDS = { "{sklep}": "Sklep Raypath", "{dolacz}": "Rejestracja „Dołącz”", "{telefon}": "Zadzwoń (telefon)", "{email}": "Napisz e-mail", "#": "Sekcja na tej stronie…", url: "Własny adres…" };
function linkField(obj, f, id, label, set) {
  const wrap = h("div", { class: "fld" });
  const v = String(obj[f.k] || "");
  const kind = LINK_KINDS[v] && v !== "#" && v !== "url" ? v : v.startsWith("#") ? "#" : "url";
  const kindSel = h("select", { id }, Object.entries(LINK_KINDS).map(([k, l]) => h("option", { value: k }, l)));
  kindSel.value = kind;
  const box = h("div", { class: "lnk" + (kind.startsWith("{") ? " single" : "") }, kindSel);
  const extra = () => {
    box.querySelectorAll(".x").forEach((x) => x.remove());
    const k = kindSel.value;
    box.className = "lnk" + (k.startsWith("{") ? " single" : "");
    if (k === "#") {
      const s = h("select", { class: "x", "aria-label": "Sekcja", onchange: () => set("#" + s.value) }, S.content.sections.map((x) => h("option", { value: x.id }, secName(x) + (x.visible ? "" : " (ukryta)"))));
      const cur = String(obj[f.k] || "").slice(1);
      s.value = S.content.sections.some((x) => x.id === cur) ? cur : (S.content.sections[0] || {}).id;
      box.append(s); return "#" + s.value;
    }
    if (k === "url") {
      const cur = String(obj[f.k] || "");
      const t = h("input", { type: "url", class: "x", "aria-label": "Adres", placeholder: "https://…", value: /^(https?:|mailto:|tel:)/.test(cur) ? cur : "", oninput: () => set(t.value.trim()) });
      box.append(t); return t.value;
    }
    return k;
  };
  extra();
  kindSel.addEventListener("change", () => set(extra()));
  wrap.append(label, box);
  return wrap;
}

async function processImage(file, square) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    let sw = img.naturalWidth, sh = img.naturalHeight, sx = 0, sy = 0;
    if (square) { const m = Math.min(sw, sh); sx = (sw - m) / 2; sy = (sh - m) / 2.6; sw = sh = m; }
    const max = 1000, k = Math.min(1, max / Math.max(sw, sh));
    const c = document.createElement("canvas"); c.width = Math.round(sw * k); c.height = Math.round(sh * k);
    c.getContext("2d").drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
    let blob = await new Promise((r) => c.toBlob(r, "image/webp", 0.85));
    if (!blob || blob.type !== "image/webp") blob = await new Promise((r) => c.toBlob(r, "image/jpeg", 0.88));
    return blob;
  } finally { URL.revokeObjectURL(url); }
}
const blobToData = (b) => new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(b); });

function imageField(obj, f, id, set) {
  const wrap = h("div", { class: "fld" });
  const square = f.k === "photo" || obj.imageShape !== "rounded";
  const thumb = h("img", { class: "thumb" + (square ? "" : " sq"), alt: "" });
  const draw = () => { const s = safeImg(obj[f.k]); thumb.src = s || "data:image/gif;base64,R0lGODlhAQABAAAAACw="; };
  const file = h("input", { type: "file", id, accept: "image/jpeg,image/png,image/webp", class: "sr" });
  const status = h("span", { class: "help" });
  file.addEventListener("change", async () => {
    const fl = file.files[0]; if (!fl) return;
    status.textContent = "Przygotowuję zdjęcie…";
    try {
      const blob = await processImage(fl, square);
      if (S.mode === "server") {
        status.textContent = "Wysyłam…";
        const r = await api("/api/img", { method: "POST", body: blob, headers: { "Content-Type": blob.type } });
        if (!r.ok) throw new Error((r.data && r.data.message) || "Nie udało się wysłać zdjęcia.");
        set(r.data.url);
      } else set(await blobToData(blob));
      draw(); status.textContent = "Gotowe – " + Math.round(blob.size / 1024) + " KB. Pamiętaj o zapisaniu.";
    } catch (e) { status.textContent = ""; toast(e.message || "Nie udało się wczytać zdjęcia.", "err"); }
    file.value = "";
  });
  draw();
  wrap.append(h("span", { class: "lbl" }, f.label),
    h("div", { class: "img-f" }, thumb, h("div", { class: "btns" },
      h("label", { for: id, class: "b" }, "Wgraj zdjęcie"), file,
      h("button", { type: "button", class: "b b-danger", onclick: () => { set(""); draw(); } }, "Usuń"))),
    status);
  return wrap;
}

function listField(obj, f) {
  if (!Array.isArray(obj[f.k])) obj[f.k] = [];
  const arr = obj[f.k];
  const wrap = h("div", { class: "fld" });
  const lst = h("div", { class: "lst" });
  const open = new Set();
  const summary = (it, i) => {
    const sf = f.fields.find((x) => x.type === "text" || x.type === "textarea");
    return (sf && String(it[sf.k] || "").trim()) || `${f.itemLabel} ${i + 1}`;
  };
  const draw = () => {
    lst.replaceChildren();
    arr.forEach((it, i) => {
      const s = h("span", { class: "s" }, summary(it, i));
      const li = h("div", { class: "li" + (open.has(it) ? " open" : "") });
      const toggle = () => { open.has(it) ? open.delete(it) : open.add(it); li.classList.toggle("open"); hdr.setAttribute("aria-expanded", String(open.has(it))); };
      const hdr = h("div", { class: "li-h", role: "button", tabindex: "0", "aria-expanded": String(open.has(it)),
        onclick: (e) => { if (!e.target.closest(".ib")) toggle(); },
        onkeydown: (e) => { if ((e.key === "Enter" || e.key === " ") && e.target === hdr) { e.preventDefault(); toggle(); } } },
        h("span", { class: "chev", "aria-hidden": "true" }, "▸"), h("span", { class: "n" }, i + 1 + "."), s,
        ib("up", "Wyżej", () => { [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; draw(); changed(); }, { disabled: i === 0 }),
        ib("down", "Niżej", () => { [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]; draw(); changed(); }, { disabled: i === arr.length - 1 }),
        ib("x", "Usuń", () => confirmBox("Usunąć element?", `„${summary(it, i)}” zniknie z sekcji.`, "Usuń", () => { arr.splice(i, 1); draw(); changed(); }, "b-danger")));
      const body = h("div", { class: "li-b" }, f.fields.map((sf) => field(it, sf, () => (s.textContent = summary(it, i)))));
      li.append(hdr, body);
      lst.append(li);
    });
    add.hidden = f.max && arr.length >= f.max;
  };
  const add = h("button", { type: "button", class: "b b-sm lst-add", onclick: () => { const it = clone(f.blank || {}); arr.push(it); open.add(it); draw(); changed(); } }, "+ Dodaj: " + f.itemLabel.toLowerCase());
  draw();
  wrap.append(h("span", { class: "lbl" }, f.label + (f.max ? ` (maks. ${f.max})` : "")), lst, add);
  return wrap;
}

/* ---------- edytor ---------- */
function renderEditor() {
  const ed = $("#editor");
  if (S.view === "settings") return ed.replaceChildren(settingsEditor());
  if (S.view === "password") return ed.replaceChildren(passwordEditor());
  if (S.view === "backup") return ed.replaceChildren(backupEditor());
  const s = find(S.sel);
  if (!s) return ed.replaceChildren(h("div", { class: "empty" }, "Wybierz sekcję z listy albo dodaj nową."));
  const T = TYPES[s.type];
  const def = DEFAULT_SECTIONS.find((d) => d.id === s.id && d.type === s.type);
  const idx = S.content.sections.indexOf(s);
  const head = h("div", { class: "ed-head" },
    h("div", null, h("div", { class: "type" }, T.label), h("h1", null, secName(s))),
    h("div", { class: "acts" },
      h("button", { type: "button", class: "b", onclick: () => { s.visible = !s.visible; changed({ list: true, editor: true }); } }, s.visible ? "Ukryj na stronie" : "Pokaż na stronie"),
      T.single ? null : h("button", { type: "button", class: "b", onclick: () => {
        const c = clone(s); c.id = uniqueId(s.id + "-kopia"); c.menuLabel = (s.menuLabel || T.label) + " (kopia)"; c.inMenu = false;
        S.content.sections.splice(idx + 1, 0, c); S.sel = c.id; changed({ list: true, editor: true, scroll: true }); toast("Utworzono kopię sekcji.");
      } }, "Duplikuj"),
      def ? h("button", { type: "button", class: "b", onclick: () => confirmBox("Przywrócić treść początkową?", "Treść tej sekcji wróci do wersji z wdrożenia. Kolejność i widoczność zostaną bez zmian.", "Przywróć", () => {
        const keep = { visible: s.visible }; Object.keys(s).forEach((k) => delete s[k]); Object.assign(s, clone(def), keep); changed({ list: true, editor: true });
      }) }, "Przywróć początkową") : null,
      h("button", { type: "button", class: "b b-danger", onclick: () => confirmBox("Usunąć sekcję?", `Sekcja „${secName(s)}” zostanie usunięta. Jeśli chcesz ją tylko schować, użyj przycisku „Ukryj”.`, "Usuń sekcję", () => {
        S.content.sections.splice(idx, 1);
        const n = S.content.sections[Math.min(idx, S.content.sections.length - 1)]; S.sel = n ? n.id : null;
        changed({ list: true, editor: true, scroll: true }); toast("Usunięto sekcję.");
      }, "b-danger") }, "Usuń")));
  const notes = [];
  if (!s.visible) notes.push(h("div", { class: "warn" }, "Ta sekcja jest ukryta – nie widać jej na stronie. Podgląd „Sekcja” nadal ją pokazuje."));
  if (s.type === "testimonials") notes.push(h("div", { class: "warn" }, "Publikuj wyłącznie prawdziwe opinie, za zgodą klientów. Sekcja bez opinii nie pojawia się na stronie."));
  const common = COMMON_FIELDS.filter((f) => !(s.type === "hero" && f.k === "theme"));
  ed.replaceChildren(...[head, ...notes,
    h("div", { class: "card" }, h("h2", null, "Treść"), T.fields.map((f) => field(s, f))),
    h("div", { class: "card" }, h("h2", null, "Wygląd i menu"), common.map((f) => field(s, f)))].filter(Boolean));
}

function settingsEditor() {
  const st = S.content.settings;
  return h("div", null,
    h("div", { class: "ed-head" }, h("div", null, h("div", { class: "type" }, "Cała strona"), h("h1", null, "Ustawienia"))),
    h("div", { class: "card" }, h("h2", null, "Dane i linki"), SETTINGS_FIELDS.slice(0, 7).map((f) => field(st, f))),
    st.formMode === "formsubmit" ? h("div", { class: "warn" }, "FormSubmit: przy pierwszej wiadomości na podany e-mail przyjdzie prośba o aktywację – kliknij link w tej wiadomości, potem formularz działa normalnie.") : null,
    h("div", { class: "card" }, h("h2", null, "Wygląd i Google"), SETTINGS_FIELDS.slice(7, 11).map((f) => field(st, f))),
    h("div", { class: "card" }, h("h2", null, "Stopka"), SETTINGS_FIELDS.slice(11).map((f) => field(st, f))));
}

function passwordEditor() {
  const cur = h("input", { type: "password", id: "pw-c", autocomplete: "current-password" });
  const nw = h("input", { type: "password", id: "pw-n", autocomplete: "new-password" });
  const rp = h("input", { type: "password", id: "pw-r", autocomplete: "new-password" });
  const meter = h("i"), msg = h("p", { class: "help", role: "alert" });
  nw.addEventListener("input", () => {
    const v = nw.value; let sc = 0;
    if (v.length >= 8) sc++; if (v.length >= 12) sc++; if (/[A-ZĄĆĘŁŃÓŚŹŻ]/.test(v) && /[a-ząćęłńóśźż]/.test(v)) sc++; if (/\d/.test(v)) sc++; if (/[^\w\s]/.test(v)) sc++;
    meter.style.width = (sc / 5) * 100 + "%"; meter.style.background = sc < 2 ? "var(--err)" : sc < 4 ? "#c08a00" : "var(--ok)";
  });
  const form = h("form", { class: "card", onsubmit: async (e) => {
    e.preventDefault(); msg.textContent = "";
    if (nw.value.length < 8) return (msg.textContent = "Nowe hasło musi mieć co najmniej 8 znaków.");
    if (nw.value !== rp.value) return (msg.textContent = "Powtórzone hasło różni się od nowego.");
    if (nw.value === DEF_PASS) return (msg.textContent = "Nowe hasło musi być inne niż startowe.");
    if (S.mode === "server") {
      const r = await api("/api/password", { method: "POST", json: { current: cur.value, next: nw.value } });
      if (!r.ok) return (msg.textContent = (r.data && r.data.message) || "Nie udało się zmienić hasła.");
    } else {
      if (!(await localCheck(S.user, cur.value))) return (msg.textContent = "Obecne hasło jest nieprawidłowe.");
      const salt = crypto.getRandomValues(new Uint32Array(4)).join("-");
      localStorage.setItem(LAUTH, JSON.stringify({ user: S.user, salt, hash: await sha(salt + nw.value) }));
    }
    S.isDefault = false; notices();
    cur.value = nw.value = rp.value = ""; meter.style.width = "0";
    toast("Hasło zmienione.", "ok");
  } },
  h("h2", null, "Zmień hasło"),
  h("div", { class: "fld" }, h("span", { class: "lbl" }, "Login"), h("input", { type: "text", value: S.user, disabled: true, autocomplete: "username" })),
  h("div", { class: "fld" }, h("label", { for: "pw-c" }, "Obecne hasło"), cur),
  h("div", { class: "fld" }, h("label", { for: "pw-n" }, "Nowe hasło (min. 8 znaków)"), nw, h("div", { class: "meter", "aria-hidden": "true" }, meter)),
  h("div", { class: "fld" }, h("label", { for: "pw-r" }, "Powtórz nowe hasło"), rp),
  msg, h("button", { type: "submit", class: "b b-pri" }, "Zmień hasło"));
  return h("div", null,
    h("div", { class: "ed-head" }, h("div", null, h("div", { class: "type" }, "Bezpieczeństwo"), h("h1", null, "Hasło do panelu"))),
    S.isDefault ? h("div", { class: "warn" }, "Używasz hasła startowego „hubert2026”. Ustaw własne – najlepiej 12+ znaków, z cyframi i znakami specjalnymi.") : h("div", { class: "ok-box" }, "Hasło zostało już zmienione z hasła startowego."),
    S.mode === "local" ? h("div", { class: "warn" }, "Tryb lokalny: hasło zmieni się tylko w tej przeglądarce.") : h("p", { class: "help" }, "Po zmianie hasła pozostałe urządzenia zostaną wylogowane."),
    form);
}

function backupEditor() {
  const fileIn = h("input", { type: "file", accept: "application/json,.json", class: "sr", id: "bk-file" });
  fileIn.addEventListener("change", async () => {
    const f = fileIn.files[0]; if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (!data || !Array.isArray(data.sections)) throw new Error();
      S.content = normalize(data); S.sel = (S.content.sections[0] || {}).id;
      changed({ list: true, editor: true, scroll: true }); toast("Wczytano kopię – kliknij Zapisz, aby ją opublikować.");
    } catch (e) { toast("To nie jest poprawny plik kopii strony.", "err"); }
    fileIn.value = "";
  });
  const histBox = h("div", null, h("p", { class: "help" }, S.mode === "server" ? "Wczytuję…" : "Historia zapisów jest dostępna po podłączeniu bazy na serwerze."));
  if (S.mode === "server") loadHistory(histBox);
  return h("div", null,
    h("div", { class: "ed-head" }, h("div", null, h("div", { class: "type" }, "Bezpieczeństwo treści"), h("h1", null, "Kopie zapasowe"))),
    h("div", { class: "card" }, h("h2", null, "Kopia w pliku"),
      h("p", { class: "help" }, "Pobierz całą stronę (treści, kolejność, ustawienia) jako plik. Zdjęcia wgrane na serwer zapisują się jako adresy."),
      h("div", { class: "img-f" },
        h("button", { type: "button", class: "b", onclick: () => {
          const a = h("a", { href: URL.createObjectURL(new Blob([JSON.stringify(S.content, null, 2)], { type: "application/json" })), download: "strona-hubert-kopia-" + new Date().toISOString().slice(0, 10) + ".json" });
          document.body.append(a); a.click(); a.remove();
        } }, "Pobierz kopię (.json)"),
        h("label", { for: "bk-file", class: "b" }, "Wczytaj kopię z pliku"), fileIn)),
    h("div", { class: "card" }, h("h2", null, "Historia zapisów na serwerze (60 dni)"), histBox),
    h("div", { class: "card" }, h("h2", null, "Ustawienia początkowe"),
      h("p", { class: "help" }, "Przywraca wszystkie sekcje, kolejność i ustawienia do wersji z wdrożenia. Zmiana zostanie zapisana dopiero po kliknięciu Zapisz."),
      h("button", { type: "button", class: "b b-danger", onclick: () => confirmBox("Przywrócić całą stronę?", "Wszystkie sekcje i ustawienia wrócą do wersji początkowej. Obecną wersję możesz wcześniej pobrać jako kopię.", "Przywróć", () => {
        S.content = normalize(defaultContent()); S.sel = S.content.sections[0].id; changed({ list: true, editor: true, scroll: true });
      }, "b-danger") }, "Przywróć stronę początkową")));
}

async function loadHistory(box) {
  const r = await api("/api/history");
  if (!r.ok) { box.replaceChildren(h("p", { class: "help" }, "Nie udało się pobrać historii.")); return; }
  const items = r.data.items;
  if (!items.length) { box.replaceChildren(h("p", { class: "help" }, "Brak wcześniejszych wersji – pojawią się po kolejnych zapisach.")); return; }
  box.replaceChildren(h("ul", { class: "hist" }, items.map((it) => h("li", null,
    h("span", null, new Date(Number(it.rev)).toLocaleString("pl-PL", { dateStyle: "medium", timeStyle: "short" })),
    h("button", { type: "button", class: "b b-sm", onclick: async () => {
      const x = await api("/api/history/" + it.rev);
      if (!x.ok) return toast((x.data && x.data.message) || "Nie udało się wczytać wersji.", "err");
      S.content = normalize(x.data.content); S.sel = (S.content.sections[0] || {}).id;
      changed({ list: true, editor: false, scroll: true }); setView("sections");
      toast("Wczytano wersję z historii – kliknij Zapisz, aby ją przywrócić na stronie.");
    } }, "Wczytaj")))));
}

/* ---------- podgląd ---------- */
const pv = $("#pv");
let pvReady = false;
window.addEventListener("message", (e) => {
  if (e.origin !== location.origin || !e.data) return;
  if (e.data.type === "ready") { pvReady = true; fit(); sendPreview(true); }
});
function sendPreview(scroll) {
  if (!pvReady || !S.content) return;
  const st = S.content.settings;
  let html, focus = null, foot = "";
  const s = find(S.sel);
  if (S.view === "sections" && S.pmode === "section" && s) {
    html = renderSection(Object.assign({}, s, { visible: true }), st) ||
      `<div style="padding:60px 20px;text-align:center;font-family:sans-serif;color:#655a5d">Sekcja jest pusta – dodaj treść, aby pojawiła się na stronie.</div>`;
    foot = "Podgląd sekcji „" + secName(s) + "”" + (s.visible ? "" : " (ukryta na stronie)");
  } else {
    const state = clone(S.content); state.settings.intro = false;
    html = renderApp(normalize(state));
    focus = S.view === "sections" && s && s.visible ? s.id : null;
    foot = "Podgląd całej strony" + (s && !s.visible && S.view === "sections" ? " – zaznaczona sekcja jest ukryta" : "");
  }
  pv.contentWindow.postMessage({ type: "render", html, focus, scroll }, location.origin);
  S.pvFoot = foot; fit();
}
function fit() {
  const stage = $("#pv-stage"); if (!stage.clientWidth) return;
  const W = DEV[S.device], k = Math.min(1, stage.clientWidth / W);
  Object.assign(pv.style, { width: W + "px", height: stage.clientHeight / k + "px", transform: `scale(${k})`, left: "50%", marginLeft: -W / 2 + "px" });
  $("#pv-foot").textContent = (S.pvFoot || "") + ` · ${W} px${k < 1 ? ` · skala ${Math.round(k * 100)}%` : ""}`;
}

/* ---------- jednorazowe podpięcia ---------- */
function bindOnce() {
  $$(".tabs button").forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));
  $$(".panes button").forEach((b) => b.addEventListener("click", () => setPane(document.body.dataset.pane === b.dataset.pane && b.dataset.pane === "preview" && !matchMedia("(max-width:820px)").matches ? "edit" : b.dataset.pane)));
  $$("[data-pmode]").forEach((b) => b.addEventListener("click", () => {
    S.pmode = b.dataset.pmode; $$("[data-pmode]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); sendPreview(true);
  }));
  $$("[data-device]").forEach((b) => b.addEventListener("click", () => {
    S.device = b.dataset.device; $$("[data-device]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); fit();
  }));
  $("#save").addEventListener("click", () => save());
  $("#logout").addEventListener("click", () => {
    const go = async () => {
      if (S.mode === "server") await api("/api/logout", { method: "POST" });
      sessionStorage.removeItem(TK); sessionStorage.removeItem(LOK); S.dirty = false; location.reload();
    };
    S.dirty ? confirmBox("Wylogować bez zapisu?", "Masz niezapisane zmiany. Zostaną zachowane jako szkic w tej przeglądarce.", "Wyloguj", go) : go();
  });
  $("#modal").addEventListener("click", (e) => { if (e.target.id === "modal") closeModal(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("#modal").hidden) closeModal();
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); save(); }
  });
  window.addEventListener("beforeunload", (e) => { if (S.dirty) { e.preventDefault(); e.returnValue = ""; } });
  new ResizeObserver(fit).observe($("#pv-stage"));
}

boot();
