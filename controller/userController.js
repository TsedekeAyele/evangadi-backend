//Imports the database connection execute queries on your database.
const dbConnection = require("../db/dbConfig");

//Imports the bcryptjs library, used for hashing and comparing passwords securely.
const bcrypt = require("bcryptjs");

// Imports HTTP status codes for easier management of response codes.
const { StatusCodes } = require("http-status-codes");

//Imports the jwt library for creating jwt
const jwt = require("jsonwebtoken");

async function register(req, res) {
  //Retrieves user data from the request body.
  const { username, first_name, last_name, email, password } = req.body;

  // Checks if all required fields are provided
  if (!username || !first_name || !last_name || !email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Bad Request",
      message: "Please provide all required fields",
    });
  }

  try {
    //Queries the database to see if a user with the given username or email already exists.
    const [user] = await dbConnection.query(
      "select username,userid from userTable where username=? or email=? ",
      [username, email]
    );
    if (user.length > 0) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ error: "Conflict", message: "User already existed" });
    }

    //Ensures the password is at least 8 characters long
    if (password.length < 8) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Bad Request",
        message: "Password must be at least 8 characters",
      });
    }

    //Uses bcrypt to hash the password securely before storing it in the database.
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Adds the new user to the database
    const result = await dbConnection.query(
      "INSERT INTO userTable(username, first_name, last_name, email, password) VALUES(?,?,?,?,?)",
      [username, first_name, last_name, email, hashedPassword]
    );

    // Retrieve the inserted user's ID
    const userid = result.insertId;

    return res
      .status(StatusCodes.CREATED)
      .json({ msg: "User registered successfully" });
  } catch (error) {
    console.log(error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
}

async function login(req, res) {
  //Retrieves email and password from the request body.
  const { email, password } = req.body;

  //Checks if both email and password are provided
  if (!email || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Please provide all required fields" });
  }

  try {
    //Queries the database to find a user with the provided email.
    const [user] = await dbConnection.query(
      "select username,password,userid from usertable where email=?",
      [email]
    );
    if (user.length == 0) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ msg: "We can not find an account with this email address" });
    }

    //compare the provided password with the hashed password in the database.
    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ msg: "Invalid password" });
    }

    // Creates a JSON Web Token with the user's username and ID, which expires in 1 day.
    const username = user[0].username;
    const userid = user[0].userid;
    const token = jwt.sign({ username, userid }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    return res
      .status(StatusCodes.OK)
      .json({ msg: "user login successful", token, username, userid });
  } catch (error) {
    console.log(error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
}

async function checkUser(req, res) {
  // Retrieves and responds with the username and user ID from the request object.
  try {
    const { username, userid } = req.user;
    if (!username || !userid) {
      // Handle cases where req.user might not have the required properties
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: "Unauthorized", message: "User information missing" });
    }
    return res
      .status(StatusCodes.OK)
      .json({ msg: "Valid user", username, userid });
  } catch (error) {
    console.log("Error in checkUser:", error.message);
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ error: "Unauthorized", message: "Authentication invalid" });
  }
}

module.exports = { register, login, checkUser };
