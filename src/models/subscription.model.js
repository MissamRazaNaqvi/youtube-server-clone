import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscriber:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }, 
    channel:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
    
}, {timestamp : true})

export const subscriptionModel = mongoose.model('subscriptions',subscriptionSchema)