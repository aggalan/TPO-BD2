// src/controllers/query.controller.js
const queryService = require('../services/query.service');

const withHandler = (handler) => async (req, res, next) => {
  try {
    const data = await handler(req, res);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  clientesActivosConPolizasVigentes: withHandler(() => queryService.getClientesActivosConPolizasVigentes()),
  siniestrosAbiertosConCliente: withHandler(() => queryService.getSiniestrosAbiertosConCliente()),
  vehiculosAseguradosConClienteYPoliza: withHandler(() => queryService.getVehiculosAseguradosConClienteYPoliza()),
  clientesSinPolizasActivas: withHandler(() => queryService.getClientesSinPolizasActivas()),
  agentesActivosConCantidadPolizas: withHandler(() => queryService.getAgentesActivosConCantidadPolizas()),
  polizasVencidasConCliente: withHandler(() => queryService.getPolizasVencidasConCliente()),
  topClientesPorCobertura: withHandler((req) => {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    return queryService.getTopClientesPorCobertura(Number.isNaN(limit) ? 10 : limit);
  }),
  siniestrosAccidenteUltimoAnio: withHandler(() => queryService.getSiniestrosAccidenteUltimoAnio()),
  polizasActivasOrdenadas: withHandler(() => queryService.getPolizasActivasOrdenadas()),
  polizasSuspendidasConEstadoCliente: withHandler(() => queryService.getPolizasSuspendidasConEstadoCliente()),
  clientesConMultiplesVehiculos: withHandler(() => queryService.getClientesConMultiplesVehiculos()),
  agentesConCantidadSiniestros: withHandler(() => queryService.getAgentesConCantidadSiniestros()),
};

