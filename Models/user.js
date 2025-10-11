import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    name : {

        type : String,
        required : true,
        trim : true
        
    },

    email : {

        type : String,
        required : true,
        unique : true,
        trim : true
    
    },

    password : {

        type : String,
        required : true

    },
    
    role : {

        type : String,
        enum : ['tutor', 'tutor-center', 'GodofWar'],
        default : 'tutor'

    },

    organization :{
        
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        default: null 

    },

    pendingInvites: [
    {
      tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
      sentAt: { type: Date, default: Date.now }
    }
    ],

    OTP: { 
        type: String
    }, 

    otpExpires: {
         type: Date 
    }  

},{ timestamps: true })

export default mongoose.model("User", userSchema);