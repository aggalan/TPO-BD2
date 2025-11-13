// src/models/poliza.model.js
const mongoose = require('mongoose');

const PolizaSchema = new mongoose.Schema({
    nro_poliza: {
        type: String,
        required: true,
        unique: true,
    },
    id_cliente: {
        type: Number,
        required: true,
    },
    id_agente: {
        type: Number,
        required: false,
    },

    tipo: {
        type: String,
        required: true,
    },

    fecha_inicio: {
        type: Date,
        required: true,
    },
    fecha_vencimiento: {
        type: Date,
        required: true,
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
    },
}, { timestamps: true });

PolizaSchema.index({ nro_poliza: 1, estado: 1 });
PolizaSchema.index({ estado: 1, fecha_vencimiento: -1 }); // usado en polizasVencidasConCliente
PolizaSchema.index({ estado: 1, fecha_inicio: 1 });       // usado en polizasActivasOrdenadas
PolizaSchema.index({ id_cliente: 1, estado: 1 });         // útil para joins y filtros por cliente
PolizaSchema.index({ id_agente: 1, estado: 1 });          // útil si se filtra por agente + estado
PolizaSchema.index({ id_cliente: 1, monto_cobertura: -1 });
PolizaSchema.index({ id_cliente: 1, tipo: 1 }, { unique: true });

module.exports = mongoose.model('Poliza', PolizaSchema);