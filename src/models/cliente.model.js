// src/models/cliente.model.js
const mongoose = require('mongoose');
const vehiculoModel = require('./vehiculo.model');

const DomicilioSchema = new mongoose.Schema({
    direccion: { type: String, required: true },
    ciudad: { type: String, required: true },
    provincia: { type: String, required: true },
}, { _id: false }); // Evita crear un _id para el subdocumento

const ClienteSchema = new mongoose.Schema({
    id_cliente: {
        type: Number,
        required: true,
        unique: true,
        index: true,
    },
    nombre: {
        type: String,
        required: true,
    },
    apellido: {
        type: String,
        required: true,
    },
    dni: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
    },
    telefono: {
        type: String,
        required: true,
    },
    domicilio: {
        type: DomicilioSchema,
        required: true,
    },
    estado_activo: {
        type: Boolean,
        default: true,
    },
    vehiculos: [{
        type: vehiculoModel,
        ref: 'Vehiculo',
    }],

}, { timestamps: true });

module.exports = mongoose.model('Cliente', ClienteSchema);