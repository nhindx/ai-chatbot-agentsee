// Vercel Proxy - GET first to register US IP as your_ip, then POST submission
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  try {
    const { screenshot_b64, auth_token, map_url, agent, endpoint } = req.body;
    if (!screenshot_b64 || !auth_token || !endpoint) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // STEP 1: GET endpoint first — Vercel IP registers as your_ip on trangden.vn
    const getResp = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Authorization': auth_token }
    });
    const getData = await getResp.json();
    const registeredIP = getData.your_ip || 'unknown';
    console.log('GET done - your_ip registered as:', registeredIP);

    // STEP 2: POST submission from Vercel US IP
    const imgBuffer = Buffer.from(screenshot_b64, 'base64');
    const blob = new Blob([imgBuffer], { type: 'image/png' });
    const form = new FormData();
    form.append('screenshot', blob, 'map-us.png');
    form.append('map_url', map_url || 'https://leafletjs.com');
    form.append('agent', agent || 'Vercel US Proxy');

    const postResp = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Authorization': auth_token },
      body: form
    });
    const postText = await postResp.text();
    let postBody;
    try { postBody = JSON.parse(postText); } catch { postBody = postText; }

    res.status(postResp.status).json({
      status: postResp.status,
      your_ip_registered: registeredIP,
      body: postBody
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
