import { useState } from "react";
import { createContext } from "react";
import axios from 'axios'
import toast from 'react-hot-toast'

export const AuthContext = createContext({
    isAuthorized : false,
    setIsAuthorized : ()=>{},
    checkAuth:async ()=>{}
});

export function AuthContextProivider({children}){
    const [isAuthorized , setIsAuthorized] = useState(false);
    const checkAuth = async()=>
    {
        try {
            const {data} = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/check`,{},{withCredentials:true})
            console.log(data)
            if(data?.success){
                setIsAuthorized(true)
            }
            else{
                setIsAuthorized(false);
            }
        } catch (error) {
            setIsAuthorized(false);
            toast.error(error.message)
        }
    }
    return (<AuthContext.Provider value={{isAuthorized,setIsAuthorized,checkAuth}}>{children}</AuthContext.Provider>)
}