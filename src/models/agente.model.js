// src/models/agente.model.js
const mongoose = require('mongoose');

const AgenteSchema = new mongoose.Schema({
    id_agente: {
        type: Number,
        required: true,
        unique: true,
        index: true,
    },
    nombre: {
        type: String,
        required: true,
    },
    matricula: {
        type: String,
        required: true,
        unique: true,
    },
    zona: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    telefono: {
        type: String,
        required: true,
    },
    activo: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

AgenteSchema.index({ activo: 1, id_agente: 1 }); // Para búsquedas de agentes activos
AgenteSchema.index({ zona: 1 }); // Si filtrás o agrupás por zona (común en análisis)


module.exports = mongoose.model('Agente', AgenteSchema);