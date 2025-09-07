import React from 'react'
import SplitText from '../components/SplitText'
import Lottie from 'lottie-react'
import animationData from '../../public/Blue Working Cat Animation.json'
import {Github} from 'lucide-react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'

const Authorization = () => {
  const handleAnimationComplete = () => {
    console.log('All letters have animated!');
  };

  async function login()
  {
    try {
      const {data} = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/github`);
      window.location.href = `${data.data.redirect_url}`
    } catch (error) {
      toast.error('Error Authorizing User');
    }
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
            <button className='flex gap-2 btn bg-violet-400 ' onClick={login}><Github className='bg-black rounded-2xl p-0.5' size={30}/>SignIn with Github</button>
          </div>
      </div>
      <Toaster/>
    </div>
  )
}

export default Authorization