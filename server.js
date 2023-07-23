const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: `./config.env` });
const app = require("./app");
// const User = require("./models/UserModel"); //in the case of data deletion
// const Ques = require("./models/QuesModel");
// const Ans = require("./models/AnsModel");
// const Com = require("./models/comModel");

const port = process.env.PORT || 8000;

const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => {
    console.log("DB connection successful");
  })
  .catch((err) => {
    console.log("DB not connected");
  });

app.listen(port, () => {
  console.log(`app running on port ${port}`);
});

// (async function () {
//   //in the case of data deletion
//   await Ques.deleteMany();
//   await User.deleteMany();
//   await Com.deleteMany();
//   await Ans.deleteMany();
// })();

// process.on("unhandledRejection", (err) => {
//   console.log(err.name, err.message);
//   console.log("unhandled rejection, shutting down");
//   process.exit(1);
// });
