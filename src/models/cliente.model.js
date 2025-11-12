// src/models/cliente.model.js
const mongoose = require('mongoose');
const { schema: VehiculoSchema } = require('./vehiculo.model');

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
        trim: true,
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
        index: true,
    },
    vehiculos: [VehiculoSchema],

}, { timestamps: true });

ClienteSchema.index({  estado_activo: 1, id_cliente: 1 });


module.exports = mongoose.model('Cliente', ClienteSchema);
