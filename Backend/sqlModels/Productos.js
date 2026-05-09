const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Producto = sequelize.define("Producto", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false
        },

        descripcion: {
            type: DataTypes.TEXT,
            allowNull: false
        },

        precio: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },

        stockDisponible: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        estado: {
            type: DataTypes.STRING(50),
            allowNull: true
        }
    }, {
        tableName: "Producto",
        freezeTableName: true,
        timestamps: false
    });

    return Producto;
};