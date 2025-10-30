// src/server.js
require('dotenv').config();
const app = require('./app');
const { connectAll } = require('./config/db'); // Importa la función

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // 1. Conecta a TODAS las bases de datos
    await connectAll();
    
    // 2. Solo si las BBDD conectan, levanta el servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
