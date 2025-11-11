const agenteService = require('../services/agente.service');
const agentesActivosConCantidadPolizas= async (req, res, next) => {
    try {
        const agentes = await agenteService.agentesActivosConCantidadPolizas();
        res.status(200).json(agentes);
    }
    catch (error) {
        next(error);
    }
}
const agentesYCantidadDeSiniestros = async (req, res, next) => {
    try {
        const agentes = await agenteService.agentesYCantidadDeSiniestros();
        res.status(200).json(agentes);
    }
    catch (error) {
        next(error);
    }
}


module.exports = {
    agentesActivosConCantidadPolizas,
    agentesYCantidadDeSiniestros
}