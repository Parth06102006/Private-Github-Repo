import './App.css'
import { useContext } from 'react'
import Authorization from './pages/Authorization'
import Home from './pages/Home'
import { AuthContext } from './context/authContext'
import { useEffect } from 'react'

function App() {
    const { isAuthorized, checkAuth } = useContext(AuthContext);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (!code) {
            checkAuth();
        }
    }, [checkAuth]);

  return (
    <div>
        {isAuthorized ? <Home /> : <Authorization />}
    </div>
  )
}

export default App
