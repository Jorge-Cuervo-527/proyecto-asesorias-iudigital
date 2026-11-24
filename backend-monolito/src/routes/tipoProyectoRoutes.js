const express = require('express');
const router = express.Router();
const controller = require('../controllers/tipoProyectoController');

router.get('/', controller.obtenerTiposProyecto);
router.post('/', controller.crearTipoProyecto);
router.put('/:id', controller.actualizarTipoProyecto);

module.exports = router;
