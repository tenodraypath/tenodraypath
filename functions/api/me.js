import { json, noDb, bad, session } from "../_lib/util.js";

export async function onRequestGet({ request, env }) {
  if (!env.CMS) return noDb();
  const s = await session(request, env);
  if (!s) return bad("Sesja wygasła – zaloguj się ponownie.", 401);
  return json({ user: s.user, isDefault: !!s.isDefault });
}
