const Product = require("../models/product");

exports.getIndex = (req, res, next) => {
  Product.fetchAll()
    .then((products) => {
      res.render("shop/index", {
        products: products,
        pageTitle: "/",
      });
    })
    .catch((err) => {
      console.log(err);
    });

};

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then((products) => {
      res.render("shop/product-list", {
        products: products,
        pageTitle: "/products",
      });
    })
    .catch((err) => {
      console.log(err);
    });
 
};

exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;
  console.log(productId)
  Product.findById(productId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
      });
    })
    .catch((error) => {
      console.log(error);
    });

};

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then(products => {
          res.render("shop/cart", {
            pageTitle: "/cart",
            products: products,
          });
        })
    .catch((err) => console.log(err));

};

exports.postCart = (req, res) => {
  const id = req.body.productId;
  Product.findById(id).then(product=>{
    return req.user.addToCart(product)
  }).then(result=>{
    console.log(result)
    res.redirect("/cart")
  }).catch(err=>console.log(err))
 
};

exports.postDeleteCartProduct = (req, res) => {
  const prodId = req.body.productId;
  req.user
    .deleteCartItem(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};


exports.getOrders = (req, res, next) => {
  req.user
    .getOrders()
    .then((orders) => {
      res.render("shop/orders", {
        pageTitle: "/orders",
        orders: orders,
      });
    })
    .catch((err) => console.log(err));
};


exports.postOrder = (req, res, next) => {
  let fetchedCart;
  req.user
    .addOrder()
    .then(result=>{
      res.redirect('/orders')
    })
    .catch((err) => console.log(err));
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    pageTitle: "checkout",
  });
};
