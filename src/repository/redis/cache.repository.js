// src/repository/redis/cache.repository.js
const { redisClient } = require('../../config/db');

const CACHE_PREFIX = 'cache:query:';
const COBERTURA_KEY = 'ranking:cobertura_total';

const getCacheKey = (name) => `${CACHE_PREFIX}${name}`;

const getCachedResult = async (key) => {
  const cached = await redisClient.get(getCacheKey(key));
  return cached ? JSON.parse(cached) : null;
};

const setCachedResult = async (key, value, ttlSeconds = 300) => {
  const payload = JSON.stringify(value);
  await redisClient.set(getCacheKey(key), payload, {
    EX: ttlSeconds,
  });
};

const invalidateCache = async (key) => {
  await redisClient.del(getCacheKey(key));
};

const getTopCobertura = async (limit = 10) => {
  if (limit <= 0) return [];
  const raw = await redisClient.zRangeWithScores(COBERTURA_KEY, 0, limit - 1, { REV: true });
  return raw.map(({ value, score }) => {
    const [, idClienteRaw] = value.split(':');
    return {
      id_cliente: parseInt(idClienteRaw, 10),
      cobertura_total: score,
    };
  });
};

const updateCoberturaRanking = async (idCliente, delta) => {
  await redisClient.zIncrBy(COBERTURA_KEY, delta, `cliente:${idCliente}`);
};

const resetCoberturaRanking = async (entries) => {
  await redisClient.del(COBERTURA_KEY);
  if (entries.length > 0) {
    await redisClient.zAdd(
      COBERTURA_KEY,
      entries.map(({ id_cliente, cobertura_total }) => ({
        score: cobertura_total,
        value: `cliente:${id_cliente}`,
      })),
    );
  }
};

const removeCoberturaEntry = async (idCliente) => {
  await redisClient.zRem(COBERTURA_KEY, `cliente:${idCliente}`);
};

module.exports = {
  getCachedResult,
  setCachedResult,
  invalidateCache,
  getTopCobertura,
  updateCoberturaRanking,
  resetCoberturaRanking,
  removeCoberturaEntry,
};
