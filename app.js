const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

const { get404 } = require("./controllers/error");
const { mongoConnect } = require("./utils/database");

const User = require("./models/user");

/* squelize setup
const sequelize = require('./utils/database')
const User = require('./models/user')
const Product = require('./models/product')
const Cart = require('./models/cart')
const CartItem = require('./models/cart-item')
const Order = require('./models/order')
const OrderItem = require('./models/order-item')
*/

const app = express();
//const expressHbs = require('express-handlebars')

//app.engine("handlebars", expressHbs({layoutsDir:'views/layouts/', defaultLayout:'main-layout'}))
//app.set('view engine', 'handlebars')
//app.set('view engine', 'pug')
app.set("view engine", "ejs");
// without setting this, express knows to find the views in the views folder
app.set("views", "views");

app.use((req, res, next) => {
  User.findById("623275c1cae8e73835cfb393")
    .then((user) => {
      req.user = new User(user.name, user.email, user.cart, user._id);
      next();
    })
    .catch((err) => console.log(err));
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", shopRoutes);
app.use("/admin", adminRoutes);

app.use(get404);

mongoConnect(() => {
  app.listen(3000, () => console.log("app is listening on port 3000"));
});

/* sequelize setup
Product.belongsTo(User, {constraints:true, onDelete:'CASCADE'})
User.hasMany(Product)

User.hasOne(Cart)
Cart.belongsTo(User);

Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, {through: CartItem})

User.hasMany(Order)
Order.belongsToMany(Product, {through: OrderItem})


//Do not use the force option in production
//sequelize.sync({force:true}).then(result=>{
sequelize.sync().then(result=>{
     return User.findByPk(1);
}).then(user =>{
    if(!user){
        return User.create({name:'Max', email: 'test@test.com'})
    }
    return user
}).then(user=>{ 
    Cart.findAll({where:{userId:user.dataValues.id}}).then(cart=>{
        if(cart.length > 0){
            return cart[0]
        }
        return user.createCart()
    }).then(cart=>{
        app.listen(3000, ()=>console.log("app is listening on port 3000"))
    }).catch(err=>console.log(err))
}).catch(err=>console.log(err))

*/

/*
Notes:




*/
