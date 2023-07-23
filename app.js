const path = require("path");

const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");

const quesRouter = require("./routes/quesRoutes");
const userRouter = require("./routes/userRoutes");
const ansRouter = require("./routes/ansRoutes");
const comRouter = require("./routes/commentRoutes");
const viewRouter = require("./routes/viewRoutes");

const AppError = require("./utils/appError");
const globalErrorMiddleware = require("./utils/globalErrorMiddleware");

const app = express();
console.log(process.env.NODE_ENV);

const limiter = rateLimit({
  max: 200,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this ip. please try again in an hour",
});

//security purposes middlewares
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use("/api", limiter); //limit requests per hour (security against ddos and bruteforce attacks )
app.use(helmet()); //secure headers
app.use(mongoSanitize()); //data sanitization against nosql injection
app.use(xss()); //data sanitization against xss attacks
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json({ limit: "10kb" }));
app.use(express.static(`${__dirname}/public`));

app.use(function (req, res, next) {
  res.setHeader(
    "Content-Security-Policy",
    "connect-src 'self' http://127.0.0.1:8000/api/v1/users/login"
  );
  return next();
});
app.use((req, res, next) => {
  console.log("hello from the test middleware");
  // console.log(req.cookies);
  // console.log(res.header);
  next();
});
app.use("/api/v1/questions", quesRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/answers", ansRouter);
app.use("/api/v1/comments", comRouter);
app.use("/", viewRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(hpp({ whitelist: ["upvotes"] })); //security purposes: prevent parameter pollution

app.use(globalErrorMiddleware);

module.exports = app;
