const Cliente = require('../../models/cliente.model');
const Vehiculo = require('../../models/vehiculo.model');

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
    const { _id, __v, createdAt, updatedAt, ...rest } = cliente.toObject();
    return rest;
};

const updateCliente = async (idCliente, updates) => {
    return Cliente.findOneAndUpdate(
        { id_cliente: idCliente },
        { $set: updates },
        { new: true }
    ).lean().then(cliente => {
        if (!cliente) return null;
        const { _id, __v, createdAt, updatedAt, ...rest } = cliente;
        return rest;
    });
};

const deleteCliente = async (idCliente) => {
    return Cliente.findOneAndDelete(
        { id_cliente: idCliente },
        { projection: { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 } }
    ).lean();
};

const getClienteById = async (idCliente) => {
    return Cliente.findOne(
        { id_cliente: idCliente },
        {
            _id: 0,
            id_cliente: 1,
            nombre: 1,
            apellido: 1,
            dni: 1,
            email: 1,
            telefono: 1,
            domicilio: 1,
            estado_activo: 1,
            vehiculos: 1
        }
    ).lean();
};

const clientesActivosConPolizasVigentes = async () => {
    return Cliente.aggregate([
        {$match: {estado_activo: true}},
        {
            $lookup: {
                from: 'polizas',
                let: {clienteId: '$id_cliente'},
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
                            monto_prima: 1,
                            monto_cobertura: 1,
                        },
                    },
                ],
                as: 'polizas_vigentes',
            },
        },{
            $project: {
                _id: 0,
                id_cliente: 1,
                nombre: 1,
                apellido: 1,
                dni: 1,
                email: 1,
                telefono: 1,
                domicilio: 1,
                estado_activo: 1,
                vehiculos: 1,
                polizas_vigentes: 1
            }
        }
    ]);
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
                    },
                    { $limit: 1 }
                ],
                as: 'polizas_activas'
            }
        },
        {
            $match: { polizas_activas: { $size: 0 } }
        },
        {
            $project: {
                _id: 0,
                id_cliente: 1,
                nombre: 1,
                apellido: 1,
                dni: 1,
                email: 1,
                telefono: 1,
                domicilio: 1,
                estado_activo: 1,
                vehiculos: 1
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
                as: 'polizas'
            }
        },
        {
            $addFields: {
                cobertura_total: { $sum: '$polizas.monto_cobertura' }
            }
        },
        {
            $sort: { cobertura_total: -1 }
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
                cobertura_total: 1,
                cantidad_polizas: { $size: '$polizas' }
            }
        }
    ]);
};

const clientesConMultiplesVehiculos = async () => {
    return Cliente.aggregate([
        {
            $addFields: {
                vehiculos_asegurados: {
                    $filter: {
                        input: '$vehiculos',
                        as: 'vehiculo',
                        cond: { $eq: ['$$vehiculo.asegurado', true] }
                    }
                }
            }
        },
        {
            $match: {
                'vehiculos_asegurados.1': { $exists: true }
            }
        },
        {
            $project: {
                _id: 0,
                id_cliente: 1,
                nombre: 1,
                apellido: 1,
                estado_activo: 1,
                vehiculos: '$vehiculos_asegurados'
            }
        }
    ]);
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
            $match: {
                'vehiculos.asegurado': true
            }
        },
        {
            $lookup: {
                from: 'polizas',
                let: { id_cliente_local: '$id_cliente' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ['$id_cliente', '$$id_cliente_local']
                            },
                            tipo: 'auto'
                        }
                    }
                ],
                as: 'poliza'
            }
        },
        {
            $unwind: {
                path:'$poliza',
                preserveNullAndEmptyArrays: true // Mantenemos esto para no perder vehículos sin póliza de auto
            }
        },
        {
            $project: {
                _id: 0,
                patente: '$vehiculos.patente',
                marca: '$vehiculos.marca',
                modelo: '$vehiculos.modelo',
                cliente_nombre: '$nombre',
                cliente_apellido: '$apellido',
                cliente_id: '$id_cliente',
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
    clientesActivosConPolizasVigentes,
    clientesSinPolizasActivas,
    top10ClientesPorCobertura,
    clientesConMultiplesVehiculos,
    vehiculosAseguradosConClienteYPoliza,
};