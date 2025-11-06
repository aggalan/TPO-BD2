
const { Router } = require('express');
const controller = require('../controllers/polizas.controller');

const router = Router();

router.post('/polizas', controller.emitirPoliza);

module.exports = router;