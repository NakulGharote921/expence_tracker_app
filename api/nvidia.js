/**
 * Vercel Serverless Function — Nvidia NIM API Proxy
 * Solves CORS by proxying browser requests through the server.
 * Uses axios (reliable JSON handling) instead of native fetch.
 */

const axios = require('axios');

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

    const response = await axios.post(NIM_API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${NIM_API_KEY}`,
        "Accept": "application/json",
      },
    });

    return res.status(200).json(response.data);
  } catch (error) {
    if (error.response) {
      console.error("NIM API error:", error.response.status, JSON.stringify(error.response.data));
      return res.status(error.response.status).json({ error: `NIM API error: ${error.response.status}` });
    }
    console.error("Proxy error:", error.message);
    return res.status(500).json({ error: `Failed to reach AI service: ${error.message}` });
  }
}
