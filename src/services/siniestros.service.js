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
    getActiveClienteById,
} = require('../repositories/mongo/cliente.repository');
const {
    getActivePolizaById,
} = require('../repositories/mongo/poliza.repository');
const {
    getOrSetCache,
    invalidateMultiple,
} = require('../repositories/redis/cache.repository');
const {
    CACHE_SINIESTROS_ABIERTOS,
    CACHE_SINIESTROS_ACCIDENTES_ANIO,
} = require('../repositories/redis/cache.keys');

async function createSiniestro(siniestroData) {
    const {
        nro_poliza,
        fecha,
        estado,
    } = siniestroData;

    const fechaSiniestro = parseDate(fecha);
    if (!fechaSiniestro) {
        throw new Error('La fecha del siniestro es inválida o nula.');
    }

    const cleanedData = {
        ...siniestroData,
        fecha: fechaSiniestro,
        estado: normalizeSiniestroEstado(estado),
    };

    const polizaActiva = await getActivePolizaById(nro_poliza);
    if (!polizaActiva) {
        throw new Error(`Póliza no encontrada, vencida o suspendida (Nro: ${nro_poliza})`);
    }

    const clienteActivo = await getActiveClienteById(polizaActiva.id_cliente);
    if (!clienteActivo) {
        throw new Error(`Cliente asociado a la póliza no encontrado o inactivo (ID: ${polizaActiva.id_cliente})`);
    }

    if (fechaSiniestro < polizaActiva.fecha_inicio || fechaSiniestro > polizaActiva.fecha_vencimiento) {
        throw new Error(`El siniestro (Fecha: ${fechaSiniestro.toISOString()}) está fuera del período de cobertura de la póliza (Inicio: ${polizaActiva.fecha_inicio.toISOString()}, Fin: ${polizaActiva.fecha_vencimiento.toISOString()}).`);
    }

    const newSiniestro = await createSiniestroMongo(cleanedData);

    await invalidateMultiple([
        CACHE_SINIESTROS_ABIERTOS,
        CACHE_SINIESTROS_ACCIDENTES_ANIO,
    ]);

    return newSiniestro;
}

async function siniestrosAbiertosConCliente() {
    return getOrSetCache(
        CACHE_SINIESTROS_ABIERTOS,
        300, // 5 minutos
        getSiniestrosAbiertosConClienteMongo,
    );
}

async function siniestrosAccidenteUltimoAnio() {
    return getOrSetCache(
        CACHE_SINIESTROS_ACCIDENTES_ANIO,
        1800, // 30 minutos
        getSiniestrosAccidenteUltimoAnioMongo,
    );
}

module.exports = {
    createSiniestro,
    siniestrosAbiertosConCliente,
    siniestrosAccidenteUltimoAnio,
};
