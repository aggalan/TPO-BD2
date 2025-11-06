const siniestrosService = require('../services/siniestros.service');


const createSiniestros = async (req, res, next) => {
    try {
        const siniestro = await siniestrosService.createSiniestros(req.body);
        res.status(201).json(siniestro);
    } catch (error) {
        next(error);
    }
};