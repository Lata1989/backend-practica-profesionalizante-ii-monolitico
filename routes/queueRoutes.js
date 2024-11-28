import express from 'express';
import { validateToken } from '../middlewares/validateToken.js';  // Importamos el middleware de validación de token

const router = express.Router();

export default router;
