const Cliente = require('../models/Cliente');

// Listar clientes
exports.obtenerClientes = async (req, res, next) => {
  try {
    const clientes = await Cliente.find().sort({ fechaCreacion: -1 });
    res.status(200).json({
      success: true,
      total: clientes.length,
      data: clientes
    });
  } catch (error) {
    next(error);
  }
};

// Crear cliente
exports.crearCliente = async (req, res, next) => {
  try {
    const { nombre, email } = req.body;
    const nuevoCliente = await Cliente.create({ nombre, email });
    res.status(201).json({
      success: true,
      message: 'Cliente creado exitosamente',
      data: nuevoCliente
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar cliente
exports.actualizarCliente = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, email } = req.body;

    const clienteActualizado = await Cliente.findByIdAndUpdate(
      id,
      { nombre, email },
      { new: true, runValidators: true }
    );

    if (!clienteActualizado) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cliente actualizado exitosamente',
      data: clienteActualizado
    });
  } catch (error) {
    next(error);
  }
};
