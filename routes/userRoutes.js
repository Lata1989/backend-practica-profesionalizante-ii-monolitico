import express from 'express';
import {
  registrarUsuario,
  obtenerUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  eliminarUsuario,
  reactivarUsuario
} from '../controllers/userController.js';
import { validateToken } from '../middlewares/validateToken.js';  // Middleware para validar token
import { validateRol } from '../middlewares/validateRol.js';      // Middleware para validar rol

const router = express.Router();

// Ruta para registrar un nuevo usuario (solo puede acceder 'owner')
router.post('/usuarios', validateToken, validateRol('owner'), registrarUsuario);

// Ruta para obtener todos los usuarios de una empresa (solo puede acceder 'owner')
router.get('/usuarios/empresa/:empresaId', validateToken, validateRol('owner'), obtenerUsuarios);

// Ruta para obtener un usuario específico por su ID (solo puede acceder 'owner')
router.get('/usuarios/:usuarioId', validateToken, validateRol('owner'), obtenerUsuario);

// Ruta para actualizar los datos de un usuario (solo puede acceder 'owner')
router.put('/usuarios/:usuarioId', validateToken, validateRol('owner'), actualizarUsuario);

// Ruta para "eliminar" un usuario (solo puede acceder 'owner')
router.delete('/usuarios/:usuarioId', validateToken, validateRol('owner'), eliminarUsuario);

// Ruta para reactivar un usuario (solo puede acceder 'owner')
router.put('/usuarios/reactivar/:usuarioId', validateToken, validateRol('owner'), reactivarUsuario);

export default router;
