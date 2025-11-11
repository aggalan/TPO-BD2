const { Router } = require('express');
const controller = require("../controllers/agentes.controller");

const router = Router();
router.get('/agentes/activos-polizas', controller.agentesActivosConCantidadPolizas);
router.get('/agentes/top-ventas', controller.agentesYCantidadDeSiniestros);

module.exports = router;
