const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/asesorias_monolito_db';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[MongoDB] Conectado exitosamente a: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Error] Error al conectar a la base de datos: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Desconectado de la base de datos');
});

mongoose.connection.on('reconnected', () => {
  console.log('[MongoDB] Reconectado a la base de datos');
});

// Manejo de desconexión controlada
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('[MongoDB] Conexión cerrada por terminación del proceso (SIGINT)');
  process.exit(0);
});

module.exports = connectDB;
