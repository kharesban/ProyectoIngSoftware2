module.exports = (sequelize, DataTypes) => {
    const Pago = sequelize.define("Pago", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        carritoId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        usuarioId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        metodoPago: {
            type: DataTypes.STRING(50),
            allowNull: false
        },

        ultimosDigitos: {
            type: DataTypes.STRING(4),
            allowNull: false
        },

        total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },

        estado: {
            type: DataTypes.STRING(50),
            allowNull: false
        },

        fechaPago: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: "Pago",
        freezeTableName: true,
        timestamps: false
    });

    return Pago;
};