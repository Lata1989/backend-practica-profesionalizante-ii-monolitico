export const validateRol = (allowedRoles) => {
    return (req, res, next) => {
      if (!allowedRoles.includes(req.user.rol)) {
        return res.status(403).json({ message: 'Acceso no permitido. Rol insuficiente.' });
      }
      next(); // El usuario tiene un rol permitido, continuar con la siguiente función
    };
  };
  