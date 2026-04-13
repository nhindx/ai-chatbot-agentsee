const https = require('https');
const FormData = require('form-data');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  try {
    const { screenshot_b64, auth_token, map_url, agent, endpoint } = req.body;
    const imgBuffer = Buffer.from(screenshot_b64, 'base64');
    const form = new FormData();
    form.append('screenshot', imgBuffer, { filename: 'map.png', contentType: 'image/png' });
    form.append('map_url', map_url || 'https://leafletjs.com');
    form.append('agent', agent || 'Vercel Proxy');
    const target = new URL(endpoint);
    const options = {
      hostname: target.hostname, path: target.pathname, method: 'POST',
      headers: { ...form.getHeaders(), 'Authorization': auth_token }
    };
    const result = await new Promise((resolve, reject) => {
      const r = https.request(options, (resp) => {
        let d = ''; resp.on('data', c => d += c);
        resp.on('end', () => resolve({ status: resp.statusCode, body: d }));
      });
      r.on('error', reject); form.pipe(r);
    });
    res.status(200).json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
