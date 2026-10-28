// Wspólne narzędzia dla funkcji Cloudflare Pages. Baza: KV podpięte pod nazwą CMS.

export const DEFAULT_USER = "admin";
export const DEFAULT_PASS = "hubert2026";   // hasło startowe – zmień je w panelu po pierwszym logowaniu
const ITER = 100000;                        // PBKDF2-SHA256 (limit Workers to 100 000)
export const SESSION_TTL = 60 * 60 * 8;     // sesja: 8 godzin
const MAX_TRIES = 8, LOCK_TTL = 60 * 15;    // 8 błędnych prób → blokada na 15 minut

export const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
});
export const noDb = () => json({ error: "db", message: "Baza niepodłączona – w Cloudflare Pages dodaj powiązanie KV o nazwie CMS." }, 503);
export const bad = (message, status = 400) => json({ error: "bad", message }, status);

const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
export const randHex = (n) => hex(crypto.getRandomValues(new Uint8Array(n)));

export async function hashPass(pass, salt) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(pass), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: new TextEncoder().encode(salt), iterations: ITER }, key, 256);
  return hex(bits);
}

export function safeEq(a, b) {
  a = String(a); b = String(b);
  let r = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) r |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return r === 0;
}

export async function checkCreds(env, user, pass) {
  const auth = await env.CMS.get("auth", "json");
  if (!auth) {
    const start = env.ADMIN_PASSWORD || DEFAULT_PASS;
    return { ok: safeEq(user, DEFAULT_USER) && safeEq(pass, start), isDefault: !env.ADMIN_PASSWORD };
  }
  const h = await hashPass(pass, auth.salt);
  return { ok: safeEq(user, auth.user) && safeEq(h, auth.hash), isDefault: false };
}

export async function setPassword(env, user, pass) {
  const salt = randHex(16);
  await env.CMS.put("auth", JSON.stringify({ user, salt, hash: await hashPass(pass, salt), changed: new Date().toISOString() }));
}

export const clientIp = (req) => req.headers.get("cf-connecting-ip") || "local";

export async function limited(env, req) {
  const r = await env.CMS.get("rl:" + clientIp(req), "json");
  return r && r.n >= MAX_TRIES;
}
export async function failed(env, req) {
  const k = "rl:" + clientIp(req);
  const r = (await env.CMS.get(k, "json")) || { n: 0 };
  await env.CMS.put(k, JSON.stringify({ n: r.n + 1 }), { expirationTtl: LOCK_TTL });
}
export const resetTries = (env, req) => env.CMS.delete("rl:" + clientIp(req));

export async function session(request, env) {
  const t = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!/^[a-f0-9]{64}$/.test(t)) return null;
  const s = await env.CMS.get("sess:" + t, "json");
  return s ? Object.assign({ token: t }, s) : null;
}
export async function newSession(env, data) {
  const token = randHex(32);
  await env.CMS.put("sess:" + token, JSON.stringify(Object.assign({ created: Date.now() }, data)), { expirationTtl: SESSION_TTL });
  return token;
}

export async function readJson(request, max = 1024 * 1024) {
  const len = +request.headers.get("content-length") || 0;
  if (len > max) throw new Error("too-big");
  const text = await request.text();
  if (text.length > max) throw new Error("too-big");
  return JSON.parse(text);
}

// minimalna kontrola kształtu treści przed zapisem
export function validContent(c) {
  if (!c || typeof c !== "object" || Array.isArray(c)) return "Nieprawidłowe dane.";
  if (!c.settings || typeof c.settings !== "object") return "Brak ustawień.";
  if (!Array.isArray(c.sections) || c.sections.length > 60) return "Nieprawidłowa lista sekcji.";
  for (const s of c.sections) {
    if (!s || typeof s.type !== "string" || typeof s.id !== "string") return "Sekcja bez typu lub adresu.";
  }
  return "";
}
