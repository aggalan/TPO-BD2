const {
    vehiculosAseguradosConClienteYPoliza: vehiculosAseguradosConClienteYPolizaMongo,
} = require('../repositories/mongo/cliente.repository');
const { getOrSetCache } = require('../repositories/redis/cache.repository');
const { CACHE_VEHICULOS_ASEGURADOS } = require('../repositories/redis/cache.keys');

async function vehiculosAseguradosConClienteYPoliza() {
    return getOrSetCache(
        CACHE_VEHICULOS_ASEGURADOS,
        42600,
        vehiculosAseguradosConClienteYPolizaMongo,
    );
}

module.exports = {
    vehiculosAseguradosConClienteYPoliza,
};
