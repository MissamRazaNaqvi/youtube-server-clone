const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    address:{
        type:String
    },
    phone:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['customer','admin']
    },
    status:{
        type:String,
        enum:['active','inactive']
    }
},{timestamps:true})

export const User = mongoose.model('user',userSchema)