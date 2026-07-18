const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    connectionString: "postgresql://postgres:IRoEWaTFjTsDTofQzxoNLepxjfUsfkEp@hayabusa.proxy.rlwy.net:51120/railway",
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Connecting...");
    await client.connect();
    console.log("Connected successfully!");
    await client.end();
  } catch (err) {
    console.error("Connection error:", err);
  }
}

testConnection();
