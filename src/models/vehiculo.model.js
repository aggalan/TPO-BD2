// src/models/vehiculo.model.js
const mongoose = require('mongoose');

const VehiculoSchema = new mongoose.Schema({
    id_vehiculo: {
        type: Number,
        required: true,
        unique: true,
        index: true,
    },
    id_cliente: {
        type: Number,
        required: true,
        index: true,
    },
    nro_chasis: {
        type: String,
        required: true,
        unique: true,
    },
    patente: {
        type: String,
        required: true,
        unique: true,
    },
    marca: {
        type: String,
        required: true,
    },
    modelo: {
        type: String,
        required: true,
    },
    anio:{
        type: Number,
        required: true,
    },
    asegurado: {
        type: Boolean,
        default: true,
    },

}, { timestamps: true });

module.exports = mongoose.model('Vehiculo', VehiculoSchema);
