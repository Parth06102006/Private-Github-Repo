import React, { useContext, useEffect } from 'react'
import RTE from './RTE'
import {Brain,Lock} from 'lucide-react'
import axios from 'axios'
import { AuthContext } from '../context/authContext'

const Home = () => {
    const { isAuthorized, handleOAuthCallback } = useContext(AuthContext)
    
    useEffect(() => {
        const backend_url = import.meta.env.VITE_BACKEND_URL;

        async function getPublicandPrivateRepos() {
            try {
                const response = await axios.get(`${backend_url}/api/v1/repo/list`, {withCredentials: true});
                console.log('Repositories:', response.data);
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

    return (
        <div className='md:flex md:mt-[80px]'>
            <h1 className='block md:hidden text-3xl font-bold text-center mt-3 mb-8'>Github Readme Generator</h1>
            <div className='flex h-1/2 items-center justify-center md:inline-block md:ml-5 mt-15'>
                <div className='right-0 mr-5 bg-blue-900/10 p-4 rounded-t-4xl max-w-fit'>
                    <div className="avatar">
                        <div className="ring-slate-200 ring-offset-base-100 w-56 rounded-full ring-2 ring-offset-2">
                            <img src="https://img.daisyui.com/images/profile/demo/spiderperson@192.webp" />
                        </div>
                    </div>
                    <div className='bg-zinc-500 w-full h-30 mt-5 border-secondary border-[3px] rounded'>
                    </div>
                </div>
            </div>
            <div className='flex w-full justify-center md:inline-block md:mt-15 text-center md:bg-blue-900/5 md:rounded md:p-5'>
                <h1 className='hidden md:block text-6xl font-bold text-center mt-3 mb-8'>Github Readme Generator</h1>
                <fieldset className="mt-6 md:mt-3 ">
                    <legend className="fieldset-legend text-2xl  mt-3">Github Repositories</legend>
                    <div className='flex gap-4'>
                        <select defaultValue="Pick A Repository" className="select select-primary md:w-ful">
                            <option disabled={true}>Pick a Public Repository</option>
                            <option>Chrome</option>
                            <option>FireFox</option>
                            <option>Safari</option>
                        </select>
                        <select defaultValue="Pick the Repository" className="select select-primary md:w-ful">
                            <option disabled={true}>Pick a Private Repository</option>
                            <option>Chrome</option>
                            <option>FireFox</option>
                            <option>Safari</option>
                        </select>
                    </div>
                </fieldset>
                <div className='md:ml-40'>
                    <button
                        className="hidden md:flex btn btn-xl btn-outline btn-secondary items-center gap-2 mt-5 "
                    >
                        <Brain size={20} />
                        {'Generate Readme'}
                    </button>
                </div>
            </div>
            <RTE/>
        </div>
    )
}

export default Home