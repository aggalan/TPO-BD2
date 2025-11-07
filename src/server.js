// src/server.js
require('dotenv').config();
const app = require('./app');
const { connectAll } = require('./config/db');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectAll();

    //correr el csv initial data load only once

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
