import express from 'express';
import { obtenerConfigCola, modificarConfigCola, crearConfigCola } from '../controllers/queueConfigController.js';
import { validateToken } from '../middlewares/validateToken.js';  // Importamos el middleware de validación de token
import { validateRol } from '../middlewares/validateRol.js';  // Importamos el middleware para validar el rol

const router = express.Router();

// Aca van las rutas

// Ruta para obtener la configuración de la cola
router.get('/config', validateToken, obtenerConfigCola);

// Ruta para crear una nueva configuración de la cola (solo accesible para el owner)
router.post('/config', validateToken, validateRol('owner'), crearConfigCola);

// Ruta para modificar la configuración de la cola (solo accesible para el owner)
router.put('/config', validateToken, validateRol('owner'), modificarConfigCola);


// Hasta aca

export default router;
