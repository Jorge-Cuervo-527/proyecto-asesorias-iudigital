const TipoProyecto = require('../models/TipoProyecto');

exports.obtenerTiposProyecto = async (req, res, next) => {
  try {
    const tipos = await TipoProyecto.find().sort({ fechaCreacion: -1 });
    res.status(200).json({ success: true, total: tipos.length, data: tipos });
  } catch (error) {
    next(error);
  }
};

exports.obtenerTipoProyectoPorId = async (req, res, next) => {
  try {
    const tipo = await TipoProyecto.findById(req.params.id);
    if (!tipo) return res.status(404).json({ success: false, message: 'Tipo de proyecto no encontrado' });
    res.status(200).json({ success: true, data: tipo });
  } catch (error) {
    next(error);
  }
};

exports.crearTipoProyecto = async (req, res, next) => {
  try {
    const { nombre } = req.body;
    const nuevoTipo = await TipoProyecto.create({ nombre });
    res.status(201).json({ success: true, message: 'Tipo de proyecto creado exitosamente', data: nuevoTipo });
  } catch (error) {
    next(error);
  }
};

exports.actualizarTipoProyecto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;
    const tipoActualizado = await TipoProyecto.findByIdAndUpdate(
      id,
      { nombre },
      { new: true, runValidators: true }
    );
    if (!tipoActualizado) return res.status(404).json({ success: false, message: 'Tipo de proyecto no encontrado' });
    res.status(200).json({ success: true, message: 'Tipo de proyecto actualizado exitosamente', data: tipoActualizado });
  } catch (error) {
    next(error);
  }
};
