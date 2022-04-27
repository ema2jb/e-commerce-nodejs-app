const express = require('express')
//const path = require('path')
//const rootDir = require('../utils/path')
const router = express.Router()
const {getProducts, 
    getProduct, 
    getIndex, 
    getCart, 
    getCheckout, 
    getCheckoutSuccess,
    getOrders,
    postCart,
    postDeleteCartProduct,
    postOrder,
    getInvoice,
} = require('../controllers/shop')

const isAuth = require('../middleware/is-auth')

router.get("/", getIndex)

router.get('/products', getProducts)

router.get('/product/:productId', getProduct)

router.post('/cart', isAuth, postCart)

router.get('/cart',isAuth, getCart)

router.post('/cart-delete-item',isAuth, postDeleteCartProduct)

router.get('/orders/:orderId', isAuth, getInvoice)

router.get('/orders', isAuth, getOrders)

router.get('/checkout', isAuth, getCheckout)

router.get('/checkout/success', getCheckoutSuccess);

router.get('/checkout/cancel', getCheckout)




module.exports = router