const express = require('express');

const consultasRouter = require('./routes/consultas.routes');
const clientesRouter = require('./routes/clientes.routes');
const polizasRouter = require('./routes/polizas.routes');
const siniestrosRouter = require('./routes/siniestros.routes');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ message: '¡El sistema de aseguradoras está funcionando!' });
});

app.use('/api', consultasRouter);
app.use('/api', clientesRouter);
app.use('/api', polizasRouter);
app.use('/api', siniestrosRouter);

// Middleware de manejo de errores
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const derivedStatus = err.name === 'ValidationError' ? 400 : undefined;
  const status = err.statusCode ?? err.status ?? derivedStatus ?? 500;
  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error('Error inesperado:', err);
  }
  res.status(status).json({ message: err.message ?? 'Error interno del servidor' });
});

module.exports = app;
