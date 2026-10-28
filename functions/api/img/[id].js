export async function onRequestGet({ params, env }) {
  if (!env.CMS || !/^[a-f0-9]{24}$/.test(params.id)) return new Response("Nie znaleziono", { status: 404 });
  const { value, metadata } = await env.CMS.getWithMetadata("img:" + params.id, "arrayBuffer");
  if (!value) return new Response("Nie znaleziono", { status: 404 });
  return new Response(value, { headers: {
    "content-type": (metadata && metadata.type) || "image/webp",
    "cache-control": "public, max-age=31536000, immutable",
    "x-content-type-options": "nosniff"
  } });
}
