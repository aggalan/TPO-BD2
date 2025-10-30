// Por ahora, solo funciones vacías para que el server arranque
const connectMongo = () => console.log('Simulando conexión a MongoDB...');
const connectNeo4j = () => console.log('Simulando conexión a Neo4j...');
const connectRedis = () => console.log('Simulando conexión a Redis...');

const connectAll = () => {
  connectMongo();
  connectNeo4j();
  connectRedis();
};

module.exports = { connectAll };
