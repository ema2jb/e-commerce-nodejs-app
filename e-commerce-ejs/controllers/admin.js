const {validationResult} = require('express-validator')
const cloudinary = require('cloudinary').v2
const { unlink } = require('fs')

const Product = require("../models/product");

cloudinary.config({
  cloud_name: 'emmyway',
  api_key: '445187176314283',
  api_secret: 'ZhcKgJU_Vf0lXyKkSdt7JP_uZ9k'
})


const  uploadImageToCloudinary = (imageUrl) =>{
  return cloudinary.uploader.upload(imageUrl, { tags: "product_image" })
  .then(function (image) {
    console.log("* " + image.public_id);
    console.log("* " + image.url);
    unlink(imageUrl, (err)=>{
      console.log(err)
    })
    return {imageUrl:image.url, publicId:image.public_id}
  })
  .catch(function (err) {
    console.log();
    console.log("** File Upload (Promise)");
    if (err) { console.warn(err); }
  });
}

exports.getAddProducts = (req, res, next) => {
  if(!req.session.isLoggedIn){
    return res.redirect('/login')
  }
  //res.sendFile(path.join(rootDir, "views", "add-product.html"))
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    editing: false,
    hasError:false,
    errorMessage:[],
    validationErrors:[]
  });
};

exports.postAddProducts = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const description = req.body.description;
  const price = req.body.price;
  
  if(!image){
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      editing: false,
      hasError:true,
      product: {
        title,
        description,
        price
      },
      errorMessage: 'Attached file is not an image',
      validationErrors: []
    });
  }

  const errors = validationResult(req)
  console.log(errors.array())
  if(!errors.isEmpty()){
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      editing: false,
      hasError:true,
      product: {
        title,
        description,
        price
      },
      errorMessage:errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

 uploadImageToCloudinary(image.path).then(({imageUrl, publicId})=>{
    const product = new Product({
      title,
      price,
      description,
      imageData:{
        imageUrl,
        publicId
      },
      userId: req.session.user._id
    }
    );
    product
      .save()
      .then((result) => {
        console.log("created product");
        res.redirect("/admin/products");
      })
      .catch((err) => {
        const error = new Error(err)
        error.httpStatusCode = 500;
        return next(error)
      });
  })
};


exports.getProducts = (req, res, next) => {
  //fetch only products that belong to the loggedin user
  Product.find({userId:req.user._id})
    .then((products) => {
      res.render("admin/products", {
        products: products,
        pageTitle: "Admin Products"
      });
    })
    .catch((err) => {
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error)
    });
};


exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDesc = req.body.description;

  const errors = validationResult(req)
  if(!errors.isEmpty()){
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      editing: true,
      hasError:true,
      product: {
        title:updatedTitle,
        description: updatedDesc,
        price:updatedPrice
      },
      errorMessage:errors.array()[0].msg,
      validationErrors:errors.array()
    });
  }

  Product.findById(prodId).then(product=>{
    if(product.userId.toString()  !== req.user._id.toString()){
      return res.redirect('/');
    }
    product.title = updatedTitle
    product.price = updatedPrice
    product.description = updatedDesc
   if(image){
    cloudinary.api.delete_resources([product.imageData.publicId],
    function(error, result) {console.log(result, error); });
      return uploadImageToCloudinary(image.path).then(({imageUrl, publicId})=>{
        product.imageData = {
          imageUrl,
          publicId
        }
        return product.save().then((result) => {
          res.redirect("/admin/products");
          console.log("UPDATED PRODUCT");
        })
      })
   }
    return product.save().then((result) => {
      res.redirect("/admin/products");
      console.log("UPDATED PRODUCT");
    })
  })
    .catch((err) => {
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error)
    });
};



exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (editMode !== "true") {
    return res.redirect("/shop");
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        editing: editMode,
        product: product,
        hasError:false,
        errorMessage:[],
        validationErrors: []
      });
    })
    .catch((err) => {
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error)
    });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId).then(product=>{
    if(!product){
      return next(new Error('Product not Found'))
    }
    return cloudinary.api.delete_resources([product.imageData.publicId],
      function(error, result) {console.log(result, error); });  
  }).then(result=>{
    Product.deleteOne({_id:prodId, userId:req.user._id})
    .then(() => {
        console.log("PRODUCT DELETED");
        res.status(200).json({message:'success!'})
    })
    .catch((err) => {
     res.status(500).json({message:'deleting product failed.'})
    });
  })
  .catch((err) => {
    const error = new Error(err)
    error.httpStatusCode = 500;
    return next(error)
  });
};
