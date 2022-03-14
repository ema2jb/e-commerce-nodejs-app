const Product = require('../models/product')

exports.getProducts = (req, res, next)=>{
    //res.sendFile(path.join(rootDir, "views", "shop.html"))
    Product.findAll().then(products=>{
        res.render("shop/product-list", {
            products:products, 
            pageTitle:"/products" 
        })
    }).catch(err=>{
        console.log(err)
    })
    /*
    Product.fetchAll().then(([rows])=>{
        res.render("shop/product-list", {
            products:rows, 
            pageTitle:"products", 
        })
    }).catch((error)=>{
        console.log(error)
    })
*/
}


exports.getProduct=(req,res,next)=>{
    const productId = req.params.productId
    Product.findByPk(productId).then((product)=>{
        res.render('shop/product-detail', {product:product, pageTitle: product.title})
    }).catch(error=>{
        console.log(error)
    })

    /* OR 
         Product.findAll({where:{id:productId}}).then((product)=>{
        console.log(product[0].dataValues)
        res.render('shop/product-detail', {product:product[0].dataValues, pageTitle: product.title})
    }).catch(error=>{
        console.log(error)
    })
    */
}


exports.getCart = (req, res, next)=>{
    req.user.getCart().then(cart=>{
       return cart.getProducts().then(products=>{
        res.render("shop/cart", {
            pageTitle:"/cart",
            products:products
        })
       }).catch(err=>console.log(err))
    }).catch(err=> console.log(err))

    /*
    Cart.getCart(cart=>{
        Product.fetchAll(products=>{
            const cartProducts = [];
            for (product of products){
                const cartProductsData = cart.products.find(prod=>prod.id === product.id)
                if(cartProductsData){
                    cartProducts.push({productData:product, qty:cartProductsData.qty})
                }
            }
            res.render("shop/cart", {
                pageTitle:"cart",
                products:cartProducts
            })
        })
    })
    */
}

exports.getIndex =(req, res, next)=>{
    Product.findAll().then(products=>{
        res.render("shop/index", {
            products:products, 
            pageTitle:"/" 
        })
    }).catch(err=>{
        console.log(err)
    })
    
    /*version 1
        Product.fetchAll().then(([rows])=>{
        res.render("shop/index", {
            products:rows, 
            pageTitle:"index" 
        })
    }).catch((error)=>{
        console.log(error)
    })
    */
    
}

exports.postCart=(req, res)=>{
    const id = req.body.productId;
    let fetchedCart;
    let newQuantity = 1;
    req.user.getCart().then(cart=>{
        fetchedCart = cart
        return cart.getProducts({where:{id:id}})
    }).then(products=>{
        let product;

        if(products.length > 0){
            product = products[0]
        }

        if(product){
            const oldQuantity =product.cartItem.quantity;
            newQuantity = oldQuantity + 1
            return product
        }

        return Product.findByPk(id)
    }).then(product=>{
        return fetchedCart.addProduct(product, {
            through: { quantity: newQuantity}
        })
    })
    .then(()=>{
        res.redirect('/cart')
    })
    .catch(err=>console.log(err))
    /*
    Product.findById(id, (product)=>{
        Cart.addProduct(id, product.price)
    })
    */
}

exports.postDeleteCartProduct = (req,res)=>{
    const prodId = req.body.productId
    req.user.getCart().then(cart=>{
        return cart.getProducts({where:{id:prodId}})
    }).then(products=>{
        const product = products[0]
        return product.cartItem.destroy()
    }).then(result=>{
        res.redirect('/cart')
    }).catch(err=>console.log(err))
    /*
    Product.findById(prodId, product=>{
        Cart.deleteProduct(prodId, product.price);
    })
    */
}



exports.getOrders =(req, res, next)=>{
    req.user.getOrders({include: ['products']})
    .then(orders=>{
        res.render("shop/orders", {
            pageTitle:"/orders",
            orders:orders
        })
    }).catch(err=>console.log(err))    
}

exports.postOrder = (req, res, next)=>{
    let fetchedCart;
    req.user.getCart().then(cart=>{
        fetchedCart = cart
        return cart.getProducts()
    }).then(products=>{
        return req.user.createOrder().then(order=>{
            return order.addProducts(products.map(product=>{
                product.orderItem = { quantity: product.cartItem.quantity}
                return product
            })).then(results=>{
                return fetchedCart.setProducts(null)
            }).then(result=>{
                res.redirect('/orders')
            })
        }).catch(err=>console.log(err))
    }).catch(err=>console.log(err))
}

exports.getCheckout = (req, res, next)=>{
    res.render("shop/checkout",{
        pageTitle:"checkout"
    })
}