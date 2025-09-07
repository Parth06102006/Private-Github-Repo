import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import axios from 'axios'

const auth = asyncHandler(async(req,res)=>{
    const redirect_url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_url=${process.env.REDIRECT_URL}&scope=repo%20read:user`;

    return res.redirect(redirect_url);
})

const getAccessToken = asyncHandler(async(req,res)=>{
    const {code} = req.query;
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

    const {access_token,token_type,scope} = response.data;

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
    return res.status(200).cookie('token',access_token,options).json(new ApiResponse(200,'Successfully Fetched Access Token'))
})

const getUserInfo_Repositories = asyncHandler(async(req,res)=>{
    const token = req.cookies.token || req?.header('Authorization')?.replace('Bearer ','');
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
        privateRepos:privateRepoNames
    }));
})

export {auth,getAccessToken,getUserInfo_Repositories}