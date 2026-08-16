const pool = require('../config/db');

const createMovimiento = async (req, res) => {
    const {
        productos_id,
        usuarios_id,
        tipo,
        cantidad,
        destino,
        observaciones
    } = req.body;

    try {
        // 1️⃣ Obtener producto y stock actual
        const [[producto]] = await pool.query(
            'SELECT stock_actual FROM productos WHERE id = ? AND activo = 1',
            [productos_id]
        );

        if (!producto) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Producto no encontrado'
            });
        }

        const stockAntes = producto.stock_actual;
        let stockDespues = stockAntes;

        // 2️⃣ Validar y calcular stock
        if (['salida', 'venta'].includes(tipo)) {
            if (cantidad > stockAntes) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'Stock insuficiente'
                });
            }
            stockDespues -= cantidad;
        } else {
            stockDespues += cantidad;
        }

        // 3️⃣ Insertar movimiento
        await pool.query(
            `INSERT INTO movimientos
            (productos_id, usuarios_id, tipo, cantidad, stock_antes, stock_despues, destino, observaciones, fecha)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                productos_id,
                usuarios_id,
                tipo,
                cantidad,
                stockAntes,
                stockDespues,
                destino,
                observaciones
            ]
        );

        // 4️⃣ Actualizar stock del producto
        if (tipo === "entrada") {

            await pool.query(
                'UPDATE productos SET stock_actual = ?, ubicacion = ? WHERE id = ?',
                [stockDespues, destino, productos_id]
            );

        } else {

            await pool.query(
                'UPDATE productos SET stock_actual = ? WHERE id = ?',
                [stockDespues, productos_id]
            );

        }

        res.status(201).json({
            status: 'OK',
            message: 'Movimiento registrado',
            stock_actual: stockDespues
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al registrar movimiento'
        });
    }
};


const getMovimientos = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                m.id,
                m.tipo,
                m.cantidad,
                m.fecha,
                m.destino,
                p.nombre AS producto,
                u.nombre AS usuario
            FROM movimientos m
            JOIN productos p ON m.productos_id = p.id
            JOIN usuarios u ON m.usuarios_id = u.id
            ORDER BY m.fecha DESC
        `);
        

        res.json({
            status: 'OK',
            data: rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al obtener movimientos'
        });
    }
};

module.exports = {
    createMovimiento,
    getMovimientos
};