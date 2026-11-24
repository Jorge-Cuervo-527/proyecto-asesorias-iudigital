const axios = require('axios');

const CATALOGOS_URL = process.env.CATALOGOS_SERVICE_URL || 'http://servicio-catalogos:4001';
const TIMEOUT_MS = parseInt(process.env.CATALOGOS_TIMEOUT_MS || '3000', 10);

/**
 * Valida la existencia de las referencias foráneas en el Servicio de Catálogos
 * mediante el endpoint consolidado GET /api/catalogos/validar
 *
 * @param {Object} referencias - { clienteId, tipoProyectoId, universidadId, etapaId }
 * @returns {{ valid: boolean, datos: Object, message: string }}
 */
const validarReferencias = async ({ clienteId, tipoProyectoId, universidadId, etapaId }) => {
  try {
    const params = {};
    if (clienteId) params.clienteId = clienteId;
    if (tipoProyectoId) params.tipoProyectoId = tipoProyectoId;
    if (universidadId) params.universidadId = universidadId;
    if (etapaId) params.etapaId = etapaId;

    const response = await axios.get(`${CATALOGOS_URL}/api/catalogos/validar`, {
      params,
      timeout: TIMEOUT_MS
    });

    return response.data;
  } catch (error) {
    // Si el catálogo responde con 404 (referencias no encontradas)
    if (error.response && error.response.status === 404) {
      return error.response.data;
    }

    // Si el catálogo no responde o hay timeout: retornar error de disponibilidad
    console.error('[Catálogos Client] Error de comunicación:', error.message);
    return {
      valid: false,
      message: `Servicio de catálogos no disponible (timeout ${TIMEOUT_MS}ms). Reintente más tarde.`,
      serviceUnavailable: true
    };
  }
};

module.exports = { validarReferencias };
