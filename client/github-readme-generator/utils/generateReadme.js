import axios from "axios";

async function generateReadme(repo,owner)
{
    if(!repo || !owner)
    {
        throw Error('Repo or Owner not defined')    
    }

    try {
        const {data} = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/generate/readme`,{
            repo,
            owner
        },{withCredentials:true});
        const readme = data.data.readme;
        if(!readme)
        {
            throw Error('Error Generating Readme');
        }
        console.log(readme)
        return readme;
    } catch (error) {
        console.error(error.message)
    }
}

export {generateReadme}