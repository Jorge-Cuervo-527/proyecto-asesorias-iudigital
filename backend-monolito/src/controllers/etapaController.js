const Etapa = require('../models/Etapa');

// Listar etapas
exports.obtenerEtapas = async (req, res, next) => {
  try {
    const etapas = await Etapa.find().sort({ fechaCreacion: -1 });
    res.status(200).json({
      success: true,
      total: etapas.length,
      data: etapas
    });
  } catch (error) {
    next(error);
  }
};

// Crear etapa
exports.crearEtapa = async (req, res, next) => {
  try {
    const { nombre } = req.body;
    const nuevaEtapa = await Etapa.create({ nombre });
    res.status(201).json({
      success: true,
      message: 'Etapa creada exitosamente',
      data: nuevaEtapa
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar etapa
exports.actualizarEtapa = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    const etapaActualizada = await Etapa.findByIdAndUpdate(
      id,
      { nombre },
      { new: true, runValidators: true }
    );

    if (!etapaActualizada) {
      return res.status(404).json({
        success: false,
        message: 'Etapa no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Etapa actualizada exitosamente',
      data: etapaActualizada
    });
  } catch (error) {
    next(error);
  }
};
