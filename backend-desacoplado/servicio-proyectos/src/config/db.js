const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/asesorias_proyectos_db';
  try {
    const conn = await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 });
    console.log(`[MongoDB Proyectos] Conectado a: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Error Proyectos]: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
