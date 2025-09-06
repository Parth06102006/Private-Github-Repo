import './App.css'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Authorization from './pages/Authorization'
import Home from './pages/Home'
import Error from './pages/Error'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/auth' element={<Authorization/>}/>
        <Route path='*' element={<Error/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
