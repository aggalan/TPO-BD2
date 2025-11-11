const {
    createCliente: createClienteMongo,
    updateCliente: updateClienteMongo,
    deleteCliente: deleteClienteMongo,
    getClienteById: getClienteByIdMongo,
    getActiveClienteById,
    getPolizasByCliente,
} = require('../repository/mongo/siniestro.repository.js');

const {
    invalidateCache,
    invalidateMultiple,
} = require('../repository/cache.repository');
const {CACHE_CLIENTES_ACTIVOS, CACHE_CLIENTES_SIN_POLIZAS, CACHE_SINIESTROS_ABIERTOS,
    CACHE_VEHICULOS_ASEGURADOS
} = require("../repositories/redis/cache.keys");

async function createCliente(clienteData) {
    const newCliente = await createClienteMongo(clienteData);
    await invalidateMultiple([
        CACHE_CLIENTES_ACTIVOS,   // Query 1
        CACHE_CLIENTES_SIN_POLIZAS // Query 4
    ]);
    return newCliente;
}

async function updateCliente(id_cliente, updateData) {
    const updatedCliente = await updateClienteMongo(id_cliente, updateData);
    await invalidateMultiple([
        CACHE_CLIENTES_ACTIVOS,
        CACHE_SINIESTROS_ABIERTOS,
        CACHE_VEHICULOS_ASEGURADOS,
        CACHE_CLIENTES_SIN_POLIZAS
    ]);
    return updatedCliente;
}

async function deleteCliente(id_cliente) {
    const cliente = await getClienteById(id_cliente);
    if (!cliente) {
        throw new Error('Cliente no encontrado');
    }

    //TODO: debo borrar la poliza existente?on delete set null?(es mongo)
    const polizas = await getPolizasByCliente(id_cliente);
    for (const poliza of polizas) {
        await removeCoberturaEntry(poliza.id_poliza);
    }
    // await invalidateMultiple([
    //     CACHE_CLIENTES_ACTIVOS,


    return await deleteClienteMongo(id_cliente);
}

async function getClienteById(id_cliente) {
    return await getClienteByIdMongo(id_cliente);
}

async function getActiveClienteById(id_cliente) {
    return await getActiveClienteById(id_cliente);
}

async function clientesActivosConPolizasVigentes(id_cliente) {
    return await clientesActivosConPolizasVigentes(id_cliente);
}


module.exports = {
    createCliente,
    updateCliente,
    deleteCliente,
    getClienteById,
    getActiveClienteById,
    clientesActivosConPolizasVigentes
}