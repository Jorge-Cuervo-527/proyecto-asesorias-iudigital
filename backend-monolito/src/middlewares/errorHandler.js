const errorHandler = (err, req, res, next) => {
  console.error(`[Error Handler] ${req.method} ${req.originalUrl}:`, err);

  // Error de sintaxis JSON mal formado
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'JSON mal formado en el cuerpo de la petición'
    });
  }

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: 'Error de validación en los datos enviados',
      errors
    });
  }

  // Error de clave duplicada (Mongo code 11000)
  if (err.code === 11000) {
    const campo = Object.keys(err.keyValue || {})[0] || 'campo';
    const valor = err.keyValue ? err.keyValue[campo] : '';
    return res.status(409).json({
      success: false,
      message: `El ${campo} '${valor}' ya se encuentra registrado en el sistema`,
      campo,
      valor
    });
  }

  // Error de tipo CastError (por ejemplo, ObjectId inválido)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Identificador inválido para el campo: ${err.path}`
    });
  }

  // Error genérico del servidor
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Error interno del servidor'
  });
};

module.exports = errorHandler;
