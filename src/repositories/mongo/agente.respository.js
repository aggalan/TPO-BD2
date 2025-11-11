const Agente = require("../../models/agente.model");

const getActiveAgenteById = async(idAgente) => {
    return Agente.findOne({ id_agente: idAgente , activo:true}).lean();
}

module.exports = {
    getActiveAgenteById,
}
