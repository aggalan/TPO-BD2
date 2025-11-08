// src/models/cliente.model.js
const mongoose = require('mongoose');
const { VehiculoSchema } = require('./vehiculo.model');

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
    vehiculos: {
        type: [VehiculoSchema],
        default: [],
    },
    activo: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

ClienteSchema.index({ 'vehiculos.patente': 1 }, { unique: true, sparse: true });
ClienteSchema.index({ 'vehiculos.nro_chasis': 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Cliente', ClienteSchema);
