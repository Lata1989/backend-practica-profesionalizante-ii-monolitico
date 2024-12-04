import express from 'express';
import {
  registrarUsuario,
  obtenerUsuarios,
  obtenerUsuario,
  obtenerMiPerfil,
  actualizarUsuario,
  eliminarUsuario,
  reactivarUsuario
} from '../controllers/userController.js';

// Middlewares
import { addIdEmpresaToUrl } from '../middlewares/addIdEmpresaToURL.js';
import { validateToken } from '../middlewares/validateToken.js';  
import { validateRol } from '../middlewares/validateRol.js';      

const router = express.Router();

// Ruta para registrar un nuevo usuario (solo puede acceder 'owner')
router.post('/usuarios', validateToken, validateRol('owner'), registrarUsuario);

// Ruta para obtener todos los usuarios de una empresa (solo puede acceder 'owner')
router.get('/usuarios/empresa', validateToken, addIdEmpresaToUrl, validateRol('owner'), obtenerUsuarios);
// router.get('/usuarios/empresa/:empresaId', validateToken, addIdEmpresaToUrl, validateRol('owner'), obtenerUsuarios);

// Ruta para obtener un usuario específico por su ID (solo puede acceder 'owner')
router.get('/usuarios/:usuarioId', validateToken, validateRol('owner'), obtenerUsuario);

// Ruta para obtener un usuario específico por su ID.
router.get('/usuarios/miperfil/:usuariId', validateToken, validateRol('staff', 'admin'), obtenerMiPerfil);

// Ruta para actualizar los datos de un usuario (solo puede acceder 'owner')
router.put('/usuarios/:usuarioId', validateToken, validateRol('owner'), actualizarUsuario);

// Ruta para "eliminar" un usuario (solo puede acceder 'owner')
router.delete('/usuarios/:usuarioId', validateToken, validateRol('owner'), eliminarUsuario);

// Ruta para reactivar un usuario (solo puede acceder 'owner')
router.put('/usuarios/reactivar/:usuarioId', validateToken, validateRol('owner'), reactivarUsuario);

export default router;
