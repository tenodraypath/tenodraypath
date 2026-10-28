import { json, noDb, bad, session, randHex } from "../../_lib/util.js";

const TYPES = ["image/webp", "image/jpeg", "image/png"];
const MAX = 1.5 * 1024 * 1024;

export async function onRequestPost({ request, env }) {
  if (!env.CMS) return noDb();
  const s = await session(request, env);
  if (!s) return bad("Sesja wygasła – zaloguj się ponownie.", 401);
  const type = (request.headers.get("content-type") || "").split(";")[0].trim();
  if (!TYPES.includes(type)) return bad("Dozwolone formaty: WebP, JPG, PNG.");
  const buf = await request.arrayBuffer();
  if (!buf.byteLength || buf.byteLength > MAX) return bad("Zdjęcie jest za duże (limit 1,5 MB).", 413);
  const id = randHex(12);
  await env.CMS.put("img:" + id, buf, { metadata: { type, size: buf.byteLength, at: Date.now() } });
  return json({ url: "/api/img/" + id });
}
