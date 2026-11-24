const express = require('express');
const router = express.Router();
const controller = require('../controllers/etapaController');

router.get('/', controller.obtenerEtapas);
router.get('/:id', controller.obtenerEtapaPorId);
router.post('/', controller.crearEtapa);
router.put('/:id', controller.actualizarEtapa);

module.exports = router;
