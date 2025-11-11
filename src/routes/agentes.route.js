const controller = require("../controllers/agentes.controller");
router.get('/agentes/activos-polizas', controller.agentesActivosConCantidadPolizas);

