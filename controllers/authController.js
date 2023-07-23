const { promisify } = require("util");
const crypto = require("crypto");

const jwt = require("jsonwebtoken");

const User = require("../models/UserModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");

const signToken = (userid) => {
  const token = jwt.sign({ id: userid }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token;
};

const createSendToken = (user, status, res) => {
  const token = signToken(user.id);

  const cookieOptions = {
    expiresIn: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);

  res.status(status).json({
    status: "success",
    token,
    data: {
      data: user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const createdUser = await User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  console.log(createdUser);
  createSendToken(createdUser, 200, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError("Please enter email and password"));

  const user = await User.findOne({ email }).select("+password");
  //   const isValidPassword = await user.checkPassword(password, user.password);

  if (!user || !(await user.checkPassword(password, user.password)))
    return next(new AppError("Incorrect Email or Password", 400));

  try {
    await sendEmail({
      to: user.email,
      name: user.username,
      subject: `Hi, ${user.username} Welcome to nameless family`,
      message: "Welcome to natours family",
    });
  } catch (err) {
    console.log(err);
  }

  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  //checking if token exists
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token)
    return next(
      new AppError("You are not logged in. Please log in and try again")
    );

  //verifying token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //checking if user exists
  const foundUser = await User.findById(decoded.id);
  if (!foundUser)
    return next(
      new AppError("User associated with this account no longer exists")
    );

  //checking if user changed his password
  if (foundUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password, Please log in again", 401)
    );
  }

  //user is authenticated
  req.user = foundUser;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  //checking if token exists
  if (req.cookies.jwt) {
    try {
      let token = req.cookies.jwt;
      const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
      );

      //checking if user exists
      const foundUser = await User.findById(decoded.id);
      if (!foundUser) return next();

      //checking if user changed his password
      if (foundUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      //user is authenticated
      res.locals.user = foundUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("you are not allowed to access this route", 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //check if user exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) next(new AppError("There is no user with that email", 400));

  //create reset token
  const resetToken = user.passResetToken();
  await user.save({ validateBeforeSave: false });

  //send mail
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot Your Password. Submit a patch request with your password and password Confirm to ${resetUrl}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Your password reset token valid for 10 minutes",
      message,
    });

    res.status(200).json({
      status: "success",
      token: "Token sent to mail",
    });
  } catch (err) {
    user.passResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.save({ validateBeforeSave: false });

    return next(new AppError("Could not send email", 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //hash token and compare
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //check if token is valid
  if (!user) return next(new AppError("Token Expired or Invalid Token", 400));

  //change password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  await user.save(); //validators only runs on save

  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  console.log(req.body.passwordCurrent, user.password);
  if (!(await user.checkPassword(req.body.passwordCurrent, user.password))) {
    return next(
      new AppError("Inputted password does not match with the current password")
    );
  }

  //update user password
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.confirmNewPassword;
  await user.save();

  //send token
  createSendToken(user, 200, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie("jwt", "loggedout", {
    httpOnly: true,
    expiresIn: new Date(Date.now() + 10 * 1000),
  });
  res.status(200).json({
    status: "success",
  });
});
