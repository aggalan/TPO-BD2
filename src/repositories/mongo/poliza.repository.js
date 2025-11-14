const Poliza = require("../../models/poliza.model");
const PolizaActivaView = require("../../models/poliza.view.model");
const {connection} = require("mongoose");

async function createPolizaMongo(polizaData) {
    try {
        const newPoliza = await Poliza.create(polizaData);
        const { _id, __v, createdAt, updatedAt, ...rest } = newPoliza.toObject();
        return rest;
    } catch (error) {
        console.error("Error en createPolizaMongo:", error);
        if (error.code === 11000) {
            throw new Error(`Error: El número de póliza '${polizaData.nro_poliza}' ya existe o el cliente ya tiene una póliza de ese tipo.`);
        }
        throw error;
    }
}

async function polizasVencidasConCliente() {
    try {
        return await Poliza.aggregate([
            {
                $match: {
                    estado: 'vencida',
                },
            },
            {
                $lookup: {
                    from: 'clientes',
                    localField: 'id_cliente',
                    foreignField: 'id_cliente',
                    as: 'cliente',
                    pipeline: [
                        {
                            $project: {
                                id_cliente: 1,
                                nombre: 1,
                                apellido: 1,
                                _id: 0,
                            }
                        }
                    ]
                },
            },
            { $unwind: '$cliente' },
            {
                $project: {
                    _id: 0,
                    nro_poliza: 1,
                    tipo: 1,
                    fecha_inicio: 1,
                    fecha_vencimiento: 1,
                    monto_prima:1,
                    monto_cobertura:1,
                    id_agente:1,
                    cliente: 1,
                },
            },
            { $sort: { fecha_vencimiento: -1 } },
        ]);

    } catch(error) {
        console.error("Error en polizasVencidasConCliente:", error);
        throw error;
    }
}
async function polizasActivasOrdenadas() {
    return PolizaActivaView.find({}).lean();
}

async function polizasSuspendidasConEstadoCliente() {
    try {
        return await Poliza.aggregate([
            {$match: {estado: 'suspendida'}},
            {
                $lookup: {
                    from: 'clientes',
                    localField: 'id_cliente',
                    foreignField: 'id_cliente',
                    as: 'cliente',
                },
            },
            {$unwind: '$cliente'},
            {
                $project: {
                    _id: 0,
                    nro_poliza: 1,
                    tipo: 1,
                    fecha_inicio: 1,
                    fecha_vencimiento: 1,
                    monto_prima:1,
                    monto_cobertura:1,
                    id_agente:1,
                    cliente: {
                        id_cliente: '$cliente.id_cliente',
                        nombre: '$cliente.nombre',
                        apellido: '$cliente.apellido',
                        activo: '$cliente.estado_activo',
                    },
                },
            },
        ]);
    }catch(error) {
        console.error("Error en activa:",error);
        throw error;
    }
}

async function getPolizaById(nroPoliza) {
    return Poliza.findOne(
        { nro_poliza: nroPoliza },
        {
            _id: 0,
            nro_poliza: 1,
            id_cliente: 1,
            id_agente: 1,
            tipo: 1,
            fecha_inicio: 1,
            fecha_vencimiento: 1,
            monto_prima: 1,
            monto_cobertura: 1,
            estado: 1
        }
    ).lean();
}

module.exports = {
    createPolizaMongo,
    polizasVencidasConCliente,
    polizasActivasOrdenadas,
    polizasSuspendidasConEstadoCliente,
    getPolizaById,
};