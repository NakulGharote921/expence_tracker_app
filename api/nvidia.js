/**
 * Vercel Serverless Function — Nvidia NIM API Proxy
 *
 * Solves CORS by proxying browser requests through the server.
 * Uses Node's built-in https module (most reliable in serverless).
 *
 * Authentication: reads NVIDIA_API_KEY from Vercel environment variables.
 * The frontend sends NO credentials — the proxy handles everything.
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
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Read key ONLY from server environment — never from client headers.
  const NIM_API_KEY = process.env.NVIDIA_API_KEY;

  if (!NIM_API_KEY) {
    console.error("NVIDIA_API_KEY is not configured in Vercel environment variables.");
    return res.status(500).json({
      error: "AI service is not configured. Please set NVIDIA_API_KEY in Vercel."
    });
  }

  try {
    const payload = req.body;
    const result = await callNim(payload, NIM_API_KEY);

    if (result.status >= 400) {
      console.error("NIM API error:", result.status, JSON.stringify(result.data));
      return res.status(result.status).json({
        error: `NIM API error: ${result.status}`,
        detail: result.status === 401
          ? "NVIDIA authentication failed. Check that NVIDIA_API_KEY is valid in Vercel."
          : result.data
      });
    }

    return res.status(200).json(result.data);
  } catch (error) {
    console.error("Proxy error:", error.message);
    return res.status(500).json({ error: `Failed to reach AI service: ${error.message}` });
  }
}
