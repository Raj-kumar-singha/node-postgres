const { Sequelize, DataTypes } = require('sequelize'),
    dbConfig = require('../config/dbConfig');

let sequelize;
let db;
async function connectPostgreSQL() {
    try {
        sequelize = new Sequelize(
            dbConfig.DB_Name,
            dbConfig.DB_Username,
            dbConfig.DB_Password,
            dbConfig.options
        );
        db = {
            Sequelize,
            sequelize,
            DataTypes,
        };

        await sequelize.authenticate();
        (async () => {
            await sequelize.sync();
            console.log('SQL Connection has been established successfully.');
        })();
    } catch (error) {
        console.error('SQL Unable to connect to the database:', error);
    }
}

connectPostgreSQL();

module.exports = db;