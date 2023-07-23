const express = require("express");
const answerController = require("../controllers/answerController");
const authController = require("../controllers/authController");

const AnsRouter = express.Router({ mergeParams: true });

AnsRouter.use(authController.protect);

AnsRouter.route("/")
  .post(answerController.setQuesUserIds, answerController.createAnswer)
  .get(
    authController.restrictTo("admin", "moderator"),
    answerController.getAnswers
  );

AnsRouter.route("/:id")
  .get(answerController.getAnswer)
  .delete(answerController.deleteAnswer)
  .patch(answerController.updateAnswer);
module.exports = AnsRouter;
