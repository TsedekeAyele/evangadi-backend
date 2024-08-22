// Import the Express library to create a server and handle routes and requests.
const express = require("express");
const app = express();
const port = 3000;

require("dotenv").config();

const cors = require("cors");

app.use(cors());

//allows your application to interact with your database.
const dbConnection = require("./db/dbConfig");

// Imports routes for user registration, login ...
const userRoutes = require("./routes/userRoute");

// Imports routes for question
const questionRoutes = require("./routes/questionRoute");

// Imports routes for answer
const answerRoutes = require("./routes/answerRoute");

// verify user access before  allowing access to certain routes.
const authMiddleware = require("./middleware/authMiddleware");

// handle(parse) JSON data sent in HTTP requests
app.use(express.json());

//user routes at /api/users, handled by userRoutes middleware.
app.use("/api/user", userRoutes);

//  using authMiddleware for authentication before questionRoutes handles the request.
app.use("/api", authMiddleware, questionRoutes);

//  using authMiddleware for authentication before answerRoutes handles the request.
app.use("/api", authMiddleware, answerRoutes);

async function start() {
  try {
    // Test database connection
    await dbConnection.execute("SELECT 'test'");
    // Listens for incoming requests on the specified port
    await app.listen(port);
    console.log("database connection established");
    console.log(`listening on port${port}`);
  } catch (error) {
    console.log(error.message);
  }
}
//Initializes the server and database to handles requests.
start();
