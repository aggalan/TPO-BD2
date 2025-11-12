// src/models/siniestro.model.js
const mongoose = require('mongoose');

const SiniestroSchema = new mongoose.Schema({
    id_siniestro: {
        type: Number,
        required: true,
        unique: true,
    },
    nro_poliza: {
        type: String,
        required: true,
    },

    fecha: {
        type: Date,
        required: true,
        default: Date.now,
    },
    tipo: {
        type: String,
        required: true, //TODO: PONEMOS ENUM DE TIPOS?
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

SiniestroSchema.index({ estado: 1, nro_poliza: 1 });          // usado en getSiniestrosAbiertosConCliente
SiniestroSchema.index({ tipo: 1, fecha: 1 });                 // usado en getSiniestrosAccidenteUltimoAnio
SiniestroSchema.index({ nro_poliza: 1, fecha: -1 });           // útil para reportes o histórico por póliza


module.exports = mongoose.model('Siniestro', SiniestroSchema);