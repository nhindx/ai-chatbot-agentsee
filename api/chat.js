export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { messages } = req.body || {};
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: "Invalid messages" });
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key not configured" });
  const sysPrompt = "Ban la tro ly AI thong minh. Tra loi bang tieng Viet, ro rang va day du.";
  const contents = messages.slice(-10).map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }]
  }));
  try {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: sysPrompt }] },
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
      })
    });
    const d = await r.json();
    if (!r.ok) return res.status(502).json({ error: d.error?.message || "AI service error", status: r.status });
    const reply = d.candidates?.[0]?.content?.parts?.[0]?.text || "Khong the tra loi.";
    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(500).json({ error: "Internal error: " + e.message });
  }
}
