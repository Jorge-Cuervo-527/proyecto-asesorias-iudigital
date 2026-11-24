require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

// Rutas de los 5 módulos
const tipoProyectoRoutes = require('./routes/tipoProyectoRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const universidadRoutes = require('./routes/universidadRoutes');
const etapaRoutes = require('./routes/etapaRoutes');
const proyectoRoutes = require('./routes/proyectoRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Endpoint de salud (Healthcheck para Docker y Jenkins)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'backend-monolito',
    timestamp: new Date().toISOString()
  });
});

// Endpoint raíz con metadatos
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'API Monolítica de Asesorías Académicas - IUDigital',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: [
      '/health',
      '/api/tipos-proyecto',
      '/api/clientes',
      '/api/universidades',
      '/api/etapas',
      '/api/proyectos'
    ]
  });
});

// Montaje de rutas de la API
app.use('/api/tipos-proyecto', tipoProyectoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/universidades', universidadRoutes);
app.use('/api/etapas', etapaRoutes);
app.use('/api/proyectos', proyectoRoutes);

// Manejador de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

// Middleware centralizado de errores
app.use(errorHandler);

// Iniciar base de datos y servidor
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[Servidor Monolito] Ejecutándose en puerto ${PORT}`);
    console.log(`[Healthcheck] http://localhost:${PORT}/health`);
  });
};

// Si se ejecuta directamente
if (require.main === module) {
  startServer();
}

module.exports = app;
