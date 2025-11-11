const Cliente = require('../../models/cliente.model');
const Vehiculo = require('../../models/vehiculo.model');
const {getOrSetCache} = require("../redis/cache.repository");
const {CACHE_CLIENTES_ACTIVOS} = require("../redis/cache.keys");

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
    return Cliente.findOneAndUpdate(
        {id_cliente: idCliente},
        {$set: updates},
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

const clientesActivosConPolizasVigentes = async () => {
    const resultFunction =  Cliente.aggregate([
        { $match: { estado_activo: true } },
        {
            $lookup: {
                from: 'polizas',
                let: { clienteId: '$id_cliente' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {$eq: ['$id_cliente', '$$clienteId']},
                                    {$eq: ['$estado', 'activa']}]
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            nro_poliza: 1,
                            tipo: 1,
                            fecha_inicio: 1,
                            fecha_fin: 1,
                            prima_mensual: 1,
                            cobertura_total: 1,
                        },
                    },
                ],
                as: 'polizas_vigentes',
            },
        },
    ]);


    return getOrSetCache(CACHE_CLIENTES_ACTIVOS, 60, () => resultFunction);

}


module.exports = {
    createCliente,
    updateCliente,
    deleteCliente,
    getClienteById,
    getActiveClienteById,
    clientesActivosConPolizasVigentes
};