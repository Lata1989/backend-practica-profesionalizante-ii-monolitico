import jwt from 'jsonwebtoken';

export const validateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];  // Obtener el token del header Authorization

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    // Verificar el token utilizando la clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Almacenar la información decodificada del token en la solicitud

    next();  // Continuar con el siguiente middleware o ruta
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};
