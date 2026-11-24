require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

const tipoProyectoRoutes = require('./routes/tipoProyectoRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const universidadRoutes = require('./routes/universidadRoutes');
const etapaRoutes = require('./routes/etapaRoutes');
const validacionRoutes = require('./routes/validacionRoutes');

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'servicio-catalogos',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    service: 'Microservicio de Catálogos - IUDigital',
    version: '1.0.0',
    endpoints: [
      '/health',
      '/api/tipos-proyecto',
      '/api/clientes',
      '/api/universidades',
      '/api/etapas',
      '/api/catalogos/validar'
    ]
  });
});

app.use('/api/tipos-proyecto', tipoProyectoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/universidades', universidadRoutes);
app.use('/api/etapas', etapaRoutes);
app.use('/api/catalogos', validacionRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada en Catálogos: ${req.method} ${req.originalUrl}`
  });
});

app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[Microservicio Catálogos] Corriendo en puerto ${PORT}`);
    console.log(`[Healthcheck] http://localhost:${PORT}/health`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = app;
