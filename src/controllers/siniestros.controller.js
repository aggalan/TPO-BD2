const siniestrosService = require('../services/siniestros.service');


const createSiniestros = async (req, res, next) => {
    try {
        const siniestro = await siniestrosService.createSiniestro(req.body);
        res.status(201).json(siniestro);
    } catch (error) {
        next(error);
    }
};

const siniestrosAbiertosConCliente = async (req, res, next) => {
    try {
        const siniestros = await siniestrosService.siniestrosAbiertosConCliente();
        res.status(200).json(siniestros);
    } catch (error) {
        next(error);
    }
}
const siniestrosAccidenteUltimoAnio = async (req, res, next) => {
    try {
        const siniestros = await siniestrosService.siniestrosAccidenteUltimoAnio();
        res.status(200).json(siniestros);
    }
    catch (error) {
        next(error);
    }
}

module.exports = {createSiniestros, siniestrosAbiertosConCliente,siniestrosAccidenteUltimoAnio}