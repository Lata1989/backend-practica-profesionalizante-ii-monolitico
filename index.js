import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import clienteRoutes from './routes/clienteRoutes.js';
import empresaRoutes from './routes/empresaRoutes.js';
import queueRoutes from './routes/queueRoutes.js';
import userRoutes from './routes/userRoutes.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares globales
app.use(express.json());

// Ruta base para probar las respuestas
app.get("/", (req,res) => {
    res.send("El servidor funciona correctamente.");
})

// Rutas principales
app.use('/auth', authRoutes); // Todo probado en Postman - OK
app.use('/clientes', clienteRoutes);
app.use('/empresas', empresaRoutes); // Todo probado en Postman - OK
app.use('/queue', queueRoutes);
app.use('/users', userRoutes); // Todo probado en Postman - OK

// Arrancar servidor
connectDB()
    .then(() => {
        app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
    })
    .catch(err => {
        console.error('Error al conectar con la base de datos:', err);
        process.exit(1);
    });
