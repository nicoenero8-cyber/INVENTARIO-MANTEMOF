const pool = require("../config/db");

const getTecnicos = async (req, res) => {
    try {

        const [rows] = await pool.query(`
            SELECT *
            FROM tecnicos
            WHERE activo = 1
            ORDER BY nombre ASC
        `);

        res.json({
            status: "OK",
            data: rows
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            status: "ERROR",
            message: "Error al obtener técnicos"
        });

    }
};

const createTecnico = async (req, res) => {

    try {

        console.log(req.body);

        const {
            nombre,
            telefono,
            area,
            correo
        } = req.body;

        // VALIDAR

        if (!nombre) {

            return res.status(400).json({
                status: "ERROR",
                message: "Nombre requerido"
            });

        }

        await pool.query(
            `
            INSERT INTO tecnicos (
                nombre,
                telefono,
                area,
                correo
            )
            VALUES (?, ?, ?, ?)
            `,
            [
                nombre,
                telefono || null,
                area || null,
                correo || null
            ]
        );

        res.json({
            status: "OK",
            message: "Técnico creado"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            status: "ERROR",
            message: "Error al crear técnico"
        });

    }

};

const asignarHerramienta = async (req, res) => {

    try {

        const {
            tecnicos_id,
            productos_id,
            cantidad
        } = req.body;

        const usuarios_id = req.user.id;

        // VALIDAR STOCK

        const [producto] = await pool.query(
            `
            SELECT *
            FROM productos
            WHERE id = ?
            `,
            [productos_id]
        );

        if (producto.length === 0) {

            return res.status(404).json({
                status: "ERROR",
                message: "Producto no encontrado"
            });

        }

        const stockActual = producto[0].stock_actual;

        if (stockActual < cantidad) {

            return res.status(400).json({
                status: "ERROR",
                message: "Stock insuficiente"
            });

        }

        // DESCONTAR STOCK

        const nuevoStock = stockActual - cantidad;

        await pool.query(
            `
            UPDATE productos
            SET stock_actual = ?
            WHERE id = ?
            `,
            [nuevoStock, productos_id]
        );

        

        // INSERT ASIGNACION

        await pool.query(
            `
            INSERT INTO asignaciones (
                tecnicos_id,
                productos_id,
                cantidad
            )
            VALUES (?, ?, ?)
            `,
            [
                tecnicos_id,
                productos_id,
                cantidad
            ]
        );

        // OBTENER TECNICO

        const [tecnico] = await pool.query(
            `
            SELECT nombre
            FROM tecnicos
            WHERE id = ?
            `,
            [tecnicos_id]
        );

        // INSERT MOVIMIENTO

        await pool.query(
            `
            INSERT INTO movimientos (
                tipo,
                cantidad,
                stock_antes,
                stock_despues,
                destino,
                observaciones,
                productos_id,
                usuarios_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                "asignacion",
                cantidad,
                stockActual,
                nuevoStock,
                tecnico[0].nombre,
                "Herramienta asignada a técnico",
                productos_id,
                usuarios_id
            ]
        );

        res.json({
            status: "OK",
            message: "Herramienta asignada"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            status: "ERROR",
            message: "Error al asignar herramienta"
        });

    }

};

module.exports = {
    getTecnicos,
    createTecnico,
    asignarHerramienta
};