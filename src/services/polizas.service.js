const {
    parseDate,
    normalizePolizaEstado,
} = require('../utils/utils');
const {
    createPolizaMongo,
    polizasVencidasConCliente: polizasVencidasConClienteMongo,
    polizasActivasOrdenadas: polizasActivasOrdenadasMongo,
    polizasSuspendidasConEstadoCliente: polizasSuspendidasConEstadoClienteMongo,
} = require('../repositories/mongo/poliza.repository');
const {
    getActiveClienteById,
} = require('../repositories/mongo/cliente.repository');
const {
    getActiveAgenteById,
} = require('../repositories/mongo/agente.repository');
const {
    getOrSetCache,
    invalidateMultiple,
} = require('../repositories/redis/cache.repository');
const {
    CACHE_CLIENTES_ACTIVOS,
    CACHE_CLIENTES_SIN_POLIZAS,
    CACHE_TOP_10_CLIENTES,
    CACHE_VEHICULOS_ASEGURADOS,
    CACHE_POLIZAS_VENCIDAS,
    CACHE_POLIZAS_ACTIVAS_ORDENADAS,
    CACHE_POLIZAS_SUSPENDIDAS,
    CACHE_AGENTES_POLIZAS,
} = require('../repositories/redis/cache.keys');

async function createPoliza(polizaData) {
    const {
        id_cliente,
        id_agente,
        fecha_inicio,
        fecha_vencimiento,
        estado,
    } = polizaData;

    const cliente = await getActiveClienteById(id_cliente);
    if (!cliente) {
        throw new Error(`Cliente no encontrado o inactivo (ID: ${id_cliente})`);
    }

    const agente = await getActiveAgenteById(id_agente);
    if (!agente) {
        throw new Error(`Agente no encontrado o inactivo (ID: ${id_agente})`);
    }

    const cleanedData = {
        ...polizaData,
        fecha_inicio: parseDate(fecha_inicio),
        fecha_vencimiento: parseDate(fecha_vencimiento),
        estado: normalizePolizaEstado(estado),
    };

    if (cleanedData.fecha_inicio && cleanedData.fecha_vencimiento) {
        if (cleanedData.fecha_inicio > cleanedData.fecha_vencimiento) {
            throw new Error('La fecha de inicio no puede ser posterior a la fecha de vencimiento');
        }
    }

    const newPoliza = await createPolizaMongo(cleanedData);

    await invalidateMultiple([
        CACHE_CLIENTES_ACTIVOS,
        CACHE_CLIENTES_SIN_POLIZAS,
        CACHE_TOP_10_CLIENTES,
        CACHE_VEHICULOS_ASEGURADOS,
        CACHE_POLIZAS_VENCIDAS,
        CACHE_POLIZAS_ACTIVAS_ORDENADAS,
        CACHE_POLIZAS_SUSPENDIDAS,
        CACHE_AGENTES_POLIZAS,
    ]);

    return newPoliza;
}

async function polizasVencidasConCliente() {
    return getOrSetCache(
        CACHE_POLIZAS_VENCIDAS,
        900, // 15 minutos
        polizasVencidasConClienteMongo,
    );
}

async function polizasActivasOrdenadas() {
    return getOrSetCache(
        CACHE_POLIZAS_ACTIVAS_ORDENADAS,
        300, // 5 minutos
        polizasActivasOrdenadasMongo,
    );
}

async function polizasSuspendidasConEstadoCliente() {
    return getOrSetCache(
        CACHE_POLIZAS_SUSPENDIDAS,
        600, // 10 minutos
        polizasSuspendidasConEstadoClienteMongo,
    );
}

module.exports = {
    createPoliza,
    polizasVencidasConCliente,
    polizasActivasOrdenadas,
    polizasSuspendidasConEstadoCliente,
};
