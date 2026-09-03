/**
 * Vercel Serverless Function — Nvidia NIM API Proxy
 * Solves CORS by proxying browser requests through the server.
 * Uses Node's built-in https module (most reliable in serverless).
 */

import https from 'https';

const NIM_HOST = "integrate.api.nvidia.com";
const NIM_PATH = "/v1/chat/completions";

function callNim(payload, apiKey) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const options = {
      hostname: NIM_HOST,
      path: NIM_PATH,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        // Handle non-JSON responses - capture raw for diagnostics
        let parsed;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          return reject(new Error(`Invalid JSON from NIM (status ${res.statusCode}): ${data.slice(0, 500)}`));
        }
        resolve({ status: res.statusCode, data: parsed });
      });
    });

    req.on("error", (e) => reject(e));
    req.write(body);
    req.end();
  });
}

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

  // Use ONLY the client-provided key header (this key is verified working).
  // We deliberately ignore the server env var to avoid a stale/invalid key
  // causing spurious 401s. The browser sends this header from VITE_NVIDIA_NIM_API_KEY.
  const NIM_API_KEY = req.headers["x-nim-key"];

  if (!NIM_API_KEY) {
    return res.status(500).json({ error: "No Nvidia API key available" });
  }

  try {
    const payload = req.body;
    const result = await callNim(payload, NIM_API_KEY);

    if (result.status >= 400) {
      console.error("NIM API error:", result.status, JSON.stringify(result.data));
      return res.status(result.status).json({ error: `NIM API error: ${result.status}` });
    }

    return res.status(200).json(result.data);
  } catch (error) {
    console.error("Proxy error:", error.message);
    return res.status(500).json({ error: `Failed to reach AI service: ${error.message}` });
  }
}
