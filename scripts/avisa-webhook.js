#!/usr/bin/env node

const path = require("node:path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(process.cwd(), ".env.local"), override: true });

const baseUrl = (process.env.AVISA_API_BASE_URL || "https://www.avisaapi.com.br/api").replace(/\/$/, "");
const token = process.env.AVISA_API_TOKEN;
const defaultWebhookUrl = process.env.AVISA_WEBHOOK_URL;

async function showWebhook() {
  const response = await fetch(`${baseUrl}/webhook`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "x-api-key": token,
      "Content-Type": "application/json",
    },
  });

  const text = await response.text();
  console.log(`status=${response.status}`);
  console.log(text);

  if (!response.ok) {
    process.exitCode = 1;
  }
}

async function setWebhook(webhookUrl) {
  const response = await fetch(`${baseUrl}/webhook`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "x-api-key": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ webhook: webhookUrl }),
  });

  const text = await response.text();
  console.log(`status=${response.status}`);
  console.log(text);

  if (!response.ok) {
    process.exitCode = 1;
  }
}

async function main() {
  if (!token) {
    console.error("AVISA_API_TOKEN não configurado em .env.local");
    process.exit(1);
  }

  const command = (process.argv[2] || "show").toLowerCase();

  if (command === "show") {
    await showWebhook();
    return;
  }

  if (command === "set") {
    const cliWebhook = process.argv[3];
    const webhookUrl = cliWebhook || defaultWebhookUrl;

    if (!webhookUrl) {
      console.error("Informe a URL do webhook no argumento ou AVISA_WEBHOOK_URL em .env.local");
      process.exit(1);
    }

    await setWebhook(webhookUrl);
    return;
  }

  console.error("Uso: node scripts/avisa-webhook.js [show|set] [webhookUrl]");
  process.exit(1);
}

main().catch((error) => {
  console.error("Erro ao executar script da Avisa API:", error);
  process.exit(1);
});
