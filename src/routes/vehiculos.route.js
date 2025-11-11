const { Router } = require('express');
const controller = require('../controllers/vehiculos.controller');

const router = Router();

router.get('/vehiculos/asegurados', controller.vehiculosAseguradosConClienteYPoliza);


module.exports = router;