const Cliente = require('../models/Cliente');
const TipoProyecto = require('../models/TipoProyecto');
const Universidad = require('../models/Universidad');
const Etapa = require('../models/Etapa');

exports.validarEntidades = async (req, res, next) => {
  try {
    const { clienteId, tipoProyectoId, universidadId, etapaId } = req.query;
    const faltantes = [];
    const datos = {};

    if (clienteId) {
      const c = await Cliente.findById(clienteId);
      if (!c) faltantes.push(`Cliente (${clienteId})`);
      else datos.cliente = c;
    }

    if (tipoProyectoId) {
      const tp = await TipoProyecto.findById(tipoProyectoId);
      if (!tp) faltantes.push(`TipoProyecto (${tipoProyectoId})`);
      else datos.tipoProyecto = tp;
    }

    if (universidadId) {
      const u = await Universidad.findById(universidadId);
      if (!u) faltantes.push(`Universidad (${universidadId})`);
      else datos.universidad = u;
    }

    if (etapaId) {
      const e = await Etapa.findById(etapaId);
      if (!e) faltantes.push(`Etapa (${etapaId})`);
      else datos.etapa = e;
    }

    if (faltantes.length > 0) {
      return res.status(404).json({
        valid: false,
        message: `Las siguientes entidades referenciadas no existen en catálogos: ${faltantes.join(', ')}`,
        faltantes
      });
    }

    return res.status(200).json({
      valid: true,
      message: 'Todas las referencias existen en el catálogo',
      datos
    });
  } catch (error) {
    next(error);
  }
};
