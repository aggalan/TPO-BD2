const Siniestro = require('../../models/siniestro.model');


async function createSiniestroMongo(siniestroData) {
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


export {
    createSiniestroMongo,
}