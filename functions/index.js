// Strona główna renderowana po stronie serwera z treści zapisanej w panelu (KV „CMS”).
import { normalize, renderApp } from "../public/js/render.js";

const attr = (name, value) => ({ element(e) { e.setAttribute(name, value); } });

export async function onRequestGet({ env, next }) {
  const res = await next();
  if (!env.CMS || !(res.headers.get("content-type") || "").includes("text/html")) return res;
  let raw = null;
  try { raw = await env.CMS.get("content", "json"); } catch (e) {}
  const rw = new HTMLRewriter().on("html", attr("data-db", "1"));
  if (raw) {
    const state = normalize(raw), st = state.settings;
    rw.on("html", attr("data-intro", st.intro === false ? "off" : "on"))
      .on("#app", { element(e) { e.setInnerContent(renderApp(state), { html: true }); } })
      .on("title", { element(e) { e.setInnerContent(st.seoTitle); } })
      .on('meta[name="description"]', attr("content", st.seoDescription))
      .on('meta[property="og:title"]', attr("content", st.seoTitle))
      .on('meta[property="og:description"]', attr("content", st.seoDescription));
  }
  const out = rw.transform(res);
  const headers = new Headers(out.headers);
  headers.set("cache-control", "no-cache");
  return new Response(out.body, { status: out.status, headers });
}
