const mongoose = require('mongoose');

const ETAPAS_VALIDAS = [
  'anteproyecto',
  'entrega parcial 1',
  'entrega parcial 2',
  'entrega final'
];

const EtapaSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre de la etapa es obligatorio'],
      trim: true,
      lowercase: true,
      enum: {
        values: ETAPAS_VALIDAS,
        message: 'Etapa inválida. Valores permitidos: {VALUES}'
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

module.exports = mongoose.model('Etapa', EtapaSchema);
module.exports.ETAPAS_VALIDAS = ETAPAS_VALIDAS;
