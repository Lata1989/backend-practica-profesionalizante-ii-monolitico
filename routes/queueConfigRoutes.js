import express from 'express';
import {
  crearConfiguracion,
  obtenerConfiguraciones,
  obtenerConfiguracionPorId,
  actualizarConfiguracion,
  eliminarConfiguracion,
} from '../controllers/queueConfigController.js';
import { validateToken } from '../middlewares/validateToken.js'; 
import { validateRol } from '../middlewares/validateRol.js'; 
import { addIdEmpresaToUrl } from '../middlewares/addIdEmpresaToURL.js'; // Middleware para filtrar por empresa

const router = express.Router();

// Obtener todas las configuraciones de la empresa
router.get('/', validateToken, addIdEmpresaToUrl, validateRol('owner'), obtenerConfiguraciones);

// Crear nueva configuración (solo accesible para el owner)
router.post('/', validateToken, validateRol('owner'), addIdEmpresaToUrl, crearConfiguracion);

// Obtener una configuración específica por ID
router.get('/:id', validateToken, addIdEmpresaToUrl, validateRol('owner'), obtenerConfiguracionPorId);

// Actualizar una configuración específica
router.put('/:id', validateToken, addIdEmpresaToUrl, validateRol('owner'), actualizarConfiguracion);

// Eliminar una configuración (soft delete)
router.delete('/:id', validateToken, addIdEmpresaToUrl, validateRol('owner'), eliminarConfiguracion);

export default router;
