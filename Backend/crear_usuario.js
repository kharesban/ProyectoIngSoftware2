// Backend/crear_usuario.js
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function crearUsuario() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'EcoMart'
    });

    const nombre = 'Juan Perez';
    const correo = 'juan@test.com';
    const contraseña = '123456';

    const hashedPassword = await bcrypt.hash(contraseña, 10);
    
    try {
        await connection.execute(
            'INSERT INTO Usuario (nombre, correo, contraseña) VALUES (?, ?, ?)',
            [nombre, correo, hashedPassword]
        );
        console.log('✅ Usuario creado:', correo);
        console.log('   Contraseña:', contraseña);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            console.log('⚠️ El usuario ya existe');
        } else {
            console.error('❌ Error:', error);
        }
    }
    
    await connection.end();
}

crearUsuario();