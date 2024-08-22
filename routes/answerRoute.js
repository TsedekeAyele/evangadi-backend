const express = require("express");
const router = express.Router();

const { getAnswers, postAnswers } = require("../controller/answerController");

router.get("/:question_id", getAnswers);

router.post("/answer", postAnswers);

module.exports = router;
