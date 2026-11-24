const mongoose = require('mongoose');

const ProyectoSchema = new mongoose.Schema(
  {
    numero: {
      type: String,
      required: [true, 'El número de proyecto es obligatorio'],
      unique: true,
      trim: true
    },
    titulo: {
      type: String,
      required: [true, 'El título del proyecto es obligatorio'],
      trim: true,
      minlength: [5, 'El título debe tener al menos 5 caracteres']
    },
    fechaIniciacion: {
      type: Date,
      required: [true, 'La fecha de iniciación es obligatoria']
    },
    fechaEntrega: {
      type: Date,
      required: [true, 'La fecha de entrega es obligatoria'],
      validate: {
        validator: function (value) {
          if (!this.fechaIniciacion || !value) return true;
          return new Date(value) > new Date(this.fechaIniciacion);
        },
        message: 'La fecha de entrega debe ser posterior a la fecha de iniciación'
      }
    },
    valor: {
      type: Number,
      required: [true, 'El valor del proyecto es obligatorio'],
      min: [0.01, 'El valor debe ser un rubro económico mayor a 0']
    },
    cliente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cliente',
      required: [true, 'El cliente es obligatorio']
    },
    tipoProyecto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TipoProyecto',
      required: [true, 'El tipo de proyecto es obligatorio']
    },
    universidad: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Universidad',
      required: [true, 'La universidad es obligatoria']
    },
    etapa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Etapa',
      required: [true, 'La etapa del proyecto es obligatoria']
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

module.exports = mongoose.model('Proyecto', ProyectoSchema);
