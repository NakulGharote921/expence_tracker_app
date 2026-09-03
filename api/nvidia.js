/**
 * Vercel Serverless Function — Nvidia NIM API Proxy
 * Solves CORS by proxying browser requests through the server.
 * Uses native fetch (built into Node 18+) with correct JSON handling.
 */

const NIM_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

export default async function handler(req, res) {
  // CORS headers for the browser
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-NIM-Key");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Priority: server env var (secure), then client-provided header (fallback)
  const NIM_API_KEY =
    process.env.NVIDIA_NIM_API_KEY ||
    req.headers["x-nim-key"];

  if (!NIM_API_KEY) {
    return res.status(500).json({ error: "No Nvidia API key available" });
  }

  try {
    const payload = req.body;

    const response = await fetch(NIM_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${NIM_API_KEY}`,
        "Accept": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const rawText = await response.text();

    // Emit raw text back for debugging (temporary)
    return res.status(200).json({ debug: true, status: response.status, raw: rawText.slice(0, 3000) });
  } catch (error) {
    console.error("Proxy error:", error.message);
    return res.status(500).json({ error: `Failed to reach AI service: ${error.message}` });
  }
}
