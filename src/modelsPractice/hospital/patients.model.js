const mongoose = require('mongoose');

const patientsSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true
    },
    bloodGroup:{
        type:String,
        required:true
    },
    gender:{
        type:String,
        required:true,
        enum:["M","F","O"]
    },
    admittedIn:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Hospital"
    },
    consultantDoctor:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Doctor"
    }

},
{timestamp:true})

export const patientModel = mongoose.model('Patient',patientsSchema)