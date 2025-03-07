const User = require('../models/User');

// Middleware para verificar si el usuario tiene el rol requerido
module.exports = function(roles) {
  return async function(req, res, next) {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ msg: 'Usuario no encontrado' });
      }
      
      if (!roles.includes(user.rol)) {
        return res.status(403).json({ msg: 'Acceso denegado: permisos insuficientes' });
      }
      
      next();
    } catch (err) {
      console.error(err);
      res.status(500).send('Error del servidor');
    }
  };
};