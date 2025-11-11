const express = require('express');

const vehiculosRouter = require('./routes/vehiculos.route');
const clientesRouter = require('./routes/clientes.route');
const polizasRouter = require('./routes/polizas.route');
const siniestrosRouter = require('./routes/siniestros.route');
const agentesRouter = require('./routes/agentes.route');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ message: '¡El sistema de aseguradoras está funcionando!' });
});

app.use('/api', vehiculosRouter);
app.use('/api', clientesRouter);
app.use('/api', polizasRouter);
app.use('/api', siniestrosRouter);
app.use('/api', agentesRouter);

app.use((err, req, res, next) => {
  const derivedStatus = err.name === 'ValidationError' ? 400 : undefined;
  const status = err.statusCode ?? err.status ?? derivedStatus ?? 500;
  if (status >= 500) {
    console.error('Error inesperado:', err);
  }
  res.status(status).json({ message: err.message ?? 'Error interno del servidor' });
});

module.exports = app;