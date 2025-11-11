import { createError,parseDate,normalizePolizaEstado } from '../utils/utils.js';
const {
    createPoliza: createPolizaMongo,
    getActiveClienteById,
    getActiveAgenteById,
} = require('../repositories/crud.repository.js');
const {
    invalidateCache,
    updateCoberturaRanking,
    incrementAgentPolizasMetric,
} = require('../repositories/cache.respository.js');






async function createPoliza(polizaData) {

    const {
        id_cliente,
        id_agente,
        fecha_inicio,
        fecha_vencimiento,
        estado
    } = polizaData;
    const cliente = await getActiveClienteById(id_cliente);
    if (!cliente) {
        throw new Error(`Cliente no encontrado o inactivo (ID: ${id_cliente})`);
    }
    const agente = await getActiveAgenteById(id_agente);
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
    //invalidar QUERY 1-3-4-5-6-7-9-10
    return newPoliza;
}

export {
    createPoliza,
}