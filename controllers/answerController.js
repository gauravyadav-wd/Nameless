const catchAsync = require("../utils/catchAsync");
const Answer = require("../models/AnsModel");
const factory = require("./factory");

exports.setQuesUserIds = (req, res, next) => {
  if (!req.body.question) req.body.question = req.params.quesId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAnswers = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.quesId) filter = { question: req.params.quesId };
  const answer = await Answer.find(filter);
  res.status(200).json({
    status: "success",
    results: answer.length,
    answer,
  });
});

exports.getAnswer = factory.getOne(Answer);
exports.createAnswer = factory.createOne(Answer);
exports.deleteAnswer = factory.deleteOne(Answer);
exports.updateAnswer = factory.updateOne(Answer);
