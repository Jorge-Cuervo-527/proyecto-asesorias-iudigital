const mongoose = require('mongoose');

const UniversidadSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre de la universidad es obligatorio'],
      trim: true,
      unique: true
    },
    direccion: {
      type: String,
      required: [true, 'La dirección es obligatoria'],
      trim: true
    },
    telefono: {
      type: String,
      required: [true, 'El teléfono es obligatorio'],
      trim: true
    }
  },
  {
    timestamps: {
      createdAt: 'fechaCreacion',
      updatedAt: 'fechaActualizacion'
    },
    versionKey: false
  }
);

module.exports = mongoose.model('Universidad', UniversidadSchema);
