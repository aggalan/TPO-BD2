// src/routes/clientes.routes.js
const { Router } = require('express');
const controller = require('../controllers/clientes.controller');

const router = Router();

router.post('/clientes', controller.createCliente);
router.put('/clientes/:idCliente', controller.updateCliente);
router.delete('/clientes/:idCliente', controller.deleteCliente);

module.exports = router;