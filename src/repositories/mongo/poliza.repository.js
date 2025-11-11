const Poliza = require("../../models/poliza.model");

async function createPolizaMongo(polizaData) {
    try {
        const newPoliza = await Poliza.create(polizaData);
        return newPoliza;
    } catch (error) {
        console.error("Error en createPolizaMongo:", error);
        if (error.code === 11000) {
            throw new Error(`Error: El número de póliza '${polizaData.nro_poliza}' ya existe.`);
        }
        throw error;
    }
}

async function polizasVencidasConCliente() {
    try {
        const today = new Date();

        const results = await Poliza.aggregate([
            {
                $match: {
                    estado: 'vencida',
                    fecha_fin: {$lt: today},
                },
            },
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
                    fecha_fin: 1,
                    estado: 1,
                    cliente: {
                        id_cliente: '$cliente.id_cliente',
                        nombre: '$cliente.nombre',
                        apellido: '$cliente.apellido',
                    },
                },
            },
            {$sort: {fecha_fin: -1}},
        ]);

        return results;
    }catch(error) {
        console.error("Error en createPolizaMongo:",error);
        throw error;
    }
}
async function polizasActivasOrdenadas() {
    try {
        const results = await Poliza.find(
            {estado: 'activa'},
            {
                _id: 0,
                nro_poliza: 1,
                tipo: 1,
                fecha_inicio: 1,
                fecha_fin: 1,
                prima_mensual: 1,
                cobertura_total: 1,
                id_cliente: 1,
                id_agente: 1,
            },
        ).sort({fecha_inicio: 1});
        return results;
    }catch(error) {
        console.error("Error en activa:",error);
        throw error;
    }
}

async function polizasSuspendidasConEstadoCliente() {
    try {
        const results = await Poliza.aggregate([
            {$match: {estado: 'suspendidas'}},
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
                    estado: 1,
                    cliente: {
                        id_cliente: '$cliente.id_cliente',
                        nombre: '$cliente.nombre',
                        apellido: '$cliente.apellido',
                        activo: '$cliente.activo',
                    },
                },
            },
        ]);

        return results;
    }catch(error) {
        console.error("Error en activa:",error);
        throw error;
    }
}

async function getActivePolizaById(nroPoliza) {
    return Poliza.findOne({
        nro_poliza: nroPoliza,
        estado: 'activa',
    }).lean();
}

module.exports = {
    createPolizaMongo,
    polizasVencidasConCliente,
    polizasActivasOrdenadas,
    polizasSuspendidasConEstadoCliente,
    getActivePolizaById,
};
