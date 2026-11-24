const errorHandler = (err, req, res, next) => {
  console.error(`[Proyectos Error] ${req.method} ${req.originalUrl}:`, err);

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, message: 'JSON mal formado en el cuerpo de la petición' });
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: 'Error de validación', errors });
  }

  if (err.code === 11000) {
    const campo = Object.keys(err.keyValue || {})[0] || 'campo';
    const valor = err.keyValue ? err.keyValue[campo] : '';
    return res.status(409).json({
      success: false,
      message: `El ${campo} '${valor}' ya se encuentra registrado`,
      campo,
      valor
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: `Identificador inválido: ${err.path}` });
  }

  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({ success: false, message: err.message || 'Error interno del servidor en servicio de proyectos' });
};

module.exports = errorHandler;
