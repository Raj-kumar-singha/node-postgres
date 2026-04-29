module.exports = (sequelize, DataTypes) => {
    return sequelize.define("SessionLogs", {
        _id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Users",
                key: "_id",
            },
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        loginTime: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        logoutTime: {
            type: DataTypes.DATE,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM("active", "loggedout"),
            allowNull: false,
            defaultValue: "active",
        },
        jwtToken: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    }, {
        timestamps: true,
        freezeTableName: true,
    });
};
