const Agente = require("../../models/agente.model");
const Siniestro = require("../../models/siniestro.model");

const getAgenteById = async (idAgente) => {
    return Agente.findOne({ id_agente: idAgente }).lean();
};

const agentesActivosConCantidadPolizas = async () => {
    return Agente.aggregate([
        { $match: { activo: true } },
        {
            $lookup: {
                from: 'polizas',
                let: { agenteId: '$id_agente' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$id_agente', '$$agenteId'] },
                                    { $eq: ['$estado', 'activa'] },
                                ],
                            },
                        },
                    },
                    { $count: 'total' }
                ],
                as: 'polizas',
            },
        },
        {
            $addFields: {
                cantidad_polizas: {
                    $ifNull: [{ $arrayElemAt: ['$polizas.total', 0] }, 0]
                },
            },
        },
        {
            $project: {
                _id: 0,
                id_agente: 1,
                nombre: 1,
                matricula: 1,
                zona: 1,
                email: 1,
                telefono: 1,
                cantidad_polizas: 1,
            },
        },
        { $sort: { cantidad_polizas: -1, id_agente: 1 } },
    ]);
};

const agentesYCantidadDeSiniestros = async () => {
    return Agente.aggregate([
        {
            $lookup: {
                from: 'siniestros',
                let: { agenteId: '$id_agente' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$id_agente', '$$agenteId'] }
                        }
                    },
                    { $count: 'total' }
                ],
                as: 'siniestros',
            },
        },
        {
            $addFields: {
                cantidad_siniestros: {
                    $ifNull: [
                        { $arrayElemAt: ['$siniestros.total', 0] },
                        0
                    ]
                },
            },
        },
        {
            $project: {
                _id: 0,
                id_agente: 1,
                nombre: 1,
                matricula: 1,
                zona: 1,
                activo: 1,
                cantidad_siniestros: 1,
            },
        },
        { $sort: { cantidad_siniestros: -1, id_agente: 1 } },
    ]);
};

module.exports = {
    getAgenteById,
    agentesActivosConCantidadPolizas,
    agentesYCantidadDeSiniestros,
};
