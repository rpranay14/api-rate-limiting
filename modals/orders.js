const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const orderSchema=new Schema({
    orderid:{
        type:String
    },

    razorpay_payment_id:{
type:String
    },
    plan:{
        type:String
    },
    email:{
        type:String
    },
    amount:{
        type:Number
    },
    status:{
        type:String
    }
})
const ORDERS=mongoose.model("ORDERS",orderSchema);
module.exports=ORDERS