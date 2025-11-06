// src/controllers/cliente.controller.js
const clienteService = require('../services/cliente.service');

const createCliente = async (req, res, next) => {
  try {
    const cliente = await clienteService.createCliente(req.body);
    res.status(201).json(cliente);
  } catch (error) {
    next(error);
  }
};

const updateCliente = async (req, res, next) => {
  try {
    const idCliente = Number(req.params.idCliente);
    if (Number.isNaN(idCliente)) {
      throw new Error('idCliente inválido');
    }
    const cliente = await clienteService.updateCliente(idCliente, req.body);
    res.json(cliente);
  } catch (error) {
    next(error);
  }
};

const deleteCliente = async (req, res, next) => {
  try {
    const idCliente = Number(req.params.idCliente);
    if (Number.isNaN(idCliente)) {
      throw new Error('idCliente inválido');
    }
    const cliente = await clienteService.deleteCliente(idCliente);
    res.json({ eliminado: true, cliente });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCliente,
  updateCliente,
  deleteCliente,
};

