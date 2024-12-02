import express from 'express';
import { registrarCliente, obtenerClientes, obtenerCliente, actualizarCliente, eliminarCliente } from '../controllers/clienteController.js';
import { validateToken } from '../middlewares/validateToken.js';  
import { validateRol } from '../middlewares/validateRol.js';      

const router = express.Router();

// Ruta para registrar un nuevo cliente (solo puede acceder 'owner' y 'admin')
router.post('/clientes', validateToken, validateRol('owner', 'admin'), registrarCliente);

// Ruta para obtener todos los clientes de una empresa (solo puede acceder 'owner' y 'admin')
router.get('/clientes/empresa/:empresaId', validateToken, validateRol('owner', 'admin'), obtenerClientes);

// Ruta para obtener un cliente por su ID (solo puede acceder 'owner' y 'admin')
router.get('/clientes/:clienteId', validateToken, validateRol('owner', 'admin'), obtenerCliente);

// Ruta para actualizar los datos de un cliente (solo puede acceder 'owner' y 'admin')
router.put('/clientes/:clienteId', validateToken, validateRol('owner', 'admin'), actualizarCliente);

// Ruta para eliminar un cliente (solo puede acceder 'owner' y 'admin')
router.delete('/clientes/:clienteId', validateToken, validateRol('owner', 'admin'), eliminarCliente);

export default router;
