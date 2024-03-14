import React, { useEffect, useState, useRef } from 'react'
import Box from '@mui/material/Box';
import { Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material';

// Help for the desing of the chat elements from here: https://frontendshape.com/post/create-a-chat-ui-in-react-with-mui-5 

/** This component renders the chatwindow and messages between current user and their match.
 * Accepts following props: isMediumUp (size of screen), activeChat, update, setUpdate
 */
function ChatWindow(props) {
  const [messages, setMessages] = useState([]) // messages is an array of Messages-objects from database
  const { t } = useTranslation()

  const div = useRef(null) // using useref for creating an automatic scroll to the beginning of the chat to show the newest messages. Reference: https://simplefrontend.com/react-scroll-to-bottom/ 

  useEffect(() =>
    div.current.scrollIntoView({ behavior: "smooth", block: "end" })
  ) // useEffect will automatically scroll to bottom

  const theme = createTheme({
    typography: {
        fontFamily: 'Concert One'
  },})

  useEffect(() => {
    let token = localStorage.getItem("auth_token")

    if (props.update) {
      fetch(`/users/api/messages/${props.activeChat.convo}`, {
        method: "get",
        headers: { "Authorization": "Bearer " + token },
        mode: "cors" 
      }).then(async response => {
          
          if(!response.ok) {
              const err = response
              throw err
          }

          return response.json()
      }).then(data => {
          
          if (data.messages) {
            setMessages(data.messages) // setting the messages - if any
          }
      }).catch(error => {
          console.log("Error: ", error)
      })
    }
    
    props.setUpdate(false) // setting update as false after having fetched messages for current active chat
  }, [props.activeChat, props.update]) // fetching messages every time chat is changed and update is changed in other components

  // creating message components to show on the window from the ones from database
  const Message = ({ message }) => {

    // using this variable to conditionally render the messages (current user's messages are located on the right side and receiving 
    // messages on the left, also color coordinated).
    const user = message.sender === localStorage.getItem('user') 

    const dateString = message.created
    const date = new Date(dateString)

    // formatting date to more readable form to show on the message
    const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    const formattedDate = date.toLocaleDateString('en-US', options)

    return (
      <Box sx={{ display: "flex", justifyContent: user ? "flex-end" : "flex-start", mb: 2}} > 
        <Paper elevation={6} square={false}  sx={{  maxWidth:200, flexDirection:'column', p: 1, backgroundColor: user ? "secondary.light" : "primary.light", wordWrap: 'break-word', borderRadius: user ? "20px 20px 0px 20px" : "20px 20px 20px 0px"}}>
          <Typography variant='p' gutterBottom>
            {message.message}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom>
            {formattedDate}
          </Typography>
        </Paper>
        
      </Box>
    ) 
  }

  return (
    <ThemeProvider theme={theme}>
        <Box alignContent='flex-end' sx={{ width: '100%', display:'flex', height:'calc(100vh - 64px - 70.5px )', flexDirection:'column'}}>
        {props.activeChat && 
            <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
              {messages.map((msg) => (
                msg ? (<Message key={msg._id} message={msg} />) : null
              ))}
              <div ref={div} />
              {messages.length === 0 && <Typography variant='h5'>{t("chat.noMessages")}</Typography>} {/** if there are no messages, info 
               * text is shown to the user */}
          </Box>
        }
        </Box>
    </ThemeProvider>
   
  )
}

export default ChatWindow