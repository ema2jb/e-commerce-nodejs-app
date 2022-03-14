const Product = require('../models/product')

exports.getAddProducts = (req, res, next)=>{
    //res.sendFile(path.join(rootDir, "views", "add-product.html"))
    res.render(
        "admin/edit-product", 
        {
        pageTitle:"Add Product", 
        editing:false
    })
}

exports.postAddProducts = (req, res)=>{
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = req.body.price
    /* version 1
    const product = new Product(null,title, imageUrl, description, price)
    product.save().then(()=>{
        res.redirect('/shop')
    }).catch((error)=>{
        console.log(error)
    })
    */ 

    req.user.createProduct({
        title:title,
        price:price,
        imageUrl:imageUrl,
        description:description,
    }).then(result=>{
        console.log('created product')
        res.redirect('/')
    }).catch(err=>{
        console.log(err)
    })
}

exports.getProducts = (req, res, next)=>{
    req.user.getProducts().then(products=>{
        res.render("admin/products", {
            products:products, 
            pageTitle:"Admin Products", 
        })
    }).catch(err=>{
        console.log(err)
    })
}

exports.postEditProduct = (req, res, next)=>{
    const prodId = req.body.productId
    const updatedTitle = req.body.title
    const updatedPrice = req.body.price
    const updatedImageUrl = req.body.imageUrl;
    const updatedDesc = req.body.description;
    Product.findByPk(prodId).then(product=>{
        product.title = updatedTitle
        product.price =updatedPrice
        product.imageUrl = updatedImageUrl
        product.description = updatedDesc
        product.description = updatedDesc
        return  product.save()
    }).then(result=>{
        res.redirect('/admin/products')
        console.log('UPDATED PRODUCT')
    }).catch(err=>{
        console.log(err)
    })
}


exports.getEditProduct = (req, res, next)=>{
    const editMode = req.query.edit;
    if(editMode !== "true"){
        return res.redirect('/shop')
    }
    const prodId = req.params.productId
    req.user.getProducts({where:{id:prodId}}).then(products=>{
        const product = products[0];
        if(!product){
            return res.redirect('/shop')
        }
        res.render(
            "admin/edit-product", 
            {
            pageTitle:"Edit Product", 
            editing:editMode,
            product:product
        })
    }).catch(err=>{
        console.log(err)
    })
}

exports.postDeleteProduct =(req, res, next)=>{
    const prodId = req.body.productId;
    Product.findByPk(prodId).then(product=>{
        return product.destroy()
    }).then(result=>{
        console.log('DESTROYED PRODUCT');
        res.redirect('/admin/products')  
    }).catch(err=>{
        console.log(err)
    })
}


