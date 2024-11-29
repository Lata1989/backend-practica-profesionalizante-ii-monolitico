import express from 'express';
import { registrarEmpresa, consultarPerfilEmpresa, actualizarEmpresa } from '../controllers/empresaController.js';
import { validateToken } from '../middlewares/validateToken.js';  // Importamos el middleware de validación de token
import { validateRol } from '../middlewares/validateRol.js';  // Importamos el middleware para validar el rol

const router = express.Router();

// Ruta para registrar una empresa (sin rol necesario, cualquiera puede crear una empresa)
router.post('/registrar', registrarEmpresa);

// Ruta protegida para consultar el perfil de la empresa (requiere autenticación y rol de 'owner')
// router.get('/perfil/:empresaId', validateToken, validateRol, consultarPerfilEmpresa);
router.get('/perfil/:empresaId', validateToken, validateRol('owner'), consultarPerfilEmpresa);

// Ruta protegida para actualizar los datos de la empresa (requiere autenticación y rol de 'owner')
router.put('/actualizar/:empresaId', validateToken, validateRol('owner'), actualizarEmpresa);

export default router;
