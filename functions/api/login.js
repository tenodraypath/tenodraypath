import { json, noDb, bad, checkCreds, limited, failed, resetTries, newSession, readJson, SESSION_TTL } from "../_lib/util.js";

export async function onRequestPost({ request, env }) {
  if (!env.CMS) return noDb();
  if (await limited(env, request)) return bad("Za dużo nieudanych prób. Spróbuj ponownie za 15 minut.", 429);
  let body;
  try { body = await readJson(request, 4096); } catch (e) { return bad("Nieprawidłowe dane."); }
  const user = String(body.user || "").trim(), pass = String(body.pass || "");
  const r = await checkCreds(env, user, pass);
  if (!r.ok) {
    await failed(env, request);
    await new Promise((res) => setTimeout(res, 400));
    return bad("Nieprawidłowy login lub hasło.", 401);
  }
  await resetTries(env, request);
  const token = await newSession(env, { user, isDefault: r.isDefault });
  return json({ token, user, isDefault: r.isDefault, ttl: SESSION_TTL });
}
