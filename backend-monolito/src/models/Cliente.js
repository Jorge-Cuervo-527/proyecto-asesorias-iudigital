const mongoose = require('mongoose');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ClienteSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del cliente es obligatorio'],
      trim: true,
      minlength: [3, 'El nombre debe tener al menos 3 caracteres']
    },
    email: {
      type: String,
      required: [true, 'El correo electrónico es obligatorio'],
      trim: true,
      lowercase: true,
      unique: true,
      match: [EMAIL_REGEX, 'Formato de correo electrónico inválido']
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

module.exports = mongoose.model('Cliente', ClienteSchema);
