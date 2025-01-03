import express from 'express';
import {
    obtenerEstadoCola,
    agregarClienteACola,
    llamarClienteCola,
    marcarClienteAtendido,
    obtenerPosicionCliente
} from '../controllers/queueController.js';

const router = express.Router();

// Server-Side Event para estado de la cola
router.get('/estado/:idEmpresa', obtenerEstadoCola); // Deberiamos agregar validatetoken

// Agregar cliente/visitante a la cola
router.post('/agregar', agregarClienteACola); // En el controlador, deberia buscar al cliente si no esta registrado

// Llamar a un cliente de la cola
router.put('/llamar', llamarClienteCola);

// Actualizar estado de cliente a atendido
router.put('/atendido', marcarClienteAtendido);

// Obtener posición del cliente con QR
router.get('/posicion/:idCliente', obtenerPosicionCliente);

export default router;
