const checkRole = (roleRequired) => {
    return (req, res, next) => {

        if (!req.user || !req.user.roles) {
            return res.status(403).json({
                status: 'ERROR',
                message: 'Roles no disponibles'
            });
        }

        if (!req.user.roles.includes(roleRequired)) {
            return res.status(403).json({
                status: 'ERROR',
                message: 'No tienes permisos'
            });
        }

        next();
    };
};

module.exports = checkRole;