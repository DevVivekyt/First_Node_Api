const express = require("express");
const userRoute = express();
const multer = require("multer");
const user_controller = require("../controllers/userController");
const tokenValidation = require("../middleware/auth")

// Upload Images
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads");
    },
    filename: function (req, file, cb) {
      cb(null, file.filename + "-" + Date.now() + ".jpg");
    },
  }),
}).single("image");

// register route 
userRoute.post("/register", upload, user_controller.registerUser);

// login route
userRoute.post("/login", user_controller.loginUser);

// token validation
userRoute.get("/authencation", tokenValidation, function (req, res) {
  res.status(200).send({ message: "Authencated" })
})

// updatepassword
userRoute.post("/update-password", tokenValidation, user_controller.updatePassword);

// forget password
userRoute.post("/forget-password", user_controller.forgetPassword);

// reset password
userRoute.get("/reset-password", user_controller.resetPassword)

module.exports = userRoute;
