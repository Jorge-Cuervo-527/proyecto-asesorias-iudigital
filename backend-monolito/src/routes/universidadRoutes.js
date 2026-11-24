const express = require('express');
const router = express.Router();
const controller = require('../controllers/universidadController');

router.get('/', controller.obtenerUniversidades);
router.post('/', controller.crearUniversidad);
router.put('/:id', controller.actualizarUniversidad);

module.exports = router;
