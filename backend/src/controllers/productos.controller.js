const pool = require('../config/db');

// GET
const getAllProductos = async (req, res) => {
    try {
    const [rows] = await pool.query(`
        SELECT 
            id,
            nombre,
            descripcion,
            marca,
            modelo,
            precio_compra,
            precio_venta,
            stock_actual,
            ubicacion
        FROM productos
    `);

        res.json({
            status: 'OK',
            data: rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al obtener productos'
        });
    }
};

// POST
const createProducto = async (req, res) => {
    try {
        const {
            nombre,
            descripcion,
            marca,
            modelo,
            precio_compra,
            precio_venta,
            cantidad,
            ubicacion,
            categorias_id,
            codigo_barras
        } = req.body;



        if (!nombre || !precio_venta || !categorias_id) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Faltan datos obligatorios'
            });
        }

        // 🔥 VALIDAR DUPLICADO POR NOMBRE
        const [existe] = await pool.query(
            "SELECT id FROM productos WHERE LOWER(nombre) = LOWER(?) AND activo = 1",
            [nombre.trim()]
        );

        if (existe.length > 0) {
            return res.status(400).json({
                status: "ERROR",
                message: "El producto ya existe"
            });
        }

        // 🔥 VALIDAR CODIGO DE BARRAS
        if (codigo_barras) {
            const [codigoExiste] = await pool.query(
                "SELECT id FROM productos WHERE codigo_barras = ?",
                [codigo_barras]
            );

            if (codigoExiste.length > 0) {
                return res.status(400).json({
                    status: "ERROR",
                    message: "El código de barras ya existe"
                });
            }
        }

        // 🔥 INSERT CORREGIDO
        // 🔥 INSERT CORREGIDO
       // 🔥 INSERT CORREGIDO
        const [result] = await pool.query(
            `INSERT INTO productos (
                nombre,
                descripcion,
                marca,
                modelo,
                precio_compra,
                precio_venta,
                cantidad,
                stock_actual,
                ubicacion,
                categorias_id,
                codigo_barras,
                activo
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,

            [
                nombre.trim(),
                descripcion || null,
                marca || null,
                modelo || null,
                precio_compra || 0,
                precio_venta,
                cantidad || 0,
                cantidad || 0,
                ubicacion || "Sin ubicación",
                categorias_id,
                codigo_barras || null
            ]
        );



        

                // 🔥 CREAR MOVIMIENTO INICIAL
        if (cantidad > 0) {
            await pool.query(
                `INSERT INTO movimientos (
                    tipo,
                    cantidad,
                    stock_antes,
                    stock_despues,
                    destino,
                    observaciones,
                    fecha,
                    productos_id,
                    usuarios_id
                )
                VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
                [
                    "entrada",
                    cantidad,
                    0,
                    cantidad,
                    ubicacion || "General",
                    "Ingreso inicial del producto",
                    result.insertId,
                    req.user.id
                ]
            );
        }

        res.status(201).json({
            status: 'OK',
            message: 'Producto creado',
            id: result.insertId
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al crear producto'
        });
    }
};

// UPDATE
const updateProducto = async (req, res) => {
    const { id } = req.params;
    const { nombre, precio_venta, activo } = req.body;

    try {
        const [result] = await pool.query(
            `UPDATE productos 
             SET nombre = ?, precio_venta = ?, activo = ?
             WHERE id = ?`,
            [nombre, precio_venta, activo, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Producto no encontrado'
            });
        }

        res.json({
            status: 'OK',
            message: 'Producto actualizado'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al actualizar producto'
        });
    }
};

// DELETE (soft delete)
const deleteProducto = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query(
            'UPDATE productos SET activo = 0 WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Producto no encontrado'
            });
        }

        res.json({
            status: 'OK',
            message: 'Producto desactivado'
        });
    } catch (error) {


        res.status(500).json({
            status: 'ERROR',
            message: 'Error al eliminar producto'
        });
    }
};

module.exports = {
    getAllProductos,
    createProducto,
    updateProducto,
    deleteProducto
};