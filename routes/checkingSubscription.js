const USERS = require("../modals/user");

const checkSubscription=async(req,res,next)=>{
 
    const {email}=req;
    if(!email){
        return res.status(400).json({success:false,message:"Logged in to continue"})
    }
    const user=await USERS.findOne({email});
    if(!user){
        return res.status(400).json({success:false,message:"User not found"})
    }
    if(user.isSubscribed){
        if(user.credits<=0){
            return res.status(400).json({success:false,message:"No Credits left"})
        }
        else{
            req.email=email;
            next();
        }
    }
    else{
        return res.status(400).json({success:false,message:"You are not subscribe to any plan"})
    }

}
module.exports=checkSubscription