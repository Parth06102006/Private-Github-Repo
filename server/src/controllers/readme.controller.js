import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import {GoogleGenAI } from '@google/genai'
import axios from 'axios'
import { Octokit } from "@octokit/rest";

const generateReadme = asyncHandler(async(req,res)=>{
    const token = req.cookies.token;
    if(!token)
    {
        throw new ApiError(401,'Token not found');
    }
    const {repo,owner} = req.body;
    if(!repo)
    {
        throw new ApiError(400,'No Selected Repository Name Found')
    }
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`,
        {
            headers:{
                Authorization:`Bearer ${token}`
            }
        }
    );

    const {
        name,    
        full_name,         
        description,        
        html_url,         
        language,               
        topics,                 
        forks_count,
        stargazers_count,
        watchers_count,
        open_issues_count,
        created_at,
        updated_at,
        pushed_at,
        license,       
        owner: { login, html_url: owner_url },
        default_branch,
        visibility,           
        size,            
        homepage,            
    } = response.data


    const repoDetails = `
        Repository Name: ${name}
        Full Name: ${full_name}
        Description: ${description || "No description provided"}
        GitHub URL: ${html_url}
        Language: ${language || "Not specified"}
        Topics: ${topics && topics.length ? topics.join(", ") : "None"}
        Stars: ${stargazers_count}
        Forks: ${forks_count}
        Watchers: ${watchers_count}
        Open Issues: ${open_issues_count}
        Created At: ${created_at}
        Last Updated: ${updated_at}
        Last Push: ${pushed_at}
        License: ${license?.spdx_id || "Not specified"}
        Default Branch: ${default_branch}
        Visibility: ${visibility}
        Size (KB): ${size}
        Homepage: ${homepage || "None"}
        Owner: ${login} (${owner_url})
        `;

    console.log(process.env.GEMINI_API_KEY)
    const ai = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});
    // console.log(ai)
    const prompt = `Generate a professional README.md file for the following GitHub project.\n Use the details provided. Make sure to include:\nProject Title & Description\nBadges (Stars, Forks, Issues, License, etc.)\nInstallation steps (use language as hint)\nUsage instructions\nContributing guidelines\nLicense section\nContact/Owner info\nHere are the repository details:${repoDetails}\n Important: \n- Output ONLY the README.md content. \n- Do NOT add any explanations, introductions, or extra commentary. \n- Format properly in markdown.`
    
    const geminiResponse = await ai.models.generateContent({
        model:'gemini-2.5-pro',
        contents:prompt,
        generationConfig:{
            temperature:0.5,
            maxOutputTokens:2000
        }
    })
    const generatedReadmeMessage = geminiResponse.text;
    return res.status(200).json(new ApiResponse(200,`Generated the Readme for ${repo}`,{readme:generatedReadmeMessage}))
})

const publishGithub = asyncHandler(async(req,res)=>{
        const token = req.cookies.token;
        if(!token)
        {
            throw new ApiError(401,'No Token Found');
        }

        const { owner, repo, content, email } = req.body;

        if(!owner||!repo||!content||!email)
        {
            throw new ApiError(400,'Incomplete Details')
        }

        const octokit = new Octokit({
            auth: token
        })

        let sha;
        try {
            const {data} = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}",{
                owner,
                repo,
                path:'README.md'
            })
            sha = data.sha;
        } catch (error) {
            if(error.status != 404)
            {
                throw new ApiError(400,error.message)
            }
        }

        try {
            const response = await octokit.request(`PUT /repos/{owner}/{repo}/contents/{path}`, {
                owner: owner,
                repo: repo,
                path: 'README.md',
                message: 'Update README.md',
                committer: {
                    name: `${owner}`,
                    email: `${email}`
                },
                content: Buffer.from(content, "utf8").toString("base64"),
                ...(sha && { sha }),
            })
            return res.status(200).json(new ApiResponse(200,'README.md committed successfully',{
                commitUrl: response.data.commit.html_url,
            }))
        } catch (error) {
            throw new ApiError(500,error.message)
        }

})

export {generateReadme,publishGithub}