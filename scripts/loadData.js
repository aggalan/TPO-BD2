// scripts/loadData.js
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const mongoose = require('mongoose');

const { connectAll, redisClient } = require('../src/config/db');
const Cliente = require('../src/models/cliente.model');
const Poliza = require('../src/models/poliza.model');
const Siniestro = require('../src/models/siniestro.model');
const Vehiculo = require('../src/models/vehiculo.model');
const Agente = require('../src/models/agente.model');

const rootDir = path.join(__dirname, '..');
const datasetsDir = path.join(rootDir, 'datasets');

const readCsv = (filename) => {
  const filePath = path.join(datasetsDir, filename);
  const rawContent = fs.readFileSync(filePath, 'utf8');
  const [headerLine, ...rows] = rawContent.trim().split(/\r?\n/);
  const headers = headerLine.split(',').map((h) => h.trim());

  return rows
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const values = line.split(',').map((v) => v.trim());
      return headers.reduce((acc, header, idx) => {
        acc[header] = values[idx] ?? null;
        return acc;
      }, {});
    });
};

const parseBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (!value) return false;
  return value.toString().toLowerCase() === 'true';
};

const parseNumber = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
};

const parseDate = (value) => {
  if (!value) return null;
  const [day, month, year] = value.split('/').map((part) => parseInt(part, 10));
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
};

const normalizePolizaEstado = (estado) => {
  if (!estado) return 'activa';
  const standardized = estado.toString().trim().toLowerCase();
  switch (standardized) {
    case 'activa':
      return 'activa';
    case 'vencida':
      return 'vencida';
    case 'suspendida':
      return 'suspendida';
    case 'cancelada':
      return 'cancelada';
    default:
      return 'activa';
  }
};

const normalizeSiniestroEstado = (estado) => {
  if (!estado) return 'abierto';
  const standardized = estado.toString().trim().toLowerCase();
  if (standardized.startsWith('abierto')) return 'abierto';
  if (standardized.startsWith('cerrado')) return 'cerrado';
  if (standardized.includes('evalu')) return 'en_evaluacion';
  return 'abierto';
};

const loadDatasets = () => {
  const clientes = readCsv('clientes.csv').map((row) => ({
    id_cliente: parseNumber(row.id_cliente),
    nombre: row.nombre,
    apellido: row.apellido,
    dni: row.dni,
    email: row.email,
    telefono: row.telefono,
    domicilio: {
      direccion: row.direccion,
      ciudad: row.ciudad,
      provincia: row.provincia,
    },
    activo: parseBoolean(row.activo),
  }));

  const polizas = readCsv('polizas.csv').map((row) => ({
    nro_poliza: row.nro_poliza,
    id_cliente: parseNumber(row.id_cliente),
    id_agente: parseNumber(row.id_agente),
    tipo: row.tipo,
    fecha_inicio: parseDate(row.fecha_inicio),
    fecha_fin: parseDate(row.fecha_fin),
    prima_mensual: parseNumber(row.prima_mensual),
    cobertura_total: parseNumber(row.cobertura_total),
    estado: normalizePolizaEstado(row.estado),
  }));

  const polizasWithAgent = polizas.filter((poliza) => poliza.id_agente !== null);

  const siniestros = readCsv('siniestros.csv').map((row) => ({
    id_siniestro: parseNumber(row.id_siniestro),
    nro_poliza: row.nro_poliza,
    fecha: parseDate(row.fecha),
    tipo: row.tipo,
    monto_estimado: parseNumber(row.monto_estimado),
    descripcion: row.descripcion,
    estado: normalizeSiniestroEstado(row.estado),
  }));

  const seenChasis = new Set();
  const vehiculos = readCsv('vehiculos.csv').map((row) => {
    const idVehiculo = parseNumber(row.id_vehiculo);
    let chasis = row.nro_chasis ? row.nro_chasis.trim() : '';
    if (!chasis || seenChasis.has(chasis)) {
      let fallback = `GENERATED-${idVehiculo ?? 'UNKNOWN'}`;
      let attempts = 1;
      while (seenChasis.has(fallback)) {
        fallback = `GENERATED-${idVehiculo ?? 'UNKNOWN'}-${attempts++}`;
      }
      chasis = fallback;
    }
    seenChasis.add(chasis);

    return {
      id_vehiculo: idVehiculo,
      id_cliente: parseNumber(row.id_cliente),
      marca: row.marca,
      modelo: row.modelo,
      anio: parseNumber(row.anio),
      patente: row.patente,
      nro_chasis: chasis,
      asegurado: parseBoolean(row.asegurado),
    };
  });

  const agentes = readCsv('agentes.csv').map((row) => ({
    id_agente: parseNumber(row.id_agente),
    nombre: row.nombre,
    apellido: row.apellido,
    matricula: row.matricula,
    telefono: row.telefono,
    email: row.email,
    zona: row.zona,
    activo: parseBoolean(row.activo),
  }));

  return {
    clientes,
    polizas,
    polizasWithAgent,
    siniestros,
    vehiculos,
    agentes,
  };
};

const resetMongoCollections = async () => {
  await Promise.all([
    Cliente.deleteMany({}),
    Poliza.deleteMany({}),
    Siniestro.deleteMany({}),
    Vehiculo.deleteMany({}),
    Agente.deleteMany({}),
  ]);
};

const seedMongo = async ({ clientes, polizasWithAgent, siniestros, vehiculos, agentes }) => {
  await Cliente.insertMany(clientes);
  await Agente.insertMany(agentes);
  await Vehiculo.insertMany(vehiculos);
  await Poliza.insertMany(polizasWithAgent);
  await Siniestro.insertMany(siniestros);
};

const seedRedis = async ({ polizasWithAgent }) => {
  await redisClient.flushDb();

  const coberturaPorCliente = polizasWithAgent.reduce((acc, poliza) => {
    if (!poliza.cobertura_total) return acc;
    acc[poliza.id_cliente] = (acc[poliza.id_cliente] ?? 0) + poliza.cobertura_total;
    return acc;
  }, {});

  const rankingEntries = Object.entries(coberturaPorCliente).map(([idCliente, cobertura]) => ({
    score: cobertura,
    value: `cliente:${idCliente}`,
  }));

  if (rankingEntries.length > 0) {
    await redisClient.zAdd('ranking:cobertura_total', rankingEntries);
  }
};

const run = async () => {
  try {
    await connectAll();
    const datasets = loadDatasets();

    await resetMongoCollections();
    await seedMongo(datasets);
    await seedRedis(datasets);

    console.log('✅ Datos cargados correctamente en MongoDB y Redis');
  } catch (error) {
    console.error('❌ Error durante la carga de datos:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    await redisClient.quit();
  }
};

run();
