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
}
