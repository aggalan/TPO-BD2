const {
    createSiniestro: createSiniestroMongo,
} = require('../repository/mongo/crud.repository.js');

const {
    invalidateCache,
} = require('../repository/redis/cache.repository');


async function createSiniestro(siniestroData) {
   //TODO: check de cliente y poliza existents
    const newSiniestro = await createSiniestroMongo(siniestroData);
    return newSiniestro;
}