const mongoose = require('mongoose');

/**
 * Schema de Proyecto — Microservicio Desacoplado
 * Los IDs de cliente, tipoProyecto, universidad y etapa se almacenan como
 * referencias externas (String) hacia el Servicio de Catálogos. No se usa
 * .populate() ya que las colecciones residen en otro servicio.
 */
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
      min: [0.01, 'El valor debe ser mayor a 0']
    },
    // IDs foráneos desde el Servicio de Catálogos (almacenados como String)
    clienteId: {
      type: String,
      required: [true, 'El ID del cliente es obligatorio']
    },
    tipoProyectoId: {
      type: String,
      required: [true, 'El ID del tipo de proyecto es obligatorio']
    },
    universidadId: {
      type: String,
      required: [true, 'El ID de la universidad es obligatorio']
    },
    etapaId: {
      type: String,
      required: [true, 'El ID de la etapa es obligatorio']
    },
    // Snapshot de datos del catálogo en el momento de creación (para consultas sin round-trip)
    snapshotCatalogo: {
      type: Object,
      default: {}
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
