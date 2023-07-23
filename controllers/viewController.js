const multer = require("multer");
const sharp = require("sharp");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const Ques = require("../models/QuesModel");
const User = require("../models/UserModel");

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/img");
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("not an image, please upload only images", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadPhoto = upload.single("photo");

exports.resizePhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/${req.file.filename}`);

  next();
});

exports.getOverview = catchAsync(async (req, res) => {
  const questions = await Ques.find();

  res.status(200).render("overview", {
    title: "overview",
    questions,
  });
});

exports.getQuestion = catchAsync(async (req, res, next) => {
  const question = await Ques.findOne({ slug: req.params.slug })
    .populate("answers")
    .populate("comments");

  if (!question) return next(new AppError("No question found", 404));

  res.status(200).render("question", {
    title: "Question",
    question,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  res.status(200).render("login", {
    title: "Login",
  });
});

exports.account = catchAsync(async (req, res, next) => {
  res.status(200).render("account", {
    title: "account",
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  let photo;
  if (req.file) {
    photo = "img/" + req.file.filename;
  } else {
    photo = req.user.photo;
  }
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      username: req.body.name,
      email: req.body.email,
      photo,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).render("account", {
    title: "account",
    user: updatedUser,
  });
});
