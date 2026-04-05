export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing url parameter" });
  if (!url.startsWith("https://trangden.vn/")) {
    return res.status(403).json({ error: "Only trangden.vn URLs allowed" });
  }
  try {
    const r = await fetch(url);
    if (!r.ok) return res.status(r.status).json({ error: "Fetch failed" });
    const buf = await r.arrayBuffer();
    const contentType = r.headers.get("content-type") || "image/png";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).send(Buffer.from(buf));
  } catch (e) {
    return res.status(500).json({ error: "Proxy error: " + e.message });
  }
}
