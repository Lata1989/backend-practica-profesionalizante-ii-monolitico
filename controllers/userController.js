import { getDB } from '../config/db.js';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

// Función para registrar un nuevo usuario
export const registrarUsuario = async (req, res) => {
  const { idEmpresa, nombre, apellido, dni, CUIL, direccion, localidad, email, password, rol, box } = req.body;

  if (!idEmpresa || !nombre || !apellido || !dni || !CUIL || !direccion || !localidad || !email || !password || !rol) {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }

  try {
    const db = getDB();

    // Verificar si ya existe un usuario con el mismo email para esa empresa
    const usuarioExistente = await db.collection('usuarios').findOne({
      email: email,
      idEmpresa: idEmpresa,
    });

    if (usuarioExistente) {
      return res.status(400).json({ message: 'El email ya está registrado para esta empresa' });
    }

    // Crear un nuevo usuario
    const nuevoUsuario = {
      idEmpresa,
      nombre,
      apellido,
      dni,
      CUIL,
      direccion,
      localidad,
      email,
      password,
      rol,
      box,
      fechaRegistro: new Date(),
      fechaBorrado: null,  // Al registrar, la fecha de borrado es null
    };

    const resultado = await db.collection('usuarios').insertOne(nuevoUsuario);

    res.status(201).json({ message: 'Usuario registrado exitosamente', usuario: nuevoUsuario });
  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    res.status(500).json({ message: 'Error al registrar el usuario' });
  }
};

// Función para obtener todos los usuarios de una empresa (filtrando los borrados)
export const obtenerUsuarios = async (req, res) => {
  const { empresaId } = req.params;

  try {
    const db = getDB();

    // Obtener los usuarios de la empresa especificada, excluyendo los borrados
    const usuarios = await db.collection('usuarios').find({ idEmpresa: empresaId, fechaBorrado: null }).toArray();

    if (usuarios.length === 0) {
      return res.status(404).json({ message: 'No se encontraron usuarios para esta empresa' });
    }

    res.status(200).json({ usuarios });
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    res.status(500).json({ message: 'Error al obtener los usuarios' });
  }
};

// Función para obtener un usuario por su ID (verificando que no esté borrado)
export const obtenerUsuario = async (req, res) => {
  const { usuarioId } = req.params;

  try {
    const db = getDB();

    // Buscar el usuario por su ID y verificar que no esté borrado
    const usuario = await db.collection('usuarios').findOne({ _id: new ObjectId(usuarioId), fechaBorrado: null });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado o borrado' });
    }

    res.status(200).json({ usuario });
  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    res.status(500).json({ message: 'Error al obtener el usuario' });
  }
};

export const obtenerMiPerfil = async (req, res) => {
  const { usuariId } = req.params;
  const { userId } = req.user; // El userId desde el token

  console.log(`Entre a la funcion.`);
  console.log(`UsuariId: ${usuariId}`);
  console.log(`UserId: ${userId}`);

  if (usuariId !== userId) {
    return res.status(403).json({ message: 'No tienes acceso a este perfil' });
  }

  try {
    const db = getDB();
    const usuario = await db.collection('usuarios').findOne({ _id: new ObjectId(usuariId) });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({ usuario });
  } catch (error) {
    console.error('Error al obtener el perfil:', error);
    res.status(500).json({ message: 'Error al obtener el perfil' });
  }
};

// Función para actualizar los datos de un usuario (verificando que no esté borrado)
export const actualizarUsuario = async (req, res) => {
  const { usuarioId } = req.params;
  const { nombre, apellido, dni, CUIL, direccion, localidad, email, password, rol, box } = req.body;

  if (!nombre || !apellido || !dni || !CUIL || !direccion || !localidad || !email || !password || !rol) {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }

  try {
    const db = getDB();

    // Verificar que el usuario no esté borrado
    const usuarioExistente = await db.collection('usuarios').findOne({ _id: new ObjectId(usuarioId), fechaBorrado: null });

    if (!usuarioExistente) {
      return res.status(404).json({ message: 'Usuario no encontrado o borrado' });
    }

    // Actualizar los datos del usuario
    const resultado = await db.collection('usuarios').updateOne(
      { _id: new ObjectId(usuarioId) },
      { $set: { nombre, apellido, dni, CUIL, direccion, localidad, email, password, rol, box } }
    );

    if (resultado.modifiedCount === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado para actualizar' });
    }

    res.status(200).json({ message: 'Usuario actualizado con éxito' });
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    res.status(500).json({ message: 'Error al actualizar el usuario' });
  }
};

// Función para "eliminar" un usuario (en realidad asigna la fecha de borrado)
export const eliminarUsuario = async (req, res) => {
  const { usuarioId } = req.params;

  try {
    const db = getDB();

    // Verificar que el usuario no esté borrado
    const usuarioExistente = await db.collection('usuarios').findOne({ _id: new ObjectId(usuarioId), fechaBorrado: null });

    if (!usuarioExistente) {
      return res.status(404).json({ message: 'Usuario no encontrado o ya está borrado' });
    }

    // Asignar la fecha de borrado
    const resultado = await db.collection('usuarios').updateOne(
      { _id: new ObjectId(usuarioId) },
      { $set: { fechaBorrado: new Date() } }
    );

    if (resultado.modifiedCount === 0) {
      return res.status(404).json({ message: 'No se pudo borrar el usuario' });
    }

    res.status(200).json({ message: 'Usuario borrado con éxito' });
  } catch (error) {
    console.error('Error al borrar el usuario:', error);
    res.status(500).json({ message: 'Error al borrar el usuario' });
  }
};

// Función para reactivar un usuario (elimina la fecha de borrado)
export const reactivarUsuario = async (req, res) => {
  const { usuarioId } = req.params;

  try {
    const db = getDB();

    // Verificar que el usuario esté borrado
    const usuarioExistente = await db.collection('usuarios').findOne({ _id: new ObjectId(usuarioId), fechaBorrado: { $ne: null } });

    if (!usuarioExistente) {
      return res.status(404).json({ message: 'Usuario no encontrado o no está borrado' });
    }

    // Eliminar la fecha de borrado para reactivar al usuario
    const resultado = await db.collection('usuarios').updateOne(
      { _id: new ObjectId(usuarioId) },
      { $set: { fechaBorrado: null } }
    );

    if (resultado.modifiedCount === 0) {
      return res.status(404).json({ message: 'No se pudo reactivar el usuario' });
    }

    res.status(200).json({ message: 'Usuario reactivado con éxito' });
  } catch (error) {
    console.error('Error al reactivar el usuario:', error);
    res.status(500).json({ message: 'Error al reactivar el usuario' });
  }
};