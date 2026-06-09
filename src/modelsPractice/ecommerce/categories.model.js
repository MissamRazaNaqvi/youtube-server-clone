const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    name:{
        type:String,
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
    products:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product"
    }
},{timestamps:true})

export const categoryModel = mongoose.model('Category',categorySchema);