import './App.css';
import { useState } from "react";
import { Routes, Route, useNavigate} from 'react-router-dom'
import Login from './components/Login'
import Register from './components/Register'
import Profile from './components/Profile'
import FrontPage from './components/FrontPage'
import Swipe from './components/Swipe'
import Header from './components/Header'
import Chats from './components/Chats'
import Settings from './components/Settings';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';


function App() {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(!!localStorage.getItem("auth_token")) // using the session storage to get the initial state's value. Using double NOT to have a boolean value for the state value. Reference for checking if user is logged in logic: https://stackoverflow.com/questions/71560284/how-do-i-display-logut-button-once-i-login-to-the-main-ui 

  function onLoginSuccessful() {
    setIsUserLoggedIn(true) // updating the state to notify React the value has changed and user is redirected to profile (in Login-component)
  }

  const sizeTheme = useTheme()
  let isMediumUp = useMediaQuery(sizeTheme.breakpoints.up('sm')) // checking size of screen for rendering purposes of the header

  const navigate = useNavigate();

  // when user logs out, the authentication token and user's id are removed from the local storage.
  const handleLogout = () => { 
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user")
    setIsUserLoggedIn(false) 
    navigate("/") // redirecting user to the front page on logout
  }

  return (
    <div className="App">
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Header isMediumUp={isMediumUp} isUserLoggedIn={isUserLoggedIn} handleLogout={handleLogout} /> {/* passing  the state value as a prop to header for correct rendering purposes */}
          <Routes>
            {/* passing the onLoginSuccessful as a prop to componenets to know whether it is okay to render or redirect the user to another page */}
            <Route path="/" element={<FrontPage isUserLoggedIn={isUserLoggedIn}/>} />
            <Route path="/login" element={<Login onLoginSuccessful={onLoginSuccessful}  isUserLoggedIn={isUserLoggedIn} />} /> 
            <Route path="/register" element={<Register isUserLoggedIn={isUserLoggedIn} />} />
            <Route path="/profile" element={<Profile isUserLoggedIn={isUserLoggedIn} />} />
            <Route path="/settings" element={<Settings isUserLoggedIn={isUserLoggedIn} handleLogout={handleLogout} />} />
            <Route path="/swipe" element={<Swipe isUserLoggedIn={isUserLoggedIn} />} />
            <Route path="/chats" element={<Chats isUserLoggedIn={isUserLoggedIn} />} />
          </Routes>
      </Box>
    </div>
  );
}

export default App;
