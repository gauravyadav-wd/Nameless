const express = require("express");
const comController = require("../controllers/comController");
const authController = require("../controllers/authController");

const comRouter = express.Router({ mergeParams: true });

comRouter
  .route("/")
  .post(
    authController.protect,
    comController.createQuesUserIds,
    comController.createComment
  )
  .get(comController.getComments);

comRouter
  .route("/:id")
  .get(comController.getComment)
  .patch(comController.updateComment)
  .delete(comController.deleteComment);

module.exports = comRouter;
