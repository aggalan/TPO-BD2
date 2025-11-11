
const { Router } = require('express');
const controller = require('../controllers/polizas.controller');

const router = Router();

router.post('/polizas', controller.createPoliza);
router.get('/polizas/vencidas', controller.polizasVencidasConCliente);
router.get('/polizas/activas', controller.polizasActivasOrdenadas);
router.get('/polizas/suspendidas', controller.polizasSuspendidasConEstadoCliente);
router.get('/agentes/siniestros', controller.agentesConCantidadSiniestros);

module.exports = router;