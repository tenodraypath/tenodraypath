// Wspólny renderer: używa go strona (serwer i przeglądarka) oraz podgląd w panelu.
import { DEFAULT_SETTINGS, DEFAULT_SECTIONS, CONTENT_VERSION } from "./defaults.js";

/* ---------- pomocnicze ---------- */
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
// polskie sieroty: spójniki jednoliterowe sklejone z kolejnym słowem
const nbsp = (s) => s.replace(/(^|[\s(„])([aiouwzAIOUWZ])\s+/g, "$1$2 ");
export const txt = (s) => nbsp(inline(s));
export const rich = (s) => String(s ?? "").trim().split(/\n\s*\n/).filter(Boolean)
  .map((p) => `<p>${nbsp(inline(p.trim())).replace(/\n/g, "<br>")}</p>`).join("");
const lines = (s) => String(s ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
export const slug = (s) => String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/ł/g, "l").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "sekcja";
export const telHref = (p) => "tel:" + String(p ?? "").replace(/[^\d+]/g, "");
const phoneShort = (p) => String(p ?? "").replace(/^\+48\s*/, "");

export function resolveLink(link, st) {
  const l = String(link ?? "").trim();
  if (l === "{sklep}") return { href: st.shopUrl, ext: true };
  if (l === "{dolacz}") return { href: st.joinUrl || st.shopUrl, ext: true };
  if (l === "{telefon}") return { href: telHref(st.phone) };
  if (l === "{email}") return { href: "mailto:" + st.email };
  if (/^#[a-z0-9-]+$/.test(l)) return { href: l };
  if (/^https?:\/\//i.test(l)) return { href: l, ext: true };
  if (/^(mailto|tel):/i.test(l)) return { href: l };
  return { href: "#" };
}
const linkAttrs = (link, st) => {
  const r = resolveLink(link, st);
  return `href="${esc(r.href)}"${r.ext ? ' target="_blank" rel="noopener"' : ""}`;
};
export const safeImg = (src) => {
  const s = String(src ?? "");
  return /^(\/img\/|\/api\/img\/|data:image\/(webp|jpeg|png);base64,|https:\/\/)/.test(s) ? s : "";
};

const ICON_PATHS = {
  drop: '<path d="M12 2.5s6.5 7 6.5 11.5a6.5 6.5 0 0 1-13 0C5.5 9.5 12 2.5 12 2.5z"/>',
  fiber: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17M3.5 12h17M6 6l12 12M18 6 6 18"/>',
  shield: '<path d="M12 3 4 7v5c0 4.5 3.4 8.4 8 9 4.6-.6 8-4.5 8-9V7z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  recycle: '<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5M20 4v4.5h-4.5M20 12a8 8 0 0 1-13.7 5.6L4 15.5M4 20v-4.5h4.5"/>',
  home: '<path d="M3 11 12 4l9 7M5 10v10h14V10"/>',
  gift: '<rect x="3" y="8" width="18" height="13"/><path d="M12 8v13M3 12h18M12 8c-2-4-6-4-6-1.5S10 8 12 8zm0 0c2-4 6-4 6-1.5S14 8 12 8z"/>',
  building: '<path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/>',
  leaf: '<path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15"/><path d="M5 19c3-4 6-6 10-8"/>',
  star: '<path d="m12 3 2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.4 6.5 20.3l1-6.2L3 9.7l6.2-.9z"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7.5 3c0 5.4-7.5 10-7.5 10z"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2z"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/>',
  check: '<path d="m5 12 5 5L20 7"/>',
  hand: '<path d="M7 11V5a2 2 0 0 1 4 0v5M11 10V4a2 2 0 0 1 4 0v6M15 10V6a2 2 0 0 1 4 0v8a7 7 0 0 1-7 7h-1a7 7 0 0 1-6-3.5L3 14a2 2 0 0 1 3.4-2L7 13"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
};
export const icon = (n, sw = 1.5) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[n] || ICON_PATHS.star}</svg>`;
const X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="m5 12 5 5L20 7"/></svg>';
const ORN = '<div class="orn" aria-hidden="true"><i></i></div>';
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

function buttons(list, st, dark) {
  const b = (list || []).filter((x) => x && x.label);
  if (!b.length) return "";
  return `<div class="btns">${b.map((x) => {
    const cls = x.style === "outline" ? (dark ? "btn-outline-l" : "btn-outline-d") : (dark ? "btn-champ" : "btn-wine");
    return `<a class="btn ${cls}" ${linkAttrs(x.link, st)}>${esc(x.label)}</a>`;
  }).join("")}</div>`;
}
const head = (s, idp, { center = true } = {}) => `
  ${s.kicker ? `<span class="kicker caps">${esc(s.kicker)}</span>` : ""}
  ${s.title ? `<h2 id="${idp}-h" class="reveal">${txt(s.title)}${s.titleAccent ? ` <em>${txt(s.titleAccent)}</em>` : ""}</h2>` : ""}
  ${center && s.title ? ORN : ""}`;

/* ---------- sekcje ---------- */
const R = {
  hero(s, st) {
    const photo = safeImg(s.photo);
    const ring = esc(s.ringText || "");
    return `<div class="wrap">
      ${s.kicker ? `<span class="caps hero-k">${esc(s.kicker)}</span>` : ""}
      <h1 id="${s.id}-h"><span class="h1a">${txt(s.title)}</span>${s.titleAccent ? ` <em class="h1b">${txt(s.titleAccent)}</em>` : ""}</h1>
      <div class="orn hero-orn" aria-hidden="true"><i></i></div>
      ${s.lead ? `<p class="lead">${txt(s.lead)}</p>` : ""}
      ${buttons(s.buttons, st, true)}
      ${s.micro || st.phone ? `<p class="micro">${txt(s.micro || "")} <b><a href="${esc(telHref(st.phone))}">${esc(phoneShort(st.phone))}</a></b></p>` : ""}
      ${photo ? `<div class="portrait">
        ${ring ? `<svg class="ring" viewBox="0 0 300 300" aria-hidden="true"><defs><path id="circ-${s.id}" d="M150,150 m-138,0 a138,138 0 1,1 276,0 a138,138 0 1,1 -276,0"/></defs><text><textPath href="#circ-${s.id}" textLength="858" lengthAdjust="spacing">${ring} </textPath></text></svg>` : ""}
        <span class="halo" aria-hidden="true"></span>
        <div class="disc"><img src="${esc(photo)}" width="600" height="600" alt="${esc(s.photoAlt || st.name)}" fetchpriority="high" decoding="async"></div>
        ${s.sealTop ? `<a class="seal" ${linkAttrs(s.sealLink || "#kontakt", st)}><span>${esc(s.sealTop)}<i>${esc(s.sealBottom || "")}</i></span></a>` : ""}
      </div>` : ""}
    </div>`;
  },

  about(s, st) {
    const facts = (s.facts || []).filter((f) => f.value || f.label);
    const pr = (s.principles || []).filter((p) => p.title || p.text);
    return `<div class="wrap">
      <div class="about-top center">${head(s, s.id)}</div>
      <div class="about-grid">
        <div class="about-quote reveal">
          ${s.quote ? `<blockquote class="quote">„${txt(s.quote)}”</blockquote>` : ""}
          ${s.signature ? `<p class="sig">${esc(s.signature)}<span>Niezależny konsultant Raypath International</span></p>` : ""}
        </div>
        <div class="about-text reveal">${rich(s.text)}</div>
      </div>
      ${facts.length ? `<dl class="facts">${facts.map((f) => `<div class="reveal"><dt>${esc(f.value)}</dt><dd>${txt(f.label)}</dd></div>`).join("")}</dl>` : ""}
      ${pr.length ? `<div class="principles">${pr.map((p, i) => `<div class="pr reveal"><span class="pr-n">${ROMAN[i] || i + 1}</span><h3>${txt(p.title)}</h3><p>${txt(p.text)}</p></div>`).join("")}</div>` : ""}
    </div>`;
  },

  pillars(s) {
    const items = (s.items || []).filter((p) => p.title || p.text);
    return `<div class="wrap">
      <div class="brand-head">
        ${s.bigNumber ? `<p class="big reveal" aria-hidden="${s.bigLabel ? "false" : "true"}"><span class="countup" data-to="${esc(s.bigNumber)}">${esc(s.bigNumber)}</span><small>${esc(s.bigLabel || "")}</small></p>` : ""}
        <div class="reveal">
          ${s.kicker ? `<span class="kicker caps">${esc(s.kicker)}</span>` : ""}
          <h2 id="${s.id}-h">${txt(s.title)}</h2>
          ${rich(s.text)}
        </div>
      </div>
      ${items.length ? `<div class="pillars" style="--n:${Math.min(items.length, 4)}">${items.map((p) => `<div class="pillar reveal"><div class="ic">${icon(p.icon)}</div><h3>${txt(p.title)}</h3><p>${txt(p.text)}</p></div>`).join("")}</div>` : ""}
    </div>`;
  },

  timeline(s) {
    const items = (s.items || []).filter((p) => p.title || p.text || p.date);
    return `<div class="wrap center">
      ${head(s, s.id)}
      ${s.intro ? `<p class="intro">${txt(s.intro)}</p>` : ""}
      <ol class="tl">${items.map((p, i) => `<li class="tl-i ${i % 2 ? "r" : "l"}">
        <span class="tl-dot" aria-hidden="true"></span>
        <div class="tl-card">
          ${p.date ? `<span class="tl-date">${esc(p.date)}</span>` : ""}
          <h3>${txt(p.title)}</h3>
          ${p.text ? `<p>${txt(p.text)}</p>` : ""}
        </div></li>`).join("")}</ol>
      ${s.note ? `<p class="note">${txt(s.note)}</p>` : ""}
    </div>`;
  },

  tech(s) {
    const items = (s.items || []).filter((p) => p.title || p.text);
    return `<div class="wrap center">
      ${head(s, s.id)}
      ${s.intro ? `<p class="intro">${txt(s.intro)}</p>` : ""}
      <ol class="tech">${items.map((p, i) => `<li class="reveal"><span class="tech-n">${ROMAN[i] || i + 1}</span><h3>${txt(p.title)}</h3><p>${txt(p.text)}</p></li>`).join("")}</ol>
      ${s.note ? `<p class="note">${txt(s.note)}</p>` : ""}
    </div>`;
  },

  compare(s) {
    return `<div class="wrap center">
      ${head(s, s.id)}
      <div class="compare reveal">
        <div class="old"><h3>${txt(s.leftTitle)}</h3><ul>${lines(s.leftItems).map((l) => `<li>${X}<span>${txt(l)}</span></li>`).join("")}</ul></div>
        <div class="new"><h3>${txt(s.rightTitle)}</h3><ul>${lines(s.rightItems).map((l) => `<li>${CHECK}<span>${txt(l)}</span></li>`).join("")}</ul></div>
      </div>
    </div>`;
  },

  calculator(s, st) {
    const min = +s.min || 0, max = Math.max(+s.max || 100, min + 1), step = +s.step || 1;
    const val = Math.min(max, Math.max(min, +s.value || min));
    return `<div class="wrap center">
      ${head(s, s.id)}
      ${s.intro ? `<p class="intro">${txt(s.intro)}</p>` : ""}
      <div class="calc reveal" data-bottle="${+s.bottlePrice || 12}">
        <label for="${s.id}-r">Miesięcznie na środki czystości: <output class="val" for="${s.id}-r">${val} zł</output></label>
        <input type="range" id="${s.id}-r" min="${min}" max="${max}" step="${step}" value="${val}">
        <div class="scale" aria-hidden="true"><span>${min} zł</span><span>${max} zł</span></div>
        <div class="res" aria-live="polite">
          <div><b data-r="1">${val * 12} zł</b><span>w ciągu roku</span></div>
          <div><b data-r="5">${val * 60} zł</b><span>w ciągu 5 lat</span></div>
          <div><b data-r="b">≈ ${Math.round((val * 60) / (+s.bottlePrice || 12))}</b><span>butelek w 5 lat*</span></div>
        </div>
        ${s.ctaLabel ? `<div class="cta"><a class="btn btn-wine" ${linkAttrs(s.ctaLink, st)}>${esc(s.ctaLabel)}</a></div>` : ""}
        ${s.note ? `<p class="note">* ${txt(s.note)}</p>` : ""}
      </div>
    </div>`;
  },

  quiz(s, st) {
    const o = (s.options || []).filter((x) => x.label);
    return `<div class="wrap center">
      ${head(s, s.id)}
      <div class="quiz">
        <div class="opts" role="group" aria-label="${esc(s.title || "Wybierz opcję")}" style="--n:${Math.min(o.length, 4) || 1}">
          ${o.map((x, i) => `<button class="opt" type="button" data-i="${i}" aria-pressed="false" aria-controls="${s.id}-res">${icon(x.icon)}<span>${txt(x.label)}</span></button>`).join("")}
        </div>
        <div class="results" id="${s.id}-res" aria-live="polite">
          ${o.map((x, i) => `<div class="result" data-i="${i}" hidden>
            <h3>${txt(x.resultTitle || x.label)}</h3>
            ${x.resultText ? `<p>${txt(x.resultText)}</p>` : ""}
            <div class="btns">
              ${x.btnLabel ? `<a class="btn btn-champ" ${linkAttrs(x.btnLink, st)}>${esc(x.btnLabel)}</a>` : ""}
              <a class="btn btn-outline-l" href="${esc(telHref(st.phone))}">Zadzwoń i dopytaj</a>
            </div></div>`).join("")}
        </div>
      </div>
    </div>`;
  },

  products(s, st) {
    const items = (s.items || []).filter((x) => x.title);
    return `<div class="wrap center">
      ${head(s, s.id)}
      ${s.intro ? `<p class="intro">${txt(s.intro)}</p>` : ""}
      <div class="lines">${items.map((x, i) => `<a class="line reveal${x.badge ? " hl" : ""}" ${linkAttrs(x.link, st)}>
        ${x.badge ? `<span class="badge">${esc(x.badge)}</span>` : ""}
        <span class="rn">${ROMAN[i] || i + 1}</span><h3>${txt(x.title)}</h3>${x.text ? `<p>${txt(x.text)}</p>` : ""}<span class="more">Zobacz</span></a>`).join("")}</div>
    </div>`;
  },

  steps(s, st, dark) {
    const items = (s.items || []).filter((x) => x.title || x.text);
    return `<div class="wrap center">
      ${head(s, s.id)}
      ${s.intro ? `<p class="intro">${txt(s.intro)}</p>` : ""}
      <ol class="steps" style="--n:${Math.min(items.length, 4) || 1}">${items.map((x, i) => `<li class="step reveal"><span class="rn">${ROMAN[i] || i + 1}</span><h3>${txt(x.title)}</h3><p>${txt(x.text)}</p></li>`).join("")}</ol>
      ${buttons(s.buttons, st, dark)}
    </div>`;
  },

  testimonials(s) {
    const items = (s.items || []).filter((x) => x.text);
    if (!items.length) return "";
    return `<div class="wrap center">
      ${head(s, s.id)}
      <div class="testi">${items.map((x) => `<figure class="reveal"><blockquote>„${txt(x.text)}”</blockquote><figcaption>${esc(x.author)}${x.place ? `<span>${esc(x.place)}</span>` : ""}</figcaption></figure>`).join("")}</div>
      ${s.note ? `<p class="note">${txt(s.note)}</p>` : ""}
    </div>`;
  },

  faq(s) {
    const items = (s.items || []).filter((x) => x.q);
    return `<div class="wrap center">
      ${head(s, s.id)}
      <div class="faq">${items.map((x) => `<details><summary>${txt(x.q)}</summary><div class="faq-a">${rich(x.a)}</div></details>`).join("")}</div>
    </div>`;
  },

  cta(s, st, dark) {
    return `<div class="wrap center">
      ${head(s, s.id)}
      ${s.text ? `<p class="intro">${txt(s.text)}</p>` : ""}
      ${buttons(s.buttons, st, dark)}
    </div>`;
  },

  text(s, st, dark) {
    return `<div class="wrap ${s.align === "left" ? "left" : "center"}">
      ${head(s, s.id, { center: s.align !== "left" })}
      <div class="prose reveal">${rich(s.text)}</div>
      ${buttons(s.buttons, st, dark)}
    </div>`;
  },

  imagetext(s, st, dark) {
    const img = safeImg(s.image);
    return `<div class="wrap">
      <div class="it ${s.imageSide === "right" ? "it-r" : ""} ${img ? "" : "it-noimg"}">
        ${img ? `<div class="it-img ${s.imageShape === "rounded" ? "rounded" : "circle"} reveal"><img src="${esc(img)}" alt="${esc(s.imageAlt || "")}" loading="lazy" decoding="async"></div>` : ""}
        <div class="it-txt reveal">
          ${s.kicker ? `<span class="kicker caps">${esc(s.kicker)}</span>` : ""}
          <h2 id="${s.id}-h">${txt(s.title)}</h2>
          <div class="prose">${rich(s.text)}</div>
          ${buttons(s.buttons, st, dark)}
        </div>
      </div>
    </div>`;
  },

  contact(s, st) {
    const topics = lines(s.topics);
    return `<div class="wrap center">
      ${head(s, s.id)}
      ${s.text ? `<p class="intro">${txt(s.text)}</p>` : ""}
      ${s.showPhone !== false ? `<a class="phone" href="${esc(telHref(st.phone))}">${esc(phoneShort(st.phone))}</a>` : ""}
      ${s.showEmail !== false ? `<a class="mail" href="mailto:${esc(st.email)}">${esc(st.email)}</a>` : ""}
      ${s.showForm !== false ? `<form class="cform" novalidate data-mode="${esc(st.formMode || "mailto")}" data-email="${esc(st.email)}">
        <div class="f"><label for="${s.id}-name">Imię *</label><input id="${s.id}-name" name="name" autocomplete="name" required maxlength="80"><span class="err" aria-live="polite"></span></div>
        <div class="f"><label for="${s.id}-phone">Telefon</label><input id="${s.id}-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" maxlength="20"><span class="err" aria-live="polite"></span></div>
        <div class="f full"><label for="${s.id}-email">E-mail ${st.formMode === "formsubmit" ? "*" : ""}</label><input id="${s.id}-email" name="email" type="email" autocomplete="email" maxlength="120" ${st.formMode === "formsubmit" ? "required" : ""}><span class="err" aria-live="polite"></span></div>
        ${topics.length ? `<div class="f full"><label for="${s.id}-topic">Temat</label><select id="${s.id}-topic" name="topic">${topics.map((t) => `<option>${esc(t)}</option>`).join("")}</select></div>` : ""}
        <div class="f full"><label for="${s.id}-msg">Wiadomość *</label><textarea id="${s.id}-msg" name="msg" required maxlength="3000"></textarea><span class="err" aria-live="polite"></span></div>
        <div class="hp" aria-hidden="true"><label>Strona www<input name="website" tabindex="-1" autocomplete="off"></label></div>
        <label class="consent"><input type="checkbox" name="ok" required> <span>${txt(s.consent || "Wyrażam zgodę na kontakt w sprawie mojego zapytania.")}</span></label>
        <span class="err err-ok" aria-live="polite"></span>
        <div class="form-end">
          <button class="btn btn-wine" type="submit">Wyślij wiadomość</button>
          <p class="f-note" role="status">${st.formMode === "formsubmit" ? "Wiadomość trafi prosto na moją skrzynkę." : "Otworzy się Twój program pocztowy z&nbsp;gotową wiadomością."}</p>
        </div>
      </form>` : ""}
    </div>`;
  }
};

/* ---------- normalizacja stanu ---------- */
export function normalize(raw) {
  const st = Object.assign({}, DEFAULT_SETTINGS, raw && raw.settings);
  let sections = Array.isArray(raw && raw.sections) ? raw.sections : JSON.parse(JSON.stringify(DEFAULT_SECTIONS));
  const seen = new Set();
  sections = sections.filter((s) => s && R[s.type]).map((s) => {
    let id = slug(s.id || s.type);
    while (seen.has(id)) id = id + "-2";
    seen.add(id);
    return Object.assign({ visible: true, inMenu: false, theme: "light" }, s, { id });
  });
  return { v: CONTENT_VERSION, rev: raw && raw.rev, settings: st, sections };
}

export function renderSection(s, st, extraClass = "") {
  const dark = s.type === "hero" || s.theme === "dark";
  const inner = R[s.type](s, st, dark);
  if (!inner) return "";
  const cls = s.type === "hero" ? "hero" : `sec t-${dark ? "dark" : s.theme === "soft" ? "soft" : "light"} s-${s.type}`;
  return `<section class="${cls} ${extraClass}" id="${esc(s.id)}" data-sid="${esc(s.id)}" aria-labelledby="${esc(s.id)}-h">${inner}</section>`;
}

export function renderMain(state) {
  const { settings: st, sections } = state;
  let prevHero = false;
  const out = [];
  for (const s of sections) {
    if (!s.visible) continue;
    const html = renderSection(s, st, prevHero ? "after-hero" : "");
    if (!html) continue;
    out.push(html);
    prevHero = s.type === "hero";
  }
  if (prevHero) out.push('<div class="after-hero-spacer" aria-hidden="true"></div>');
  return out.join("\n");
}

function navItems(state) {
  return state.sections.filter((s) => s.visible && s.inMenu && R[s.type])
    .filter((s) => s.type !== "testimonials" || (s.items || []).some((x) => x.text))
    .map((s) => `<li><a href="#${esc(s.id)}">${esc(s.menuLabel || s.title || s.id)}</a></li>`);
}

export function renderHeader(state) {
  const st = state.settings, items = navItems(state);
  const half = Math.ceil(items.length / 2);
  const shop = `<li><a ${linkAttrs("{sklep}", st)}>Sklep&nbsp;→</a></li>`;
  const left = items.slice(0, half).join(""), right = items.slice(half).join("") + shop;
  return `<header class="top" id="top">
  <div class="wrap">
    <nav class="nav-l" aria-label="Menu główne – część 1"><ul>${left}</ul></nav>
    <a class="mono" href="#tresc" aria-label="${esc(st.name)} – początek strony"><b>${esc(st.monogram)}</b><span>${esc(st.role)}</span></a>
    <nav class="nav-r" aria-label="Menu główne – część 2"><ul>${right}</ul></nav>
    <button class="burger" type="button" aria-expanded="false" aria-controls="mnav"><span class="sr">Menu</span><i></i><i></i><i></i></button>
  </div>
  <nav class="mnav" id="mnav" aria-label="Menu"><div class="mnav-in">
    <ul>${items.join("")}${shop}</ul>
    <a class="btn btn-champ" href="${esc(telHref(st.phone))}">Zadzwoń · ${esc(phoneShort(st.phone))}</a>
  </div></nav>
</header>`;
}

export function renderFooter(state) {
  const st = state.settings;
  return `<footer class="foot">
  <div class="wrap">
    <div class="mono"><b>${esc(st.monogram)}</b><span>${esc(st.role)}</span></div>
    <p>© <span class="year">${new Date().getFullYear()}</span> ${esc(st.name)} – niezależny konsultant Raypath International · <a href="${esc(telHref(st.phone))}">${esc(st.phone)}</a></p>
    ${st.footerLegal ? `<p>${txt(st.footerLegal)}</p>` : ""}
    ${st.footerPrivacy ? `<p>${txt(st.footerPrivacy)}</p>` : ""}
    <p>Projekt strony: <a href="https://stronyaiwroclaw.pl" target="_blank" rel="noopener">Strony AI Wrocław</a></p>
  </div>
</footer>
<nav class="mbar" aria-label="Szybkie akcje">
  <a href="${esc(telHref(st.phone))}">Zadzwoń</a>
  <a ${linkAttrs("{sklep}", st)}>Sklep</a>
</nav>`;
}

export function renderIntro(state) {
  const st = state.settings;
  if (st.intro === false) return "";
  return `<div class="curtain" aria-hidden="true">
  <div class="c-in">
    <svg class="c-ring" viewBox="0 0 200 200"><circle cx="100" cy="100" r="92"/><circle class="c-ring2" cx="100" cy="100" r="80"/></svg>
    <div class="c-mono">${esc(st.monogram).split("").map((ch, i) => `<span style="--i:${i}">${ch === " " ? "&nbsp;" : ch}</span>`).join("")}</div>
    <div class="c-line"></div>
    <div class="c-role">${esc(st.role)}</div>
  </div>
</div>`;
}

export function renderApp(state) {
  return `${renderIntro(state)}
<a class="skip" href="#tresc">Przejdź do treści</a>
${renderHeader(state)}
<main id="tresc">
${renderMain(state)}
</main>
${renderFooter(state)}`;
}
