const {
    createPoliza: createPolizaMongo,
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

async function createPoliza(clienteData) {
    const newPoliza = await createPolizaMongo(clienteData);
    await invalidateCache('clientes_activos_polizas_vigentes');
    await invalidateCache('polizas_activas_ordenadas');
    return newCliente;
}