const bcrypt = require("bcryptjs");
require('dotenv').config()
const crypto = require('crypto')
const { validationResult } = require('express-validator')

const User = require("../models/user");


exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    pageTitle: "Signup",
    isAuthenticated: false,
    errorMessage: req.flash('error'),
    oldInput:{
      email:'',
      password:'',
      confirmPassword:''
    },
    validationErrors:[]
  });
};


exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log(password)
 
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    return res.status(422).render("auth/signup", {
      pageTitle: "Signup",
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      oldInput:{
        email:email,
        password:password,
        confirmPassword:req.body.confirmPassword
      },
      validationErrors:errors.array()
    });
  }
     bcrypt.hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] },
      });
      return user.save();
    })
    .then((result) => {
      res.redirect("/login");
      console.log("sign up successfull")
      })
    .catch((err) => {
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error)
      });
};

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",           
    errorMessage:req.flash('error'),
    oldInput:{
      email:'',
      password:'',
    },
    validationErrors:[]
  });
};

exports.postLogin = (req, res, next) => {
  const email= req.body.email;
  const password = req.body.password

  const errors = validationResult(req)
  if(!errors.isEmpty()){
    return res.status(422).render("auth/login", {
      pageTitle: "Login",           
      errorMessage:errors.array()[0].msg,
      oldInput:{
        email:email,
        password:password,
      },
      validationErrors:errors.array()
    });
  }

  User.findOne({email:email})
    .then((user) => {
      if(!user){
         res.status(422).render("auth/login", {
          pageTitle: "Login",           
          errorMessage:'invalid email or password.',
          oldInput:{
            email:email,
            password:password,
          },
          validationErrors:[]
        });
      }

      bcrypt.compare(password, user.password).then(doMatch=>{
          if(doMatch){
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              console.log(err);
              res.redirect('/')
            });
          }
          res.status(422).render("auth/login", {
            pageTitle: "Login",           
            errorMessage:'invalid email or password.',
            oldInput:{
              email:email,
              password:password,
            },
            validationErrors:[]
          });
      }).catch(err=>{
        console.log(err)
        res.redirect('/login')
      })
    })
    .catch((err) => {
    const error = new Error(err)
    error.httpStatusCode = 500;
    return next(error)
  });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};


exports.getReset =(req, res, next)=>{
  res.render("auth/reset", {
    pageTitle: "Reset Password",           
    errorMessage:req.flash('error')
  });
}

exports.postReset = (req, res, next)=>{
    crypto.randomBytes(32, (err, buffer)=>{
      if(err){
        console.log(err)
        return res.redirect('/reset')
      }
      const token = buffer.toString('hex')
      User.findOne({email: req.body.email}).then(user=>{
        if(!user){
          req.flash('error', 'No account with that email found')
          return res.redirect('/reset')
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000
        return user.save().then(result=>{
          req.flash('passwordReset', `${token}`)
          res.redirect('/')
          // send a mail to user with a link <a href="http://localhost:3000/reset/${token}">Link</a>
        })
      })
      .catch(err=>{
        const error = new Error(err)
        error.httpStatusCode = 500;
        return next(error)
      })
    })
}

exports.getNewPassword = (req, res, next)=>{
  const token =req.params.token;
  User.findOne({resetToken: token, resetTokenExpiration:{$gt:Date.now()}})
  .then(user=>{
    res.render("auth/new-password", {
      pageTitle: "New Password",           
      errorMessage:req.flash('error'),
      userId:user._id.toString(),
      passwordToken: token
    }); 
  }).catch(err=>{
    const error = new Error(err)
    error.httpStatusCode = 500;
    return next(error)
  })
}

exports.postNewPassword = (req, res, next)=>{
  const newPassword = req.body.password;
  const userId = req.body.userId
  const passwordToken = req.body.passwordToken
  let resetUser

  User.findOne({resetToken: passwordToken, resetTokenExpiration:{$gt:Date.now()}, _id:userId})
  .then(user=>{
    resetUser = user
    return bcrypt.hash(newPassword, 12)
  })
  .then(hashedPassword=>{
    resetUser.password = hashedPassword
    resetUser.resetToken = undefined
    resetUser.resetTokenExpiration = undefined
    return resetUser.save()
  })
  .then(result=>{
    res.redirect('/login')
  })
  .catch(err=>{
    const error = new Error(err)
    error.httpStatusCode = 500;
    return next(error)
  })
}