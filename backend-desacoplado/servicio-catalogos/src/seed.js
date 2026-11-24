require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const TipoProyecto = require('./models/TipoProyecto');
const Cliente = require('./models/Cliente');
const Universidad = require('./models/Universidad');
const Etapa = require('./models/Etapa');

const seedCatalogos = async () => {
  try {
    console.log('[Seed Catálogos] Conectando a BD...');
    await connectDB();

    console.log('[Seed Catálogos] Limpiando datos previos...');
    await Promise.all([
      TipoProyecto.deleteMany({}),
      Cliente.deleteMany({}),
      Universidad.deleteMany({}),
      Etapa.deleteMany({})
    ]);

    const tipos = await TipoProyecto.insertMany([
      { nombre: 'ensayo' },
      { nombre: 'artículo' },
      { nombre: 'monografía' },
      { nombre: 'trabajo final de pregrado' },
      { nombre: 'trabajo final de especialización' }
    ]);

    const clientes = await Cliente.insertMany([
      { nombre: 'Carlos Mario Restrepo', email: 'carlos.restrepo@correo.com' },
      { nombre: 'Laura Marcela Gómez', email: 'laura.gomez@correo.com' },
      { nombre: 'Alejandro Duque Ortiz', email: 'alejandro.duque@correo.com' }
    ]);

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

    const etapas = await Etapa.insertMany([
      { nombre: 'anteproyecto' },
      { nombre: 'entrega parcial 1' },
      { nombre: 'entrega parcial 2' },
      { nombre: 'entrega final' }
    ]);

    console.log('[Seed Catálogos] Poblado finalizado con éxito:');
    console.log(`- Tipos: ${tipos.length}`);
    console.log(`- Clientes: ${clientes.length}`);
    console.log(`- Universidades: ${universidades.length}`);
    console.log(`- Etapas: ${etapas.length}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Catálogos Error]:', error);
    process.exit(1);
  }
};

seedCatalogos();
