require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const TipoProyecto = require('./models/TipoProyecto');
const Cliente = require('./models/Cliente');
const Universidad = require('./models/Universidad');
const Etapa = require('./models/Etapa');
const Proyecto = require('./models/Proyecto');

const seedData = async () => {
  try {
    console.log('[Seed] Conectando a la base de datos...');
    await connectDB();

    console.log('[Seed] Limpiando colecciones existentes...');
    await Promise.all([
      TipoProyecto.deleteMany({}),
      Cliente.deleteMany({}),
      Universidad.deleteMany({}),
      Etapa.deleteMany({}),
      Proyecto.deleteMany({})
    ]);

    console.log('[Seed] Insertando Tipos de Proyecto...');
    const tipos = await TipoProyecto.insertMany([
      { nombre: 'ensayo' },
      { nombre: 'artículo' },
      { nombre: 'monografía' },
      { nombre: 'trabajo final de pregrado' },
      { nombre: 'trabajo final de especialización' }
    ]);

    console.log('[Seed] Insertando Clientes...');
    const clientes = await Cliente.insertMany([
      {
        nombre: 'Carlos Mario Restrepo',
        email: 'carlos.restrepo@correo.com'
      },
      {
        nombre: 'Laura Marcela Gómez',
        email: 'laura.gomez@correo.com'
      },
      {
        nombre: 'Alejandro Duque Ortiz',
        email: 'alejandro.duque@correo.com'
      }
    ]);

    console.log('[Seed] Insertando Universidades...');
    const universidades = await Universidad.insertMany([
      {
        nombre: 'Institución Universitaria Digital de Antioquia - IU.Digital',
        direccion: 'Calle 52 # 41-38, Medellín, Antioquia',
        telefono: '+57 604 520 0750'
      },
      {
        nombre: 'Universidad de Antioquia',
        direccion: 'Calle 67 # 53-108, Medellín, Antioquia',
        telefono: '+57 604 219 8332'
      },
      {
        nombre: 'Universidad Nacional de Colombia - Sede Medellín',
        direccion: 'Carrera 65 # 59A-110, Medellín, Antioquia',
        telefono: '+57 604 430 9000'
      }
    ]);

    console.log('[Seed] Insertando Etapas...');
    const etapas = await Etapa.insertMany([
      { nombre: 'anteproyecto' },
      { nombre: 'entrega parcial 1' },
      { nombre: 'entrega parcial 2' },
      { nombre: 'entrega final' }
    ]);

    console.log('[Seed] Insertando Proyectos de Asesoría de Prueba...');
    const fechaActual = new Date();
    const fechaIniciacion1 = new Date(fechaActual.getTime() - 30 * 24 * 60 * 60 * 1000); // Hace 30 días
    const fechaEntrega1 = new Date(fechaActual.getTime() + 60 * 24 * 60 * 60 * 1000); // En 60 días

    const fechaIniciacion2 = new Date(fechaActual.getTime() - 15 * 24 * 60 * 60 * 1000); // Hace 15 días
    const fechaEntrega2 = new Date(fechaActual.getTime() + 45 * 24 * 60 * 60 * 1000); // En 45 días

    const proyectos = await Proyecto.insertMany([
      {
        numero: 'PRY-2026-001',
        titulo: 'Desarrollo de Plataforma Web para Telemedicina Comunitaria',
        fechaIniciacion: fechaIniciacion1,
        fechaEntrega: fechaEntrega1,
        valor: 3500000,
        cliente: clientes[0]._id,
        tipoProyecto: tipos[3]._id, // Trabajo final de pregrado
        universidad: universidades[0]._id, // IUDigital
        etapa: etapas[1]._id // Entrega parcial 1
      },
      {
        numero: 'PRY-2026-002',
        titulo: 'Análisis Cienciométrico de Tecnologías Cloud y Microservicios',
        fechaIniciacion: fechaIniciacion2,
        fechaEntrega: fechaEntrega2,
        valor: 1800000,
        cliente: clientes[1]._id,
        tipoProyecto: tipos[1]._id, // Artículo
        universidad: universidades[1]._id, // UdeA
        etapa: etapas[0]._id // Anteproyecto
      }
    ]);

    console.log(`[Seed] Datos poblados exitosamente:`);
    console.log(`- Tipos de Proyecto: ${tipos.length}`);
    console.log(`- Clientes: ${clientes.length}`);
    console.log(`- Universidades: ${universidades.length}`);
    console.log(`- Etapas: ${etapas.length}`);
    console.log(`- Proyectos: ${proyectos.length}`);

    await mongoose.connection.close();
    console.log('[Seed] Conexión a BD cerrada.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Error durante el poblado de datos:', error);
    process.exit(1);
  }
};

seedData();
