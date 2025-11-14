// src/config/db.js

const mongoose = require('mongoose');
const { createClient } = require('redis');

require('dotenv').config();

const {
  MONGO_URI,
  REDIS_HOST,
  REDIS_PORT
} = process.env;

const viewName = 'vista_polizas_activas';
const viewPipeline = [
  { $match: { estado: 'activa' } },
  { $sort: { fecha_inicio: 1 } },
  {
    $project: {
      _id: 0,
      nro_poliza: 1,
      tipo: 1,
      fecha_inicio: 1,
      fecha_vencimiento: 1,
      monto_prima: 1,
      monto_cobertura: 1,
      id_cliente: 1,
      id_agente: 1,
    }
  }
];


const ensurePolizaActivaView = async () => {
  try {
    const db = mongoose.connection.db;

    if (!db) throw new Error('mongoose.connection.db no está disponible (asegurate de conectar con mongoose).');

    const existing = await db.listCollections({ name: viewName }).toArray();
    if (existing.length > 0) {
      await db.collection(viewName).drop();
      console.log("Vista '${viewName}' existente borrada.");
    }


    await db.createCollection(viewName, {
      viewOn: 'polizas',
      pipeline: viewPipeline
    });

    console.log("✅ Vista '${viewName}' creada correctamente.");
  } catch (err) {
    console.error("❌ Error al crear/actualizar la vista '${viewName}':", err);
    throw err;
  }
};
const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Conectado...');

    await ensurePolizaActivaView();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};


const redisClient = createClient({
  url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.error('Error de Cliente Redis:', err));

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Redis Conectado');
  } catch (err) {
    console.error('Error conectando a Redis:', err.message);
    process.exit(1);
  }
};

const connectAll = async () => {
  await Promise.all([
    connectMongo(),
    connectRedis()
  ]);
};

module.exports = {
  connectAll,
  redisClient,
  connectMongo
};
