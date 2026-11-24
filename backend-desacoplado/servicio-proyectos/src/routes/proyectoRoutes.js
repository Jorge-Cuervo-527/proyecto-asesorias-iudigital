const express = require('express');
const router = express.Router();
const controller = require('../controllers/proyectoController');

router.get('/', controller.obtenerProyectos);
router.post('/', controller.crearProyecto);
router.put('/:id', controller.actualizarProyecto);

module.exports = router;
