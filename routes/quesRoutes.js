const express = require("express");
const quesController = require("../controllers/quesController");
const authController = require("../controllers/authController");
const ansRouter = require("./ansRoutes");
const comRouter = require("./commentRoutes");

const quesRouter = express.Router();

quesRouter.get(
  "/questions-within/:distance/center/:latlon/unit/:unit",
  quesController.getquestionsWithin
);
quesRouter.get("/getDistances/:latlon/unit/:unit", quesController.getDistances);

quesRouter.use("/:quesId/answers", ansRouter);
quesRouter.use("/:quesId/comments", comRouter);

quesRouter.get(
  "/top-3-questions",
  quesController.top3Questions,
  quesController.getAllQuestions
);

quesRouter.get(
  "/getQuesStats",
  authController.protect,
  authController.restrictTo("admin", "moderator"),
  quesController.getQuesStats
);

quesRouter
  .route("/")
  .get(quesController.getAllQuestions)
  .post(authController.protect, quesController.createQuestion);

quesRouter
  .route("/:id")
  .get(quesController.getOneQuestion)
  .delete(authController.protect, quesController.deleteQuestion)
  .patch(authController.protect, quesController.updateQuestion);

module.exports = quesRouter;
