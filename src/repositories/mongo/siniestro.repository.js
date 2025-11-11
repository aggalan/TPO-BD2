const Siniestro = require('../../models/siniestro.model');


async function createSiniestro(siniestroData) {
    try {
        return await Siniestro.create(siniestroData);
    } catch (error) {
        console.error("Error en createSiniestroMongo:", error);
        if (error.code === 11000) {
            throw new Error(`Error: El ID de siniestro '${siniestroData.id_siniestro}' ya existe.`);
        }
        throw error;
    }
}

async function getSiniestrosAbiertosConCliente() {
    return Siniestro.aggregate([
        {
            $match: {estado: 'abierto'}
        },
        {
            $lookup: {
                from: 'polizas',
                localField: 'nro_poliza',
                foreignField: 'nro_poliza',
                as: 'poliza_info'
            }
        },
        {
            $unwind: '$poliza_info'
        },
        {
            $lookup: {
                from: 'clientes',
                localField: 'poliza_info.id_cliente',
                foreignField: 'id_cliente',
                as: 'cliente_info'
            }
        },
        {
            $unwind: '$cliente_info'
        },
        {
            $project: {
                id_siniestro: 1,
                nro_poliza: 1,
                fecha: 1,
                tipo: 1,
                descripcion: 1,
                monto: 1,
                estado: 1,
                cliente: {
                    id_cliente: '$cliente_info.id_cliente',
                    nombre: '$cliente_info.nombre',
                    apellido: '$cliente_info.apellido',
                    email: '$cliente_info.email',
                    telefono: '$cliente_info.telefono',
                }
            }
        }
    ]);
}
async function getSiniestrosAccidenteUltimoAnio() {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    return Siniestro.aggregate([
        {
            $match: {
                tipo: 'accidente',
                fecha: { $gte: oneYearAgo }
            }
        },
        {
            $lookup: {
                from: 'polizas',
                localField: 'nro_poliza',
                foreignField: 'nro_poliza',
                as: 'poliza_info'
            }
        },
        {
            $unwind: '$poliza_info'
        },
        {
            $lookup: {
                from: 'clientes',
                localField: 'poliza_info.id_cliente',
                foreignField: 'id_cliente',
                as: 'cliente_info'
            }
        },
        {
            $unwind: '$cliente_info'
        }
    ]);
}

module.exports = {
    createSiniestro,
    getSiniestrosAbiertosConCliente,
    getSiniestrosAccidenteUltimoAnio
}