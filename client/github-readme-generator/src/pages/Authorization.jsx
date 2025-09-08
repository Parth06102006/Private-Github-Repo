import React, { useState, useContext, useEffect } from 'react'
import SplitText from '../components/SplitText'
import Lottie from 'lottie-react'
import animationData from '../../public/Blue Working Cat Animation.json'
import {Github} from 'lucide-react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { AuthContext } from '../context/authContext'

const Authorization = () => {
  const { setIsAuthorized, handleOAuthCallback } = useContext(AuthContext)
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if we have an OAuth code in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      console.log('OAuth code detected, processing callback...');
      setIsLoading(true);
      
      handleOAuthCallback().then((success) => {
        if (success) {
          console.log('OAuth callback successful');
          setIsAuthorized(true)
        } else {
          console.log('OAuth callback failed');
          setIsLoading(false);
        }
      }).catch((error) => {
        console.error('OAuth callback error:', error);
        setIsLoading(false);
      });
    }
  }, [handleOAuthCallback]);

  const handleAnimationComplete = () => {
    console.log('All letters have animated!');
  };

  async function login() {
    if (isLoading) return; // Prevent multiple clicks
    
    setIsLoading(true);
    try {
      console.log('Attempting to get GitHub auth URL...');
      const {data} = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/github`);
      
      console.log('Auth response:', data);
      
      if (data?.success && data?.data?.redirect_url) {
        console.log('Redirecting to:', data.data.redirect_url);
        window.location.href = data.data.redirect_url;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Error connecting to GitHub. Please try again.');
      setIsLoading(false);
    }
  }

  // Show loading state if processing OAuth callback
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  
  if (code && isLoading) {
    return (
      <div className='md:h-screen md:flex md:align-middle md:items-center md:justify-center'>
        <div className='text-center'>
          <div className='loading loading-spinner loading-lg mb-4'></div>
          <p className='text-white/80'>Processing GitHub authorization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='md:h-screen md:flex md:align-middle'>
      <div className='md:w-200 md:self-center'>
        <Lottie animationData={animationData} loop={true} autoplay={true}></Lottie>
      </div>
      <div>
        <h1 className='md:mt-40 flex-col justify-center items-center text-center p-5'>
          <SplitText
            text="Github Readme Generator"
            className="text-violet-400 md:text-7xl text-4xl font-extrabold text-center"
            delay={100}
            duration={0.6}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
            onLetterAnimationComplete={handleAnimationComplete}
          />
        </h1>
        <p className='md:max-w-300 mt-4 mr-3 text-white/80 text-center'>
          GitHub README Generator is a tool that helps developers quickly create professional, customized, and visually appealing README.md files for their GitHub projects. Instead of manually writing Markdown, the generator provides an easy interface to add project details (like title, description, tech stack, installation steps, usage, badges, and contributors) and instantly produces a well-structured README file. This saves time, ensures consistency, and makes your repositories stand out to collaborators and recruiters.
        </p>
        <div className='flex items-center justify-center mt-4'>
          <button 
            className={`flex gap-2 btn bg-violet-400 ${isLoading ? 'loading' : ''}`} 
            onClick={login}
            disabled={isLoading}
          >
            {!isLoading && <Github className='bg-black rounded-2xl p-0.5' size={30}/>}
            {isLoading ? 'Connecting...' : 'SignIn with Github'}
          </button>
        </div>
      </div>
      <Toaster/>
    </div>
  )
}

export default Authorization