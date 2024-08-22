
//imports the Express library for building web applications and APIs 
const express = require("express");

//creates a new router object from Express that can handle routes separately from the main app
const router = express.Router();

//checks if a user is authenticated before they reach route handlers.
const authMiddleware = require("../middleware/authMiddleware");


//imports specific functions which handle the logic for user-related operations
const { register, login, checkUser } = require("../controller/userController");


//sets up a POST route for /register to handle registration requests
router.post("/register", register);
  
//sets up a POST route for /login to handle login requests
router.post("/login", login);

//sets up a GET route for /check to check if the user is authenticated before calling the checkUser function
router.get("/checkUser",authMiddleware,checkUser);

module.exports = router;
