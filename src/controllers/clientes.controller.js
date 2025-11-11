const clienteService = require('../services/clientes.service');


const createCliente = async (req, res, next) => {
    try {
        const cliente = await clienteService.createCliente(req.body);
        res.status(201).json(cliente);
    } catch (error) {
        next(error);
    }
};

const updateCliente = async (req, res, next) => {
    try {
        const cliente = await clienteService.updateCliente(req.params.idCliente, req.body);
        res.status(200).json(cliente);
    }
    catch (error) {
        next(error);
    }
};

const deleteCliente = async (req, res, next) => {
    try {
        await clienteService.deleteCliente(req.params.idCliente);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
const clientesActivosConPolizasVigentes = async (req, res, next) => {
    try {
        const clientes = await clienteService.clientesActivosConPolizasVigentes();
        res.status(200).json(clientes);
    } catch (error) {
        next(error);
    }
};

const clientesSinPolizasActivas = async (req, res, next) => {
    try {
        const clientes = await clienteService.clientesSinPolizasActivas();
        res.status(200).json(clientes);
    }
    catch (error) {
        next(error);
    }
};

const clientesConMultiplesVehiculos = async (req, res, next) => {
    try {
        const clientes = await clienteService.clientesConMultiplesVehiculos();
        res.status(200).json(clientes);
    }
    catch (error) {
        next(error);
    }
}
const topClientesPorCobertura = async (req, res, next) => {
    try {
        const clientes = await clienteService.top10ClientesPorCobertura();
        res.status(200).json(clientes);
    }
    catch (error) {
        next(error);
    }
}


module.exports = {
    createCliente,
    updateCliente,
    deleteCliente,
    clientesActivosConPolizasVigentes,
    clientesSinPolizasActivas,
    clientesConMultiplesVehiculos,
    topClientesPorCobertura
}
