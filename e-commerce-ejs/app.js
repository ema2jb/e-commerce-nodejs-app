const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const sessionStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require('connect-flash')
require('dotenv').config()
const multer = require('multer');


const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

const { get404, get500 } = require("./controllers/error");

const User = require("./models/user");

const MONGODB_URI =
  "mongodb+srv://emmatudje:Tusboy0762@express-tutorials.jykrc.mongodb.net/SHOP?retryWrites=true&w=majority";

const app = express();
const store = new sessionStore({
  uri: MONGODB_URI,
  collection: "sessions",
});
const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", "views");


const fileStorage = multer.diskStorage({
  destination: (req, file, cb) =>{
    cb(null, 'images')
  },
  filename:(req, file, cb)=>{
    cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname)
  }
});

const fileFilter = (req, file, cb)=>{
  if( file.mimetype==="image/png" || file.mimetype==="image/jpeg" || file.mimetype==="image/jpg" ){
    cb(null, true)
  } else{
    cb(null, false)
  }
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage:fileStorage, fileFilter: fileFilter }).single('image'))
app.use(express.static(path.join(__dirname, "public")));
//The scret value shouldbea very long string in production,
// The resave option determines if session data should be saved on every request

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(csrfProtection)
app.use(flash())

app.use((req, res, next)=>{
  res.locals.isAuthenticated = req.session.isLoggedIn
  res.locals.csrfToken = req.csrfToken()
  next()
})

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if(!user){
        return next()
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err))
    });
});


app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', get500)

app.use(get404);

app.use((error, req, res, next) =>{
  console.log(error)
  res.status(500).render("500", {pageTitle:"Error", isAuthenticated:req.session.isLoggedIn})
})

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(3000, () => console.log("app is listening on port 3000"));
  })
  .catch((err) => {
    console.log(err);
  });
