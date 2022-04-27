const fs = require('fs')
const path = require('path')
const PDFDocument = require('pdfkit')
const stripe = require('stripe')('sk_test_4eC39HqLyjWDarjtT1zdp7dc')


const Product = require("../models/product");
const Order = require("../models/order");

const ITEMS_PER_PAGE = 2

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1
  let totalItems;

    Product.find().countDocuments().then(numProducts=>{
      totalItems = numProducts;
    return Product.find()
    .skip((page-1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
  }).then((products) => {
      res.render("shop/index", {
        products: products,
        pageTitle: "/",
        passwordReset: req.flash('passwordReset'),
        currentPage: page,
        hasNextPage:ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage : page - 1,
        lastPage: Math.ceil(totalItems/ITEMS_PER_PAGE)
      });
    })
    .catch((err) => {
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error)
    });
};

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1
  let totalItems;

    Product.find().countDocuments().then(numProducts=>{
      totalItems = numProducts;
    return Product.find()
    .skip((page-1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
  }).then((products) => {
      res.render("shop/product-list", {
        products: products,
        pageTitle: "Products",
        currentPage: page,
        hasNextPage:ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage : page - 1,
        lastPage: Math.ceil(totalItems/ITEMS_PER_PAGE)
      });
    })
    .catch((err) => {
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error)
    });
};

exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;
  Product.findById(productId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title
      });
    })
    .catch((err) => {
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error)
    });
};


exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items;
      res.render("shop/cart", {
        pageTitle: "/cart",
        products: products
      });
    })
    .catch((err) => {
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error)
    });
};


exports.postCart = (req, res) => {
  const id = req.body.productId;
  Product.findById(id)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      console.log(result);
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error)
    });
};

exports.postDeleteCartProduct = (req, res) => {
  const prodId = req.body.productId;
  req.user
    .deleteCartItem(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error)
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.session.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        pageTitle: "/orders",
        orders: orders
      });
    })
    .catch((err) => {
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error)
    });
};

exports.getCheckoutSuccess = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
        },
        products: products,
      });
      return order.save();
    })
    .then((result) => {
      req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => {
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error)
    });
};

exports.getCheckout = (req, res, next)=>{
  let products;
  let total = 0
  console.log('checkout')
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      products = user.cart.items;
      products.forEach(p=>{
        total += p.quantity * p.productId.price
      })
     
      return stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items:products.map(p=>{
            return {
              name: p.productId.title,
              description: p.productId.description,
              amount:p.productId.price * 100,
              currency:'usd',
              quantity:p.quantity
            }
          }),
          success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
          cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
      });
    })
    .then(session=>{
      res.render("shop/checkout", {
        pageTitle: "/cart",
        products: products,
        totalSum: total,
        sessionId: session.id
      });
    })
    .catch((err) => {
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error)
    });
}

exports.getInvoice = (req, res, next)=>{
    const orderId = req.params.orderId;

    Order.findById(orderId).then(order=>{
      if(!order){
        return next(newError('No '))
      }
      if (order.user.userId.toString() !== req.user._id.toString()){
          return next(new Error('Unauthorised'))
      }

      const invoiceName =  'invoice-' + orderId + '.pdf';
      const invoicePath = path.join('data', 'invoices', invoiceName)

      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"')
      pdfDoc.pipe(fs.createWriteStream(invoicePath))
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text('Invoice', {
        underline:true
      });
      pdfDoc.text('-----------------------')

      let totalPrice = 0
      order.products.forEach(prod=>{
        totalPrice = totalPrice + prod.quantity * prod.product.price
        pdfDoc.fontSize(14).text(prod.product.title + ' - ' + prod.quantity + ' x ' + '$' + prod.product.price)
      })
      pdfDoc.text('------')
      pdfDoc.fontSize(20).text('Total Price: $' + totalPrice)

      pdfDoc.end()

      /*
      fs.readFile(invoicePath, (err, data)=>{
          if(err){
            return next(err)
          }
         res.setHeader('Content-Type', 'application/pdf')
         res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"')
          res.send(data);
      })
      
     const file = fs.createReadStream(invoicePath);
     file.pipe(res)
     */
    })                                                                                                                      
}
