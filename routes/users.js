var express = require('express');
const USERS = require('../modals/user');
var router = express.Router();
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const verifyJWT = require('./middleware/verifyJWT');
require('dotenv').config();
/* GET users listing. */
router.route("/")
.get(async(req,res,next)=>{

 try {
   const users=await USERS.find({});
   return res.status(200).json({success:true,data:users});
 } catch (error) {

  return res.status(500).json({success:false,message:"Some error occured"})
 }

})
.post(async(req,res,next)=>{
  const {email,name,password}=req.body;
  if(!email || !name || !password){
    return res.status(401).json({success:false,message:"Required all fields"})
  }
  try{
    const isUserAlreadySignUp=await USERS.findOne({email});
    if(isUserAlreadySignUp){
      return res.status(401).json({success:false,message:"Already registered"})
    }
   const hashedPassword=await bcrypt.hash(password,10)

  const newUser=new USERS({
    email,name,password:hashedPassword
  })
  await newUser.save();
  return res.status(200).json({success:true,message:"Signup Successful"})
}
catch(error){
  console.log(error)
  return res.status(500).json({success:false,message:"Some error occured"})
}
})


router.route("/signin")
.post(async(req,res,next)=>{
  const {email,password}=req.body;
  if(!email || !password){
    return res.status(401).json({success:false,message:"Required all fields"})
  }

 
 
   const user=await USERS.findOne({email});
   if(!user){
    
     return res.status(400).json({success:false,message:"No user found with the email address"})
   }

   const isPasswordMatch=await bcrypt.compare(password,user.password);
   if(!isPasswordMatch){
  
     return res.status(400).json({success:false,message:"Password do not match"});
    
   }
 
   const accessToken=jwt.sign({email:user.email,name:user.name,credits:user.credits},process.env.ACCESS_TOKEN_SECRET,{expiresIn:"300s"});
   const refreshToken=jwt.sign({email:user.email},process.env.REFRESH_TOKEN_SECRET,{expiresIn:"1296000"});

   const updateUser=await USERS.updateOne({email:email},{$set:{refreshToken:refreshToken}},{new:true});
  
   res.status(200);
   res.cookie("jwt", refreshToken, {
    
     maxAge: 15*24 * 60 * 60 * 1000,
   });
   res.json({success:true,data:{accessToken:accessToken,email:email,name:user.name,credits:user.credits}});

 
  
})
router.route("/logout")
.get(async(req,res,next)=>{
  console.log(req.cookies.jwt)
  res.clearCookie("jwt")
  res.sendStatus(200);

})

router.route("/refresh")
.get(async(req,res,next)=>{
  try{


  console.log(req.cookies)
  if(!req.cookies || !req?.cookies.jwt){
    return res.status(400).json("Invalid Credentials")
  }
  const user=await USERS.findOne({refreshToken:req.cookies.jwt});
  if(!user){
    return res.status(400).json({success:false,message:"No user found"})
  }

jwt.verify(req.cookies.jwt,process.env.REFRESH_TOKEN_SECRET,(err,decoded)=>{

  if(!err || this.user.email===decoded.email){
    const accessToken=jwt.sign({email:user.email,name:user.name,credits:user.credits},process.env.ACCESS_TOKEN_SECRET,{expiresIn:"20s"});
    return res.status(200).json({success:true,data:{accessToken:accessToken,email:user.email,name:user.name,credits:user.credits}})
  }
  return res.status(403)
})
}
catch(error){
  res.clearCookie("jwt");
    res.sendStatus(401) 
}
})

router.route("/credits")
.get(verifyJWT,async(req,res,next)=>{
  const email=req.email;
  try{
    const user=await USERS.findOne({email});
    if(!user){
      return res.status(400).json({success:false,message:"user not found"})
    }
    return res.status(200).json({success:true,data:user.credits})
  }
  catch(error){

  }
})


module.exports = router;
