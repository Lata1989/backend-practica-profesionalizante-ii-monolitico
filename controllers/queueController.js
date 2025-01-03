import { getDB } from '../config/db.js';
import { ObjectId } from 'mongodb';
import QRCode from 'qrcode'; // Usamos la librería QRCode para generar el QR

// Definimos un objeto global para mantener los contadores
let contadores = {};

// Función para inicializar los contadores con las categorías que tiene la configuración de la cola
const inicializarContadores = async (idEmpresa) => {
  try {
    const db = getDB();
    const configuracion = await db.collection('configuracionColas').findOne({ idEmpresa, fechaBorrado: null });

    if (!configuracion) {
      throw new Error('Configuración de cola no encontrada');
    }

    // Inicializamos el objeto de contadores con las categorías y valor inicial 0
    contadores = {
      ContadoresCategorias: {}
    };

    // Iteramos sobre las categorías en la configuración de la cola y creamos un contador para cada una
    for (let categoria in configuracion.contadores) {
      contadores.ContadoresCategorias[categoria] = 0;  // Inicializamos cada contador en 0
    }

    console.log('Contadores inicializados:', contadores);
  } catch (error) {
    console.error('Error al inicializar los contadores:', error.message);
  }
};


// Función para generar el QR
const generarQR = async (data) => {
  try {
    const qrCode = await QRCode.toDataURL(data);
    return qrCode; // Retorna el QR como una URL
  } catch (error) {
    throw new Error('Error al generar el QR: ' + error.message);
  }
};

/*
  ↑ Funciones internas del controlador
  
  ↓ Funciones de las rutas
*/


// Obtener el estado de la cola (server-side event)
export const obtenerEstadoCola = async (req, res) => {
  const { idEmpresa } = req.params;

  try {
    const db = getDB();
    const configuracion = await db.collection('configuracionColas').findOne({ idEmpresa, fechaBorrado: null });

    if (!configuracion) {
      return res.status(404).json({ error: 'Configuración de cola no encontrada' });
    }

    // Emitir un evento cada vez que cambie el estado
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const interval = setInterval(async () => {
      const clientesEnCola = await db.collection('clientesCola').find({ idEmpresa, atendido: false }).toArray();
      res.write(`data: ${JSON.stringify(clientesEnCola)}\n\n`);
    }, 5000); // Emitir cada 5 segundos

    req.on('close', () => {
      clearInterval(interval);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el estado de la cola', detalles: error.message });
  }
};

// Agregar cliente a la cola
export const agregarClienteACola = async (req, res) => {
  const { idEmpresa } = req.params;
  const { nombre, categoria } = req.body;

  try {
    const db = getDB();
    const configuracion = await db.collection('configuracionColas').findOne({ idEmpresa, fechaBorrado: null });

    if (!configuracion) {
      return res.status(404).json({ error: 'Configuración de cola no encontrada' });
    }

    // Incrementar el contador de la categoría
    const contador = configuracion.contadores[categoria.toLowerCase()] + 1;
    configuracion.contadores[categoria.toLowerCase()] = contador;

    // Calcular la posición del cliente en la cola
    const valor = contador * configuracion.multiplicador[categoria] + configuracion.diferenciador[categoria];

    // Generar el QR con la información del cliente
    const qrData = { idCliente: nombre, categoria, valor };
    const qrCode = await generarQR(qrData);

    // Guardar el cliente en la cola
    await db.collection('clientesCola').insertOne({
      idEmpresa,
      nombre,
      categoria,
      valor,
      qrCode,
      atendido: false,
      fechaIngreso: new Date(),
    });

    res.status(201).json({ mensaje: 'Cliente agregado a la cola', qrCode });
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar el cliente a la cola', detalles: error.message });
  }
};

// Llamar a un cliente de la cola
export const llamarClienteCola = async (req, res) => {
  const { idEmpresa, idCliente } = req.params;

  try {
    const db = getDB();
    const cliente = await db.collection('clientesCola').findOne({ _id: new ObjectId(idCliente), idEmpresa });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado en la cola' });
    }

    await db.collection('clientesCola').updateOne(
      { _id: new ObjectId(idCliente) },
      { $set: { atendido: true } }
    );

    res.status(200).json({ mensaje: 'Cliente llamado para ser atendido' });
  } catch (error) {
    res.status(500).json({ error: 'Error al llamar al cliente de la cola', detalles: error.message });
  }
};

// Actualizar estado de un cliente a atendido
export const marcarClienteAtendido = async (req, res) => {
  const { idEmpresa, idCliente } = req.params;

  try {
    const db = getDB();
    const cliente = await db.collection('clientesCola').findOne({ _id: new ObjectId(idCliente), idEmpresa });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado en la cola' });
    }

    await db.collection('clientesCola').updateOne(
      { _id: new ObjectId(idCliente) },
      { $set: { atendido: true } }
    );

    res.status(200).json({ mensaje: 'Cliente actualizado a estado atendido y retirado de la cola' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar estado del cliente', detalles: error.message });
  }
};

// Obtener la posición del cliente en la cola usando el QR
export const obtenerPosicionCliente = async (req, res) => {
  const { idEmpresa, qrCode } = req.params;

  try {
    const db = getDB();
    const cliente = await db.collection('clientesCola').findOne({ idEmpresa, qrCode });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado con este QR' });
    }

    res.status(200).json({ posicion: cliente.valor, estado: cliente.atendido ? 'Atendido' : 'En espera' });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la posición del cliente', detalles: error.message });
  }
};


/*
export const ConfiguracionCola = {
    idEmpresa: '', // ID de la empresa a la que pertenece la configuración de la cola
    nombre: '',
    multiplicador: {
      VIP: 1,        // Multiplicador para la categoría VIP
      Premium: 4,  // Multiplicador para la categoría Premium
      Regular: 4,    // Multiplicador para la categoría Regular
      NoCliente: 5   // Multiplicador para NoCliente
    },
    diferenciador: {
      VIP: Math.pow(10,-5),        // Diferenciadores para la categoría VIP
      premium: Math.pow(10,-4),    // Diferenciadores para la categoría Premium
      regular: Math.pow(10,-3),     // Diferenciadores para la categoría Regular
      noCliente: Math.pow(10,-3)    // Diferenciadores para NoCliente
    },
    contadores: {
      VIP: 0,       // Contador para la categoría VIP
      premium: 0,   // Contador para la categoría Premium
      regular: 0,   // Contador para la categoría Regular
      noCliente: 0  // Contador para NoCliente
    },
    fechaCreacion: '',  // Fecha de creación de esta configuración (para obtener siempre la última configuración)
    activo: ''
};
*/

/*

let contadores = {
  ContadoresCategorias:{
    categoria1:
    categoria2:
    categoria3:
    categoria4:
    categoria5:
  }
};
for (let index = 0; index < contadores.length; index++) {
  const contadores[valorContadorCategoria] = contadores[categoria];
}

*/