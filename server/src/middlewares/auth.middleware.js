import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'
import { client } from "../config/redis.js";

export const authHandler = asyncHandler(async(req,res,next)=>{
    const token = req.cookies.token;
    console.log('MIDDLEWARE TOKEN : ',token)
    if(!token)
    {
        throw new ApiError(401,'No Token Found')
    }
    try {
            console.log('STARTED VERIFICATION PROCESS ...')
            const decoded = jwt.verify(token,process.env.JWT_SECRET)
            const sessionId = decoded._id;
            console.log('MIDDLWARE SESSION ID : ',sessionId)
            if(!sessionId)
            {
                throw new ApiError(401,'Invalid Token')
            }

            const githubToken = await client.get(`${sessionId}`);
            console.log('GITHUB TOKEN : ',githubToken)
            if(!githubToken)
            {
                throw new ApiError(401,'Session Expired');
            }

            req.token = githubToken;
            req.sessionId = sessionId;
            return next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            throw new ApiError(401, 'Invalid Token')
        }
        if (error.name === 'TokenExpiredError') {
            throw new ApiError(401, 'Token Expired')
        }
        throw new ApiError(400,error.message)
    }
})