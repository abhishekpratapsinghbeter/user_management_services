const mongoose = require('mongoose');

const authSchema = new mongoose.Schema({
    user_ID:{
        type:String,
        required: true,
        unique: true
    },
    user_password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        required:true
    },
    userdetails:{
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    otp: {
        type: String 
    },
    otpExpiry: {
        type: Date 
    },
    tokens:[
        {
            token: {
                type:String,
                required:true
            }
        }
    ]
});

const Auth = mongoose.model("Auth", authSchema);
module.exports = Auth;
