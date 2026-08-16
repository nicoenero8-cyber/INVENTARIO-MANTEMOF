const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");

const {
    getTecnicos,
    createTecnico,
    asignarHerramienta
} = require("../controllers/tecnicos.controller");

router.get(
    "/",
    authMiddleware,
    getTecnicos
);

router.post(
    "/",
    authMiddleware,
    createTecnico
);

router.post(
    "/asignar",
    authMiddleware,
    asignarHerramienta
);

module.exports = router;