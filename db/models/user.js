const Sequelize = require('sequelize');

// User Model
module.exports = (sequelize) => {
  class User extends Sequelize.Model {}
  User.init({
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a value for "firstName"',
        },
        notEmpty: {
          msg: 'Please provide a value for "firstName"',
        },
      },
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a value for "lastName"',
        },
        notEmpty: {
          msg: 'Please provide a value for "lastName"',
        },
      },
    },
    emailAddress: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a value for "email"',
        },
        notEmpty: {
          msg: 'Please provide a value for "email"',
        },
        isEmail: {
          msg: 'Please provide a valid email address for "email"',
        },
      },
      unique: {
        args: true,
        msg: 'Email address already in use!'
      }
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a value for "password"',
        },
        notEmpty: {
          msg: 'Please provide a value for "password"',
        },
      },
    },
  }, { sequelize, timestamps: false });

  User.associate = (models) => {
    User.hasMany(models.Course, {
      as: 'owner',
      foreignKey: {
        fieldName: 'userId',
        allowNull: false,
      },
    });
  };

  return User;
};