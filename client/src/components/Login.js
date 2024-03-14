import { React, useState, useEffect } from 'react'
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom'; // https://reactrouter.com/en/main/components/link
import Alert from '@mui/material/Alert'; // https://mui.com/material-ui/react-alert/#basic-alerts
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import TextField from '@mui/material/TextField';
import { Box, Typography } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material';

// idea to use useNavigate() from here: https://www.makeuseof.com/redirect-user-after-login-react/

/** This component renders the login-page. Accepts onLoginSuccessful-function and isUserLoggedIn-boolean value */
function Login(props) { 
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loginError, setError] = useState('')
    const navigate = useNavigate()

    const { t } = useTranslation()

    // setting new value when the input field changes
    const handleEmailChange = (e) => setEmail(e.target.value) 
    const handlePasswordChange = (e) => setPassword(e.target.value)

    // font for app
    const theme = createTheme({
        typography: {
            fontFamily: 'Concert One'
    },});


    const storeToken = (token, id) => {
        localStorage.setItem("auth_token", token)
        localStorage.setItem("user", id) // by saving the logged in-user's _id to local storage, we can access the id easier in other components (rather than
        // having to fetch it from server continuously)
    }

    useEffect(() => { // when the logging is successful or if user is already logged in, redirecting to user's profile
        if (props.isUserLoggedIn) {
            navigate("/profile")
        }
    }, [props.isUserLoggedIn, navigate])

    // calling server to authenticate login and to send back the authentication token
    const handleLogin = () => {
        fetch("/users/login", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                "email": email,
                "password": password
            }),
            mode: "cors" 
        }).then(async response => {
            if (!response.ok) {
              // if the response status code is not ok, error is thrown and shown for the user
              const err = await response.json()
              throw err
            }
            return response.json()
          }).then(data => {
            
            // on login succesful the storeToken fuction is called
            if(data.token) {
                storeToken(data.token, data.userid)
                props.onLoginSuccessful() // now the isUserLoggedIn = true and useEffect on line 37 is triggered
            } else {
                console.log("Error, no token received.")
            }

          }).catch(error => {
            if(error.msg) {
              console.error('Error:', error.msg);
              setError(error.msg) // setting error message to be shown for user
            } else {
                console.log(error) // if error is something else than related to wrong credentials
            }
          });
    }


    return (
        <ThemeProvider theme={theme}>
            <Box display="flex" flexDirection="column" alignItems="center">
                <Typography p={3} variant='h3'>{t("login.title")}</Typography>
                <TextField margin='normal' type="email" id="user-email" placeholder={t("login.email")} onChange={handleEmailChange}></TextField>
                <TextField type="password" id="user-password" placeholder={t("login.password")} onChange={handlePasswordChange}></TextField>
                <Box p={1}>
                    <Button variant='contained' type='submit' onClick={()=> handleLogin()}>{t("login.submit")}</Button>
                </Box>
                
                {loginError && <Alert severity="error">{loginError}</Alert>} {/** Showing an alert to user informing about wrong credentials */}
                <Box mt={5}>
                    <Typography>{t("login.question")}</Typography>
                    <Button variant="outlined" component={Link} to="/Register">{t("register button")}</Button> 
                </Box>
            </Box>
        </ThemeProvider>
    )
}

export default Login