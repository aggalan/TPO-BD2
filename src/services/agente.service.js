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
        3600,
        agentesYCantidadDeSiniestrosMongo,
    );
}

async function agentesActivosConCantidadPolizas() {
    return getOrSetCache(
        CACHE_AGENTES_POLIZAS,
        3600,
        agentesActivosConCantidadPolizasMongo,
    );
}

module.exports = {
    agentesYCantidadDeSiniestros,
    agentesActivosConCantidadPolizas,
};
