module.exports = (sequelize, DataTypes) => {
    return sequelize.define("Users", {
        _id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
                notEmpty: true
            }
        },
        userType: {
            type: DataTypes.ENUM("candidate", "employer"),
            allowNull: false,
            defaultValue: "candidate",
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        authProvider: {
            type: DataTypes.ENUM("local", "google"),
            allowNull: false,
            defaultValue: "local",
        },
        profileStatus: {
            type: DataTypes.ENUM('registered', 'personal_completed', 'education_completed', 'assessment_completed'),
            allowNull: false,
            defaultValue: "registered",
        },
        status: {
            type: DataTypes.ENUM("active", "restricted"),
            allowNull: false,
            defaultValue: "active",
        },
        googleId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        timestamps: true,
        freezeTableName: true,
    });
};
