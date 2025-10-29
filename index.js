import express from "express";
import mongoose from "mongoose";
import neo4j from "neo4j-driver";
import { createClient } from "redis";

const app = express();

// Conexiones usando variables del devcontainer
await mongoose.connect(process.env.MONGO_URL);

const neo4jDriver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);
await neo4jDriver.getServerInfo();

const redis = createClient({ url: process.env.REDIS_URL });
redis.on("error", (e) => console.error("Redis error:", e));
await redis.connect();

// Ruta de salud
app.get("/health", async (_req, res) => {
  try {
    const mongoOk = mongoose.connection.readyState === 1;

    const neoSession = neo4jDriver.session();
    const neoRes = await neoSession.run("RETURN 1 AS ok");
    await neoSession.close();
    const neoOk = neoRes.records[0].get("ok") === 1;

    await redis.set("ping", "pong");
    const pong = await redis.get("ping");
    const redisOk = pong === "pong";

    res.json({ mongoOk, neoOk, redisOk });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Puerto por defecto 3000
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

