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
const clientesSinPolizasActivas = async () => {
    return Cliente.aggregate([
        {
            $lookup: {
                from: 'polizas',
                let: { clienteId: '$id_cliente' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$id_cliente', '$$clienteId'] },
                                    { $eq: ['$estado', 'activa'] }
                                ]
                            }
                        }
                    }
                ],
                as: 'polizas_activas'
            }
        },
        {
            $match: {
                polizas_activas: { $size: 0 }
            }
        },
        {
            $project: {
                polizas_activas: 0
            }
        }
    ]);
};

const top10ClientesPorCobertura = async () => {
    return Cliente.aggregate([
        {
            $lookup: {
                from: 'polizas',
                localField: 'id_cliente',
                foreignField: 'id_cliente',
                as: 'poliza'
            }
        },
        {
            $unwind: '$poliza'
        },
        {
            $sort: {
                'poliza.monto_cobertura': -1
            }
        },
        {
            $limit: 10
        },
        {
            $project: {
                _id: 0,
                id_cliente: 1,
                nombre: 1,
                apellido: 1,
                cobertura_total: '$poliza.monto_cobertura',
                nro_poliza: '$poliza.nro_poliza'
            }
        }
    ]);
};
const clientesConMultiplesVehiculos = async () => {
    return Cliente.find({
        'vehiculos.1': { $exists: true }
    }).lean();
};

const vehiculosAseguradosConClienteYPoliza = async () => {
    return Cliente.aggregate([
        {
            $match: {
                'vehiculos.0': { $exists: true }
            }
        },
        {
            $unwind: '$vehiculos'
        },
        {
            $lookup: {
                from: 'polizas',
                localField: 'id_cliente',
                foreignField: 'id_cliente',
                as: 'poliza'
            }
        },
        {
            $unwind: '$poliza'
        },
        {
            $project: {
                _id: 0,
                // Datos del vehículo
                patente: '$vehiculos.patente',
                marca: '$vehiculos.marca',
                modelo: '$vehiculos.modelo',
                // Datos del cliente
                cliente_nombre: '$nombre',
                cliente_apellido: '$apellido',
                cliente_id: '$id_cliente',
                // Datos de la póliza
                nro_poliza: '$poliza.nro_poliza',
                poliza_tipo: '$poliza.tipo',
                poliza_estado: '$poliza.estado'
            }
        }
    ]);
};

module.exports = {
    createCliente,
    updateCliente,
    deleteCliente,
    getClienteById,
    getActiveClienteById,
    clientesActivosConPolizasVigentes,
    clientesSinPolizasActivas,
    top10ClientesPorCobertura,
    clientesConMultiplesVehiculos,
    vehiculosAseguradosConClienteYPoliza,
};