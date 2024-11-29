export const validateRol = (...allowedRoles) => {
    return (req, res, next) => {
      // Verificar que el usuario tiene un rol permitido
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Acceso no permitido para este rol.' });
      }
      next(); // El rol es válido, continuar
    };
  };
  