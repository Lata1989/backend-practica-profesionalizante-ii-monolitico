import express from 'express';
import { loginEmpresa, loginUsuario } from '../controllers/authController.js'; // Nuevas funciones de login
import { validateToken } from '../middlewares/validateToken.js';  // Importamos el middleware de validación de token

const router = express.Router();

// Ruta para el login de la empresa
router.post('/login/empresa', loginEmpresa);

// Ruta para el login del personal (staff)
router.post('/login/usuarios', loginUsuario);

export default router;
