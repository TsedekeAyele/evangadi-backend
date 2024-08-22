const { StatusCodes } = require("http-status-codes");

//Imports the jwt to verify JWTs for user authentication.
const jwt = require("jsonwebtoken");

//process requests before they reach route handlers
async function authMiddleware(req, res, next) {
  //Retrieves the Authorization header(contain the JWT) from the incoming request
  const authHeader = req.headers.authorization;

  //Checks if the Authorization header exists and starts with "Bearer"
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      error: "Unauthorized",
      msg: "Authentication invalid",
    });
  }
  //Extracts the token from the Authorization header
  const token = authHeader.split(" ")[1];

  try {
    //Verifies the token with the secret key and extracts username and userid from the payload.
    const { username, userid } = jwt.verify(token,process.env.JWT_SECRET);

    //Adds username and userid to req.user for use in later route handlers.
    req.user = { username, userid };
    next();
  } catch (error) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ error: "Unauthorized", message: "Authentication invalid" });
  }
}
module.exports = authMiddleware;
