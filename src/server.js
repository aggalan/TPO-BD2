require('dotenv').config(); // Carga el .env al inicio
const app = require('./app');
const { connectAll } = require('./config/db');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  // Conecta a las BBDD después de levantar el servidor
  connectAll();
});
