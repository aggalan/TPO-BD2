// src/services/poliza.service.js
const {
  createPoliza: createPolizaMongo,
  getClienteById,
  getAgenteById,
} = require('../repository/mongo/crud.repository');
const {
  invalidateCache,
  updateCoberturaRanking,
  incrementAgentPolizasMetric,
} = require('../repository/redis/cache.repository');

const POLIZA_CACHE_KEYS = [
  'clientes_activos_polizas_vigentes',
  'clientes_sin_polizas_activas',
  'polizas_vencidas_cliente',
  'polizas_suspendidas_cliente',
  'polizas_activas_ordenadas',
  'vehiculos_asegurados',
  'siniestros_abiertos',
  'siniestros_accidente_recientes',
  'agentes_activos_polizas',
  'agentes_siniestros',
];

const normalizePolizaEstado = (estado) => {
  if (!estado) return 'activa';
  const normalized = estado.toString().trim().toLowerCase();
  switch (normalized) {
    case 'activa':
      return 'activa';
    case 'vencida':
      return 'vencida';
    case 'suspendida':
      return 'suspendida';
    case 'cancelada':
      return 'cancelada';
    default:
      return 'activa';
  }
};

const parseDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw createError(`Fecha inválida: ${value}`);
  }
  return parsed;
};

const invalidatePolizaCaches = async () => {
  await Promise.all(POLIZA_CACHE_KEYS.map((key) => invalidateCache(key).catch(() => undefined)));
};

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const emitirPoliza = async (payload) => {
  const requiredFields = ['nro_poliza', 'id_cliente', 'id_agente', 'tipo', 'fecha_inicio', 'fecha_fin', 'prima_mensual', 'cobertura_total'];
  const missing = requiredFields.filter((field) => payload[field] === undefined || payload[field] === null);
  if (missing.length > 0) {
    throw createError(`Faltan campos obligatorios: ${missing.join(', ')}`);
  }

  const cliente = await getClienteById(payload.id_cliente);
  if (!cliente) {
    throw createError(`Cliente ${payload.id_cliente} inexistente`, 404);
  }
  if (!cliente.activo) {
    throw createError(`Cliente ${payload.id_cliente} no está activo`);
  }

  const agente = await getAgenteById(payload.id_agente);
  if (!agente) {
    throw createError(`Agente ${payload.id_agente} inexistente`, 404);
  }
  if (!agente.activo) {
    throw createError(`Agente ${payload.id_agente} no está activo`);
  }

  const polizaData = {
    nro_poliza: payload.nro_poliza,
    id_cliente: payload.id_cliente,
    id_agente: payload.id_agente,
    tipo: payload.tipo,
    fecha_inicio: parseDate(payload.fecha_inicio),
    fecha_fin: parseDate(payload.fecha_fin),
    prima_mensual: Number(payload.prima_mensual),
    cobertura_total: Number(payload.cobertura_total),
    estado: normalizePolizaEstado(payload.estado ?? 'activa'),
  };

  if (!Number.isFinite(polizaData.prima_mensual) || !Number.isFinite(polizaData.cobertura_total)) {
    throw createError('prima_mensual y cobertura_total deben ser numéricos');
  }

  const poliza = await createPolizaMongo(polizaData);
  await incrementAgentPolizasMetric(poliza.id_agente).catch(() => undefined);
  await updateCoberturaRanking(poliza.id_cliente, poliza.cobertura_total ?? 0);
  await invalidatePolizaCaches();
  return poliza;
};

module.exports = {
  emitirPoliza,
};
