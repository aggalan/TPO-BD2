// src/services/siniestro.service.js
const {
  createSiniestro: createSiniestroMongo,
  getPolizaByNumero,
} = require('../repository/mongo/crud.repository');
const {
  invalidateCache,
  incrementAgentSiniestrosMetric,
} = require('../repository/redis/cache.repository');
const { SINIESTRO_CACHE_KEYS } = require('../constants/cacheKeys');

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeEstado = (estado) => {
  if (!estado) return 'abierto';
  const normalized = estado.toString().trim().toLowerCase();
  if (normalized.startsWith('abierto')) return 'abierto';
  if (normalized.startsWith('cerrado')) return 'cerrado';
  if (normalized.includes('evalu')) return 'en_evaluacion';
  return 'abierto';
};

const parseDate = (value) => {
  if (!value) return new Date();
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw createError(`Fecha inválida: ${value}`);
  }
  return parsed;
};

const invalidateSiniestroCaches = async () => {
  await Promise.all(SINIESTRO_CACHE_KEYS.map((key) => invalidateCache(key).catch(() => undefined)));
};

const crearSiniestro = async (payload) => {
  const requiredFields = ['nro_poliza', 'tipo', 'monto_estimado'];
  const missing = requiredFields.filter((field) => payload[field] === undefined || payload[field] === null);
  if (missing.length > 0) {
    throw createError(`Faltan campos obligatorios: ${missing.join(', ')}`);
  }

  const poliza = await getPolizaByNumero(payload.nro_poliza);
  if (!poliza) {
    throw createError(`No existe la póliza ${payload.nro_poliza}`, 404);
  }

  const montoEstimado = Number(payload.monto_estimado);
  if (!Number.isFinite(montoEstimado)) {
    throw createError('monto_estimado debe ser numérico');
  }

  const siniestroData = {
    nro_poliza: payload.nro_poliza,
    tipo: payload.tipo,
    descripcion: payload.descripcion ?? null,
    fecha: parseDate(payload.fecha),
    monto_estimado: montoEstimado,
    estado: normalizeEstado(payload.estado),
  };

  const siniestro = await createSiniestroMongo(siniestroData);
  await incrementAgentSiniestrosMetric(poliza.id_agente).catch(() => undefined);
  await invalidateSiniestroCaches();
  return siniestro;
};

module.exports = {
  crearSiniestro,
};
