import { json, noDb, bad, session } from "../../_lib/util.js";

export async function onRequestGet({ request, env, params }) {
  if (!env.CMS) return noDb();
  if (!(await session(request, env))) return bad("Sesja wygasła – zaloguj się ponownie.", 401);
  if (!/^\d{6,16}$/.test(params.rev)) return bad("Nieprawidłowa wersja.");
  const content = await env.CMS.get("hist:" + params.rev, "json");
  if (!content) return bad("Ta wersja już nie istnieje.", 404);
  return json({ content });
}
