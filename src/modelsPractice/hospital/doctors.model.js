const mongoose = require('mongoose');

const doctorSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    salary:{
        type:Number,
        required:true
    },
    qualification:{
        type:String,
        required:true
    },
    experienceInYear:{
        type:Number
    },
    workInHospitals:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Hospital"
    }
},{timestamp:true})

export const doctorModel = mongoose.model('Doctor',doctorSchema)