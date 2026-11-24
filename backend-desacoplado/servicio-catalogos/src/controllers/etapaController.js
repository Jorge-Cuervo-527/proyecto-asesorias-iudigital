const Etapa = require('../models/Etapa');

exports.obtenerEtapas = async (req, res, next) => {
  try {
    const etapas = await Etapa.find().sort({ fechaCreacion: -1 });
    res.status(200).json({ success: true, total: etapas.length, data: etapas });
  } catch (error) {
    next(error);
  }
};

exports.obtenerEtapaPorId = async (req, res, next) => {
  try {
    const etapa = await Etapa.findById(req.params.id);
    if (!etapa) return res.status(404).json({ success: false, message: 'Etapa no encontrada' });
    res.status(200).json({ success: true, data: etapa });
  } catch (error) {
    next(error);
  }
};

exports.crearEtapa = async (req, res, next) => {
  try {
    const { nombre } = req.body;
    const nuevaEtapa = await Etapa.create({ nombre });
    res.status(201).json({ success: true, message: 'Etapa creada exitosamente', data: nuevaEtapa });
  } catch (error) {
    next(error);
  }
};

exports.actualizarEtapa = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;
    const etapaActualizada = await Etapa.findByIdAndUpdate(
      id,
      { nombre },
      { new: true, runValidators: true }
    );
    if (!etapaActualizada) return res.status(404).json({ success: false, message: 'Etapa no encontrada' });
    res.status(200).json({ success: true, message: 'Etapa actualizada exitosamente', data: etapaActualizada });
  } catch (error) {
    next(error);
  }
};
