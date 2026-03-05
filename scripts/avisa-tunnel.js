#!/usr/bin/env node

/**
 * Avisa API — Tunnel + Webhook Registration
 * 
 * Usage:
 *   node scripts/avisa-tunnel.js          Start tunnel and register webhook
 *   node scripts/avisa-tunnel.js status   Check instance status
 *   node scripts/avisa-tunnel.js send <number> <message>   Send a message
 */

require("dotenv").config({ path: ".env.local", override: true });

const TOKEN = process.env.AVISA_API_TOKEN;
const BASE_URL = process.env.AVISA_API_BASE_URL || "https://www.avisaapi.com.br/api";

if (!TOKEN) {
  console.error("❌ AVISA_API_TOKEN not found in .env.local");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};

async function checkStatus() {
  const res = await fetch(`${BASE_URL}/instance/status`, { headers });
  const data = await res.json();
  console.log("📱 Instance Status:");
  console.log(JSON.stringify(data, null, 2));
  return data;
}

async function checkWebhook() {
  const res = await fetch(`${BASE_URL}/webhook`, { headers });
  const data = await res.json();
  console.log("🔗 Current Webhook:");
  console.log(JSON.stringify(data, null, 2));
  return data;
}

async function registerWebhook(url) {
  const res = await fetch(`${BASE_URL}/webhook`, {
    method: "POST",
    headers,
    body: JSON.stringify({ webhook: url }),
  });
  const data = await res.json();
  console.log(`✅ Webhook registered: ${url}`);
  return data;
}

async function sendMessage(number, message) {
  const sendPath = process.env.AVISA_API_SEND_PATH || "/actions/sendMessage";
  const endpoint = `${BASE_URL.replace(/\/$/, "")}/${sendPath.replace(/^\//, "")}`;
  
  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ number, message }),
  });
  const data = await res.json();
  console.log(`📤 Send result (${res.status}):`);
  console.log(JSON.stringify(data, null, 2));
  return data;
}

const [, , command, ...args] = process.argv;

(async () => {
  try {
    switch (command) {
      case "status":
        await checkStatus();
        await checkWebhook();
        break;

      case "send":
        if (args.length < 2) {
          console.error("Usage: node scripts/avisa-tunnel.js send <number> <message>");
          process.exit(1);
        }
        await sendMessage(args[0], args.slice(1).join(" "));
        break;

      case "webhook":
        if (args[0]) {
          await registerWebhook(args[0]);
        }
        await checkWebhook();
        break;

      default:
        await checkStatus();
        await checkWebhook();
        console.log("\n📋 Commands:");
        console.log("  status              Check instance & webhook status");
        console.log("  send <num> <msg>    Send a WhatsApp message");
        console.log("  webhook <url>       Register webhook URL");
        break;
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
})();
