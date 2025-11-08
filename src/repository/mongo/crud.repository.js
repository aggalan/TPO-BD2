// src/repository/mongo/crud.repository.js
const Cliente = require('../../models/cliente.model');
const Poliza = require('../../models/poliza.model');
const Siniestro = require('../../models/siniestro.model');
const Agente = require('../../models/agente.model');

const getNextSequentialId = async (Model, fieldName) => {
  const last = await Model.findOne({}, { [fieldName]: 1 }).sort({ [fieldName]: -1 }).lean();
  if (!last || !last[fieldName]) return 1;
  return last[fieldName] + 1;
};

const createCliente = async (payload) => {
  const id_cliente = payload.id_cliente ?? (await getNextSequentialId(Cliente, 'id_cliente'));
  const cliente = new Cliente({
    ...payload,
    id_cliente,
  });
  await cliente.save();
  return cliente.toObject();
};

const updateCliente = async (idCliente, updates) => {
  const updated = await Cliente.findOneAndUpdate(
    { id_cliente: idCliente },
    { $set: updates },
    { new: true },
  ).lean();
  return updated;
};

const deleteCliente = async (idCliente) => {
  return Cliente.findOneAndDelete({ id_cliente: idCliente }).lean();
};

const createPoliza = async (payload) => {
  const poliza = new Poliza(payload);
  await poliza.save();
  return poliza.toObject();
};

const updatePoliza = async (nroPoliza, updates) => {
  const updated = await Poliza.findOneAndUpdate(
    { nro_poliza: nroPoliza },
    { $set: updates },
    { new: true },
  ).lean();
  return updated;
};

const deletePoliza = async (nroPoliza) => {
  return Poliza.findOneAndDelete({ nro_poliza: nroPoliza }).lean();
};

const createSiniestro = async (payload) => {
  const id_siniestro = payload.id_siniestro ?? (await getNextSequentialId(Siniestro, 'id_siniestro'));
  const siniestro = new Siniestro({
    ...payload,
    id_siniestro,
  });
  await siniestro.save();
  return siniestro.toObject();
};

const updateSiniestro = async (idSiniestro, updates) => {
  const updated = await Siniestro.findOneAndUpdate(
    { id_siniestro: idSiniestro },
    { $set: updates },
    { new: true },
  ).lean();
  return updated;
};

const deleteSiniestro = async (idSiniestro) => {
  return Siniestro.findOneAndDelete({ id_siniestro: idSiniestro }).lean();
};

const getClienteById = async (idCliente) => Cliente.findOne({ id_cliente: idCliente }).lean();
const getAgenteById = async (idAgente) => Agente.findOne({ id_agente: idAgente }).lean();
const getPolizaByNumero = async (nroPoliza) => Poliza.findOne({ nro_poliza: nroPoliza }).lean();

const getPolizasByCliente = async (idCliente) => Poliza.find({ id_cliente: idCliente }).lean();

const coberturaTotalPorCliente = async (idCliente) => {
  const result = await Poliza.aggregate([
    { $match: { id_cliente: idCliente } },
    {
      $group: {
        _id: null,
        cobertura_total: { $sum: '$cobertura_total' },
      },
    },
  ]);

  return result.length > 0 ? result[0].cobertura_total : 0;
};

const getClientesByIds = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const clientes = await Cliente.find({ id_cliente: { $in: ids } }).lean();
  return clientes;
};

module.exports = {
  createCliente,
  updateCliente,
  deleteCliente,
  createPoliza,
  updatePoliza,
  deletePoliza,
  createSiniestro,
  updateSiniestro,
  deleteSiniestro,
  getClienteById,
  getAgenteById,
  getPolizaByNumero,
  getPolizasByCliente,
  coberturaTotalPorCliente,
  getClientesByIds,
};
