const mongoose = require("mongoose");

const subTodos = new mongoose.Schema({
    title:{
        type:String,
        required: true
    },
    status:{
        type:String,
    },
    todoCreator:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Todo"
    }
})

export const subTodo = mongoose.model("subTodo",subTodos)

