'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const db = require('./db');
const { User, Course} = db.models;
const routes = require('./routes');

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

// setup morgan which gives us http request logging
app.use(morgan('dev'));

// setup body-parser
app.use(express.json());

// setup routes
app.use('/api', routes);

console.log('Testing the connection to the database...');

// async IIFE
(async () => {
  try {
    // Test the connection to the database
    await db.sequelize.authenticate();
    console.log('Connection to the database successful!');

    // Sync the models
    console.log('Synchronizing the models with the database...');
    await db.sequelize.sync();

    // Retrieve Users
    // const users = await User.findAll();
    // console.log('Users:');
    // console.log(users.map(user => user.get({ plain: true })));

    // Retrieve Courses
    // const courses = await Course.findAll({
    //   include: [
    //     {
    //       model: User,
    //     },
    //   ],
    // });
    // console.log('Courses:');
    // console.log(courses.map(course => course.get({ plain: true})));

  } catch(error) {
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      console.error('Validation errors: ', errors);
    } else {
      throw error;
    }
  }
})();

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});



