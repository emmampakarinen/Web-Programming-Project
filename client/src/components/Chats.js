import React, {useState, useEffect} from 'react'
import ChatWindow from './ChatWindow'
import ChatList from './ChatList'
import Grid from '@mui/material/Grid';
import { useNavigate } from "react-router-dom";
import ChatInput from './ChatInput'
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider, Box } from '@mui/material';

/** This component is for rendering the chat element */
function Chats(props) {
  const [activeChat, setActiveChat] = useState(null) // activeChat is a user object with corresponding chatID
  const [update, setUpdate] = useState(true) // boolean check for chatwinow to know when to update the view
  const sizeTheme = useTheme() // breakpoint reference: https://mui.com/material-ui/customization/breakpoints/ 
  const { t } = useTranslation()
  const navigate = useNavigate()

  const theme = createTheme({
    typography: {
        fontFamily: 'Concert One'
  },});

  let isMediumUp = useMediaQuery(sizeTheme.breakpoints.up('sm')) // useMediaQuery "allows the rendering of components based on whether the query matches or not." Media query reference: https://mui.com/material-ui/react-use-media-query/

  useEffect(() => { // if user is not logged in, redirected to front page
    if (!props.isUserLoggedIn) {
        navigate("/")
    }
  }, [props.isUserLoggedIn, navigate])

  return (
    <ThemeProvider theme={theme}>
      {!activeChat && // when there is no activeChat set, i.e., there are no chats available, info is shown to user
        <Box height={"100vh"} display={"flex"} alignItems={"center"} justifyContent={"center"} >
          <Typography variant='h4'>{t("chat.noChats")}</Typography>
        </Box>
      }
      
      <Grid container spacing={2} flexDirection={'row'} sx={{ height: '100vh' }}> 
        <Grid item xs={4}>
          <ChatList isMediumUp={isMediumUp} setUpdate={setUpdate} activeChat={activeChat} setActiveChat={setActiveChat}></ChatList>
        </Grid>

        <Grid item xs={8} >    
          {activeChat && <ChatWindow isMediumUp={isMediumUp} activeChat={activeChat} update={update} setUpdate={setUpdate}></ChatWindow>}
          <ChatInput setUpdate={setUpdate} activeChat={activeChat} ></ChatInput>
        </Grid>
      </Grid>
    </ThemeProvider>
  )
}

export default Chats