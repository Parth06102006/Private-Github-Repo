import { useState, createContext } from "react";
import axios from 'axios'
import toast from 'react-hot-toast'

export const AuthContext = createContext({
    isAuthorized: false,
    setIsAuthorized: () => {},
    checkAuth: async () => {},
    handleOAuthCallback: async () => {}
});

export function AuthContextProvider({ children }) {
    const [isAuthorized, setIsAuthorized] = useState(false);

    const checkAuth = async () => {
        console.log('BACKEND URL: ', import.meta.env.VITE_BACKEND_URL)
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/check`,{ withCredentials: true })
            console.log(data)
            if (data?.success) {
                setIsAuthorized(true)
                return true;
            } else {
                setIsAuthorized(false);
                return false;
            }
        } catch (error) {
            console.log('Auth check failed:', error.response?.status || error.message)
            setIsAuthorized(false);
            if (error.response?.status === 401) {
                toast.error('User is not Authenticated')
            }
            return false
        }
    }

    const handleOAuthCallback = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (!code || isAuthorized) return false;

        try {
            console.log('Processing OAuth callback with code:', code);
            const backend_url = import.meta.env.VITE_BACKEND_URL;
            const response = await axios.post(
                `${backend_url}/api/v1/auth/getToken?code=${code}`, 
                {}, 
                { withCredentials: true }
            );
            
            console.log('OAuth callback response:', response.data);
            
            if (response.data?.success) {
                setIsAuthorized(true);
                toast.success('Successfully authorized with GitHub!');
                
                // Clean up URL
                const url = new URL(window.location);
                url.searchParams.delete('code');
                window.history.replaceState({}, document.title, url);
                
                return true;
            } else {
                throw new Error('Token exchange failed');
            }
        } catch (error) {
            console.error('OAuth callback error:', error);
            toast.error('Failed to authorize with GitHub. Please try again.');
            setIsAuthorized(false);
            return false;
        }
    }

    return (
        <AuthContext.Provider value={{ 
            isAuthorized, 
            setIsAuthorized, 
            checkAuth, 
            handleOAuthCallback 
        }}>
            {children}
        </AuthContext.Provider>
    )
}