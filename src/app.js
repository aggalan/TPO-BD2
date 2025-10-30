const express = require('express');
const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ message: '¡El sistema de aseguradoras está funcionando!' });
});


module.exports = app;
