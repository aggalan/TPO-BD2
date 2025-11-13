const {
    createCliente: createClienteMongo,
    updateCliente: updateClienteMongo,
    getClienteById: getClienteByIdMongo,
    clientesActivosConPolizasVigentes: clientesActivosConPolizasVigentesMongo,
    clientesSinPolizasActivas: clientesSinPolizasActivasMongo,
    top10ClientesPorCobertura: top10ClientesPorCoberturaMongo,
    clientesConMultiplesVehiculos: clientesConMultiplesVehiculosMongo,
    vehiculosAseguradosConClienteYPoliza: vehiculosAseguradosConClienteYPolizaMongo,
} = require('../repositories/mongo/cliente.repository.js');


const {
    invalidateMultiple,
    getOrSetCache,
} = require('../repositories/redis/cache.repository');

const {
    CACHE_CLIENTES_ACTIVOS,           // Q1
    CACHE_CLIENTES_SIN_POLIZAS,       // Q4
    CACHE_TOP_10_CLIENTES,            // Q7
    CACHE_CLIENTES_MULTI_VEHICULO,    // Q11
    CACHE_VEHICULOS_ASEGURADOS,       // Q3
} = require("../repositories/redis/cache.keys");



async function createCliente(clienteData) {
    try {
        const newCliente = await createClienteMongo(clienteData);

        const cachesToInvalidate = [
            CACHE_CLIENTES_ACTIVOS,       // Q1
            CACHE_CLIENTES_SIN_POLIZAS,   // Q4
        ];

        if (clienteData.vehiculos && clienteData.vehiculos.length > 0) {
            cachesToInvalidate.push(CACHE_VEHICULOS_ASEGURADOS);
            cachesToInvalidate.push(CACHE_CLIENTES_MULTI_VEHICULO);
        }


        await invalidateMultiple(cachesToInvalidate);
        return newCliente;
    } catch (error) {
        if (error.code === 11000) {
            throw new Error(`Error: Ya existe un cliente con esos datos (DNI/ID).`);
        }
        throw error;
    }
}


async function updateCliente(id_cliente, updateData) {

    const clienteExistente = await getClienteByIdMongo(id_cliente);
    if (!clienteExistente) {
        throw new Error('Cliente no encontrado');
    }

    const updatedCliente = await updateClienteMongo(id_cliente, updateData);
    const cachesToInvalidate = [
        CACHE_CLIENTES_ACTIVOS,
        CACHE_CLIENTES_SIN_POLIZAS,
        CACHE_TOP_10_CLIENTES,
        CACHE_CLIENTES_MULTI_VEHICULO,
        CACHE_VEHICULOS_ASEGURADOS,
    ];

    await invalidateMultiple(cachesToInvalidate);
    return updatedCliente;
}

async function deleteCliente(id_cliente) {

    const cliente = await getClienteByIdMongo(id_cliente);
    if (!cliente) {
        throw new Error('Cliente no encontrado');
    }

    if (!cliente.estado_activo) {
        return { message: 'El cliente ya estaba inactivo.' };
    }

    return await updateCliente(id_cliente, { estado_activo: false });
}




async function getClienteById(id_cliente) {
    return await getClienteByIdMongo(id_cliente);
}




async function clientesActivosConPolizasVigentes() {
    return getOrSetCache(
        CACHE_CLIENTES_ACTIVOS,
        300, // 5 minutos TTL
        clientesActivosConPolizasVigentesMongo
    );
}


async function clientesSinPolizasActivas() {
    return getOrSetCache(
        CACHE_CLIENTES_SIN_POLIZAS,
        3600, // 1 hora TTL
        clientesSinPolizasActivasMongo
    );
}


async function top10ClientesPorCobertura() {
    return getOrSetCache(
        CACHE_TOP_10_CLIENTES,
        3600, // 1 hora TTL
        top10ClientesPorCoberturaMongo
    );
}


async function clientesConMultiplesVehiculos() {
    return getOrSetCache(
        CACHE_CLIENTES_MULTI_VEHICULO,
        3600, // 1 hora TTL
        clientesConMultiplesVehiculosMongo
    );
}


async function vehiculosAseguradosConClienteYPoliza() {
    return getOrSetCache(
        CACHE_VEHICULOS_ASEGURADOS,
        300, //TTL
        vehiculosAseguradosConClienteYPolizaMongo
    );
}


module.exports = {
    // ABM (Servicio 13)
    createCliente,
    updateCliente,
    deleteCliente,
    getClienteById,
    // Queries con Caché
    clientesActivosConPolizasVigentes,       // Q1
    vehiculosAseguradosConClienteYPoliza, // Q3
    clientesSinPolizasActivas,           // Q4
    top10ClientesPorCobertura,         // Q7
    clientesConMultiplesVehiculos,       // Q11
};