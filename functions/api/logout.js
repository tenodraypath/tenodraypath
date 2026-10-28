import { json, noDb, session } from "../_lib/util.js";

export async function onRequestPost({ request, env }) {
  if (!env.CMS) return noDb();
  const s = await session(request, env);
  if (s) await env.CMS.delete("sess:" + s.token);
  return json({ ok: true });
}
