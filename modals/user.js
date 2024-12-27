const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const userSchema=new Schema({
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    isSubscribed:{
        type:Boolean,
        default:false
    },
    refreshToken:{
        type:String,

    },
    credits:{
        type:Number,
        default:0
    }
},{
    timestamps:true
});
const USERS=mongoose.model("USERS",userSchema)
module.exports=USERS;