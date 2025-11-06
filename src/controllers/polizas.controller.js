const polizasService = require('../services/polizas.service');


const createPoliza = async (req, res, next) => {
    try {
        const poliza = await polizasService.createPoliza(req.body);
        res.status(201).json(poliza);
    } catch (error) {
        next(error);
    }
};