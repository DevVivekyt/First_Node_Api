const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoute = require("./routers/userRoute");

dotenv.config();

// Connect Database
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log(err));
// #################

// middleweres
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api", userRoute);
// #############

// Start Server
app.listen(8800, (req, res) => {
  console.log("Backend server is running");
});
// ############
