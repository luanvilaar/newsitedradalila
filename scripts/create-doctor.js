#!/usr/bin/env node

const https = require("https");
require("dotenv").config({ path: ".env.local" });

const email = "dalilalucenaa@gmail.com";
const password = "dali1010";
const fullName = "Dra. Dalila Lucena";

const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!baseUrl) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL not found in .env.local");
  process.exit(1);
}

const url = `${baseUrl}/api/auth/register-doctor`;

const data = JSON.stringify({
  email,
  password,
  full_name: fullName,
});

const options = {
  hostname: new URL(url).hostname,
  port: new URL(url).port || 443,
  path: new URL(url).pathname + new URL(url).search,
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": data.length,
  },
};

const req = https.request(options, (res) => {
  let responseData = "";

  res.on("data", (chunk) => {
    responseData += chunk;
  });

  res.on("end", () => {
    console.log("\n📋 Response Status:", res.statusCode);
    try {
      const parsed = JSON.parse(responseData);
      console.log("📋 Response:", JSON.stringify(parsed, null, 2));

      if (res.statusCode === 200) {
        console.log("\n✅ Doctor account created successfully!");
        console.log(`📧 Email: ${email}`);
        console.log(`🔐 Password: ${password}`);
        console.log(`👩‍⚕️ Name: ${fullName}`);
      } else {
        console.log("\n❌ Error creating doctor account");
      }
    } catch (e) {
      console.log("Raw Response:", responseData);
    }
  });
});

req.on("error", (error) => {
  console.error("❌ Error:", error.message);
  process.exit(1);
});

console.log("🔄 Creating doctor account...");
console.log(`📧 Email: ${email}`);
console.log(`🔐 Password: ${password}`);
console.log(`👩‍⚕️ Name: ${fullName}\n`);

req.write(data);
req.end();
