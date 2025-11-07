const {
    createCliente: createClienteMongo,
    updateCliente: updateClienteMongo,
    deleteCliente: deleteClienteMongo,
    getClienteById,
    getPolizasByCliente,
} = require('../repository/mongo/crud.repository.js');

const {
    invalidateCache,
} = require('../repository/redis/cache.repository');

async function createCliente(clienteData) {
    const newCliente = await createClienteMongo(clienteData);
    return newCliente;
}

async function updateCliente(id_cliente, updateData) {
    const updatedCliente = await updateClienteMongo(id_cliente, updateData);
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

    const deletedCliente = await deleteClienteMongo(id_cliente);
    return deletedCliente;
}