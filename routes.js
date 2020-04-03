// Load modules
const express = require('express');
const router = express.Router();

const { check, validationResult } = require('express-validator');

// Load bcrypt and basic-auth for authentication features
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');

// Load database Models
const db = require('./db');
const { User, Course} = db.models;

// async handler function
function asyncHandler(cb){
  return async (req, res, next)=>{
    try {
      await cb(req, res, next);
    } catch(err){
      next(err);
    }
  };
};

// Authenticate User Middleware
async function authenticateUser (req, res, next) {
  let message = null;

  // Parse the user's credentials from the Authorization header.
  const credentials = auth(req);
  credentials.name = credentials.name;

  // If the user's credentials are available...
  if (credentials) {
    // Attempt to retrieve the user from the data store by their email.
    const users = await User.findAll();
    const user = users.find(u => u.emailAddress === credentials.name);

    // If a user was successfully retrieved from the data store...
    if (user) {
      // Use bcryptjs to compare the user's password
      // (from the Authorization header) to the user's password
      // that was retrieved from the database.
      const authenticated = bcryptjs.compareSync(credentials.pass, user.password);

      // If the passwords match...
      if (authenticated) {
        console.log(`Authentication successful for username: ${user.emailAddress}`);
        // Then store the retrieved user object on the request object
        // so any middleware functions that follow this middleware function
        // will have access to the user's information.
        req.currentUser = user;
      } else {
        message = `Authentication failure for username: ${user.emailAddress}`;
      }
    } else {
      message = `User not found for username: ${credentials.name}`;
    }
  } else {
    message = 'Auth header not found';
  }

  // If user authentication failed...
  if (message) {
    console.warn(message);

    // Return a response with a 401 Unauthorized HTTP status code.
    res.status(401).json({ message: 'Access Denied' });
  } else {
    // Or if user authentication succeeded...
    // Call the next() method.
    next();
  }
};

// setup a friendly greeting for the root route
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

// GET request to /users to return the currently authenticated user
router.get('/users', authenticateUser, asyncHandler (async (req, res) => {
  const user = await User.findAll({
    attributes: ['id', 'firstName', 'lastName', 'emailAddress'],
    where: { id: req.currentUser.id }
  });
  res.status(200).json(user);
}));

// POST request to /users to create a user
router.post('/users', [
  check('firstName')
    .exists()
    .withMessage('Please provide a value for "firstName"'),
  check('lastName')
    .exists()
    .withMessage('Please provide a value for "lastName"'),
  check('emailAddress')
    .exists()
    .withMessage('Please provide a value for "emailAddress"')
    .isEmail()
    .withMessage('Please provide a valid email address for "emailAddress"'),
  check('password')
    .exists()
    .withMessage('Please provide a value for "password"'),
], asyncHandler (async (req, res) => {
  // Check if the provided email already exists or not
  const emails = await User.findAll({ where: { emailAddress: req.body.emailAddress }});
  if (emails) {
    res.status(409).json({ errors: 'Provided email already in use' });
  } else {
    // Attempt to get the validation result from the Request object.
    const errors = validationResult(req);

    // If there are validation errors...
    if (!errors.isEmpty()) {
      // Use the Array `map()` method to get a list of error messages.
      const errorMessages = errors.array().map(error => error.msg);

      // Return the validation errors to the client.
      res.status(400).json({ errors: errorMessages });
    } else {
      // Hash the password 
      req.body.password = bcryptjs.hashSync(req.body.password);
      // Create the user
      await User.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        emailAddress: req.body.emailAddress,
        password: req.body.password
      });
      res.location('/');
      res.status(201).end();
    }
  }
}));

// GET request to /courses to return a list of courses (including the user that owns each course)
router.get('/courses', asyncHandler( async (req, res) => {
  const courses = await Course.findAll({
    attributes: ['id', 'title', 'description', 'estimatedTime', 'materialsNeeded'],
    include: [
      {
        model: User,
        as: 'owner',
        attributes: ['id', 'firstName', 'lastName', 'emailAddress']
      },
    ],
  });
  res.status(200).json(courses);
}));

// GET request to /courses/:id to return a course (including the user that owns the course) for the provided course ID
router.get('/courses/:id', asyncHandler( async (req, res) => {
  const course = await Course.findByPk(req.params.id, {
    attributes: ['id', 'title', 'description', 'estimatedTime', 'materialsNeeded'],
    include: [
      {
        model: User,
        as: 'owner',
        attributes: ['id', 'firstName', 'lastName', 'emailAddress']
      },
    ],
  });
  if(course) {
    res.status(200).json(course);
  } else {
    res.status(404).json({ message: "Course Not Found" });
  }
}));

// POST request to /courses to create a course
router.post('/courses', authenticateUser, [
  check('title')
    .exists()
    .withMessage('Please provide a value for "title"'),
  check('description')
    .exists()
    .withMessage('Please provide a value for "description"'),
], asyncHandler (async (req, res) => {
  // Attempt to get the validation result from the Request object.
  const errors = validationResult(req);

  // If there are validation errors...
  if (!errors.isEmpty()) {
    // Use the Array `map()` method to get a list of error messages.
    const errorMessages = errors.array().map(error => error.msg);

    // Return the validation errors to the client.
    res.status(400).json({ errors: errorMessages });
  } else {
    const course = await Course.create({
      title: req.body.title,
      description: req.body.description,
      estimatedTime: req.body.estimatedTime,
      materialsNeeded: req.body.materialsNeeded,
      userId: req.body.userId,
    });
    res.location('/' + course.id);
    res.status(201).end();
  }
}));

// PUT request to /courses/:id to update a course
router.put('/courses/:id', authenticateUser, [
  check('title')
    .exists()
    .withMessage('Please provide a value for "title"'),
  check('description')
    .exists()
    .withMessage('Please provide a value for "description"'),
], asyncHandler (async (req, res) => {
  // Attempt to get the validation result from the Request object.
  const errors = validationResult(req);

  // If there are validation errors...
  if (!errors.isEmpty()) {
    // Use the Array `map()` method to get a list of error messages.
    const errorMessages = errors.array().map(error => error.msg);
  
    // Return the validation errors to the client.
    res.status(400).json({ errors: errorMessages });
  } else {
    const course = await Course.findByPk(req.params.id);
    if (course) {
      if (req.currentUser.id === course.userId) {
        await Course.update({ title: req.body.title }, { where: { id: req.params.id }});
        await Course.update({ description: req.body.description }, { where: { id: req.params.id }});
        await Course.update({ userId: req.body.userId }, { where: { id: req.params.id }});
        await Course.update({ estimatedTime: req.body.estimatedTime }, { where: { id: req.params.id }});
        await Course.update({ materialsNeeded: req.body.materialsNeeded }, { where: { id: req.params.id }});

        res.status(204).end();
      } else {
        res.status(403).json({ message: 'You are not the owner of this course' });
      }
    } else {
      res.status(404).json({ message: "Course Not Found" });
    }
  }
}));

// DELETE request to /courses/:id to deletes a course
router.delete('/courses/:id', authenticateUser, asyncHandler (async (req, res) => {
  const course = await Course.findByPk(req.params.id);
  if (course) {
    if (req.currentUser.id === course.userId) {
      await course.destroy();
      res.status(204).end();
    } else {
      res.status(403).json({ message: 'You are not the owner of this course' });
    }
  } else {
    res.status(404).json({ message: "Course Not Found" });
  }
}));

// DELETE route for deleting users for testing
router.delete('/users/:id', asyncHandler (async (req, res) => {
  const user = await User.findByPk(req.params.id);
  await user.destroy();
  res.status(204).end();
}));

module.exports = router;