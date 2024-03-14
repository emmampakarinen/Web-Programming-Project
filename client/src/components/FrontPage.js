import React, {useEffect} from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import { createTheme, ThemeProvider, Box } from '@mui/material';
import Typography from '@mui/material/Typography';

/* The frontpage of the web application. Here the user can choose to either naviagte to register page or login page. */
function FrontPage(props) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const theme = createTheme({
    typography: {
        fontFamily: 'Concert One'
  },});

  useEffect(() => { // if user is logged in, redirecting to user's profile
    if (props.isUserLoggedIn) {
        navigate("/profile")
    }
  }, [props.isUserLoggedIn, navigate])

  return (
    <ThemeProvider theme={theme}>
      <Box display={"flex"} height={"100vh"} justifyContent={"space-evenly"} alignItems={"center"} flexDirection={"column"} >
          <Typography variant="h3">{t('front page')}</Typography>
          <Box>
            <Typography variant="h4">{t('front page text')}</Typography>

            {/* When pressing either one of the buttons, the user is taken to corresponding page */}
            <Button sx={{m:1}} variant="contained" component={RouterLink} to="/Login">{t("login button")}</Button> 
            <Button variant="contained" component={RouterLink} to="/Register">{t("register button")}</Button> 
          </Box>
        </Box>
    </ThemeProvider>
  )
}

export default FrontPage