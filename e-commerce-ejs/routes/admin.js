const express = require('express')
const {body} = require('express-validator')

const {
    getAddProducts, 
    postAddProducts, 
    getProducts, 
    getEditProduct, 
    postEditProduct,
    deleteProduct
    } = require('../controllers/admin')

const isAuth = require('../middleware/is-auth')

const router = express.Router()

router.get("/add-product", isAuth, getAddProducts)

router.post('/add-product', [
    body('title').isString().isLength({min:3}).trim(),
    body('price').isFloat(),
    body('description').isLength({min:5, max:200}).trim()
], isAuth, postAddProducts)


router.get('/products', isAuth, getProducts)


router.get('/edit-product/:productId', isAuth, getEditProduct)

router.post('/edit-product', [
    body('title').isString().isLength({min:3}).trim(),
    body('price').isFloat(),
    body('description').isLength({min:5, max:200}).trim()
], isAuth, postEditProduct)


router.delete('/product/:productId', isAuth, deleteProduct)


module.exports = router