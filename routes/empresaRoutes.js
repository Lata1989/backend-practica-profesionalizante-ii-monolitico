import express from 'express';
import { registrarEmpresa, consultarPerfilEmpresa, actualizarEmpresa } from '../controllers/empresaController.js';
import { validateToken } from '../middlewares/validateToken.js';  // Importamos el middleware de validación de token

const router = express.Router();

// Ruta para registrar una empresa
router.post('/registrar', registrarEmpresa);

// Ruta protegida para consultar el perfil de la empresa (requiere autenticación)
router.get('/perfil/:empresaId', validateToken, consultarPerfilEmpresa);

// Ruta protegida para actualizar los datos de la empresa (requiere autenticación)
router.put('/actualizar/:empresaId', validateToken, actualizarEmpresa);

export default router;
