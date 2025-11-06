
const { Router } = require('express');
const controller = require('../controllers/siniestros.controller');

const router = Router();

router.post('/siniestros', controller.crearSiniestro);

module.exports = router;