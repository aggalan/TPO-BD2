const Cliente = require('../models/cliente.model');
const Poliza = require('../models/poliza.model');
const Siniestro = require('../models/siniestro.model');
const Vehiculo = require('../models/vehiculo.model');
const Agente = require('../models/agente.model');

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
    createPolizaMongo,
    createSiniestroMongo,
}