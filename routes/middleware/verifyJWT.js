const jwt=require('jsonwebtoken');
require("dotenv").config();

const verifyJWT=async(req,res,next)=>{
    if(!req.headers || !req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')){
        return res.status(403).json({success:false,message:"No token is present"})
    }
    const token=req.headers.authorization.split(' ')[1];
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decode)=>{
        if(err){
            return res.status(403).json({success:false,message:"Invalid Token"})
        }
  
        req.email=decode.email;
        next();
    })

}
module.exports=verifyJWT