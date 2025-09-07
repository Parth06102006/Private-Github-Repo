import './App.css'
import { useContext } from 'react'
import {BrowserRouter,Routes,Route,Navigate} from 'react-router-dom'
import Authorization from './pages/Authorization'
import Home from './pages/Home'
import Error from './pages/Error'
import { AuthContext,AuthContextProivider } from './context/authContext'
import { useEffect } from 'react'

function App() {

  const {isAuthorized,checkAuth} = useContext(AuthContext);
  useEffect(()=>{
    checkAuth()
  },[]);

  return (
    <BrowserRouter>
    <AuthContextProivider>
        <Routes>
          <Route path='/' element={isAuthorized ? <Home/> : <Navigate to="/auth"/>}/>
          <Route path='/auth' element={!isAuthorized ? <Authorization/> : <Navigate to="/"/>}/>
          <Route path='*' element={<Error/>}/>
        </Routes>
      </AuthContextProivider>
    </BrowserRouter>
  )
}

export default App
