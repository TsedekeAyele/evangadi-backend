const dbConnection = require("../db/dbConfig");

const { StatusCodes } = require("http-status-codes");

async function allQuestions(req, res) {
  try {
    // Query the database to get all questions with user information
    const [questions] =
      await dbConnection.query(`SELECT q.question_id, q.title, q.description, u.username
FROM questionTable q
JOIN userTable u ON q.userid = u.userid;
`);
    // console.log(questions);

    // Check if there are no questions found
    if (questions.length === 0) {
      return res.status(404).json({
        error: "Not Found",
        message: "No questions found",
      });
    }

    // Respond with the list of questions
    return res.status(StatusCodes.OK).json({
      message: "Questions retrieved successfully",
      questions,
    });
  } catch (error) {
    // Log the error and respond with a server error message
    console.error("Error retrieving questions:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
}

async function singleQuestion(req, res) {
  const questionId = parseInt(req.params.question_id);

  if (isNaN(questionId)) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Invalid question_id format",
    });
  }

  const query = `SELECT 
  q.question_id, 
  q.title, 
  q.description, 
  u.username
FROM 
  questionTable q
JOIN 
  userTable u
ON 
  q.userid = u.userid
WHERE 
  q.question_id = ?;
`;

  try {
    // Wrap the query in a promise
    const [results] = await dbConnection.query(query, [questionId]);
    console.log(results);

    if (results.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Not Found",
        message: "The requested question could not be found.",
      });
    }

    const question = results[0];
    res.status(StatusCodes.OK).json({ question });
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
}

async function postQuestion(req, res) {
  // Extracts data sent with the HTTP request
  const { title, description, userid } = req.body;

  console.log(userid);
  // Checks if all required fields are present in the request body
  if (!title || !description) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Bad Request",
      message: "Please provide all required fields",
    });
  }

  try {
    // // Insert into the questionTable
    // const query =
    //   "INSERT INTO questionTable (userid, title, description) VALUES (?, ?, ?)";
    // const values = [userid, title, description];

    // // const result = await dbConnection.query(query, values);
    // Insert the new answer into the database
    await dbConnection.query(
      "INSERT INTO questionTable(userid, title, description) VALUES (?, ?, ?)",
      [userid, title, description]
    );
    // const question_id = result.insertId;

    return res.status(StatusCodes.CREATED).json({
      message: "Question created successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: err.message,
    });
  }
}

module.exports = { allQuestions, singleQuestion, postQuestion };
