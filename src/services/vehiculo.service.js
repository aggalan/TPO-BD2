const { vehiculosAseguradosConClienteYPoliza : vehiculosAseguradosConClienteYPolizaMongo } = require('../repositories/mongo/cliente.repository');

async function vehiculosAseguradosConClienteYPoliza() {
    //falta cache aca
    return await vehiculosAseguradosConClienteYPolizaMongo()
}

module.exports = {
    vehiculosAseguradosConClienteYPoliza
}