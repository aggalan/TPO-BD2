const vehiculoService = require('../services/vehiculo.service');
const vehiculosAseguradosConClienteYPoliza= async (req, res, next) => {
    try {
        const agentes = await vehiculoService.vehiculosAseguradosConClienteYPoliza();
        res.status(200).json(agentes);
    }
    catch (error) {
        next(error);
    }
}


module.exports = {
    vehiculosAseguradosConClienteYPoliza
}