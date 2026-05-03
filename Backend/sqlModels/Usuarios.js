const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Usuario = sequelize.define("Usuario", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false
        },

        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            field: "correo"
        },

        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: "contraseña"
        }
    }, {
        tableName: "Usuario",
        freezeTableName: true,
        timestamps: false
    });

    return Usuario;
};