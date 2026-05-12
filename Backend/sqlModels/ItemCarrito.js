module.exports = (sequelize, DataTypes) => {
    const ItemCarrito = sequelize.define("ItemCarrito", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        carritoId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        productoId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        cantidad: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        precioUnitario: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },

        total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        }
    }, {
        tableName: "ItemCarrito",
        freezeTableName: true,
        timestamps: false
    });

    return ItemCarrito;
};