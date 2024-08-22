const dbConnection = require("../db/dbConfig");

const { StatusCodes } = require("http-status-codes");

// const jwt = require("jsonwebtoken");

async function getAnswers(req, res) {
  // Retrieve question_id from the request parameters
  const { question_id } = req.params;

  try {
    // Validate question_id (e.g., check if it's a valid number)
    if (!question_id || isNaN(question_id)) {
      return res
        .status(400)
        .json({ error: "Bad Request", message: "Invalid question ID" });
    }

    // Query the database for answers related to the question_id
    const [answers] = await dbConnection.query(
      `SELECT 
  a.answerid, 
  a.answer, 
  u.username
FROM 
  answerTable a
JOIN 
  userTable u
ON 
  a.userid = u.userid
WHERE 
  a.question_id = ?;
`, // SQL query to get answers
      [question_id] // Parameter to replace the placeholder in the query
    );

    // Check if any answers were found
    if (answers.length === 0) {
      return res.status(404).json({
        error: "Not Found",
        message: "No answers found for this question",
      });
    }

    // Respond with the answers in JSON format
    return res.status(200).json({
      message: "Answers retrieved successfully",
      answers,
    });
  } catch (error) {
    // Log the error and respond with a server error message
    console.error("Error retrieving answers:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Something went wrong, try again later",
    });
  }
}

async function postAnswers(req, res) {
  // Retrieve data from the request body
  const { question_id, answer, userid } = req.body;

  try {
    // Check if all required fields are present
    if (!question_id || !answer || !userid) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Bad Request",
        message: "Please provide all required fields",
      });
    }

    // Check if the user exists
    const [user] = await dbConnection.query(
      "SELECT userid FROM userTable WHERE userid = ?",
      [userid]
    );

    if (user.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Bad Request",
        message: "Please provide answer",
      });
    }

    // Check if the question exists
    const [question] = await dbConnection.query(
      "SELECT question_id FROM questionTable WHERE question_id = ?",
      [question_id]
    );

    if (question.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Bad Request",
        message: "Please provide answer",
      });
    }

    // Insert the new answer into the database
    await dbConnection.query(
      "INSERT INTO answerTable (question_id, answer, userid) VALUES (?, ?, ?)",
      [question_id, answer, userid]
    );

    // Respond with success status and a message
    return res.status(StatusCodes.CREATED).json({
      message: "Answer posted successfully",
    });
  } catch (error) {
    console.error("Error posting answer:", error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
}

module.exports = { getAnswers, postAnswers };
