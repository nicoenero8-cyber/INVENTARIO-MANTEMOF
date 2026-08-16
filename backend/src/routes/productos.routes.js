const authMiddleware = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/role.middleware');
const express = require('express');
const router = express.Router();

const {
    getAllProductos,
    createProducto,
    updateProducto,
    deleteProducto
} = require('../controllers/productos.controller');

// Ver productos → cualquier usuario logueado
router.get('/', authMiddleware, getAllProductos);

// Crear producto → solo ADMIN
router.post(
  '/',
  authMiddleware,
  checkRole('Administrador'),
  createProducto
);

// Actualizar producto → solo ADMIN
router.put(
  '/:id',
  authMiddleware,
  checkRole('ADMIN'),
  updateProducto
);

// Eliminar producto → solo ADMIN
router.delete(
  '/:id',
  authMiddleware,
  checkRole('ADMIN'),
  deleteProducto
);

module.exports = router;
