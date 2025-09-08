import React, { useContext, useEffect, useState , useRef } from 'react'
import RTE from './RTE'
import {Brain,Lock,Mail,Github,MapPinCheckInside  } from 'lucide-react'
import axios from 'axios'
import { AuthContext } from '../context/authContext'
import { generateReadme } from '../../utils/generateReadme'
import toast,{Toaster} from 'react-hot-toast'


const Home = () => {
    const { isAuthorized, handleOAuthCallback } = useContext(AuthContext);
    const ref = useRef('')
    const [content,setContent]= useState('');
    const [publicRepos,setPublicRepos]= useState([]);
    const [privateRepos,setPrivateRepos]= useState([]);
    const [userInfo,setUserInfo] = useState([]);
    useEffect(() => {
        const backend_url = import.meta.env.VITE_BACKEND_URL;

        async function getPublicandPrivateRepos() {
            try {
                const response = await axios.get(`${backend_url}/api/v1/repo/list`, {withCredentials: true});
                console.log('Repositories:', response.data);
                setPublicRepos(response.data.data.publicRepos);
                setPrivateRepos(response.data.data.privateRepos);
                setUserInfo(response.data.data.user)
            } catch (error) {
                console.error('Failed to get repos:', error);
            }
        }

        // Handle OAuth callback if we have a code parameter
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code && !isAuthorized) {
            // Handle OAuth callback
            handleOAuthCallback().then((success) => {
                if (success) {
                    getPublicandPrivateRepos();
                }
            });
        } else if (isAuthorized) {
            // If already authorized, just fetch repos
            getPublicandPrivateRepos();
        }
    }, [isAuthorized, handleOAuthCallback])

    function handleChange(event)
    {
        ref.current = event.target.value;
        console.log('Selected Repository : ',ref.current);
    }

    async function getReadme() {
        if (!ref.current) {
            toast.error('Please select a repository first');
            return;
        }
        
        if (!userInfo.login) {
            toast.error('User information not loaded');
            return;
        }

        try {
            const loadingToast = toast.loading('Generating README...');
            
            const value = await generateReadme(ref.current, userInfo.login);
            setContent(value);
            toast.dismiss(loadingToast);
            toast.success('README generated successfully!');
        } catch (error) {
            toast.error(error.message || 'Failed to generate README');
            console.error('Error generating README:', error);
        }
    }

    return (
        <div className='md:flex md:mt-[80px]'>
            <h1 className='block md:hidden text-3xl font-bold text-center mt-3 mb-8'>Github Readme Generator</h1>
            <div className='flex h-1/2 items-center justify-center md:inline-block md:ml-5 mt-15'>
                <div className='mr-5 bg-blue-900/10 p-4 rounded-t-4xl max-w-fit '>
                    <div className="avatar ml-11 md:ml-0">
                        <div className="ring-slate-200 ring-offset-base-100 w-56 rounded-full ring-2 ring-offset-2">
                            <img src={userInfo.avatar_url ? userInfo.avatar_url : `https://img.daisyui.com/images/profile/demo/spiderperson@192.webp` }/>
                        </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-md shadow-lg w-full max-h-fit p-5 mt-5 border border-gray-200 rounded-2xl transition hover:shadow-xl">
                    <h1 className="text-2xl font-extrabold text-center text-gray-800">{userInfo.login}</h1>

                    <div className="flex gap-2 text-sm text-center items-center justify-center mt-3 text-gray-600">
                        <Mail size={15} className="text-blue-600" />
                        <span>{userInfo.email}</span>
                    </div>

                    {userInfo.location && (
                        <div className="flex gap-2 text-sm text-center items-center justify-center mt-3 text-gray-600">
                        <MapPinCheckInside size={15} className="text-green-600" />
                        <span>{userInfo.location}</span>
                        </div>
                    )}

                    <div className="flex gap-6 text-sm text-center items-center justify-center mt-4">
                        <span className="px-3 py-1 rounded-lg bg-secondary text-white font-medium">
                        Public Repos: {userInfo.public_repos}
                        </span>
                        <span className="px-3 py-1 rounded-lg bg-purple-100 text-pink-600 font-medium">
                        Private Repos: {`${userInfo.total_private_repos}`}
                        </span>
                    </div>

                    <div className="flex gap-2 text-sm text-center items-center justify-center mt-4 text-gray-700 hover:text-blue-600 transition">
                        <Github size={15} className="text-black" />
                        <a href={userInfo.html_url} target="_blank" rel="noreferrer" className="underline font-medium">
                        Github Profile
                        </a>
                    </div>
                    </div>

                </div>
            </div>
            <div className='flex w-full justify-center md:inline-block md:mt-15 text-center md:bg-blue-900/5 md:rounded md:p-5'>
                <h1 className='hidden md:block text-6xl font-bold text-center mt-3 mb-8'>Github Readme Generator</h1>
                <fieldset className="mt-6 md:mt-3 ">
                    <legend className="fieldset-legend text-2xl  mt-3">Github Repositories</legend>
                    <div className='flex gap-4'>
                        <select defaultValue="Pick a Repository" className="select select-primary md:w-full" value={ref.current.value} onChange={(event)=>{handleChange(event)}}>
                            <option disabled={true}>Pick a Repository</option>
                            {publicRepos?.map((r,idx)=>(
                                <option key={idx} value={r}>{r}</option>
                            ))}
                            {privateRepos?.map((r,idx)=>(
                                <option key={idx} value={r}><Lock size={14}/>  {r}</option>
                            ))}
                        </select>
                    </div>
                </fieldset>
                <div className='md:ml-40'>
                    <button
                        onClick={getReadme}
                        className="hidden md:flex btn btn-xl btn-outline btn-secondary items-center gap-2 mt-5 "
                    >
                        <Brain size={20} />
                        {'Generate Readme'}
                    </button>
                </div>
            </div>
            <RTE generatedValue={content} selectedRepo={ref.current} owner={userInfo.login} email={userInfo.email}/>
            <Toaster/>
        </div>
    )
}

export default Home

