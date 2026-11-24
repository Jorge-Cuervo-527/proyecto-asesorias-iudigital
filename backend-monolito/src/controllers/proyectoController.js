const Proyecto = require('../models/Proyecto');
const Cliente = require('../models/Cliente');
const TipoProyecto = require('../models/TipoProyecto');
const Universidad = require('../models/Universidad');
const Etapa = require('../models/Etapa');

// Listar todos los proyectos con populate completo
exports.obtenerProyectos = async (req, res, next) => {
  try {
    const proyectos = await Proyecto.find()
      .populate('cliente')
      .populate('tipoProyecto')
      .populate('universidad')
      .populate('etapa')
      .sort({ fechaCreacion: -1 });

    res.status(200).json({
      success: true,
      total: proyectos.length,
      data: proyectos
    });
  } catch (error) {
    next(error);
  }
};

// Crear nuevo proyecto validando referencias foráneas
exports.crearProyecto = async (req, res, next) => {
  try {
    const {
      numero,
      titulo,
      fechaIniciacion,
      fechaEntrega,
      valor,
      cliente,
      tipoProyecto,
      universidad,
      etapa
    } = req.body;

    // 1. Validar existencia de Cliente
    const existeCliente = await Cliente.findById(cliente);
    if (!existeCliente) {
      return res.status(404).json({
        success: false,
        message: `Cliente con ID '${cliente}' no encontrado`
      });
    }

    // 2. Validar existencia de TipoProyecto
    const existeTipo = await TipoProyecto.findById(tipoProyecto);
    if (!existeTipo) {
      return res.status(404).json({
        success: false,
        message: `Tipo de proyecto con ID '${tipoProyecto}' no encontrado`
      });
    }

    // 3. Validar existencia de Universidad
    const existeUniversidad = await Universidad.findById(universidad);
    if (!existeUniversidad) {
      return res.status(404).json({
        success: false,
        message: `Universidad con ID '${universidad}' no encontrada`
      });
    }

    // 4. Validar existencia de Etapa
    const existeEtapa = await Etapa.findById(etapa);
    if (!existeEtapa) {
      return res.status(404).json({
        success: false,
        message: `Etapa con ID '${etapa}' no encontrada`
      });
    }

    // Crear el proyecto
    const nuevoProyecto = await Proyecto.create({
      numero,
      titulo,
      fechaIniciacion,
      fechaEntrega,
      valor,
      cliente,
      tipoProyecto,
      universidad,
      etapa
    });

    // Cargar relaciones para la respuesta
    const proyectoCompleto = await Proyecto.findById(nuevoProyecto._id)
      .populate('cliente')
      .populate('tipoProyecto')
      .populate('universidad')
      .populate('etapa');

    res.status(201).json({
      success: true,
      message: 'Proyecto de asesoría creado exitosamente',
      data: proyectoCompleto
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar proyecto existente
exports.actualizarProyecto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      numero,
      titulo,
      fechaIniciacion,
      fechaEntrega,
      valor,
      cliente,
      tipoProyecto,
      universidad,
      etapa
    } = req.body;

    // Si se envían IDs foráneos en la actualización, validar su existencia
    if (cliente) {
      const existeCliente = await Cliente.findById(cliente);
      if (!existeCliente) {
        return res.status(404).json({
          success: false,
          message: `Cliente con ID '${cliente}' no encontrado`
        });
      }
    }

    if (tipoProyecto) {
      const existeTipo = await TipoProyecto.findById(tipoProyecto);
      if (!existeTipo) {
        return res.status(404).json({
          success: false,
          message: `Tipo de proyecto con ID '${tipoProyecto}' no encontrado`
        });
      }
    }

    if (universidad) {
      const existeUniversidad = await Universidad.findById(universidad);
      if (!existeUniversidad) {
        return res.status(404).json({
          success: false,
          message: `Universidad con ID '${universidad}' no encontrada`
        });
      }
    }

    if (etapa) {
      const existeEtapa = await Etapa.findById(etapa);
      if (!existeEtapa) {
        return res.status(404).json({
          success: false,
          message: `Etapa con ID '${etapa}' no encontrada`
        });
      }
    }

    const proyectoActualizado = await Proyecto.findByIdAndUpdate(
      id,
      {
        ...(numero && { numero }),
        ...(titulo && { titulo }),
        ...(fechaIniciacion && { fechaIniciacion }),
        ...(fechaEntrega && { fechaEntrega }),
        ...(valor !== undefined && { valor }),
        ...(cliente && { cliente }),
        ...(tipoProyecto && { tipoProyecto }),
        ...(universidad && { universidad }),
        ...(etapa && { etapa })
      },
      { new: true, runValidators: true }
    )
      .populate('cliente')
      .populate('tipoProyecto')
      .populate('universidad')
      .populate('etapa');

    if (!proyectoActualizado) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Proyecto actualizado exitosamente',
      data: proyectoActualizado
    });
  } catch (error) {
    next(error);
  }
};
