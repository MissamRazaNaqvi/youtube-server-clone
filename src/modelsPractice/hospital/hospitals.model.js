const mongoose = require('mongoose')

const hospitalSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    pincode:{
        type:String,
        required:true
    },
    specialiesedIn:{
        type:String,
        required:true
    },

},{timestamp:true})

export const hospitalModel = mongoose.model('Hospital',hospitalSchema)