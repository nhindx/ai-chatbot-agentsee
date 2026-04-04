export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { messages } = req.body || {};
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: "Invalid messages" });
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key not configured" });
  const sysPrompt = "Ban la tro ly AI chuyen gia ve AI va AI Agent. Tra loi bang tieng Viet, ro rang. Co kien thuc ve ML, DL, NLP, LLM, AI Agent, prompt engineering, RAG, fine-tuning. Tra loi ngan gon day du.";
  const contents = messages.slice(-20).map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
  try {
    const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
      method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({ system_instruction: { parts: [{ text: sysPrompt }] }, contents, generationConfig: { temperature: 0.7, maxOutputTokens: 1024 } })
    });
    if (!r.ok) return res.status(502).json({ error: "AI service error" });
    const d = await r.json();
    return res.status(200).json({ reply: d.candidates?.[0]?.content?.parts?.[0]?.text || "Xin loi, khong the tra loi." });
  } catch (e) { return res.status(500).json({ error: "Internal server error" }); }
}
