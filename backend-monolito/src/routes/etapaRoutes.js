const express = require('express');
const router = express.Router();
const controller = require('../controllers/etapaController');

router.get('/', controller.obtenerEtapas);
router.post('/', controller.crearEtapa);
router.put('/:id', controller.actualizarEtapa);

module.exports = router;
