const Sequelize = require('sequelize');

console.info('Instantiating and configuring the Sequelize object instance...');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'fsjstd-restapi.db',
  logging: false
});

const db = {
  sequelize,
  Sequelize,
  models: {},
};

module.exports = db;