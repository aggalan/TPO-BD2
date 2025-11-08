// src/repository/redis/cache.repository.js
const { redisClient } = require('../../config/db');

const CACHE_PREFIX = 'cache:query:';
const COBERTURA_KEY = 'ranking:cobertura_total';
const AGENTE_POLIZAS_KEY = 'metrics:agentes:polizas_emitidas';
const AGENTE_SINIESTROS_KEY = 'metrics:agentes:siniestros_gestionados';

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

const parseAgentId = (value) => {
  const [, idRaw] = value.split(':');
  return parseInt(idRaw, 10);
};

const incrementAgentMetric = async (key, idAgente, delta = 1) => {
  if (!Number.isFinite(Number(idAgente)) || delta === 0) return;
  await redisClient.zIncrBy(key, delta, `agente:${idAgente}`);
};

const incrementAgentPolizasMetric = async (idAgente, delta = 1) => incrementAgentMetric(AGENTE_POLIZAS_KEY, idAgente, delta);

const incrementAgentSiniestrosMetric = async (idAgente, delta = 1) => incrementAgentMetric(AGENTE_SINIESTROS_KEY, idAgente, delta);

const getAgentMetricMap = async (key) => {
  const entries = await redisClient.zRangeWithScores(key, 0, -1, { REV: true });
  return new Map(entries.map(({ value, score }) => [parseAgentId(value), score]));
};

const getAgentPolizaMetricMap = async () => getAgentMetricMap(AGENTE_POLIZAS_KEY);
const getAgentSiniestroMetricMap = async () => getAgentMetricMap(AGENTE_SINIESTROS_KEY);

const resetAgentMetric = async (key, entries) => {
  await redisClient.del(key);
  if (!entries || entries.length === 0) return;
  await redisClient.zAdd(
    key,
    entries.map(({ id_agente, cantidad }) => ({
      score: cantidad,
      value: `agente:${id_agente}`,
    })),
  );
};

const resetAgentPolizaMetrics = async (entries) => resetAgentMetric(AGENTE_POLIZAS_KEY, entries);
const resetAgentSiniestroMetrics = async (entries) => resetAgentMetric(AGENTE_SINIESTROS_KEY, entries);

module.exports = {
  getCachedResult,
  setCachedResult,
  invalidateCache,
  getTopCobertura,
  updateCoberturaRanking,
  resetCoberturaRanking,
  removeCoberturaEntry,
  incrementAgentPolizasMetric,
  incrementAgentSiniestrosMetric,
  getAgentPolizaMetricMap,
  getAgentSiniestroMetricMap,
  resetAgentPolizaMetrics,
  resetAgentSiniestroMetrics,
};
