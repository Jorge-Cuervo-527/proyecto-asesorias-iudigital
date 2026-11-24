const express = require('express');
const router = express.Router();
const controller = require('../controllers/validacionController');

router.get('/validar', controller.validarEntidades);

module.exports = router;
