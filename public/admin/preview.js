// Podgląd w panelu: odbiera HTML z panelu i odświeża widok. Linki i formularze są tu wyłączone.
import { init } from "/js/site.js";

const app = document.getElementById("app");
addEventListener("message", (e) => {
  if (e.origin !== location.origin || !e.data) return;
  if (e.data.type === "ping") return parent.postMessage({ type: "ready" }, location.origin);
  if (e.data.type !== "render") return;
  const y = scrollY;
  app.innerHTML = e.data.html;
  init();
  const el = e.data.focus && document.getElementById(e.data.focus);
  requestAnimationFrame(() => requestAnimationFrame(() => go(el, e.data, y)));
});
function go(el, d, y) {
  if (el && d.scroll) {
    const head = document.querySelector(".top");
    scrollTo({ top: el.getBoundingClientRect().top + scrollY - (head ? head.offsetHeight : 0), behavior: "instant" });
    el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
  } else if (d.scroll) scrollTo(0, 0);
  else scrollTo(0, y);
}
document.addEventListener("click", (e) => {
  const a = e.target.closest("a[href]");
  if (!a) return;
  const href = a.getAttribute("href");
  if (href.startsWith("#") && href.length > 1) { e.preventDefault(); const t = document.getElementById(href.slice(1)); t && t.scrollIntoView(); return; }
  e.preventDefault();
}, true);
document.addEventListener("submit", (e) => { e.preventDefault(); e.stopImmediatePropagation(); }, true);
parent.postMessage({ type: "ready" }, location.origin);
