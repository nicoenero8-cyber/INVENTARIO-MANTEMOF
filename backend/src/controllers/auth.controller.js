const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * LOGIN
 * Verifica usuario y contraseña
 */
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1️⃣ Validar que lleguen datos
        if (!email || !password) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Email y password son obligatorios'
            });
        }

        // 2️⃣ Buscar usuario en BD
        const [rows] = await pool.query(
            `
            SELECT 
                u.id,
                u.nombre,
                u.email,
                u.password_hash,
                u.activo,
                GROUP_CONCAT(r.nombre) AS roles
            FROM usuarios u
            LEFT JOIN usuarios_roles ur ON u.id = ur.usuario_id
            LEFT JOIN roles r ON ur.rol_id = r.id
            WHERE u.email = ?
            GROUP BY u.id
            `,
        [email]
);

        if (rows.length === 0) {
            return res.status(401).json({
                status: 'ERROR',
                message: 'Credenciales inválidas'
            });
        }

        const user = rows[0];
        const roles = user.roles ? user.roles.split(',') : [];
        // 3️⃣ Verificar si está activo
        if (user.activo === 0) {
            return res.status(403).json({
                status: 'ERROR',
                message: 'Usuario inactivo'
            });
        }


        // 4️⃣ Comparar contraseña (bcrypt)
        const passwordOK = await bcrypt.compare(password, user.password_hash);

        if (!passwordOK) {
            return res.status(401).json({
                status: 'ERROR',
                message: 'Credenciales inválidas'
            });
        }

        // 5️⃣ Login exitoso

const token = jwt.sign(
  {
    id: user.id,
    email: user.email,
    roles: roles
  },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES }
);

res.json({
  status: 'OK',
  message: 'Login exitoso',
  token,
  user: {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    roles: roles
  }
});

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error en login'
        });
    }
};

/**
 * REGISTER
 * Crea usuario con contraseña encriptada
 */
const register = async (req, res) => {
    const { nombre, email, password } = req.body;

    try {
        // 1️⃣ Validar datos
        if (!nombre || !email || !password) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Todos los campos son obligatorios'
            });
        }

        // 2️⃣ Verificar si el email ya existe
        const [exist] = await pool.query(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );

        if (exist.length > 0) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'El email ya está registrado'
            });
        }

        // 3️⃣ Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // 4️⃣ Guardar usuario
        await pool.query(
            `INSERT INTO usuarios (nombre, email, password_hash, activo)
             VALUES (?, ?, ?, 1)`,
            [nombre, email, password_hash]
        );

        // 5️⃣ Respuesta
        res.status(201).json({
            status: 'OK',
            message: 'Usuario creado correctamente'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al registrar usuario'
        });
    }
};


module.exports = {
    login,
    register
};
