const authMiddleware = require('../middlewares/auth.middleware');
const express = require('express');
const router = express.Router();

const { createMovimiento, getMovimientos } = require('../controllers/movimientos.controller');


router.post('/', authMiddleware, createMovimiento);
router.get('/', authMiddleware, getMovimientos);

module.exports = router;
