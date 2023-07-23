const mongoose = require("mongoose");
const slugify = require("slugify");

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "User must have a name"],
      minlength: [15, "Minimum 15 characters are required"],
      maxlength: [100, "question can have 100 characters or less"],
      trim: true,
    },

    category: {
      type: String,
      default: "General",
    },
    date: {
      type: Date,
      default: Date.now(),
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    slug: {
      type: String,
    },
    secretQues: {
      type: Boolean,
      default: false,
    },
    location: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
    },
    NOfAnswers: {
      type: Number,
      default: null,
    },
    NOfComments: {
      type: Number,
      default: null,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "question must belong to a user"],
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

//indexing
questionSchema.index({ upvotes: 1 });
questionSchema.index({ location: "2dsphere" });

//virtual property for referencing
questionSchema.virtual("answers", {
  ref: "Ans",
  foreignField: "question",
  localField: "_id",
});
questionSchema.virtual("comments", {
  ref: "Com",
  foreignField: "question",
  localField: "_id",
});

// DOcumenet middleware mongoose
questionSchema.pre("save", function (next) {
  this.slug = slugify(this.question);
  next();
});

questionSchema.pre("save", function (next) {
  this.populate({
    path: "user",
    select: "username",
  });
  next();
});

questionSchema.post("save", function () {
  console.log("document saved");
});

//Query Middleware mongoose
questionSchema.pre(/^find/, function (next) {
  this.find({ secretQues: { $ne: true } });
  next();
});

const Ques = mongoose.model("Ques", questionSchema);

module.exports = Ques;
