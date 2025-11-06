// src/routes/polizas.routes.js
const { Router } = require('express');
const controller = require('../controllers/poliza.controller');

const router = Router();

router.post('/polizas', controller.emitirPoliza);

module.exports = router;

