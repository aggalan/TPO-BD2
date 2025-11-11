const {
    agentesYCantidadDeSiniestros: agentesYCantidadDeSiniestrosMongo,
    agentesActivosConCantidadPolizas: agentesActivosConCantidadPolizasMongo,
} = require('../repositories/mongo/agente.repository');
const {
    getOrSetCache,
} = require('../repositories/redis/cache.repository');
const {
    CACHE_AGENTES_POLIZAS,
    CACHE_AGENTES_SINIESTROS,
} = require('../repositories/redis/cache.keys');

async function agentesYCantidadDeSiniestros() {
    return getOrSetCache(
        CACHE_AGENTES_SINIESTROS,
        600, // 10 minutos
        agentesYCantidadDeSiniestrosMongo,
    );
}

async function agentesActivosConCantidadPolizas() {
    return getOrSetCache(
        CACHE_AGENTES_POLIZAS,
        300, // 5 minutos
        agentesActivosConCantidadPolizasMongo,
    );
}

module.exports = {
    agentesYCantidadDeSiniestros,
    agentesActivosConCantidadPolizas,
};
