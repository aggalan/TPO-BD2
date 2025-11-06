// src/services/query.service.js
const mongoQueries = require('../repository/mongo/query.repository');
const {
  getCachedResult,
  setCachedResult,
  getTopCobertura,
  resetCoberturaRanking,
} = require('../repository/redis/cache.repository');
const {
  getClientesByIds,
} = require('../repository/mongo/crud.repository');

const CACHE_KEYS = {
  clientesActivosPolizasVigentes: 'clientes_activos_polizas_vigentes',
  vehiculosAsegurados: 'vehiculos_asegurados',
  clientesSinPolizasActivas: 'clientes_sin_polizas_activas',
  agentesActivosPolizas: 'agentes_activos_polizas',
  polizasVencidasCliente: 'polizas_vencidas_cliente',
  polizasActivasOrdenadas: 'polizas_activas_ordenadas',
  polizasSuspendidasCliente: 'polizas_suspendidas_cliente',
  clientesMultiplesVehiculos: 'clientes_multiples_vehiculos',
  siniestrosAbiertos: 'siniestros_abiertos',
  siniestrosAccidenteRecientes: 'siniestros_accidente_recientes',
  agentesSiniestros: 'agentes_siniestros',
};

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

  const data = await mongoQueries.agentesActivosConCantidadPolizas();
  await setCachedResult(cacheKey, data, 180);
  return data;
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

  const data = await mongoQueries.agentesConCantidadSiniestros();
  await setCachedResult(cacheKey, data, 600);
  return data;
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
