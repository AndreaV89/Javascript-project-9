# Andrea Vannetti FSJS Techdegree
# Project 9 - REST API Project

## Description

In this project I created a REST API using Express.
The API provide a way for users to administer a school database containing information about courses: users can interact with the database by retrieving a list of courses, as well as adding, updating and deleting courses in the database.
In addition, the project will require users to create an account and log-in to make changes to the database.
This is the back-end part of the next project, where I'll create a client for this REST API.

In this project I used Express and Node.js to create routes, Sequelize ORM for database modeling, and Postman for testing routes.


## Getting Started

To get up and running with this project, run the following commands from the root of the folder that contains this README file.

First, install the project's dependencies using `npm`.
```
npm install
```

Second, seed the SQLite database.
```
npm run seed
```

And lastly, start the application.
```
npm start
```

To test the Express server, browse to the URL [http://localhost:5000/](http://localhost:5000/).
