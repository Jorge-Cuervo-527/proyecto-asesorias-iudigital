const mongoose = require('mongoose');

const TIPOS_VALIDOS = [
  'ensayo',
  'artículo',
  'monografía',
  'trabajo final de pregrado',
  'trabajo final de especialización'
];

const TipoProyectoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del tipo de proyecto es obligatorio'],
      trim: true,
      lowercase: true,
      enum: {
        values: TIPOS_VALIDOS,
        message: 'Tipo de proyecto inválido. Valores permitidos: {VALUES}'
      }
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

module.exports = mongoose.model('TipoProyecto', TipoProyectoSchema);
module.exports.TIPOS_VALIDOS = TIPOS_VALIDOS;
