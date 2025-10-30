// src/models/siniestro.model.js
const mongoose = require('mongoose');

const SiniestroSchema = new mongoose.Schema({
    id_siniestro: {
        type: Number,
        required: true,
        unique: true,
        index: true,
    },
    nro_poliza: {
        type: String,
        required: true,
        index: true,
    },

    fecha: {
        type: Date,
        required: true,
        default: Date.now,
    },
    tipo: {
        type: String,
        required: true,
    },
    descripcion: {
        type: String,
    },
    monto: {
        type: Number,
        required: true,
    },
    estado: {
        type: String,
        required: true,
        enum: ['abierto', 'en_proceso', 'cerrado_pagado', 'cerrado_rechazado'],
        default: 'abierto',
    }
}, { timestamps: true });

module.exports = mongoose.model('Siniestro', SiniestroSchema);