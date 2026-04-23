const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'EcoMart',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Ruta de prueba
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Backend funcionando' });
});

// LOGIN - Versión corregida
app.post('/api/login', async (req, res) => {
    const { correo, contraseña } = req.body;
    
    console.log('=== INTENTO DE LOGIN ===');
    console.log('Email:', correo);
    console.log('Contraseña:', contraseña);
    
    if (!correo || !contraseña) {
        return res.status(400).json({ error: 'Faltan correo o contraseña' });
    }
    
    try {
        const [users] = await pool.query(
            'SELECT id, nombre, correo, contraseña FROM Usuario WHERE correo = ?',
            [correo]
        );
        
        console.log('Usuarios encontrados:', users.length);
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        const user = users[0];
        
        // IMPORTANTE: Revisa que el nombre del campo sea 'contraseña' con Ñ
        const passwordMatch = await bcrypt.compare(contraseña, user.contraseña);
        
        console.log('¿Contraseña válida?', passwordMatch);
        
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        // Login exitoso - devolver datos del usuario
        res.json({
            success: true,
            message: 'Login exitoso',
            user: {
                id: user.id,
                nombre: user.nombre,
                correo: user.correo
            }
        });
        
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Ruta para obtener productos
app.get('/api/productos', async (req, res) => {
    try {
        const [productos] = await pool.query('SELECT * FROM Producto');
        res.json(productos);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Servidor backend corriendo en http://localhost:${PORT}`);
    console.log(`📦 Base de datos: ${process.env.DB_NAME || 'EcoMart'}`);
});