const { DataTypes } = require('sequelize');

// Exportar como función que recibe sequelize y Sequelize
module.exports = (sequelize, Sequelize) => {
    const Usuario = sequelize.define('Usuario', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        edad: {
            type: DataTypes.INTEGER,
            validate: {
                min: 0,
                max: 120
            }
        }
    }, {
        tableName: 'usuarios',
        timestamps: true,
        underscored: true
    });

    return Usuario;
};