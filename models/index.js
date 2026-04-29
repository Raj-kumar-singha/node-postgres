let db = require('./connection');
const obj = {
    users: require('./schemas/users')(db.sequelize, db.DataTypes),
    sessionLogs: require('./schemas/sessionLogs')(db.sequelize, db.DataTypes),
};

// Define Associations
obj.users.hasMany(obj.sessionLogs, { foreignKey: "userId", as: "sessionLogs", onDelete: "CASCADE", onUpdate: "CASCADE"});
obj.sessionLogs.belongsTo(obj.users, {foreignKey: "userId",as: "user"});

obj.sequelize = db.sequelize;

module.exports = obj;