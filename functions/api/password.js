import { json, noDb, bad, session, checkCreds, setPassword, readJson, DEFAULT_PASS } from "../_lib/util.js";

export async function onRequestPost({ request, env }) {
  if (!env.CMS) return noDb();
  const s = await session(request, env);
  if (!s) return bad("Sesja wygasła – zaloguj się ponownie.", 401);
  let body;
  try { body = await readJson(request, 4096); } catch (e) { return bad("Nieprawidłowe dane."); }
  const current = String(body.current || ""), next = String(body.next || "");
  const r = await checkCreds(env, s.user, current);
  if (!r.ok) return bad("Obecne hasło jest nieprawidłowe.", 403);
  if (next.length < 8) return bad("Nowe hasło musi mieć co najmniej 8 znaków.");
  if (next === DEFAULT_PASS || next === current) return bad("Nowe hasło musi być inne niż dotychczasowe.");
  if (next.length > 200) return bad("Hasło jest za długie.");
  await setPassword(env, s.user, next);
  // wyloguj pozostałe urządzenia
  let cursor;
  do {
    const l = await env.CMS.list({ prefix: "sess:", cursor });
    await Promise.all(l.keys.filter((k) => k.name !== "sess:" + s.token).map((k) => env.CMS.delete(k.name)));
    cursor = l.list_complete ? null : l.cursor;
  } while (cursor);
  await env.CMS.put("sess:" + s.token, JSON.stringify({ user: s.user, isDefault: false, created: s.created }), { expirationTtl: 60 * 60 * 8 });
  return json({ ok: true });
}
