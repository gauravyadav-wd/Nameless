const Ques = require("../models/QuesModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./factory");

exports.top3Questions = (req, res, next) => {
  req.query.limit = "3";
  req.query.sort = "-upvotes";
  console.log(req.query.limit, req.query.sort);
  next();
};

exports.getQuesStats = catchAsync(async (req, res, next) => {
  const stats = await Ques.aggregate([
    {
      $match: { upvotes: { $gte: 0 } },
    },
    {
      $group: {
        _id: null,
        minUpvotes: { $min: "$upvotes" },
        maxUpvotes: { $max: "$upvotes" },
        avgUpvotes: { $avg: "$upvotes" },
        sumUpvotes: { $sum: "$upvotes" },
        numQues: { $sum: 1 },
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});

exports.getquestionsWithin = catchAsync(async (req, res, next) => {
  const { distance, latlon, unit } = req.params;
  const [lat, lon] = latlon.split(",");
  if (!lat || !lon)
    return next(new AppError("Please provide langitude and longitude"), 400);

  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  const questions = await Ques.find({
    location: { $geoWithin: { $centerSphere: [[lon, lat], radius] } },
  });

  res.status(200).json({
    status: "sucess",
    results: questions.length,
    questions,
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlon, unit } = req.params;

  const [lat, lon] = latlon.split(",");

  if (!lat || !lon)
    return next(new AppError("Please provide langitude and longitude"), 401);

  const multiplier = unit === "mi" ? 0.000621371 : 0.001;
  const distances = await Ques.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lon * 1, lat * 1],
        },
        distanceField: "distance",
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        question: 1,
        distance: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: distances,
  });
});

exports.createQuestion = catchAsync(async (req, res, next) => {
  req.body.user = req.user.id;
  console.log(req.user);
  console.log(req.body);
  const data = await Ques.create(req.body);
  res.status(200).json({
    status: "success",
    data,
  });
});

exports.getAllQuestions = factory.getAll(Ques);

exports.getOneQuestion = factory.getOne(Ques, ["answers", "comments"]);

// exports.createQuestion = factory.createOne(Ques);

exports.deleteQuestion = factory.deleteOne(Ques);

exports.updateQuestion = factory.updateOne(Ques);
