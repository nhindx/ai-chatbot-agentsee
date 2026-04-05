export default async function handler(req, res) {
  const { url } = req.query;
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Missing url parameter" });
  }
  // Only allow trangden.vn URLs for security
  if (!url.startsWith("https://trangden.vn/")) {
    return res.status(403).json({ error: "Only trangden.vn URLs allowed" });
  }
  try {
    const r = await fetch(url);
    if (!r.ok) {
      return res.status(r.status).json({ error: "Failed to fetch image" });
    }
    const contentType = r.headers.get("content-type") || "image/png";
    const buffer = Buffer.from(await r.arrayBuffer());
    res.setHeader("Content-Type", contentType);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.status(200).send(buffer);
  } catch (e) {
    return res.status(500).json({ error: "Proxy error: " + e.message });
  }
}
