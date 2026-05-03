const { Sequelize } = require('sequelize');
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
        logging: console.log, // Para ver las queries SQL
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

// Importar modelos aquí
db.Usuario = require('./Usuarios')(sequelize, Sequelize);

module.exports = db;