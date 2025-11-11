import { createError,normalizeSiniestroEstado,parseDate } from '../utils/utils.js';
import {get} from "mongoose";
const {
    createSiniestro: createSiniestroMongo,
    getSiniestrosAbiertosConCliente: getSiniestrosAbiertosConClienteMongo,
    getSiniestrosAccidenteUltimoAnio: getSiniestrosAccidenteUltimoAnioMongo,
} = require('../repositories/mongo/siniestro.repository.js');




async function createSiniestro(siniestroData) {
    const {
        nro_poliza,
        fecha,
        estado
    } = siniestroData;

    const fechaSiniestro = parseDate(fecha);
    if (!fechaSiniestro) {
        throw new Error('La fecha del siniestro es inválida o nula.');
    }
    const cleanedData = {
        ...siniestroData,
        fecha: fechaSiniestro,
        estado: normalizeSiniestroEstado(estado),
    };
    const polizaActiva = await getActivePolizaById(nro_poliza);
    if (!polizaActiva) {
        throw new Error(`Póliza no encontrada, vencida o suspendida (Nro: ${nro_poliza})`);
    }
    const clienteActivo= await getActiveClienteById(polizaActiva.id_cliente);
    if (!clienteActivo) {
        throw new Error(`Cliente asociado a la póliza no encontrado o inactivo (ID: ${polizaActiva.id_cliente})`);
    }
    if (fechaSiniestro < polizaActiva.fecha_inicio || fechaSiniestro > polizaActiva.fecha_vencimiento) {  //TODO CHECK THIS
        throw new Error(`El siniestro (Fecha: ${fechaSiniestro.toISOString()}) está fuera del período de cobertura de la póliza (Inicio: ${polizaActiva.fecha_inicio.toISOString()}, Fin: ${polizaActiva.fecha_vencimiento.toISOString()}).`);
    }


    const newSiniestro = await createSiniestroMongo(cleanedData);

    //
    /*
    *  Query 12 incrementar el contador de siniestros del agente.
    *
    *
    *  Query 2  INVALIDAR la lista cachead de "siniestros abiertos".
    *
    *
    *  Query 8 INVALIDAR la lista cacheada de "siniestros por accidente del último año".
    *
    */

    return newSiniestro;
}

async function siniestrosAbiertosConCliente() {
    return await getSiniestrosAbiertosConClienteMongo();
}

async function siniestrosAccidenteUltimoAnio() {
    return await  getSiniestrosAccidenteUltimoAnioMongo();
}


module.exports = {
    createSiniestro,
    siniestrosAbiertosConCliente,
    siniestrosAccidenteUltimoAnio
}