// Este modelo funciona OK
export const Cliente = {
    nombre: '',
    apellido: '',
    direccion: '',
    localidad: '',
    telefono: '',
    dni: '',
    CUIT: '',
    email: '', // Email del cliente
    password: '', // Contraseña (no usaremos bcrypt)
    categoria: '',
    vip: '',
    fechaRegistro: '', // Lo asignamos en el controlador
    fechaBorrado: '',
};


// import { ObjectId } from 'mongodb';

// export const Cliente = {
//     _id: ObjectId,
//     nombre: '',
//     apellido: '',
//     direccion: '',
//     localidad: '',
//     telefono: '',
//     dni: '', // Único dentro de la misma empresa
//     CUIT: '',
//     email: '', // Único dentro de la misma empresa
//     password: '', // Texto plano
//     categoria: '',
//     vip: false,
//     fechaRegistro: new Date(),
//     fechaBorrado: null,
//     idEmpresa: '', // ID de la empresa
// };
