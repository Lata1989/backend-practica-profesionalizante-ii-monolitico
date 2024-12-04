import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js'; // Asegúrate de tener una función que te conecte a la base de datos

export const registrarCliente = async (req, res) => {
  const { nombre, apellido, direccion, localidad, telefono, dni, CUIT, email, password, categoria, vip } = req.body;
  const { idEmpresa, role } = req.user; // Obtenemos idEmpresa y role del token decodificado

  // Validamos que el usuario tenga una empresa asociada
  if (!idEmpresa) {
    return res.status(400).json({ message: 'No se puede registrar un cliente sin un idEmpresa válido' });
  }

  const cliente = {
    nombre,
    apellido,
    direccion,
    localidad,
    telefono,
    dni,
    CUIT,
    email,
    password,
    categoria,
    vip,
    fechaRegistro: new Date(),
    fechaBorrado: null,
    idEmpresa, // Asociamos el cliente a la empresa del usuario
  };

  try {
    const db = getDB();

    // Validar unicidad de dni y email dentro de la empresa
    const existeCliente = await db.collection('clientes').findOne({
      idEmpresa,
      $or: [{ dni }, { email }],
    });

    if (existeCliente) {
      return res.status(409).json({ message: 'El DNI o el email ya están registrados para esta empresa.' });
    }

    // Insertar cliente en la base de datos
    const result = await db.collection('clientes').insertOne(cliente);
    res.status(201).json({ message: 'Cliente registrado con éxito', clienteId: result.insertedId });
  } catch (error) {
    console.error('Error al registrar cliente:', error);
    res.status(500).json({ message: 'Error al registrar cliente' });
  }
};

// Obtener todos los clientes de una empresa
export const obtenerClientes = async (req, res) => {
  const { idEmpresa } = req.params; // idEmpresa inyectado por addIdEmpresaToUrl

  try {
    const db = getDB();

    // Obtener los clientes de la empresa especificada, excluyendo los borrados
    const clientes = await db.collection('clientes').find({ idEmpresa, fechaBorrado: null }).toArray();

    if (clientes.length === 0) {
      return res.status(404).json({ message: 'No se encontraron clientes para esta empresa' });
    }

    res.status(200).json({ clientes });
  } catch (error) {
    console.error('Error al obtener los clientes:', error);
    res.status(500).json({ message: 'Error al obtener los clientes' });
  }
};

/*
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
*/

// Obtener un cliente por su ID
export const obtenerCliente = async (req, res) => {
  const { clienteId } = req.params;
  const { idEmpresa } = req.user; // Obtenemos el id de la empresa del token

  try {
    const db = getDB();

    // Buscar el cliente por su ID y verificar que no esté borrado y pertenezca a la empresa
    const cliente = await db.collection('clientes').findOne({
      _id: new ObjectId(clienteId),
      fechaBorrado: null,
      idEmpresa: idEmpresa,  // Filtrar por idEmpresa que viene del token
    });

    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado o ha sido borrado o no pertenece a esta empresa' });
    }

    res.status(200).json({ cliente });
  } catch (error) {
    console.error('Error al obtener el cliente:', error);
    res.status(500).json({ message: 'Error al obtener el cliente' });
  }
};

/*
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
*/

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

// Reactivar un cliente (quitar la fecha de borrado)
export const reactivarCliente = async (req, res) => {
  const { clienteId } = req.params;

  try {
    const db = getDB();
    
    // Buscar el cliente por su ID y verificar que esté eliminado
    const cliente = await db.collection('clientes').findOne({ 
      _id: new ObjectId(clienteId),
      fechaBorrado: { $ne: null } // Verificar que tenga fechaBorrado
    });

    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado o no está eliminado' });
    }

    // Reactivar el cliente (eliminamos la fechaBorrado)
    const result = await db.collection('clientes').updateOne(
      { _id: new ObjectId(clienteId) },
      { $set: { fechaBorrado: null } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'No se pudo reactivar el cliente' });
    }

    res.status(200).json({ message: 'Cliente reactivado con éxito' });
  } catch (error) {
    console.error('Error al reactivar cliente:', error);
    res.status(500).json({ message: 'Error al reactivar cliente' });
  }
};
