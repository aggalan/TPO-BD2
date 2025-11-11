const Agente = require("../../models/agente.model");
const Siniestro = require("../../models/siniestro.model");

const getActiveAgenteById = async (idAgente) => {
    return Agente.findOne({ id_agente: idAgente, activo: true }).lean();
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
                ],
                as: 'polizas',
            },
        },
        {
            $addFields: {
                cantidad_polizas: { $size: '$polizas' },
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
    return Siniestro.aggregate([
        {
            $lookup: {
                from: 'polizas',
                localField: 'nro_poliza',
                foreignField: 'nro_poliza',
                as: 'poliza',
            },
        },
        { $unwind: '$poliza' },
        {
            $group: {
                _id: '$poliza.id_agente',
                cantidad_siniestros: { $sum: 1 },
            },
        },
        {
            $lookup: {
                from: 'agentes',
                localField: '_id',
                foreignField: 'id_agente',
                as: 'agente',
            },
        },
        { $unwind: '$agente' },
        {
            $project: {
                _id: 0,
                id_agente: '$_id',
                nombre: '$agente.nombre',
                matricula: '$agente.matricula',
                zona: '$agente.zona',
                activo: '$agente.activo',
                cantidad_siniestros: 1,
            },
        },
        { $sort: { cantidad_siniestros: -1, id_agente: 1 } },
    ]);
};

module.exports = {
    getActiveAgenteById,
    agentesActivosConCantidadPolizas,
    agentesYCantidadDeSiniestros,
};
