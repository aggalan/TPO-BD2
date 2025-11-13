const {
    parseDate,
    normalizeSiniestroEstado,
} = require('../utils/utils');
const {
    createSiniestro: createSiniestroMongo,
    getSiniestrosAbiertosConCliente: getSiniestrosAbiertosConClienteMongo,
    getSiniestrosAccidenteUltimoAnio: getSiniestrosAccidenteUltimoAnioMongo,
} = require('../repositories/mongo/siniestro.repository');

const {
    getPolizaById,
} = require('../repositories/mongo/poliza.repository');
const {
    getOrSetCache,
    invalidateMultiple,
} = require('../repositories/redis/cache.repository');
const {
    CACHE_SINIESTROS_ABIERTOS,
    CACHE_SINIESTROS_ACCIDENTES_ANIO,
    CACHE_AGENTES_SINIESTROS,
} = require('../repositories/redis/cache.keys');
const {getClienteById} = require("./clientes.service");
const { getAgenteById} = require("../repositories/mongo/agente.repository");

async function persistSiniestro(siniestroData) {
    const {
        nro_poliza,
        fecha,
        estado,
        tipo,
    } = siniestroData;

    const fechaSiniestro = parseDate(fecha);
    if (!fechaSiniestro) {
        throw new Error('La fecha del siniestro es inválida o nula.');
    }


    const polizaActiva = await getPolizaById(nro_poliza);
    if (!polizaActiva) {
        throw new Error(`Póliza no encontrada (Nro: ${nro_poliza})`);
    }

    const clienteActivo = await getClienteById(polizaActiva.id_cliente);
    if (!clienteActivo) {
        throw new Error(`Cliente asociado a la póliza no encontrado (ID: ${polizaActiva.id_cliente})`);
    }
    const agenteAsociado = await getAgenteById(polizaActiva.id_agente);


    const cleanedData = {
        ...siniestroData,
        fecha: fechaSiniestro,
        estado: normalizeSiniestroEstado(estado),
        tipo: tipo.toLowerCase(),
        id_cliente: clienteActivo.id_cliente,
        id_agente: agenteAsociado?.id_agente,
    };

    return await createSiniestroMongo(cleanedData);
}

async function createSiniestro(siniestroData) {
    const newSiniestro = await persistSiniestro(siniestroData);
    await invalidateMultiple([
        CACHE_SINIESTROS_ABIERTOS,
        CACHE_SINIESTROS_ACCIDENTES_ANIO,
        CACHE_AGENTES_SINIESTROS,
    ]);

    return newSiniestro;
}

async function siniestrosAbiertosConCliente() {
    return getOrSetCache(
        CACHE_SINIESTROS_ABIERTOS,
        3600,
        getSiniestrosAbiertosConClienteMongo,
    );
}

async function siniestrosAccidenteUltimoAnio() {
    return getOrSetCache(
        CACHE_SINIESTROS_ACCIDENTES_ANIO,
        42600,
        getSiniestrosAccidenteUltimoAnioMongo,
    );
}

module.exports = {
    createSiniestro,
    persistSiniestro,
    siniestrosAbiertosConCliente,
    siniestrosAccidenteUltimoAnio,
};
