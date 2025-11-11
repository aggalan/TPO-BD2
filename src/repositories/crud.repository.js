const Cliente = require('../models/cliente.model');
const Poliza = require('../models/poliza.model');
const Siniestro = require('../models/siniestro.model');
const Vehiculo = require('../models/vehiculo.model');
const Agente = require('../models/agente.model');

const getNextSequentialId = async (Model, fieldName) => {
    const last = await Model.findOne({}, { [fieldName]: 1 }).sort({ [fieldName]: -1 }).lean();
    if (!last || !last[fieldName]) return 1;
    return last[fieldName] + 1;
};

const createCliente = async (payload) => {
    const id_cliente = payload.id_cliente ?? (await getNextSequentialId(Cliente, 'id_cliente')); //para respetar el formato del csv
    const cliente = new Cliente({
        ...payload,
        id_cliente,
    });
    await cliente.save();
    return cliente.toObject();
};

const updateCliente = async (idCliente, updates) => {
    return await Cliente.findOneAndUpdate(
        { id_cliente: idCliente },
        { $set: updates },
    ).lean();
};

const deleteCliente = async (idCliente) => {
    return Cliente.findOneAndDelete({ id_cliente: idCliente }).lean();
};

const getClienteById = async(idCliente) => {
    return Cliente.findOne({ id_cliente: idCliente }).lean();
}
const getActiveClienteById= async(idCliente) => {
    return Cliente.findOne({ id_cliente: idCliente, estado_activo: true }).lean();
}


module.exports = {
    createCliente,
    updateCliente,
    deleteCliente,
    getClienteById,
    getActiveClienteById,
};
