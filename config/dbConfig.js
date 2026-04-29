const { dbName, dbUsername, dbPassword, dbHost } = require("./envConfig");

const config = {
    DB_Name: dbName,
    DB_Username: dbUsername,
    DB_Password: dbPassword,
    options: {
        host: dbHost,
        dialect: "postgres",
        logging: false,
        timezone: '+05:30'
    }
};

module.exports = config;