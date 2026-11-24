const Universidad = require('../models/Universidad');

// Listar universidades
exports.obtenerUniversidades = async (req, res, next) => {
  try {
    const universidades = await Universidad.find().sort({ fechaCreacion: -1 });
    res.status(200).json({
      success: true,
      total: universidades.length,
      data: universidades
    });
  } catch (error) {
    next(error);
  }
};

// Crear universidad
exports.crearUniversidad = async (req, res, next) => {
  try {
    const { nombre, direccion, telefono } = req.body;
    const nuevaUniversidad = await Universidad.create({
      nombre,
      direccion,
      telefono
    });
    res.status(201).json({
      success: true,
      message: 'Universidad creada exitosamente',
      data: nuevaUniversidad
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar universidad
exports.actualizarUniversidad = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, direccion, telefono } = req.body;

    const universidadActualizada = await Universidad.findByIdAndUpdate(
      id,
      { nombre, direccion, telefono },
      { new: true, runValidators: true }
    );

    if (!universidadActualizada) {
      return res.status(404).json({
        success: false,
        message: 'Universidad no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Universidad actualizada exitosamente',
      data: universidadActualizada
    });
  } catch (error) {
    next(error);
  }
};
