import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'
import { client } from "../config/redis.js";

export const authHandler = asyncHandler(async(req,res)=>{
    const token = req.cookies.token;
    if(!token)
    {
        throw new ApiError(401,'No Token Found')
    }
    const sessionId = jwt.verify(token)?._id;
    const githubToken = await client.get(`${sessionId}`);

    req.token = githubToken;
    next();
})