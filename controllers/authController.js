import jwt from 'jsonwebtoken';
import { getDB } from '../config/db.js';

// Función de login para las empresas
export const loginEmpresa = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos' });
  }

  try {
    const db = getDB();
    const empresa = await db.collection('empresas').findOne({ email });

    if (!empresa) {
      return res.status(404).json({ message: 'Empresa no encontrada' });
    }

    // Comparar la contraseña (sin usar bcrypt)
    if (empresa.password !== password) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Crear un JWT para la empresa
    const token = jwt.sign(
      {
        empresaId: empresa._id, // ID de la empresa
        email: empresa.email,
        role: 'empresa', // Puedes mantener el rol si es necesario
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '9h', // El token expirará en 9 horas
      }
    );

    // Devolver el token y el ID de la empresa en la respuesta
    res.status(200).json({
      message: 'Autenticación exitosa',
      token,
      empresaId: empresa._id.toString(), // Devolver el ID como cadena
    });
  } catch (error) {
    console.error('Error en el login de la empresa:', error);
    res.status(500).json({ message: 'Error al autenticar la empresa' });
  }
};

// Función de login para el staff
export const loginUsuario = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos' });
  }

  try {
    const db = getDB();
    const user = await db.collection('usuarios').findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar si el usuario está borrado
    if (user.fechaBorrado !== null) {
      return res.status(403).json({ message: 'Usuario borrado, no se puede acceder' });
    }

    // Comparar la contraseña (sin usar bcrypt)
    if (user.password !== password) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Verificar que el usuario tenga el rol de 'admin' o 'staff'
    if (user.rol !== 'admin' && user.rol !== 'staff') {
      return res.status(403).json({ message: 'Acceso no permitido' });
    }

    // Crear un JWT para el usuario
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.rol, idEmpresa: user.idEmpresa },
      process.env.JWT_SECRET,
      { expiresIn: '9h' }
    );

    res.status(200).json({ message: 'Autenticación exitosa', token });
  } catch (error) {
    console.error('Error en el login del staff:', error);
    res.status(500).json({ message: 'Error al autenticar al usuario' });
  }
};
