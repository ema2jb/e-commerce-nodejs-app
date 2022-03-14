const express = require('express')
//const path = require('path')
//const rootDir = require('../utils/path')

const {
    getAddProducts, 
    postAddProducts, 
    getProducts, 
    getEditProduct, 
    postEditProduct,
    postDeleteProduct
    } = require('../controllers/admin')

const router = express.Router()

router.get("/add-product", getAddProducts)

router.get('/products', getProducts)

router.post('/add-product', postAddProducts)

router.get('/edit-product/:productId', getEditProduct)

router.post('/edit-product', postEditProduct)

router.post('/delete-product', postDeleteProduct)

module.exports = router