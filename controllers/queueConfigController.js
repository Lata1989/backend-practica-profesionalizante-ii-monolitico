import { getDB } from "../config/db.js";

// Obtener la última configuración de la cola
export const obtenerConfigCola = async (req, res) => {
    const { idEmpresa } = req.user;

    const db = getDB();
    const configCola = await db.collection('configuracionCola')
        .find({ idEmpresa })
        .sort({ fechaCreacion: -1 }) // Ordenamos por fechaCreacion descendente
        .limit(1) // Solo obtenemos el primer documento (el más reciente)
        .toArray();

    if (!configCola || configCola.length === 0) {
        return res.status(404).json({ message: 'Configuración de cola no encontrada' });
    }

    res.status(200).json(configCola[0]); // Devolvemos el primer documento (más reciente)
};

// Crear o modificar la configuración de la cola
export const modificarConfigCola = async (req, res) => {
    const { idEmpresa } = req.user;
    const { Algoritmo, Categorias, Multiplicador, Diferenciador } = req.body;

    const db = getDB();

    const fechaCreacion = new Date(); // Fecha de creación (o modificación)

    // Verificar si ya existe configuración
    const configExistente = await db.collection('configuracionCola').findOne({ idEmpresa });

    if (configExistente) {
        // Si existe, actualizamos la configuración y la fecha de creación
        await db.collection('configuracionCola').updateOne(
            { idEmpresa },
            {
                $set: {
                    Algoritmo,
                    Categorias,
                    Multiplicador,
                    Diferenciador,
                    fechaCreacion // Actualizamos la fecha de creación
                }
            }
        );
        return res.status(200).json({ message: 'Configuración de cola actualizada correctamente' });
    }

    // Si no existe, la creamos con la fecha de creación
    await db.collection('configuracionCola').insertOne({
        idEmpresa,
        Algoritmo,
        Categorias,
        Multiplicador,
        Diferenciador,
        fechaCreacion // Incluimos la fecha de creación
    });

    res.status(201).json({ message: 'Configuración de cola creada correctamente' });
};


// Crear una nueva configuración de cola (solo accesible para el owner)
export const crearConfigCola = async (req, res) => {
    const { idEmpresa } = req.user;
    const { Algoritmo, Categorias, Multiplicador, Diferenciador } = req.body;

    const db = getDB();

    // Verificar si ya existe configuración
    const configExistente = await db.collection('configuracionCola').findOne({ idEmpresa });

    if (configExistente) {
        return res.status(400).json({ message: 'Ya existe una configuración de cola para esta empresa' });
    }

    // Si no existe, la creamos
    await db.collection('configuracionCola').insertOne({
        idEmpresa,
        Algoritmo,
        Categorias,
        Multiplicador,
        Diferenciador,
    });

    res.status(201).json({ message: 'Configuración de cola creada correctamente' });
};
