const express=require("express");
const imageRouter=express.Router();
const aws =require("@aws-sdk/client-s3") ;
const S3Client=aws.S3Client;
require('dotenv').config();
const Replicate=require("replicate");
const PutObjectCommand=aws.PutObjectCommand
const GetObjectCommand=aws.GetObjectCommand
const { getSignedUrl}=require("@aws-sdk/s3-request-presigner");
const checkSubscription = require("./checkingSubscription");
const USERS = require("../modals/user");
const verifyJWT = require("./middleware/verifyJWT");
const s3Client=new S3Client({
    region:process.env.AWS_REGION,
    credentials:{
        secretAccessKey:process.env.ACCESS_SECRET,
        accessKeyId:process.env.ACCESS_KEY
    }
  })
const replicate=new Replicate();
imageRouter.route('/')
.post(verifyJWT,checkSubscription,async(req,res,next)=>{
    
   try {
     const {filename,filetype}=req.body;
     console.log(filename,"filename")
     const command=new PutObjectCommand({
         Bucket:"pranayrawat.techbucket",
         Key:filename,
         ContentType:filetype
     })
     const url=await getSignedUrl(s3Client,command);
     return res.status(200).json({success:true,data:url})
   } catch (error) {
    return res.status(500).json({success:false,data:url})
   }

})

imageRouter.route('/restoreimage')
.post(verifyJWT,checkSubscription,async(req,res,next)=>{
    try{

   
    const {filename}=req.body;
    const email=req.email;
    const command=new GetObjectCommand({
        Bucket:"pranayrawat.techbucket",
        Key:filename
    })
    const url=await getSignedUrl(s3Client,command);
    let prediction = await replicate.predictions.create({
        version: "0fbacf7afc6c144e5be9767cff80f25aff23e52b0708f17e20f9879b2f21516c",
        input: {
            img: url
        },
      });
      let resultGenerated=false;
      let outputUrl="";
      while(!resultGenerated){
        let predictionResult = await replicate.predictions.get(prediction.id);
       
    if(predictionResult.status==="succeeded"){
        const user=await USERS.findOneAndUpdate({email:email},{$inc:{credits:-1}},{new:true});
     
        outputUrl=predictionResult.output
        resultGenerated=true
    }
    


      } 
     return res.status(200).json({data:outputUrl})
    }
    catch(error){
        return res.status(500).json({success:false})
    }
})
module.exports=imageRouter;