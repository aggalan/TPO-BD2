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
module.exports = {
    createPolizaMongo,
}