module.exports = (sequelize, DataTypes) => {
    const Carrito = sequelize.define("Carrito", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        usuarioId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        estado: {
            type: DataTypes.STRING(50),
            allowNull: true
        },

        total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0
        }
    }, {
        tableName: "Carrito",
        freezeTableName: true,
        timestamps: false
    });

    return Carrito;
};