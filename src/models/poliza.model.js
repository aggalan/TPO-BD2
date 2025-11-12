// src/models/poliza.model.js
const mongoose = require('mongoose');

const PolizaSchema = new mongoose.Schema({
    nro_poliza: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    id_cliente: {
        type: Number,
        required: true,
        index: true,
    },
    id_agente: {
        type: Number,
        required: true,
        index: true,
    },

    tipo: {
        type: String,
        required: true,
        index: true,
    },

    fecha_inicio: {
        type: Date,
        required: true,
        // index: true, TODO: checkear si hace falta
    },
    fecha_vencimiento: {
        type: Date,
        required: true,
        // index: true,
    },

    monto_prima: {
        type: Number,
        required: true,
    },
    monto_cobertura: {
        type: Number,
        required: true,
    },

    estado: {
        type: String,
        required: true,
        enum: ['activa', 'vencida', 'suspendida', 'cancelada'],
        default: 'activa',
        index: true,
    },
}, { timestamps: true });

PolizaSchema.index({ estado: 1, fecha_vencimiento: -1 }); // usado en polizasVencidasConCliente
PolizaSchema.index({ estado: 1, fecha_inicio: 1 });       // usado en polizasActivasOrdenadas
PolizaSchema.index({ id_cliente: 1, estado: 1 });         // útil para joins y filtros por cliente
PolizaSchema.index({ id_agente: 1, estado: 1 });          // útil si se filtra por agente + estado

module.exports = mongoose.model('Poliza', PolizaSchema);