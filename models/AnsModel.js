const mongoose = require("mongoose");
const Ques = require("./QuesModel");

const answerSchema = new mongoose.Schema({
  answer: {
    type: String,
    required: [true, "answer is required"],
    trim: true,
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

answerSchema.index({ question: 1, user: 1 }, { unique: true });

answerSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "username photo",
  });
  next();
});

answerSchema.statics.calculateUpvotes = async function (questionId) {
  const stats = await this.aggregate([
    {
      $match: { question: questionId },
    },
    {
      $group: { _id: "$tour", nUpvotes: { $sum: 1 } },
    },
  ]);
  const doc = await Ques.findByIdAndUpdate(questionId, {
    NOfAnswers: stats[0].nUpvotes,
  });
};

answerSchema.post("save", function () {
  this.constructor.calculateUpvotes(this.question);
});

// answerSchema.pre(/^findOneAnd/, async function (next) {
//   this.r = await this.findOne();
//   next();
// });

// answerSchema.post(/^findOneAnd/, async function () {
//   await this.r.constructor.calculateUpvotes(this.r.question);
// });

const Ans = mongoose.model("Ans", answerSchema);

module.exports = Ans;
