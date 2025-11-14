const mongoose = require('mongoose');

const PolizaActivaSchema = new mongoose.Schema({
    nro_poliza: { type: String },
    tipo: { type: String },
    fecha_inicio: { type: Date },
    fecha_vencimiento: { type: Date },
    monto_prima: { type: Number },
    monto_cobertura: { type: Number },
    id_cliente: { type: Number },
    id_agente: { type: Number },
}, {
    collection: 'vista_polizas_activas',
    timestamps: false,
    autoIndex: false,
});

PolizaActivaSchema.pre('save', function(next) {
    next(new Error('Las Vistas son de solo lectura'));
});

const PolizaActivaView = mongoose.model('PolizaActivaView', PolizaActivaSchema);

module.exports = PolizaActivaView;