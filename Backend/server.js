// backend/server.js
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Pool de conexiones a MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Ruta de prueba
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Backend funcionando' });
});

// Ejemplo: Obtener datos de una tabla
app.get('/api/datos', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM tu_tabla');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor en http://localhost:${PORT}`);
});