import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import {GoogleGenAI } from '@google/genai'
import axios from 'axios'
import { Octokit } from "@octokit/rest";

const generateReadme = asyncHandler(async(req,res)=>{
    const token = req.token;
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
    const prompt = `Generate a clean and professional README.md file for the following    GitHub repository. 
        Follow the exact structure and formatting given below. 
        Do not add placeholder text or extra commentary outside the README.

        README Structure:
        1. Project Title (# Heading)
        2. Badges (Stars, Forks, Issues, License, Last Commit)
        3. Short Description (1–2 sentences)
        4. Demo/Live Link (if homepage exists)
        5. ✨ Features (bullet list)
        6. 🚀 Getting Started
        - Prerequisites
        - Installation steps
        7. 📖 Usage (clear usage example)
        8. 🛠️ Built With (list of tech stack from repo language/topics)
        9. 🤝 Contributing (strict contributing steps: fork, branch, commit, PR)
        10. 📜 License (from repo license info, or "Not specified")
        11. 👤 Contact (Owner name, GitHub profile, project link)

        Repository Details:
        [INSERT repo details string here: name, description, language, topics, stars, forks, issues, license, homepage, owner info, etc.]

        The details for the README.md to refer is given here : ${repoDetails}

        Rules:
        - Only return valid Markdown.
        - No extra explanations or placeholders.
        - Keep it concise and professional.`
    
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
        const token = req.token;
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