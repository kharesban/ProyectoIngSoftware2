const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Crear instancia de Sequelize
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: console.log,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// Probar conexión
(async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexión a MySQL establecida correctamente');
    } catch (error) {
        console.error('Error al conectar con MySQL:', error);
    }
})();

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Importar modelos
db.Usuario = require('./Usuarios')(sequelize, DataTypes);
db.Producto = require('./Productos')(sequelize, DataTypes);
db.Carrito = require('./Carrito')(sequelize, DataTypes);
db.ItemCarrito = require('./ItemCarrito')(sequelize, DataTypes);

// Relaciones en Sequelize

// Usuario -> Carrito
db.Usuario.hasMany(db.Carrito, {
    foreignKey: 'usuarioId'
});

db.Carrito.belongsTo(db.Usuario, {
    foreignKey: 'usuarioId'
});

// Carrito -> ItemCarrito
db.Carrito.hasMany(db.ItemCarrito, {
    foreignKey: 'carritoId'
});

db.ItemCarrito.belongsTo(db.Carrito, {
    foreignKey: 'carritoId'
});

// Producto -> ItemCarrito
db.Producto.hasMany(db.ItemCarrito, {
    foreignKey: 'productoId'
});

db.ItemCarrito.belongsTo(db.Producto, {
    foreignKey: 'productoId'
});

module.exports = db;