// src/models/vehiculo.model.js
const mongoose = require('mongoose');

const VehiculoSchema = new mongoose.Schema(
  {
    id_vehiculo: {
      type: Number,
      required: true,
    },
    nro_chasis: {
      type: String,
      required: true,
    },
    patente: {
      type: String,
      required: true,
    },
    marca: {
      type: String,
      required: true,
    },
    modelo: {
      type: String,
      required: true,
    },
    anio: {
      type: Number,
      required: true,
      min: 1900,
    },
    asegurado: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false },
);

module.exports = {
  VehiculoSchema,
};
