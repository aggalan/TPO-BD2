// src/controllers/poliza.controller.js
const polizaService = require('../services/poliza.service');

const emitirPoliza = async (req, res, next) => {
  try {
    const poliza = await polizaService.emitirPoliza(req.body);
    res.status(201).json(poliza);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  emitirPoliza,
};

