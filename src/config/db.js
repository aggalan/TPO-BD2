// src/config/db.js

const mongoose = require('mongoose');
const { createClient } = require('redis');

require('dotenv').config();

const {
  MONGO_URI,
  REDIS_HOST,
  REDIS_PORT
} = process.env;

const connectMongo = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Conectado');
  } catch (err) {
    console.error('Error conectando a MongoDB:', err.message);
    process.exit(1);
  }
};

const redisClient = createClient({
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT,
  }
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
  redisClient
};
