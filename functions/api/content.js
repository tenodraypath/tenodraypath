import { json, noDb, bad, session, readJson, validContent } from "../_lib/util.js";

const HIST_TTL = 60 * 60 * 24 * 60; // kopie zapisów trzymane 60 dni
const HIST_EVERY = 10 * 60 * 1000;   // nowa kopia w historii najwyżej co 10 minut

export async function onRequestGet({ env }) {
  if (!env.CMS) return noDb();
  const content = await env.CMS.get("content", "json");
  return json({ content, rev: content ? content.rev : null });
}

export async function onRequestPut({ request, env }) {
  if (!env.CMS) return noDb();
  const s = await session(request, env);
  if (!s) return bad("Sesja wygasła – zaloguj się ponownie.", 401);
  let body;
  try { body = await readJson(request, 900 * 1024); } catch (e) { return bad(e.message === "too-big" ? "Za dużo danych (limit 900 KB). Zmniejsz zdjęcia." : "Nieprawidłowe dane.", 413); }
  const c = body && body.content;
  const err = validContent(c);
  if (err) return bad(err);

  const current = await env.CMS.get("content", "json");
  const curRev = current ? current.rev : null;
  if (curRev && !body.force && body.baseRev !== curRev) {
    return json({ error: "conflict", message: "Treść zmieniono w międzyczasie na innym urządzeniu.", rev: curRev }, 409);
  }
  // kopia do historii najwyżej co 10 minut (autozapis nie zapycha historii ani limitu zapisów)
  const last = (await env.CMS.get("hist-last")) || 0;
  if (current && Date.now() - Number(last) > HIST_EVERY) {
    await env.CMS.put("hist:" + String(curRev || Date.now()), JSON.stringify(current), { expirationTtl: HIST_TTL, metadata: { by: s.user } });
    await env.CMS.put("hist-last", String(Date.now()), { expirationTtl: HIST_TTL });
  }

  c.rev = Date.now();
  c.savedAt = new Date().toISOString();
  await env.CMS.put("content", JSON.stringify(c));
  return json({ ok: true, rev: c.rev });
}
