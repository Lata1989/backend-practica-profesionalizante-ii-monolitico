import { MongoClient } from 'mongodb';

let db;

export const connectDB = async () => {
    if (!db) {
        const client = new MongoClient(process.env.MONGO_URI);
        await client.connect();
        db = client.db(process.env.DB_NAME);
        console.log(`Conexion a Mongodb exitosa. Esta utilizando la base de datos ${process.env.DB_NAME}.`);
    }
    return db;
};

export const getDB = () => {
    if (!db) {
        throw new Error('Base de datos no conectada. Ejecuta connectDB primero.');
    }
    return db;
};
