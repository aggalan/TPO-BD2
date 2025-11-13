const { Router } = require('express');
const controller = require("../controllers/agentes.controller");

const router = Router();
router.get('/agentes/activos-polizas', controller.agentesActivosConCantidadPolizas);
router.get('/agentes/cantidad-siniestros', controller.agentesYCantidadDeSiniestros);

module.exports = router;
