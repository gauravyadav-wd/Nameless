const Com = require("../models/comModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./factory");

exports.createQuesUserIds = (req, res, next) => {
  if (!req.body.question) req.body.question = req.params.quesId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getComments = catchAsync(async (req, res, next) => {
  // console.log(queryStr);
  let filter = {};
  if (req.params.quesId) filter = { question: req.params.quesId };

  const data = await Com.find(filter);

  if (!data) return next(new AppError("no document found with that id", 404));

  res.status(200).json({
    status: "success",
    results: data.length,
    data: {
      data,
    },
  });
});

exports.createComment = factory.createOne(Com);
exports.getComment = factory.getOne(Com);
exports.updateComment = factory.updateOne(Com);
exports.deleteComment = factory.deleteOne(Com);
