import { createServer } from "http";
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { onInvoke } from "./apply_gva_config_credentials.js";

const ROOT = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8787);

loadDotEnv(join(ROOT, ".env"));

const env = {
  "aws:accessKeyId": process.env["aws:accessKeyId"] || process.env.AWS_ACCESS_KEY_ID,
  "aws:secretAccessKey": process.env["aws:secretAccessKey"] || process.env.AWS_SECRET_ACCESS_KEY,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION || "us-east-1",
  APPCONFIG_SECRET_ID: process.env.APPCONFIG_SECRET_ID || "",
  APPCONFIG_ENVIRONMENT_NAME: process.env.APPCONFIG_ENVIRONMENT_NAME || "dev",
  APPCONFIG_DEPLOYMENT_STRATEGY_ID: process.env.APPCONFIG_DEPLOYMENT_STRATEGY_ID || "AppConfig.AllAtOnce"
};

if (!env["aws:accessKeyId"] || !env["aws:secretAccessKey"]) {
  console.error("Set aws:accessKeyId and aws:secretAccessKey (or AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY) in .env");
  process.exit(1);
}

const server = createServer(async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, error: "POST only" }));
    return;
  }

  try {
    const raw = await readBody(req);
    const body = raw ? JSON.parse(raw) : {};
    const envelope = "payload" in body || "invoker" in body
      ? body
      : { payload: body, invoker: { id: "local", type: "operator" } };

    const request = new Request("http://127.0.0.1/invoke", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(envelope)
    });
    const out = await onInvoke(request, env);
    const text = await out.text();
    res.writeHead(out.status || 200, { "Content-Type": "application/json" });
    res.end(text);
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      success: false,
      error: `${error.name || "Error"}: ${error.message}`
    }));
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`ApplyGvaConfigCredentials local runtime on http://127.0.0.1:${PORT}`);
});

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function loadDotEnv(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}
