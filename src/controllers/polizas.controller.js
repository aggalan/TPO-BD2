const polizasService = require('../services/polizas.service');


const createPoliza = async (req, res, next) => {
    try {
        const poliza = await polizasService.createPoliza(req.body);
        res.status(201).json(poliza);
    } catch (error) {
        next(error);
    }
};
const polizasVencidasConCliente = async (req, res, next) => {
    try {
        const polizas = await polizasService.polizasVencidasConCliente();
        res.status(200).json(polizas);
    }
    catch (error) {
        next(error);
    }
};

const polizasActivasOrdenadas = async (req, res, next) => {
    try {
        const polizas = await polizasService.polizasActivasOrdenadas();
        res.status(200).json(polizas);
    }
    catch (error) {
        next(error);
    }
}
const polizasSuspendidasConEstadoCliente = async (req, res, next) => {
    try {
        const polizas = await polizasService.polizasSuspendidasConEstadoCliente();
        res.status(200).json(polizas);

    }
    catch (error) {
        next(error);
    }
}

const agentesConCantidadSiniestros = async (req, res, next) => {
    try {
        const agentes = await polizasService.agentesConCantidadSiniestros();
        res.status(200).json(agentes);
    }
    catch (error) {
        next(error);
    }
}


module.exports = {
    createPoliza,
    polizasVencidasConCliente,
    polizasActivasOrdenadas,
    polizasSuspendidasConEstadoCliente,
    agentesConCantidadSiniestros
};