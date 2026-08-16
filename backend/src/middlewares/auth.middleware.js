const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        // 1️⃣ Obtener token del header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                status: 'ERROR',
                message: 'Token requerido'
            });
        }

        // Formato esperado: "Bearer TOKEN"
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                status: 'ERROR',
                message: 'Token inválido'
            });
        }

        // 2️⃣ Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3️⃣ Guardar usuario en request
        req.user = decoded;

        // 4️⃣ Continuar
        next();

    } catch (error) {
        return res.status(401).json({
            status: 'ERROR',
            message: 'Token no válido o expirado'
        });
    }
};

module.exports = authMiddleware;
