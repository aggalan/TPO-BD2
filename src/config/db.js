// src/config/db.js

const mongoose = require('mongoose');
const neo4j = require('neo4j-driver');
const { createClient } = require('redis');

// Carga las variables de .env (aunque server.js ya lo hace, es buena práctica ser explícito)
require('dotenv').config();

const {
  MONGO_URI,
  NEO4J_URI,
  NEO4J_USER,
  NEO4J_PASSWORD,
  REDIS_HOST,
  REDIS_PORT
} = process.env;

// --- Conexión a MongoDB (Mongoose) ---
const connectMongo = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB Conectado');
  } catch (err) {
    console.error('❌ Error conectando a MongoDB:', err.message);
    process.exit(1); // Detiene la app si no se puede conectar
  }
};

// --- Conexión a Neo4j ---
// Creamos una instancia del driver. Esta la exportaremos para usarla en los repositorios.
const neo4jDriver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)
);

const connectNeo4j = async () => {
  try {
    // Verificamos la conexión
    await neo4jDriver.verifyConnectivity();
    console.log('✅ Neo4j Conectado');
  } catch (err) {
    console.error('❌ Error conectando a Neo4j:', err.message);
    process.exit(1);
  }
};

// --- Conexión a Redis ---
// Creamos el cliente de Redis. También lo exportaremos.
const redisClient = createClient({
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT,
  }
});

redisClient.on('error', (err) => console.error('❌ Error de Cliente Redis:', err));

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('✅ Redis Conectado');
  } catch (err) {
    console.error('❌ Error conectando a Redis:', err.message);
    process.exit(1);
  }
};

// --- Función unificada ---
const connectAll = async () => {
  // Las corremos en paralelo para un arranque más rápido
  await Promise.all([
    connectMongo(),
    connectNeo4j(),
    connectRedis()
  ]);
};

// Exportamos las conexiones y la función de arranque
module.exports = {
  connectAll,
  neo4jDriver,
  redisClient
};
