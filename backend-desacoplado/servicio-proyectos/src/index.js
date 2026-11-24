require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');
const proyectoRoutes = require('./routes/proyectoRoutes');

const app = express();
const PORT = process.env.PORT || 4002;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'servicio-proyectos',
    catalogosUrl: process.env.CATALOGOS_SERVICE_URL || 'http://servicio-catalogos:4001',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    service: 'Microservicio de Proyectos - IUDigital',
    version: '1.0.0',
    endpoints: ['/health', '/api/proyectos']
  });
});

app.use('/api/proyectos', proyectoRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada en Proyectos: ${req.method} ${req.originalUrl}`
  });
});

app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[Microservicio Proyectos] Corriendo en puerto ${PORT}`);
    console.log(`[Healthcheck] http://localhost:${PORT}/health`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = app;
