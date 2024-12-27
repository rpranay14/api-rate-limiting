const {Redis}=require('ioredis');
require('dotenv').config();
const redisClient=new Redis({
    host: process.env.redis_host,
        port: 18360,
        password:process.env.redis_password,
})
redisClient.on('connect',()=>{
    console.log("Connected to Redis")
})
redisClient.on('error',(error)=>{
    console.log(error,"Error in Redis Connection")
})
module.exports=redisClient;