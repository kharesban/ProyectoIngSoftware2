const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./sqlModels'); 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


app.get('/api/usuarios', async (req, res) => {
    try {
        const usuarios = await db.Usuario.findAll();
        res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});


app.get('/api/usuarios/:id', async (req, res) => {
    try {
        const usuario = await db.Usuario.findByPk(req.params.id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/usuarios/email/:email', async (req, res) => {
    try {
        const usuario = await db.Usuario.findOne({
            where: { email: req.params.email }
        });
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.post('/api/register', async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        if (!nombre || !email || !password) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        const usuarioExistente = await db.Usuario.findOne({
            where: { email: email }
        });

        if (usuarioExistente) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        const nuevoUsuario = await db.Usuario.create({
            nombre: nombre,
            email: email,
            password: password
        });

        const { password: _, ...usuarioSinPassword } = nuevoUsuario.toJSON();

        res.status(201).json({
            mensaje: 'Usuario registrado correctamente',
            usuario: usuarioSinPassword
        });

    } catch (error) {
        console.error("Error en registro:", error);
        res.status(500).json({ error: error.message });
    }
});


app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
        }
        
        const usuario = await db.Usuario.findOne({
            where: { email: email }
        });
        
        if (!usuario) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        if (usuario.password !== password) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        const { password: _, ...usuarioSinPassword } = usuario.toJSON();

        res.json({
            mensaje: 'Login correcto',
            usuario: usuarioSinPassword
        });

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ error: error.message });
    }
});


app.put('/api/usuarios/:id', async (req, res) => {
    try {
        const usuario = await db.Usuario.findByPk(req.params.id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        await usuario.update(req.body);
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.delete('/api/usuarios/:id', async (req, res) => {
    try {
        const usuario = await db.Usuario.findByPk(req.params.id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        await usuario.destroy();
        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Backend con Sequelize funcionando' });
});

app.listen(PORT, async () => {
    console.log(`✅ Servidor en http://localhost:${PORT}`);
    

    try {
        await db.sequelize.sync({ alter: true });
        console.log('📦 Base de datos sincronizada');
    } catch (error) {
        console.error('❌ Error al sincronizar BD:', error);
    }
});