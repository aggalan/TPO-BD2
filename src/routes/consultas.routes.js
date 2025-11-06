// src/routes/consultas.routes.js
const { Router } = require('express');
const controller = require('../controllers/query.controller');

const router = Router();

router.get('/clientes/activos-polizas-vigentes', controller.clientesActivosConPolizasVigentes);
router.get('/siniestros/abiertos', controller.siniestrosAbiertosConCliente);
router.get('/vehiculos/asegurados', controller.vehiculosAseguradosConClienteYPoliza);
router.get('/clientes/sin-polizas-activas', controller.clientesSinPolizasActivas);
router.get('/agentes/activos-polizas', controller.agentesActivosConCantidadPolizas);
router.get('/polizas/vencidas', controller.polizasVencidasConCliente);
router.get('/clientes/top-cobertura', controller.topClientesPorCobertura);
router.get('/siniestros/accidentes-recientes', controller.siniestrosAccidenteUltimoAnio);
router.get('/polizas/activas', controller.polizasActivasOrdenadas);
router.get('/polizas/suspendidas', controller.polizasSuspendidasConEstadoCliente);
router.get('/clientes/multiples-vehiculos', controller.clientesConMultiplesVehiculos);
router.get('/agentes/siniestros', controller.agentesConCantidadSiniestros);

module.exports = router;

