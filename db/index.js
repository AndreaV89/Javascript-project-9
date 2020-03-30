const Sequelize = require('sequelize');

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

db.models.User = require('./models/user.js')(sequelize);
db.models.Course = require('./models/course.js')(sequelize);

// If available, call method to create associations.
Object.keys(db.models).forEach((modelName) => {
  if (db.models[modelName].associate) {
    console.info(`Configuring the associations for the ${modelName} model...`);
    db.models[modelName].associate(db.models);
  }
});

module.exports = db;