const {
    createCliente: createClienteMongo,
    updateCliente: updateClienteMongo,
    deleteCliente: deleteClienteMongo,
    getClienteById,
    getPolizasByCliente,
} = require('../repository/mongo/crud.repository');

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