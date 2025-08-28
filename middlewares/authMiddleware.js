import passport from 'passport';

// Middleware para autenticación JWT
export const authenticateJWT = passport.authenticate('jwt', { session: false });

// Middleware para verificar rol admin
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Acceso denegado: Requiere rol de administrador' });
};