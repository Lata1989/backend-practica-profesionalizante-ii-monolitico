import jwt from 'jsonwebtoken';

// Middleware para verificar si el token es válido
export const verificarToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Obtener el token del header 'Authorization'

  if (!token) {
    return res.status(401).json({ message: 'Acceso no autorizado. Token no proporcionado.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Agregar los datos del usuario decodificado al request
    next(); // Continuar con la siguiente función en la cadena
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido o expirado' });
  }
};

// Middleware para verificar si el usuario tiene rol de 'admin' o 'dueño'
export const verificarRol = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'dueño') {
    return res.status(403).json({ message: 'Acceso no permitido. Solo los administradores o dueños pueden acceder a esta ruta.' });
  }
  next(); // El usuario tiene el rol adecuado, continuar con la siguiente función
};
