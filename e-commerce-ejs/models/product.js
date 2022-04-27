const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title:{
    type:String,
    required:true
  },
  price:{
    type:Number,
    required:true
  },
  description:{
    type:String,
    required:true
  },
  imageData:{
   imageUrl:{
    type:String,
    required:true
   },
   publicId:{
    type:String,
    required:true
   }
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref:'User', 
    required:true
  }
})

module.exports = mongoose.model('Product', productSchema)











/*
//const { getDb } = require("../utils/database");

//const db = getDb();
const mongodb = require("mongodb");
class Product {
  constructor(title, imageUrl, description, price, id, userId) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
    this._id = id ? new mongodb.ObjectId(id) : null;
    this.userId = userId
  }

  save() {
    const db = getDb();
    let dbOp;
    console.log(this)
    if (this._id) {
      dbOp = db
        .collection("product")
        .updateOne({ _id: this._id }, {$set:this});
    } else {
      dbOp = db.collection("product").insertOne(this);
    }
    return dbOp
      .then((result) => {
        console.log(result);
      })
      .catch((err) => console.log(err));
  }

  static fetchAll() {
    //the .find method returns a cursor that helps navigate through the documents
    // in the collection because it wont be wise to pass millions of documents across the network at once
    //but in a situation when the documents are but a few dozens, you could receive all at once
    // with the .toArray method
    const db = getDb();
    return db
      .collection("product")
      .find()
      .toArray()
      .then((products) => {
        return products;
      })
      .catch((err) => console.log(err));
  }

  static findById(prodId) {
    // the .next() method gives the document returned by the cursor
    const db = getDb();
    return db
      .collection("product")
      .find({ _id: new mongodb.ObjectId(prodId) })
      .next()
      .then((product) => {
        return product;
      })
      .catch((err) => console.log(err));
  }

  static deleteById(prodId) {
    const db = getDb()
    return db.collection('product').deleteOne({_id: new mongodb.ObjectId(prodId) }).then(result=>{
      console.log('Deleted')
    }).catch(err=>console.log(err))
  }
}



module.exports = Product;

*/
