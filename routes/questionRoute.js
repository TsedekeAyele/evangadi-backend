const express = require("express");
const router = express.Router();

const {
  allQuestions,
  singleQuestion,
  postQuestion,
} = require("../controller/questionController");

router.get("/question", allQuestions);
router.get("/question/:question_id", singleQuestion);
router.post("/question", postQuestion);

module.exports = router;
