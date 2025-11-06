// src/routes/siniestros.routes.js
const { Router } = require('express');
const controller = require('../controllers/siniestro.controller');

const router = Router();

router.post('/siniestros', controller.crearSiniestro);

module.exports = router;

