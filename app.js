'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const db = require('./db');
const { User, Course} = db.models;
const routes = require('./routes');

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
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// setup a global error handler
app.use((err, req, res, next) => {
  if(err.name === 'SequelizeUniqueConstraintError') {
    err.status = 409;
  }
  res.status(err.status || 500).json({
    error: {
      message: err.message,
      status: err.status,
      stack: err.stack
    }
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});



