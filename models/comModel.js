const mongoose = require("mongoose");
const Ques = require("./QuesModel");

const commentSchema = new mongoose.Schema({
  comment: {
    type: String,
    trim: true,
    maxLength: [100, "100 characters allowed"],
  },

  upvotes: {
    type: Number,
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },

  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "answer must belong to a user"],
  },

  question: {
    type: mongoose.Schema.ObjectId,
    ref: "Ques",
    required: [true, "answer must belong to a question"],
  },
});

commentSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "username photo",
  });
  next();
});

commentSchema.statics.calculateNComments = async function (questionId) {
  const stats = await this.aggregate([
    {
      $match: { question: questionId },
    },
    {
      $group: { _id: "$tour", nUpvotes: { $sum: 1 } },
    },
  ]);
  const doc = await Ques.findByIdAndUpdate(questionId, {
    NOfComments: stats[0].nUpvotes,
  });
};

commentSchema.post("save", function () {
  this.constructor.calculateNComments(this.question);
});

// answerSchema.pre(/^findOneAnd/, async function (next) {
//   this.r = await this.findOne();
//   next();
// });

// answerSchema.post(/^findOneAnd/, async function () {
//   await this.r.constructor.calculateUpvotes(this.r.question);
// });

const Com = mongoose.model("Com", commentSchema);

module.exports = Com;
