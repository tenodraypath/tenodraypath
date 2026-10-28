import { json, noDb, bad, session } from "../../_lib/util.js";

export async function onRequestGet({ request, env }) {
  if (!env.CMS) return noDb();
  if (!(await session(request, env))) return bad("Sesja wygasła – zaloguj się ponownie.", 401);
  const l = await env.CMS.list({ prefix: "hist:" });
  const items = l.keys.map((k) => ({ rev: k.name.slice(5), by: k.metadata && k.metadata.by }))
    .sort((a, b) => Number(b.rev) - Number(a.rev)).slice(0, 30);
  return json({ items });
}
