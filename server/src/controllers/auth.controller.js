import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import axios from 'axios'
import { client } from "../config/redis.js";
import crypto from 'crypto'
import { Octokit } from "@octokit/rest";
import jwt from 'jsonwebtoken'

const checkAuth = asyncHandler(async(req,res)=>{
       try {
         const octokit = new Octokit({auth:req.token});
         const {data} = await octokit.request('GET /user');
         console.log('User is Authenticated')
         return res.status(200).json(new ApiResponse(200,'User is Authenticated',{valid:true,user:data}))
       } catch (error) {
            if(error.status === 401)
            {
                console.log('User not Found')
                await client.del(req.sessionId)
                return res.status(401).clearCookie('token').json(new ApiError(401,error.message))
            }
            console.error(error.message);
            throw new ApiError(500,'Error Verifying the User');
       }
})

const logout = asyncHandler(async(req,res)=>{
    try {
        await client.del(req.sessionId)

        const isDev = process.env.NODE_ENV === 'development';
        const options = {
            httpOnly: true,
            secure: !isDev,
            sameSite: isDev ? 'lax' : 'none',
        }
        
        return res.status(200).clearCookie('token',options).json(new ApiError(200,'User Logged Out Successfully'))
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(200)
            .clearCookie('token')
            .json(new ApiResponse(200, 'Logged out (with cleanup error)'));
    }
})

const auth = asyncHandler(async(req,res)=>{
    const redirect_url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_url=${process.env.REDIRECT_URL}&scope=repo%20read:user`;

    return res.status(200).json(new ApiResponse(200,'Redirect Url Fetched',{redirect_url}));
})

const getAccessToken = asyncHandler(async(req,res)=>{
    const {code} = req.query;
    console.log('CODE : ',code)
    if(!code)
        {
            throw new ApiError(400,'No Code Found');
        }
    const response = await axios.post('https://github.com/login/oauth/access_token',{
            client_id:process.env.GITHUB_CLIENT_ID,
            client_secret:process.env.GITHUB_CLIENT_SECRET,
            code
        },
        {
            headers:{Accept:'application/json'}
        }
    )
    console.log(response)
    const {access_token,token_type,scope} = response.data;

    const sessionId = crypto.randomBytes(16).toString('hex');
    console.log('SESSION ID : ',sessionId)
    //Redis Value Set
    await client.set(`${sessionId}`,access_token);
    await client.expire(`${sessionId}`,3*24*60*60);
    console.log('SUCCESSFULLY HAVE SET THE VALUE IN REDIS')

    const generatedAccessToken = jwt.sign({_id:sessionId},process.env.JWT_SECRET,{expiresIn:process.env.TOKEN_EXPIRY});
    console.log('JWT ACCESS TOKEN : ',generatedAccessToken)
    if(!access_token||!token_type||!scope)
    {
        throw new ApiError(500,'Error receiving the credentials');
    }
    const isDev = process.env.NODE_ENV === 'development';
    console.log('True or Not : '+isDev)
    const options = {
        httpOnly:true,
        secure:!isDev,
        sameSite: isDev ? 'lax' : 'none',
        expires: new Date(Date.now() + 3*24*60*60*1000)
    }
    console.log(options)
    console.log('Access Token : ',access_token)
    return res.status(200).cookie('token',generatedAccessToken,options).json(new ApiResponse(200,'Successfully Fetched Access Token'))
})

const getUserInfo_Repositories = asyncHandler(async(req,res)=>{
    const token = req.token;
    console.log('Token : ',token)
    if(!token)
    {
        throw new ApiError(401,'No Access Token Found');
    }

    const response = await axios.get(`https://api.github.com/user`,{
        headers:{
            'Authorization':`Bearer ${token}`
        }
    })

    const {
        login,
        name,
        avatar_url,
        html_url,
        location,
        email,
        public_repos,
        total_private_repos,
        followers,
        following,
        created_at,
        plan
    } = response.data;

    const user = response.data.login;
    console.log(user)

    const publicRepoResponse = await axios.get(`https://api.github.com/users/${user}/repos`,{
        headers:{
            'Authorization':`Bearer ${token}`
        }
    })
    const publicRepoNames = publicRepoResponse.data.map(repo=>repo.name) ;
    const privateRepoNames = [];
    let page = 1;
    while(true)
    {
        const privateResponse = await axios.get(`https://api.github.com/user/repos?visibility=private&per_page=100&page=${page}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        )
        console.log(privateResponse.data)
        if(privateResponse.data.length === 0) break;
        privateRepoNames.push(privateResponse.data.map(repo=>repo.name));
        page++;
    }

    return res.status(200).json(new ApiResponse(
        200,
        'Fetched All the Details of the User'
    ,{
        user:{login,name,avatar_url,html_url,location,email,public_repos,total_private_repos,followers,following,created_at,plan},
        publicRepos:publicRepoNames,
        privateRepos:privateRepoNames[0]
    }));
})

export {auth,checkAuth,logout,getAccessToken,getUserInfo_Repositories}