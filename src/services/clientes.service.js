const {
    createCliente: createClienteMongo,
    updateCliente: updateClienteMongo,
    deleteCliente: deleteClienteMongo,
    getClienteById,
    getPolizasByCliente,
} = require('../repository/mongo/crud.repository.js');

const {
    invalidateCache,
    removeCoberturaEntry,
} = require('../repository/redis/cache.repository');

const CLIENT_CACHE_KEYS = [
    'clientes_activos_polizas_vigentes',
    'clientes_sin_polizas_activas',
    'vehiculos_asegurados',
    'polizas_vencidas_cliente',
    'polizas_suspendidas_cliente',
    'clientes_multiples_vehiculos',
    'siniestros_abiertos',
    'siniestros_accidente_recientes',
    'agentes_siniestros',
    'polizas_activas_ordenadas',
];

async function createCliente(clienteData) {
    const newCliente = await createClienteMongo(clienteData);
    await invalidateCache('topClientesPorCobertura');
    return newCliente;
}

async function updateCliente(id_cliente, updateData) {
    const updatedCliente = await updateClienteMongo(id_cliente, updateData);
    await invalidateCache(CLIENT_CACHE_KEYS);
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
    await invalidateCache(CLIENT_CACHE_KEYS);
    return deletedCliente;
}