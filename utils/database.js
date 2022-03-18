const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) =>{
    MongoClient.connect(
        "mongodb+srv://emmatudje:Tusboy0762@express-tutorials.jykrc.mongodb.net/SHOP?retryWrites=true&w=majority"
      ).then(client=>{
          console.log('connected!')
            _db = client.db()
          callback()
      }).catch(err=>{
          console.log(err)
          throw err
        })
}

const getDb = ()=>{
    if(_db){
        return _db
    }

    throw 'No database found'
}

module.exports = {mongoConnect, getDb};






/*
const Sequelize = require('sequelize')

const sequelize = new Sequelize('node-complete', 'root', 'Tusboy0762', {
    dialect:'mysql',
    host:'localhost'
})

module.exports = sequelize

*/
