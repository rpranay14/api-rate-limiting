const express=require('express');
const SUBSCRIPTIONS = require('../modals/subscription');
const subscriptionRouter=express.Router();

subscriptionRouter.route('/')
.get(async(req,res,next)=>{
    try{
        const subscriptions=await SUBSCRIPTIONS.find({});
        return res.status(200).json({success:true,data:subscriptions});
    }
    catch(error){
        return res.status(500).json({success:false,message:"Some error occured"}); 
    }
   
})
.post(async(req,res,next)=>{
const {name,amount,credits}=req.body;

try {
    const newSubscription=new SUBSCRIPTIONS({
        name,amount,credits
    })
    await newSubscription.save();
    return res.status(200).json({success:true,message:"Subscription Plan created Successfully"})
    
} catch (error) {
    return res.status(500).json({success:true,message:"Some error occured"})
}
})

module.exports=subscriptionRouter;