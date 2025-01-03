import { getDB } from '../config/db.js';
import { ObjectId } from 'mongodb';

// Crear nueva configuración
export const crearConfiguracion = async (req, res) => {
    const db = getDB();
    const configuracion = {
        ...req.body,
        fechaCreacion: new Date().toISOString(),
        fechaBorrado: null,
        activo: false,
    };

    try {
        const result = await db.collection('configuracionColas').insertOne(configuracion);
        res.status(201).json({ mensaje: 'Configuración creada', id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la configuración', detalles: error.message });
    }
};

// Obtener todas las configuraciones activas o no eliminadas
export const obtenerConfiguraciones = async (req, res) => {
    const db = getDB();
    const { idEmpresa } = req.params;

    if (!idEmpresa) {
        return res.status(400).json({ error: 'El ID de la empresa no fue proporcionado' });
    }

    try {
        const configuraciones = await db
            .collection('configuracionColas')
            .find({ fechaBorrado: null, idEmpresa })
            .toArray();
        res.status(200).json(configuraciones);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener configuraciones', detalles: error.message });
    }
};

// Obtener configuración por ID
export const obtenerConfiguracionPorId = async (req, res) => {
    const { id } = req.params;
    const db = getDB();

    try {
        const configuracion = await db.collection('configuracionColas').findOne({ _id: new ObjectId(id) });
        if (!configuracion) {
            return res.status(404).json({ error: 'Configuración no encontrada' });
        }
        res.status(200).json(configuracion);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la configuración', detalles: error.message });
    }
};

// Actualizar configuración
export const actualizarConfiguracion = async (req, res) => {
    const { id } = req.params;
    const db = getDB();

    try {
        const result = await db.collection('configuracionColas').updateOne(
            { _id: new ObjectId(id) },
            { $set: req.body }
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Configuración no encontrada' });
        }
        res.status(200).json({ mensaje: 'Configuración actualizada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la configuración', detalles: error.message });
    }
};

// Eliminar configuración (soft delete)
export const eliminarConfiguracion = async (req, res) => {
    const { id } = req.params;
    const db = getDB();

    try {
        const result = await db.collection('configuracionColas').updateOne(
            { _id: new ObjectId(id) },
            { $set: { fechaBorrado: new Date().toISOString() } }
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Configuración no encontrada' });
        }
        res.status(200).json({ mensaje: 'Configuración eliminada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la configuración', detalles: error.message });
    }
};
