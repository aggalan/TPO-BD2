const {
    createPoliza: createPolizaMongo,

} = require('../repository/mongo/crud.repository.js');

const {
    invalidateCache,
} = require('../repository/redis/cache.repository');


async function createPoliza(clienteData) {
    const newPoliza = await createPolizaMongo(clienteData);
    return newCliente;
}