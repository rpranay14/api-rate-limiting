const express=require("express");
const SUBSCRIPTIONS = require("../modals/subscription");
const paymentRouter=express.Router();
const Razorpay=require('razorpay');
const verifyJWT = require("./middleware/verifyJWT");
const ORDERS = require("../modals/orders");
const USERS = require("../modals/user");
require('dotenv').config();
const crypto = require("crypto");
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

paymentRouter.route("/createorder")
.post(verifyJWT,async(req,res,next)=>{
    const {planName}=req.body;
    const email=req.email;
    const subscription=await SUBSCRIPTIONS.findOne({name:planName});
    if(!subscription){
        return res.status(400).json({success:false,message:"No Subscription found"})
    }
    let amount=subscription.amount*100
    let options={
        amount:amount,
        currency:"INR",

    }
    const createdOrder=await instance.orders.create(options);

    const newOrder=new ORDERS({
        orderid:createdOrder.id,
        plan:subscription._id,
        email:email,
        amount:subscription.amount*100,
        status:createdOrder.status
    })
    await newOrder.save();
    return res.status(200).json({success:false,data:createdOrder})
    

})

paymentRouter.route('/verify_payment')
.post(verifyJWT,async(req,res,next)=>{
    const {razorpay_payment_id,razorpay_order_id,razorpay_signature}=req.body;
    console.log(razorpay_payment_id,razorpay_order_id,razorpay_signature)
const order=await ORDERS.findOne({orderid:razorpay_order_id});
if(!order){
    return res.status(400).json({success:false,message:"Incorrect order"});
}
const generated_signature = crypto
.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
.update(`${razorpay_order_id}|${razorpay_payment_id}`)
.digest("hex");
if (generated_signature == razorpay_signature) {
    console.log("hIII2")
    const updatedOrder=await ORDERS.updateOne({orderid:razorpay_order_id},{$set:{razorpay_payment_id:razorpay_payment_id,status:"success"}},{new:true})
    const plan=await SUBSCRIPTIONS.findById(order.plan);
    const user=await USERS.findOneAndUpdate({email:order.email}, {
        $set: { isSubscribed: true }, // Set `isSubscribed` to true
        $inc: { credits: plan.credits }, // Increment `credits` by 50
      },{new:true})  
      console.log(user)
      return res.status(200).json({success:true,message:"payment Successfull",credits:user.credits})
}
else{
    return res.status(400);
}
})


paymentRouter.route("/test")
.get(verifyJWT,(req,res,next)=>{

    return res.status(200).json({success:true})
})
module.exports=paymentRouter