import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useState} from 'react'
import { createTheme, ThemeProvider } from '@mui/material';
import { useNavigate } from "react-router-dom";

/** In this component, user can change language of the UI in either finnish or english.  */
function Settings(props) {
    const navigate = useNavigate()

    // this is for the "delete user"-buttons. If user has clicked the "delete user"-button once, another one appears and asks to confrim that the user actually wants to delete their account
    const [clickCount, setClickCount] = useState(0) 

    const { t, i18n } = useTranslation()

    const changeLanguage = (lang) => { // when user presses language button, the UI changes language to the clicked language.
        i18n.changeLanguage(lang)
    }

    const theme = createTheme({
        typography: {
            fontFamily: 'Concert One'
    },});


    useEffect(() => { // if user is not logged in, redirected to front page
        if (!props.isUserLoggedIn) {
            navigate("/")
        }
    }, [props.isUserLoggedIn, navigate])


    const deleteUser = () => {
        const token = localStorage.getItem("auth_token")
        const userID = localStorage.getItem("user")
        
        fetch(`/users/delete/${userID}`, {
            method: "get",
            headers: { "Authorization": "Bearer " + token },
            mode: "cors" 
      }).then(async response => {
            if (!response.ok) {
                // If the response status code is not ok, error is thrown
                const err = response
                throw err
            }
            return response.json()
        }).then(data => {
            props.handleLogout()
            setClickCount(0)
        }).catch(error => {
            console.log("Error: ", error)
        })
        
    }



    return (
        <ThemeProvider theme={theme}>
            <Typography p={1} variant='h3'>{t("settings.title")}</Typography>
            <Box height={"100vh"} justifyContent={"center"} alignItems={"center"} flexDirection={"column"} display={"flex"}>
                <Box>
                    <Typography>{t("settings.changeLang")}</Typography>
                    <Button id="fi" color="inherit" variant='outlined' onClick={()=> changeLanguage("fi")}>FI</Button>
                    <Button id="en" color="inherit" variant='outlined' onClick={()=> changeLanguage("en")}>EN</Button>
                </Box>
                <Box m={5}>
                    {clickCount === 0 && <Button color="error" variant="contained" onClick={() => setClickCount(1)}>{t("settings.delete")}</Button>}

                    {clickCount !== 0 && <Button color="error" variant="contained" onClick={() => deleteUser()}>{t("settings.confirmDel")}</Button>}
                </Box>
                
            </Box>
        </ThemeProvider>
    )
}

export default Settings