const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const ApiFeatures = require("../utils/apiFeatures");

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // console.log(queryStr);
    const features = new ApiFeatures(Model.find(), req.query, Model);
    features.filter().sort().paginate();
    const data = await features.query;

    if (!data) return next(new AppError("no document found with that id", 404));

    res.status(200).json({
      status: "success",
      results: data.length,
      data: {
        data,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions[0]) query = query.populate(popOptions[0]);
    if (popOptions[1]) query = query.populate(popOptions[1]);
    const data = await query;

    if (!data) return next(new AppError("No data found with that id", 404));

    res.status(200).json({
      status: "success",
      data,
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const data = await Model.findByIdAndDelete(req.params.id);

    if (!data) next(new AppError("no data found with that id", 404));

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const data = await Model.create(req.body);
    res.status(200).json({
      status: "success",
      data,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const data = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!data) next(new AppError("No document found with that id", 404));

    res.status(200).json({
      status: "success",
      data,
    });
  });
