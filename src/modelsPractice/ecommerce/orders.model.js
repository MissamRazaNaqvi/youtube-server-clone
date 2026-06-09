const mongoose = require('mongoose');

const orderedItemSchema = mongoose.Schema({
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product'
    },
    quantity:{
        type:Number,
        required:true
    }
})

const orderSchema = mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    totalAmount:{
        type:String,
    },
    orderStatus:{
        type:String,
        enum:['pending','success','cancelled']
    },
    paymentStatus:{
        type:String,
        enum:['pending','success','cancelled'],
        default:"pending"
    },
    shippingAddress:{
        type:String,
        required:true
    },
    products:{
        type:[orderedItemSchema]
    }
},{})

export const orderModel = mongoose.model('order',orderSchema)