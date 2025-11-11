// src/services/query.service.js
const mongoQueries = require('../repository/mongo/query.repository');
const {
  getCachedResult,
  setCachedResult,
  getTopCobertura,
  resetCoberturaRanking,
  getAgentPolizaMetricMap,
  getAgentSiniestroMetricMap,
} = require('../repository/redis/cache.repository');
const {
  getClientesByIds,
} = require('../repository/mongo/crud.repository');
const { CACHE_KEYS } = require('../constants/cacheKeys');

const getClientesActivosConPolizasVigentes = async () => {
  const cacheKey = CACHE_KEYS.clientesActivosPolizasVigentes;
  const cached = await getCachedResult(cacheKey);
  if (cached) return cached;

  const data = await mongoQueries.clientesActivosConPolizasVigentes();
  await setCachedResult(cacheKey, data);
  return data;
};

const getVehiculosAseguradosConClienteYPoliza = async () => {
  const cacheKey = CACHE_KEYS.vehiculosAsegurados;
  const cached = await getCachedResult(cacheKey);
  if (cached) return cached;

  const data = await mongoQueries.vehiculosAseguradosConClienteYPoliza();
  await setCachedResult(cacheKey, data);
  return data;
};

const getClientesSinPolizasActivas = async () => {
  const cacheKey = CACHE_KEYS.clientesSinPolizasActivas;
  const cached = await getCachedResult(cacheKey);
  if (cached) return cached;

  const data = await mongoQueries.clientesSinPolizasActivas();
  await setCachedResult(cacheKey, data);
  return data;
};

const getAgentesActivosConCantidadPolizas = async () => {
  const cacheKey = CACHE_KEYS.agentesActivosPolizas;
  const cached = await getCachedResult(cacheKey);
  if (cached) return cached;

  const [agents, metricsMap] = await Promise.all([
    mongoQueries.agentesActivosConCantidadPolizas(),
    getAgentPolizaMetricMap(),
  ]);

  const enriched = agents
    .map((agent) => ({
      id_agente: agent.id_agente,
      nombre_completo: `${agent.nombre} ${agent.apellido}`,
      matricula: agent.matricula,
      zona: agent.zona,
      cantidad_polizas: metricsMap.get(agent.id_agente) ?? 0,
    }))
    .sort((a, b) => {
      if (b.cantidad_polizas !== a.cantidad_polizas) {
        return b.cantidad_polizas - a.cantidad_polizas;
      }
      return a.nombre_completo.localeCompare(b.nombre_completo);
    });

  await setCachedResult(cacheKey, enriched, 180);
  return enriched;
};

const getPolizasVencidasConCliente = async () => {
  const cacheKey = CACHE_KEYS.polizasVencidasCliente;
  const cached = await getCachedResult(cacheKey);
  if (cached) return cached;

  const data = await mongoQueries.polizasVencidasConCliente();
  await setCachedResult(cacheKey, data, 300);
  return data;
};

const getTopClientesPorCobertura = async (limit = 10) => {
  const ranking = await getTopCobertura(limit);

  if (ranking.length > 0) {
    const clientes = await getClientesByIds(ranking.map((item) => item.id_cliente));
    const clientesMap = new Map(clientes.map((cliente) => [cliente.id_cliente, cliente]));
    return ranking.map(({ id_cliente, cobertura_total }) => {
      const cliente = clientesMap.get(id_cliente);
      return {
        id_cliente,
        nombre: cliente?.nombre ?? null,
        apellido: cliente?.apellido ?? null,
        cobertura_total,
      };
    });
  }

  const data = await mongoQueries.topClientesPorCobertura(limit);
  if (data.length > 0) {
    await resetCoberturaRanking(data);
  }
  return data;
};

const getSiniestrosAbiertosConCliente = async () => {
  const cacheKey = CACHE_KEYS.siniestrosAbiertos;
  const cached = await getCachedResult(cacheKey);
  if (cached) return cached;

  const data = await mongoQueries.siniestrosAbiertosConCliente();
  await setCachedResult(cacheKey, data, 120);
  return data;
};

const getSiniestrosAccidenteUltimoAnio = async () => {
  const cacheKey = CACHE_KEYS.siniestrosAccidenteRecientes;
  const cached = await getCachedResult(cacheKey);
  if (cached) return cached;

  const data = await mongoQueries.siniestrosAccidenteUltimoAnio();
  await setCachedResult(cacheKey, data, 600);
  return data;
};

const getPolizasActivasOrdenadas = async () => {
  const cacheKey = CACHE_KEYS.polizasActivasOrdenadas;
  const cached = await getCachedResult(cacheKey);
  if (cached) return cached;

  const data = await mongoQueries.polizasActivasOrdenadas();
  await setCachedResult(cacheKey, data, 180);
  return data;
};

const getPolizasSuspendidasConEstadoCliente = async () => {
  const cacheKey = CACHE_KEYS.polizasSuspendidasCliente;
  const cached = await getCachedResult(cacheKey);
  if (cached) return cached;

  const data = await mongoQueries.polizasSuspendidasConEstadoCliente();
  await setCachedResult(cacheKey, data, 180);
  return data;
};

const getClientesConMultiplesVehiculos = async () => {
  const cacheKey = CACHE_KEYS.clientesMultiplesVehiculos;
  const cached = await getCachedResult(cacheKey);
  if (cached) return cached;

  const data = await mongoQueries.clientesConMultiplesVehiculos();
  await setCachedResult(cacheKey, data, 300);
  return data;
};

const getAgentesConCantidadSiniestros = async () => {
  const cacheKey = CACHE_KEYS.agentesSiniestros;
  const cached = await getCachedResult(cacheKey);
  if (cached) return cached;

  const [agents, metricsMap] = await Promise.all([
    mongoQueries.agentesConCantidadSiniestros(),
    getAgentSiniestroMetricMap(),
  ]);

  const enriched = agents
    .map((agent) => ({
      id_agente: agent.id_agente,
      cantidad_siniestros: metricsMap.get(agent.id_agente) ?? 0,
      agente: {
        id_agente: agent.id_agente,
        nombre: agent.nombre,
        apellido: agent.apellido,
        matricula: agent.matricula,
        zona: agent.zona,
        activo: agent.activo,
      },
    }))
    .sort((a, b) => {
      if (b.cantidad_siniestros !== a.cantidad_siniestros) {
        return b.cantidad_siniestros - a.cantidad_siniestros;
      }
      return a.id_agente - b.id_agente;
    });

  await setCachedResult(cacheKey, enriched, 600);
  return enriched;
};

module.exports = {
  getClientesActivosConPolizasVigentes,
  getVehiculosAseguradosConClienteYPoliza,
  getClientesSinPolizasActivas,
  getAgentesActivosConCantidadPolizas,
  getPolizasVencidasConCliente,
  getTopClientesPorCobertura,
  getSiniestrosAbiertosConCliente,
  getSiniestrosAccidenteUltimoAnio,
  getPolizasActivasOrdenadas,
  getPolizasSuspendidasConEstadoCliente,
  getClientesConMultiplesVehiculos,
  getAgentesConCantidadSiniestros,
};
