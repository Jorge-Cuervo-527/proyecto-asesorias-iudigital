const express = require('express');
const router = express.Router();
const controller = require('../controllers/clienteController');

router.get('/', controller.obtenerClientes);
router.get('/:id', controller.obtenerClientePorId);
router.post('/', controller.crearCliente);
router.put('/:id', controller.actualizarCliente);

module.exports = router;
