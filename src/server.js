// src/server.js
require('dotenv').config();
const app = require('./app');
const { connectAll } = require('./config/db');
const loadData = require('./scripts/loadData');
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectAll();

    await loadData.run();

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
