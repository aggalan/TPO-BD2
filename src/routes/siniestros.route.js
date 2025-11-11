
const { Router } = require('express');
const controller = require('../controllers/siniestros.controller');

const router = Router();

router.post('/siniestros', controller.createSiniestros);
router.get('/siniestros/abiertos', controller.siniestrosAbiertosConCliente);
router.get('/siniestros/accidentes-recientes', controller.siniestrosAccidenteUltimoAnio);


module.exports = router;