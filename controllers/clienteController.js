import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js'; // Asegúrate de tener una función que te conecte a la base de datos

// Registrar un nuevo cliente
export const registrarCliente = async (req, res) => {
  const { nombre, apellido, direccion, localidad, telefono, email, password, categoria, vip, dni, CUIT } = req.body;
  const { idEmpresa } = req.user; // ID de la empresa del usuario logueado

  // Verificar si el email o DNI ya existen en la misma empresa
  try {
    const db = getDB();
    const clienteExistente = await db.collection('clientes').findOne({
      $or: [
        { email: email, idEmpresa: idEmpresa },
        { dni: dni, idEmpresa: idEmpresa }
      ]
    });

    if (clienteExistente) {
      return res.status(400).json({ message: 'El DNI o el email ya están registrados en esta empresa' });
    }

    const cliente = {
      nombre,
      apellido,
      direccion,
      localidad,
      telefono,
      email,
      password, // Mantener la contraseña en texto plano como lo mencionaste
      categoria,
      vip,
      fechaRegistro: new Date(),
      fechaBorrado: null,
      idEmpresa, // Asociamos el cliente a la empresa del usuario
      dni,
      CUIT,
    };

    const result = await db.collection('clientes').insertOne(cliente);
    res.status(201).json({ message: 'Cliente registrado con éxito', clienteId: result.insertedId });
  } catch (error) {
    console.error('Error al registrar cliente:', error);
    res.status(500).json({ message: 'Error al registrar cliente' });
  }
};

// Obtener todos los clientes de una empresa
export const obtenerClientes = async (req, res) => {
  const { empresaId } = req.params;

  try {
    const db = getDB();
    const clientes = await db.collection('clientes').find({ idEmpresa: empresaId, fechaBorrado: null }).toArray();

    if (clientes.length === 0) {
      return res.status(404).json({ message: 'No se encontraron clientes para esta empresa' });
    }

    res.status(200).json({ clientes });
  } catch (error) {
    console.error('Error al obtener los clientes:', error);
    res.status(500).json({ message: 'Error al obtener los clientes' });
  }
};

// Obtener un cliente por su ID
export const obtenerCliente = async (req, res) => {
  const { clienteId } = req.params;

  try {
    const db = getDB();
    const cliente = await db.collection('clientes').findOne({
      _id: new ObjectId(clienteId),
      fechaBorrado: null
    });

    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado o ha sido borrado' });
    }

    res.status(200).json({ cliente });
  } catch (error) {
    console.error('Error al obtener el cliente:', error);
    res.status(500).json({ message: 'Error al obtener el cliente' });
  }
};

// Actualizar los datos de un cliente
export const actualizarCliente = async (req, res) => {
  const { clienteId } = req.params;
  const { nombre, apellido, direccion, localidad, telefono, email, categoria, vip, dni, CUIT } = req.body;

  const updatedCliente = {
    nombre,
    apellido,
    direccion,
    localidad,
    telefono,
    email,
    categoria,
    vip,
    dni,
    CUIT,
    fechaRegistro: new Date(),
  };

  try {
    const db = getDB();
    const result = await db.collection('clientes').updateOne(
      { _id: new ObjectId(clienteId), fechaBorrado: null },
      { $set: updatedCliente }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado o ya ha sido borrado' });
    }

    res.status(200).json({ message: 'Cliente actualizado con éxito' });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ message: 'Error al actualizar cliente' });
  }
};

// Eliminar un cliente
export const eliminarCliente = async (req, res) => {
  const { clienteId } = req.params;

  try {
    const db = getDB();
    const result = await db.collection('clientes').updateOne(
      { _id: new ObjectId(clienteId), fechaBorrado: null },
      { $set: { fechaBorrado: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado o ya ha sido borrado' });
    }

    res.status(200).json({ message: 'Cliente eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ message: 'Error al eliminar cliente' });
  }
};
