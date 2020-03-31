const express = require('express');
const router = express.Router();

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
}

// setup a friendly greeting for the root route
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

// GET request to /users to return the currently authenticated user
router.get('/users', (req, res) => {

});

// Post request to /users to create a user
router.post('/users', asyncHandler (async (req, res) => {
  const user = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    emailAddress: req.body.emailAddress,
    password: req.body.password,
  });
  res.json(user);
}));

// GET request to /courses to return a list of courses (including the user that owns each course)
router.get('/courses', asyncHandler( async (req, res) => {
  const courses = await Course.findAll({
    include: [
      {
        model: User,
        as: 'owner',
      },
    ],
  });
  res.json(courses);
}));

// GET request to /courses/:id to return a course (including the user that owns the course) for the provided course ID
router.get('/courses/:id', asyncHandler( async (req, res) => {
  const course = await Course.findByPk(req.params.id, {
    include: [
      {
        model: User,
        as: 'owner',
      },
    ],
  });
  res.json(course);
}));

// POST request to /courses to create a course
router.post('/courses', asyncHandler (async (req, res) => {
  const course = await Course.create({
    title: req.body.title,
    description: req.body.description,
    userId: req.body.userId,
  });
  res.json(course);
}));

// PUT request to /courses/:id to update a course
router.put('/courses/:id', asyncHandler (async (req, res) => {
  const course = await Course.findByPk(req.params.id);
  await course.update(req.body);
  res.json(course);
}));

// DELETE request to /courses/:id to deletes a course
router.delete('/courses/:id', asyncHandler (async (req, res) => {
  const course = await Course.findByPk(req.params.id);
  await course.destroy();
}));


module.exports = router;