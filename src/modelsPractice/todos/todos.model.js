const mongoose = require('mongoose')

const todoSchema = new mongoose.Schema({
    creatorName: {
        type:String,
        required: true
    },
    title:{
        type:String,
        required : true
    },
    description : {
        type:String,
    },
    creator:{
        type : mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
})

export const todo = mongoose.model("Todo",todoSchema)