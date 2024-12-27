const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const subscriptionSchema=new Schema({
    name:{
        type:String,
    },
    amount:{
        type:Number
    },
    credits:{
        type:Number
    }
},{
    timestamps:true
})
const SUBSCRIPTIONS=mongoose.model("SUBSCRIPTIONS",subscriptionSchema);
module.exports=SUBSCRIPTIONS;