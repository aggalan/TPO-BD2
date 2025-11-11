// src/constants/cacheKeys.js
const CACHE_KEYS = Object.freeze({
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
});

const CLIENT_CACHE_KEYS = [
  CACHE_KEYS.clientesActivosPolizasVigentes,
  CACHE_KEYS.clientesSinPolizasActivas,
  CACHE_KEYS.vehiculosAsegurados,
  CACHE_KEYS.polizasVencidasCliente,
  CACHE_KEYS.polizasSuspendidasCliente,
  CACHE_KEYS.clientesMultiplesVehiculos,
  CACHE_KEYS.siniestrosAbiertos,
  CACHE_KEYS.siniestrosAccidenteRecientes,
  CACHE_KEYS.agentesSiniestros,
  CACHE_KEYS.polizasActivasOrdenadas,
];

const POLIZA_CACHE_KEYS = [
  CACHE_KEYS.clientesActivosPolizasVigentes,
  CACHE_KEYS.clientesSinPolizasActivas,
  CACHE_KEYS.polizasVencidasCliente,
  CACHE_KEYS.polizasSuspendidasCliente,
  CACHE_KEYS.polizasActivasOrdenadas,
  CACHE_KEYS.vehiculosAsegurados,
  CACHE_KEYS.siniestrosAbiertos,
  CACHE_KEYS.siniestrosAccidenteRecientes,
  CACHE_KEYS.agentesActivosPolizas,
  CACHE_KEYS.agentesSiniestros,
];

const SINIESTRO_CACHE_KEYS = [
  CACHE_KEYS.siniestrosAbiertos,
  CACHE_KEYS.siniestrosAccidenteRecientes,
  CACHE_KEYS.agentesSiniestros,
];

module.exports = {
  CACHE_KEYS,
  CLIENT_CACHE_KEYS,
  POLIZA_CACHE_KEYS,
  SINIESTRO_CACHE_KEYS,
};
