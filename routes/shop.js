const express = require('express')
//const path = require('path')
//const rootDir = require('../utils/path')
const router = express.Router()
const {getProducts, 
    getProduct, 
    getIndex, 
    getCart, 
    getCheckout, 
    getOrders,
    postCart,
    postDeleteCartProduct,
    postOrder
} = require('../controllers/shop')

router.get("/", getIndex)

router.get('/products', getProducts)

router.get('/product/:productId', getProduct)

router.get('/cart', getCart)

router.post('/cart', postCart)

router.get('/orders', getOrders)

router.get('/checkout', getCheckout)

router.post('/cart-delete-item', postDeleteCartProduct)

router.post('/create-order', postOrder)

module.exports = router