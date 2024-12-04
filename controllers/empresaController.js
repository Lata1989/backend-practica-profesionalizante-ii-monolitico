import { getDB } from '../config/db.js';
import { ObjectId } from 'mongodb';  // Asegúrate de importar ObjectId
import { Empresa } from '../models/empresaModel.js';

// Registrar una nueva empresa
export const registrarEmpresa = async (req, res) => {
  const { razonSocial, cuit, direccion, localidad, email, password } = req.body;

  // Validaciones de los campos requeridos
  if (!razonSocial || !cuit || !direccion || !localidad || !email || !password) {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }

  // Validación del email
  const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Email no válido' });
  }

  try {
    const db = getDB();

    // Verificar si ya existe una empresa con el mismo CUIT o email
    const empresaExistente = await db.collection('empresas').findOne({
      $or: [{ cuit: cuit }, { email: email }],
    });

    if (empresaExistente) {
      return res.status(400).json({ message: 'El CUIT o el email ya están registrados' });
    }

    // Crear la nueva empresa y asignar el rol por defecto como "owner"
    const nuevaEmpresa = {
      razonSocial,
      cuit,
      direccion,
      localidad,
      email,
      password,  // Recuerda que no estás utilizando bcrypt
      rol: 'owner',  // Asignación del rol por defecto
      fechaRegistro: new Date(),  // Fecha de registro actual
    };

    // Insertar la nueva empresa en la base de datos
    const result = await db.collection('empresas').insertOne(nuevaEmpresa);
    res.status(201).json({ message: 'Empresa registrada con éxito', empresaId: result.insertedId });
  } catch (error) {
    console.error('Error al registrar empresa:', error);
    res.status(500).json({ message: 'Error al registrar la empresa' });
  }
};

// Obtener los datos de la empresa
export const consultarPerfilEmpresa = async (req, res) => {
  const { empresaId } = req.params;  // Obtenemos el ID de la empresa desde los parámetros de la ruta

  try {
    // Convertir el empresaId en un ObjectId de MongoDB
    const empresaObjectId = new ObjectId(empresaId);

    const db = getDB();
    const empresa = await db.collection('empresas').findOne({ _id: empresaObjectId });

    if (!empresa) {
      return res.status(404).json({ message: 'Empresa no encontrada' });
    }

    // Devolver el objeto de la empresa directamente, incluyendo el campo password
    res.status(200).json(empresa);
  } catch (error) {
    console.error('Error al consultar el perfil de la empresa:', error);
    res.status(500).json({ message: 'Error al consultar el perfil de la empresa' });
  }
};

// Actualizar los datos de la empresa
export const actualizarEmpresa = async (req, res) => {
  const { empresaId } = req.params;  // Obtenemos el ID de la empresa desde los parámetros de la ruta
  const { razonSocial, cuit, direccion, localidad, email, password } = req.body;

  // Validaciones de los campos requeridos
  if (!razonSocial || !cuit || !direccion || !localidad || !email || !password) {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }

  // Validación del email
  const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Email no válido' });
  }

  try {
    const db = getDB();

    // Verificar si ya existe una empresa con el mismo email o cuit, pero que no sea la misma empresa
    const empresaExistente = await db.collection('empresas').findOne({
      $or: [{ email: email }, { cuit: cuit }],
      _id: { $ne: new ObjectId(empresaId) }  // Excluir la empresa que estamos actualizando
    });

    // Si se encuentra otra empresa con el mismo email o cuit
    if (empresaExistente) {
      return res.status(400).json({ message: 'El email o el cuit ya están registrados por otra empresa' });
    }

    // Actualizar los datos de la empresa
    const resultado = await db.collection('empresas').updateOne(
      { _id: new ObjectId(empresaId) },  // Usar ObjectId para asegurar la comparación de ID
      { $set: { razonSocial, cuit, direccion, localidad, email, password } }
    );

    if (resultado.modifiedCount === 0) {
      return res.status(404).json({ message: 'No se encontró la empresa para actualizar' });
    }

    res.status(200).json({ message: 'Datos de la empresa actualizados con éxito' });
  } catch (error) {
    console.error('Error al actualizar la empresa:', error);
    res.status(500).json({ message: 'Error al actualizar la empresa' });
  }
};