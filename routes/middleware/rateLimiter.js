const redisClient = require("../../config/redisClient");
const BucketSize=10;
const RefillRate=20/1000;

const rateLimiter=async(req,res,next)=>{
    try{
        const {ip}=req;
        console.log(ip);
        if(!ip){
            return res.status(400).json({message:"Invalid IP Address"})
        }
        const key=`ratelimit-${ip}`;
        const bucketData=await redisClient.get(key);
        let bucket;
        if(!bucketData){
            bucket={token:BucketSize,lastRefill:Date.now()}
        }
        else{
            bucket=JSON.parse(bucketData);
        }
        const ellapsedTime=Date.now()-bucket.lastRefill;
        const tokenToAdd=Math.floor(ellapsedTime*RefillRate);
        bucket.token=Math.min(bucket.token+tokenToAdd,BucketSize);
        if(bucket.token>0){
            bucket.token--;
            await redisClient.set(key,JSON.stringify(bucket));
            next()
        }
        else{
            await redisClient.set(key,JSON.stringify(bucket));
           return res.status(429).json({message:"Too many requests"})
        }
    }
    catch(err){
        return res.status(500).json({message:"Rate Limiter error"})
    }
}
module.exports=rateLimiter