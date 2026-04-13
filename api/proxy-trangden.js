// Vercel Serverless Function - Proxy to trangden.vn
// Uses Node 18 built-in fetch + FormData (no external packages needed)
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  try {
    const { screenshot_b64, auth_token, map_url, agent, endpoint } = req.body;
    if (!screenshot_b64 || !auth_token || !endpoint) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Decode base64 image
    const imgBuffer = Buffer.from(screenshot_b64, 'base64');
    const blob = new Blob([imgBuffer], { type: 'image/png' });

    // Build FormData (Node 18 native)
    const form = new FormData();
    form.append('screenshot', blob, 'map-us.png');
    form.append('map_url', map_url || 'https://leafletjs.com');
    form.append('agent', agent || 'Vercel US Proxy');

    // Forward to trangden.vn (runs from Vercel US servers)
    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Authorization': auth_token },
      body: form
    });

    const text = await upstream.text();
    let body;
    try { body = JSON.parse(text); } catch { body = text; }

    res.status(upstream.status).json({ status: upstream.status, body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
