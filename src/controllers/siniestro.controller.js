// src/controllers/siniestro.controller.js
const siniestroService = require('../services/siniestro.service');

const crearSiniestro = async (req, res, next) => {
  try {
    const siniestro = await siniestroService.crearSiniestro(req.body);
    res.status(201).json(siniestro);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  crearSiniestro,
};

