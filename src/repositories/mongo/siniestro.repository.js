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
            { $match: { estado: 'abierto' } },
            {
                $lookup: {
                    from: 'polizas',
                    localField: 'nro_poliza',
                    foreignField: 'nro_poliza',
                    as: 'poliza_info',
                    pipeline: [
                        {
                            $lookup: {
                                from: 'clientes',
                                localField: 'id_cliente',
                                foreignField: 'id_cliente',
                                as: 'cliente_info',
                                pipeline: [
                                    { $project: { _id: 0, id_cliente: 1, nombre: 1, apellido: 1, email: 1, telefono: 1 } }
                                ]
                            }
                        },
                        { $unwind: '$cliente_info' },
                        { $project: { id_cliente: '$cliente_info.id_cliente', cliente: '$cliente_info' } }
                    ]
                }
            },
            { $unwind: '$poliza_info' },
            {
                $project: {
                    _id: 0,
                    id_siniestro: 1,
                    nro_poliza: 1,
                    fecha: 1,
                    tipo: 1,
                    descripcion: 1,
                    monto: 1,
                    estado: 1,
                    cliente: '$poliza_info.cliente'
                }
            }
        ]);
    }

    async function getSiniestrosAccidenteUltimoAnio() {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        return Siniestro.find(
            {
                tipo: 'accidente',
                fecha: { $gte: oneYearAgo }
            },
            {
                _id: 0,
                id_siniestro: 1,
                nro_poliza: 1,
                fecha: 1,
                tipo: 1,
                descripcion: 1,
                monto: 1,
                estado: 1
            }
        ).lean();
    }

    module.exports = {
        createSiniestro,
        getSiniestrosAbiertosConCliente,
        getSiniestrosAccidenteUltimoAnio
    }