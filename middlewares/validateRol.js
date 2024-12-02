export const validateRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    const { role } = req.user;
    console.log(`Rol usuario: ${role}`);
    console.log(`Roles permitidos: ${rolesPermitidos}`);
    if (!rolesPermitidos.includes(role)) {
      return res.status(403).json({ message: 'No tienes autorización para realizar esta acción' });
    }
    next();
  };
};




/*
// Este anda
export const validateRol = (...allowedRoles) => {
  return (req, res, next) => {
    // Verificar que el usuario tiene un rol permitido
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acceso no permitido para este rol.' });
    }
    next(); // El rol es válido, continuar
  };
};
*/