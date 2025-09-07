import Redis from 'ioredis'
import ApiError from '../utils/ApiError.js';
import dotenv from 'dotenv'
dotenv.config({path:'./.env'})

const client = new Redis({
    host:process.env.REDIS_HOST,
    port:Number(process.env.REDIS_PORT),
    password:process.env.REDIS_PASSWORD
})

client.on('connect',()=>{console.log('REDIS CONNECTED')});
client.on('error',(error)=>{
    console.error(error.message);
    throw new ApiError(500,'Error Connecting to Redis');
})

export {client}