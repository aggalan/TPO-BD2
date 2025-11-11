import { createError,parseDate,normalizePolizaEstado } from '../utils/utils.js';

const {
    createPoliza: createPolizaMongo,
    polizasVencidasPorCliente: polizasVencidasConCliente,
    polizasActivasOrdenads: polizasActivasOrdenadasMongo,
    polizasSuspendidasConEstadoCliente: polizasSuspendidasConEstadoClienteMongo
} = require('../repositories/mongo/poliza.repository.js');

const {
    activeClientById:getActiveClienteById
} = require('../repositories/mongo/cliente.repository.js');

const {
    activeAgenteById:getAgenteById
} = require('../repositories/mongo/cliente.repository.js');



async function createPoliza(polizaData) {

    const {
        id_cliente,
        id_agente,
        fecha_inicio,
        fecha_vencimiento,
        estado
    } = polizaData;
    const cliente = await activeClienteById(id_cliente);
    //TODO:cacheo esot??
    if (!cliente) {
        throw new Error(`Cliente no encontrado o inactivo (ID: ${id_cliente})`);
    }
    const agente = await activeAgenteById(id_agente);
    //TODO:cacheo esot??

    if (!agente) {
        throw new Error(`Agente no encontrado o inactivo (ID: ${id_agente})`);
    }
    const cleanedData = {
        ...polizaData,
        fecha_inicio: parseDate(fecha_inicio),
        fecha_vencimiento: parseDate(fecha_vencimiento),
        estado: normalizePolizaEstado(estado),
    };
    if (cleanedData.fecha_inicio && cleanedData.fecha_vencimiento) {
        if (cleanedData.fecha_inicio > cleanedData.fecha_vencimiento) {
            throw new Error('La fecha de inicio no puede ser posterior a la fecha de vencimiento');
        }
    }
    const newPoliza = await createPolizaMongo(polizaData);
    //TODO:invalidar QUERY 1-3-4-5-6-7-9-10
    return newPoliza;
}

async function PolizasVencidasConCliente(){
    //TODO:consulto cache
    const data = await polizasVencidasConCliente();
    //TODO:agrego cache
    return data;
}

async function polizasActivasOrdenadas(){
    //TODO:consulto cache
    const data = await polizasActivasOrdenadasMongo();
    //TODO:agrego cache
    return data;
}

async function polizasSuspendidasConEstadoCliente(){
    //consulto cache
    const data = await polizasSuspendidasConEstadoClienteMongo();
    //agrego cache
    return data;


}


export {
    createPoliza,
    polizasVencidasConCliente,
    polizasActivasOrdenadas,
    polizasSuspendidasConEstadoCliente,
}