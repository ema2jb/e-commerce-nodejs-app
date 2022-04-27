const express = require("express");
const { check, body } = require("express-validator");

const router = express.Router();

const {
  getLogin,
  postLogin,
  postLogout,
  getSignup,
  postSignup,
  getReset,
  postReset,
  getNewPassword,
  postNewPassword,
} = require("../controllers/auth");
const User = require('../models/user')

router.get("/login", getLogin);

router.post("/login", [
    body('email').isEmail().withMessage('please Enter avalid Email Address').normalizeEmail(),
    body('password', 'password has to be valid').isLength({min:5}).isAlphanumeric().trim()
], postLogin);

router.post("/logout", postLogout);

router.get("/signup", getSignup);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        //if (value === "test@test.com") {
         // throw new Error("This email address is forbidden");
        //}
        //return true;
        return  User.findOne({ email: value })
        .then((userDoc) => {
          if (userDoc) {
            return Promise.reject('Email exists already, please pick a different one')
          }
        })
      })
      .normalizeEmail(),
    body(
      "password",
      "please enter a password with only numbers and text and at least 5 characters"
    )
      .isLength({ min: 5 })
      .isAlphanumeric().trim(),
    body('confirmPassword').custom((value, {req})=>{
        if(value !== req.body.password){
            throw new Error('Password do not match!')
        }
    })
  ],
  postSignup
);

router.get("/reset", getReset);

router.post("/reset", postReset);

router.get("/reset/:token", getNewPassword);

router.post("/new-password", postNewPassword);

module.exports = router;
