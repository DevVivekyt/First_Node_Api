const User = require("../models/userModel");
const bcryptJs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const RandomString = require("randomstring");

// send Mail
const sendResetpasswordMail = async (name, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "vivekmishra8009@gmail.com",
        pass: "iodqdphifiscvmjt"
      }
    })

    const mailOptions = {
      from: "vivekmishra8009@gmail.com",
      to: email,
      subject: "For reset password",
      html: `<p>HiI ${name}, Please copy this link to <a href="http://localhost:8800/api/reset-password?token=${token}">reset you password<a/>`
    }

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Mail has been sent", info.response);
      }
    })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

// Create jwt
const cerate_jwt = async (id, type) => {
  try {
    const token = await jwt.sign(
      { _id: id, type: type },
      process.env.JWT_SECRET
    );
    return token;
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// Register
const registerUser = async (req, res) => {
  try {
    const hashPassword = await bcryptJs.hash(req.body.password, 10);
    const NewUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashPassword,
      image: req.file.filename,
      type: req.body.type,
    });

    const oldUser = await User.findOne({ email: req.body.email });
    if (oldUser) {
      res.status(200).send({ message: "Email already exists" });
    } else {
      const userData = await NewUser.save();
      const { password, ...other } = userData._doc;
      res.status(201).send({ message: "User Register success", data: other });
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// Login
const loginUser = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userObj = await User.findOne({ email: email });
    if (userObj) {
      const verifyPassword = await bcryptJs.compare(password, userObj.password);
      if (verifyPassword) {
        const loginToken = await cerate_jwt(userObj.id, userObj.type);
        const userRes = {
          _id: userObj._id,
          name: userObj.name,
          email: userObj.email,
          image: userObj.image,
          type: userObj.type,
          accessToken: loginToken,
        };
        const response = {
          success: true,
          message: "Login successful",
          data: userRes,
        };
        res.status(200).send(response);
      } else {
        res.status(400).send({ message: "Login details are incorrect" });
      }
    } else {
      res.status(400).send({ message: "Login details are incorrect" });
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// UpdatePassword
const updatePassword = async (req, res) => {

  try {
    const user_Id = req.body.user_Id;
    const password = req.body.password;

    const data = await User.findById({ _id: user_Id })
    if (data) {
      const newPassword = await bcryptJs.hash(password, 10);
      const updatedPassword = await User.findByIdAndUpdate({ _id: user_Id }, {
        $set: {
          password: newPassword
        }
      });
      res.status(200).send({ message: "Your password has been updated!" })
    } else {
      res.status(200).send({ message: "User Id is not found!" })
    }
  } catch (error) {
    res.status(200).send({ message: error.message })
  }
}

// ForgetPassword
const forgetPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email })
    if (userData) {
      const randomString = RandomString.generate();
      const data = await User.updateOne({ email: email }, { $set: { token: randomString } }, { new: true });
      sendResetpasswordMail(userData.name, userData.email, randomString)
      res.status(200).send({ message: "Please check you mail" })
    }
  } catch (error) {
    res.status(400).send({ message: "This email does not exists" })
  }
}
// resetPassword
const resetPassword = async (req, res) => {
  try {
    const token = req.query.token;
    const tokenData = await User.findOne({ token: token });
    if (tokenData) {
      const newPassword = await bcryptJs.hash(req.body.password, 10);
      const newUserData = await User.findByIdAndUpdate({ _id: tokenData._id }, { $set: { password: newPassword, token: "" } }, { new: true });
      res.status(200).send({ message: "You password has been reset", data: newUserData })
    } else {
      res.status(200).send({ message: "this link has been expaired!" })
    }
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

module.exports = {
  registerUser,
  loginUser,
  updatePassword,
  forgetPassword,
  resetPassword
};
