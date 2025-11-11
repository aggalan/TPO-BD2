// src/services/cliente.service.js
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
const { CLIENT_CACHE_KEYS } = require('../constants/cacheKeys');

const invalidateClientCaches = async () => {
  await Promise.all(CLIENT_CACHE_KEYS.map((key) => invalidateCache(key).catch(() => undefined)));
};

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const createCliente = async (payload) => {
  if (!payload?.nombre || !payload?.apellido || !payload?.dni) {
    throw createError('nombre, apellido y dni son campos obligatorios');
  }

  const cliente = await createClienteMongo(payload);
  await invalidateClientCaches();
  return cliente;
};

const updateCliente = async (idCliente, updates) => {
  const existing = await getClienteById(idCliente);
  if (!existing) {
    throw createError(`Cliente ${idCliente} no existe`, 404);
  }

  const updated = await updateClienteMongo(idCliente, updates);
  await invalidateClientCaches();
  return updated;
};

const deleteCliente = async (idCliente) => {
  const existing = await getClienteById(idCliente);
  if (!existing) {
    throw createError(`Cliente ${idCliente} no existe`, 404);
  }

  const polizas = await getPolizasByCliente(idCliente);
  if (polizas.length > 0) {
    throw createError(`No se puede eliminar el cliente ${idCliente} porque tiene pólizas asociadas`);
  }

  const deleted = await deleteClienteMongo(idCliente);
  await removeCoberturaEntry(idCliente);
  await invalidateClientCaches();
  return deleted;
};

module.exports = {
  createCliente,
  updateCliente,
  deleteCliente,
};
