// src/repository/mongo/query.repository.js
const Cliente = require('../../models/cliente.model');
const Poliza = require('../../models/poliza.model');
const Agente = require('../../models/agente.model');
const Siniestro = require('../../models/siniestro.model');

const clientesActivosConPolizasVigentes = async () => {
  const today = new Date();

  const results = await Cliente.aggregate([
    { $match: { activo: true } },
    {
      $lookup: {
        from: 'polizas',
        let: { clienteId: '$id_cliente' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$id_cliente', '$$clienteId'] },
                  { $eq: ['$estado', 'activa'] },
                  { $gte: ['$fecha_fin', today] },
                ],
              },
            },
          },
          {
            $project: {
              _id: 0,
              nro_poliza: 1,
              tipo: 1,
              fecha_inicio: 1,
              fecha_fin: 1,
              prima_mensual: 1,
              cobertura_total: 1,
            },
          },
        ],
        as: 'polizas_vigentes',
      },
    },
    { $match: { 'polizas_vigentes.0': { $exists: true } } },
    {
      $project: {
        _id: 0,
        id_cliente: 1,
        nombre: 1,
        apellido: 1,
        email: 1,
        telefono: 1,
        polizas_vigentes: 1,
      },
    },
    { $sort: { apellido: 1, nombre: 1 } },
  ]);

  return results;
};

const vehiculosAseguradosConClienteYPoliza = async () => {
  const results = await Cliente.aggregate([
    { $unwind: '$vehiculos' },
    { $match: { 'vehiculos.asegurado': true } },
    {
      $lookup: {
        from: 'polizas',
        let: { clienteId: '$id_cliente' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$id_cliente', '$$clienteId'] },
                  { $eq: ['$estado', 'activa'] },
                ],
              },
            },
          },
          {
            $project: {
              _id: 0,
              nro_poliza: 1,
              tipo: 1,
              fecha_inicio: 1,
              fecha_fin: 1,
            },
          },
        ],
        as: 'polizas',
      },
    },
    {
      $project: {
        _id: 0,
        id_vehiculo: '$vehiculos.id_vehiculo',
        marca: '$vehiculos.marca',
        modelo: '$vehiculos.modelo',
        anio: '$vehiculos.anio',
        patente: '$vehiculos.patente',
        cliente: {
          id_cliente: '$id_cliente',
          nombre: '$nombre',
          apellido: '$apellido',
        },
        polizas: 1,
      },
    },
    { $sort: { marca: 1, modelo: 1, anio: -1 } },
  ]);

  return results;
};

const clientesSinPolizasActivas = async () => {
  const results = await Cliente.aggregate([
    {
      $lookup: {
        from: 'polizas',
        let: { clienteId: '$id_cliente' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$id_cliente', '$$clienteId'] },
                  { $eq: ['$estado', 'activa'] },
                ],
              },
            },
          },
        ],
        as: 'polizas_activas',
      },
    },
    { $match: { 'polizas_activas.0': { $exists: false } } },
    {
      $project: {
        _id: 0,
        id_cliente: 1,
        nombre: 1,
        apellido: 1,
        email: 1,
        telefono: 1,
        activo: 1,
      },
    },
    { $sort: { apellido: 1, nombre: 1 } },
  ]);

  return results;
};

const agentesActivosConCantidadPolizas = async () => {
  const results = await Agente.aggregate([
    { $match: { activo: true } },
    {
      $project: {
        _id: 0,
        id_agente: 1,
        nombre: 1,
        apellido: 1,
        matricula: 1,
        zona: 1,
      },
    },
    { $sort: { apellido: 1, nombre: 1 } },
  ]);

  return results;
};

const polizasVencidasConCliente = async () => {
  const today = new Date();

  const results = await Poliza.aggregate([
    {
      $match: {
        estado: { $in: ['vencida', 'cancelada'] },
        fecha_fin: { $lt: today },
      },
    },
    {
      $lookup: {
        from: 'clientes',
        localField: 'id_cliente',
        foreignField: 'id_cliente',
        as: 'cliente',
      },
    },
    { $unwind: '$cliente' },
    {
      $project: {
        _id: 0,
        nro_poliza: 1,
        tipo: 1,
        fecha_fin: 1,
        estado: 1,
        cliente: {
          id_cliente: '$cliente.id_cliente',
          nombre: '$cliente.nombre',
          apellido: '$cliente.apellido',
        },
      },
    },
    { $sort: { fecha_fin: -1 } },
  ]);

  return results;
};

const topClientesPorCobertura = async (limit = 10) => {
  const results = await Poliza.aggregate([
    {
      $group: {
        _id: '$id_cliente',
        cobertura_total: { $sum: '$cobertura_total' },
      },
    },
    { $sort: { cobertura_total: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'clientes',
        localField: '_id',
        foreignField: 'id_cliente',
        as: 'cliente',
      },
    },
    { $unwind: '$cliente' },
    {
      $project: {
        _id: 0,
        id_cliente: '$cliente.id_cliente',
        nombre: '$cliente.nombre',
        apellido: '$cliente.apellido',
        cobertura_total: 1,
      },
    },
  ]);

  return results;
};

const polizasActivasOrdenadas = async () => {
  const results = await Poliza.find(
    { estado: 'activa' },
    {
      _id: 0,
      nro_poliza: 1,
      tipo: 1,
      fecha_inicio: 1,
      fecha_fin: 1,
      prima_mensual: 1,
      cobertura_total: 1,
      id_cliente: 1,
      id_agente: 1,
    },
  ).sort({ fecha_inicio: 1 });

  return results;
};

const polizasSuspendidasConEstadoCliente = async () => {
  const results = await Poliza.aggregate([
    { $match: { estado: 'suspendida' } },
    {
      $lookup: {
        from: 'clientes',
        localField: 'id_cliente',
        foreignField: 'id_cliente',
        as: 'cliente',
      },
    },
    { $unwind: '$cliente' },
    {
      $project: {
        _id: 0,
        nro_poliza: 1,
        tipo: 1,
        estado: 1,
        cliente: {
          id_cliente: '$cliente.id_cliente',
          nombre: '$cliente.nombre',
          apellido: '$cliente.apellido',
          activo: '$cliente.activo',
        },
      },
    },
  ]);

  return results;
};

const clientesConMultiplesVehiculos = async () => {
  const results = await Cliente.aggregate([
    {
      $project: {
        _id: 0,
        id_cliente: 1,
        nombre: 1,
        apellido: 1,
        cantidad_vehiculos: {
          $size: {
            $filter: {
              input: { $ifNull: ['$vehiculos', []] },
              as: 'vehiculo',
              cond: { $eq: ['$$vehiculo.asegurado', true] },
            },
          },
        },
      },
    },
    { $match: { cantidad_vehiculos: { $gt: 1 } } },
    { $sort: { cantidad_vehiculos: -1, apellido: 1 } },
  ]);

  return results;
};

const siniestrosAbiertosConCliente = async () => {
  const results = await Siniestro.aggregate([
    { $match: { estado: 'abierto' } },
    {
      $lookup: {
        from: 'polizas',
        localField: 'nro_poliza',
        foreignField: 'nro_poliza',
        as: 'poliza',
      },
    },
    {
      $unwind: {
        path: '$poliza',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'clientes',
        localField: 'poliza.id_cliente',
        foreignField: 'id_cliente',
        as: 'cliente',
      },
    },
    {
      $unwind: {
        path: '$cliente',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 0,
        id_siniestro: '$id_siniestro',
        tipo: '$tipo',
        estado: '$estado',
        monto_estimado: '$monto_estimado',
        fecha: '$fecha',
        nro_poliza: '$nro_poliza',
        cliente: {
          $cond: [
            { $ifNull: ['$cliente', false] },
            {
              id_cliente: '$cliente.id_cliente',
              nombre: '$cliente.nombre',
              apellido: '$cliente.apellido',
              email: '$cliente.email',
              telefono: '$cliente.telefono',
              activo: '$cliente.activo',
            },
            null,
          ],
        },
      },
    },
    { $sort: { fecha: -1 } },
  ]);

  return results;
};

const siniestrosAccidenteUltimoAnio = async () => {
  const today = new Date();
  const from = new Date(today);
  from.setFullYear(from.getFullYear() - 1);

  const results = await Siniestro.aggregate([
    {
      $match: {
        fecha: { $gte: from },
        tipo: { $regex: /^accidente$/i },
      },
    },
    {
      $lookup: {
        from: 'polizas',
        localField: 'nro_poliza',
        foreignField: 'nro_poliza',
        as: 'poliza',
      },
    },
    {
      $unwind: {
        path: '$poliza',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'clientes',
        localField: 'poliza.id_cliente',
        foreignField: 'id_cliente',
        as: 'cliente',
      },
    },
    {
      $unwind: {
        path: '$cliente',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 0,
        id_siniestro: '$id_siniestro',
        fecha: '$fecha',
        estado: '$estado',
        monto_estimado: '$monto_estimado',
        nro_poliza: '$nro_poliza',
        cliente: {
          $cond: [
            { $ifNull: ['$cliente', false] },
            {
              id_cliente: '$cliente.id_cliente',
              nombre: '$cliente.nombre',
              apellido: '$cliente.apellido',
              email: '$cliente.email',
            },
            null,
          ],
        },
      },
    },
    { $sort: { fecha: -1 } },
  ]);

  return results;
};

const agentesConCantidadSiniestros = async () => {
  const results = await Agente.aggregate([
    { $match: { activo: true } },
    {
      $project: {
        _id: 0,
        id_agente: '$id_agente',
        nombre: '$nombre',
        apellido: '$apellido',
        matricula: '$matricula',
        zona: '$zona',
        activo: '$activo',
      },
    },
    { $sort: { apellido: 1, nombre: 1 } },
  ]);

  return results;
};

module.exports = {
  clientesActivosConPolizasVigentes,
  vehiculosAseguradosConClienteYPoliza,
  clientesSinPolizasActivas,
  agentesActivosConCantidadPolizas,
  polizasVencidasConCliente,
  topClientesPorCobertura,
  polizasActivasOrdenadas,
  polizasSuspendidasConEstadoCliente,
  clientesConMultiplesVehiculos,
  siniestrosAbiertosConCliente,
  siniestrosAccidenteUltimoAnio,
  agentesConCantidadSiniestros,
};
