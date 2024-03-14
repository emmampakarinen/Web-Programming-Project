import { React, useState, useEffect } from 'react'
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom'; // https://reactrouter.com/en/main/components/link
import Alert from '@mui/material/Alert'; // https://mui.com/material-ui/react-alert/#basic-alerts
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import TextField from '@mui/material/TextField';
import { Box, Typography } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material';

/** This component renders the register page and handles creating new user by calling the server. Accepts isUserLoggedIn prop.  */
function Register(props) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [registerError, setError] = useState('')
  const { t } = useTranslation()

  // setting new value when the input field changes
  const handleEmailChange = (e) => setEmail(e.target.value) 
  const handlePasswordChange = (e) => setPassword(e.target.value)
  const handleNameChange = (e) => setUsername(e.target.value)
  
  const navigate = useNavigate()

  // font for typography elements in the app
  const theme = createTheme({
    typography: {
        fontFamily: 'Concert One'
  },});

  useEffect(() => {
    if (props.isUserLoggedIn) { // if user is logged in, redirecting to user's profile
        navigate("/profile")
    }
  }, [props.isUserLoggedIn, navigate])


  const handleRegister = () => {
      fetch("/users/register", { // calling the server to add data (=new user) to database
          method: "POST",
          headers: {
              "Content-type": "application/json"
          },
          body: JSON.stringify({
            "username": username,
            "email": email,
            "password": password
          }),
          mode: "cors" 
      }).then(async response => {

        if (!response.ok) {
          // if the response is not ok, error is thrown and shown for the user
          const err = await response.json()
          throw err
        }

        return response.json()
      }).then(data => {

        console.log("data", data.message)
        navigate("/login") // redirecting user to the login page

      }).catch(error => {

        if(error.errors) {
          console.error('Error:', error.errors[0].msg)
          setError(error.errors[0].msg) // setting the first error on the (possible) array to be shown for suer
        } else {
          console.log(error) // if error is something else than related to insufficient credentials
          if(error.msg) { // if the e-mail was already in use
            setError(error.msg)
          }
        }
      });
  }


  return (
    <ThemeProvider theme={theme}>
      <Box display="flex" flexDirection="column" alignItems="center">
          <Typography p={3} variant='h3'>{t("register.title")}</Typography>
          <TextField type="username" id="user-name" placeholder={t("register.username")} onChange={handleNameChange}></TextField>
          <TextField type="email" id="user-email" placeholder={t("register.email")} onChange={handleEmailChange}></TextField>
          <TextField type="password" id="user-password" placeholder={t("register.password")} onChange={handlePasswordChange}></TextField>
          <Box p={1}>
            <Button variant='contained' type='submit' onClick={()=> handleRegister()}>{t("register.submit")}</Button>
          </Box>
          {registerError && <Alert severity="error" >{registerError}</Alert>}
          <Box mt={5}>
              <Typography>{t("register.question")}</Typography>
              <Button variant="outlined" component={Link} to="/Login">{t("login button")}</Button> 
          </Box>
      </Box>
    </ThemeProvider>
  )
}

export default Register