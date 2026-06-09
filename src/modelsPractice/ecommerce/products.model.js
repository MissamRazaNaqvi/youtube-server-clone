const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    price: {
        type:Number,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String
    },
    image:{
        type:String,
    },
    status:{
        type:String,
        enum:['active','inactive']
    },
    stock:{
        type:Number,
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category"
    }
},{})

export const productModel = mongoose.model('Product',productSchema)