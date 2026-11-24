const Proyecto = require('../models/Proyecto');
const { validarReferencias } = require('../config/catalogosClient');

// Listar todos los proyectos
exports.obtenerProyectos = async (req, res, next) => {
  try {
    const proyectos = await Proyecto.find().sort({ fechaCreacion: -1 });
    res.status(200).json({ success: true, total: proyectos.length, data: proyectos });
  } catch (error) {
    next(error);
  }
};

// Crear nuevo proyecto con validación de referencias en Catálogos
exports.crearProyecto = async (req, res, next) => {
  try {
    const {
      numero, titulo, fechaIniciacion, fechaEntrega,
      valor, clienteId, tipoProyectoId, universidadId, etapaId
    } = req.body;

    // Validar referencias en el Servicio de Catálogos
    const validacion = await validarReferencias({ clienteId, tipoProyectoId, universidadId, etapaId });

    if (validacion.serviceUnavailable) {
      return res.status(503).json({
        success: false,
        message: validacion.message
      });
    }

    if (!validacion.valid) {
      return res.status(404).json({
        success: false,
        message: validacion.message,
        faltantes: validacion.faltantes
      });
    }

    // Crear el proyecto con snapshot de catálogo
    const nuevoProyecto = await Proyecto.create({
      numero,
      titulo,
      fechaIniciacion,
      fechaEntrega,
      valor,
      clienteId,
      tipoProyectoId,
      universidadId,
      etapaId,
      snapshotCatalogo: validacion.datos || {}
    });

    res.status(201).json({
      success: true,
      message: 'Proyecto de asesoría creado exitosamente',
      data: nuevoProyecto
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar proyecto existente con validación de referencias
exports.actualizarProyecto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      numero, titulo, fechaIniciacion, fechaEntrega,
      valor, clienteId, tipoProyectoId, universidadId, etapaId
    } = req.body;

    // Si se envía algún ID foráneo, re-validar en catálogos
    const tieneForeigns = clienteId || tipoProyectoId || universidadId || etapaId;
    let snapshotCatalogo = undefined;

    if (tieneForeigns) {
      const validacion = await validarReferencias({
        clienteId: clienteId || undefined,
        tipoProyectoId: tipoProyectoId || undefined,
        universidadId: universidadId || undefined,
        etapaId: etapaId || undefined
      });

      if (validacion.serviceUnavailable) {
        return res.status(503).json({ success: false, message: validacion.message });
      }

      if (!validacion.valid) {
        return res.status(404).json({
          success: false,
          message: validacion.message,
          faltantes: validacion.faltantes
        });
      }

      snapshotCatalogo = validacion.datos || {};
    }

    const updatePayload = {
      ...(numero && { numero }),
      ...(titulo && { titulo }),
      ...(fechaIniciacion && { fechaIniciacion }),
      ...(fechaEntrega && { fechaEntrega }),
      ...(valor !== undefined && { valor }),
      ...(clienteId && { clienteId }),
      ...(tipoProyectoId && { tipoProyectoId }),
      ...(universidadId && { universidadId }),
      ...(etapaId && { etapaId }),
      ...(snapshotCatalogo !== undefined && { snapshotCatalogo })
    };

    const proyectoActualizado = await Proyecto.findByIdAndUpdate(
      id,
      updatePayload,
      { new: true, runValidators: true }
    );

    if (!proyectoActualizado) {
      return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
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
