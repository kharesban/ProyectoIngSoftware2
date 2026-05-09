const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./sqlModels'); 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// ============ RUTAS DE USUARIOS ============

// GET - Obtener todos los usuarios
app.get('/api/usuarios', async (req, res) => {
    try {
        const usuarios = await db.Usuario.findAll();
        res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// GET - Obtener usuario por ID
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

// GET - Obtener usuario por email (para login)
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

// POST - Crear nuevo usuario (registro)
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
// POST - Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const usuario = await db.Usuario.findOne({
            where: { email: email }
        });
        
        if (!usuario) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        // ¡En producción debes comparar contraseñas hasheadas!
        if (usuario.password !== password) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        // No enviar la contraseña en la respuesta
        const { password: _, ...usuarioSinPassword } = usuario.toJSON();
        res.json(usuarioSinPassword);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// PUT - Actualizar usuario
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

// DELETE - Eliminar usuario
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

// ============ RUTAS DE PRODUCTOS ============

// GET - Obtener todos los productos
app.get('/api/productos', async (req, res) => {
    try {
        const productos = await db.Producto.findAll();
        res.json(productos);
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ error: error.message });
    }
});


// GET - Obtener producto por ID
app.get('/api/productos/:id', async (req, res) => {
    try {
        const producto = await db.Producto.findByPk(req.params.id);

        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json(producto);
    } catch (error) {
        console.error("Error al obtener producto:", error);
        res.status(500).json({ error: error.message });
    }
});


// POST - Crear nuevo producto
app.post('/api/productos', async (req, res) => {
    try {
        const { nombre, descripcion, precio, stockDisponible, estado } = req.body;

        if (!nombre || !descripcion || !precio || stockDisponible === undefined) {
            return res.status(400).json({
                error: 'Nombre, descripción, precio y stock son obligatorios'
            });
        }

        const nuevoProducto = await db.Producto.create({
            nombre: nombre,
            descripcion: descripcion,
            precio: precio,
            stockDisponible: stockDisponible,
            estado: estado || 'Disponible'
        });

        res.status(201).json({
            mensaje: 'Producto creado correctamente',
            producto: nuevoProducto
        });

    } catch (error) {
        console.error("Error al crear producto:", error);
        res.status(500).json({ error: error.message });
    }
});


// PUT - Actualizar producto
app.put('/api/productos/:id', async (req, res) => {
    try {
        const producto = await db.Producto.findByPk(req.params.id);

        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        const { nombre, descripcion, precio, stockDisponible, estado } = req.body;

        await producto.update({
            nombre: nombre || producto.nombre,
            descripcion: descripcion || producto.descripcion,
            precio: precio || producto.precio,
            stockDisponible: stockDisponible !== undefined ? stockDisponible : producto.stockDisponible,
            estado: estado || producto.estado
        });

        res.json({
            mensaje: 'Producto actualizado correctamente',
            producto: producto
        });

    } catch (error) {
        console.error("Error al actualizar producto:", error);
        res.status(500).json({ error: error.message });
    }
});


// DELETE - Eliminar producto
app.delete('/api/productos/:id', async (req, res) => {
    try {
        const producto = await db.Producto.findByPk(req.params.id);

        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        await producto.destroy();

        res.json({
            mensaje: 'Producto eliminado correctamente'
        });

    } catch (error) {
        console.error("Error al eliminar producto:", error);
        res.status(500).json({ error: error.message });
    }
});

// Ruta de prueba
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Backend con Sequelize funcionando' });
});

// Iniciar servidor
app.listen(PORT, async () => {
    console.log(`✅ Servidor en http://localhost:${PORT}`);

    try {
        await db.sequelize.sync();
        console.log(' Base de datos sincronizada');
    } catch (error) {
        console.error(' Error al sincronizar BD:', error);
    }
});