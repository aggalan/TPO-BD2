// src/routes/clientes.routes.js
const { Router } = require('express');
const controller = require('../controllers/clientes.controller');

const router = Router();

router.post('/clientes', controller.createCliente);
router.put('/clientes/:idCliente', controller.updateCliente);
router.delete('/clientes/:idCliente', controller.deleteCliente);
router.get('/clientes/activos-polizas-vigentes', controller.clientesActivosConPolizasVigentes);
router.get('/clientes/sin-polizas-activas', controller.clientesSinPolizasActivas);
router.get('/clientes/multiples-vehiculos', controller.clientesConMultiplesVehiculos);
router.get('/clientes/top-cobertura', controller.topClientesPorCobertura);


module.exports = router;