const express = require('express');
const app = express();

app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: '¡El sistema de aseguradoras está funcionando!' });
});

// Aquí irán las rutas de /api/v1/...

module.exports = app;
