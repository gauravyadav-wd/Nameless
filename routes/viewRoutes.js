const express = require("express");

const viewController = require("../controllers/viewController");
const authController = require("../controllers/authController");

const viewRouter = express.Router();

viewRouter.use(authController.isLoggedIn);

viewRouter.get("/", viewController.getOverview);

viewRouter.get("/question/:slug", viewController.getQuestion);

viewRouter.get("/login", viewController.login);
viewRouter.get("/account", authController.protect, viewController.account);
viewRouter.post(
  "/submit-user-data",
  authController.protect,
  viewController.uploadPhoto,
  viewController.resizePhoto,
  viewController.updateUserData
);

module.exports = viewRouter;
