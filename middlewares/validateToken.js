import jwt from 'jsonwebtoken';

export const validateToken = (req, res, next) => {
  console.log("Validando el token.");
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado o inválido' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Validar que siempre exista un campo identificador uniforme
    if (!req.user.userId && !req.user.idEmpresa) {
      return res.status(401).json({ message: 'Token inválido: faltan identificadores' });
    }

    console.log('Token decodificado:', decoded);
    next();
  } catch (error) {
    console.error('Error al validar el token:', error.message);
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};



/*
// Esto anda
import jwt from 'jsonwebtoken';

export const validateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado o inválido' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Decodificar el token y agregarlo a `req.user`
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};
*/