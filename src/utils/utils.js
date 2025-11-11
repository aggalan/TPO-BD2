const createError = (message, statusCode = 400) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const parseDate = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        throw createError(`Fecha inválida: ${value}`);
    }
    return parsed;
};

const normalizePolizaEstado = (estado) => {
    if (!estado) return 'activa';
    const normalized = estado.toString().trim().toLowerCase();
    switch (normalized) {
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
    const normalized = estado.toString().trim().toLowerCase();
    if (normalized.startsWith('abierto')) return 'abierto';
    if (normalized.startsWith('cerrado')) return 'cerrado';
    if (normalized.includes('evalu')) return 'en_evaluacion';
    return 'abierto';
};

module.exports = {
    createError,
    parseDate,
    normalizePolizaEstado,
    normalizeSiniestroEstado,
};
