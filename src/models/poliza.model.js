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
    },

    fecha_inicio: {
        type: Date,
        required: true,
    },
    fecha_fin: {
        type: Date,
        required: true,
    },

    prima_mensual: {
        type: Number,
        required: true,
    },
    cobertura_total: {
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

module.exports = mongoose.model('Poliza', PolizaSchema);
