import TextField from '@mui/material/TextField';
import React, {useState} from 'react'
import Grid from '@mui/material/Grid';
import { IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SendIcon from '@mui/icons-material/Send';
import { useTranslation } from 'react-i18next';
import { createTheme, ThemeProvider } from '@mui/material';


/** This component is for rendering the chat input to be shown for current user, sending messages to match and update-button for
 * receiving new messages. Accepted props: setUpdate, activeChat
 */
function ChatInput(props) {
  const [message, setMessage] = useState("")
  const { t } = useTranslation()

  const theme = createTheme({
    typography: {
        fontFamily: 'Concert One'
  },});
  
  const sendMessage = () => {
    console.log(message)
    const token = localStorage.getItem("auth_token")
    const user = localStorage.getItem("user")
    fetch("/users/api/newMessage", {
      method: "post",
      headers: { 
          "Authorization": "Bearer " + token,
          "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        chatID: props.activeChat.convo,
        sender: user,
        receiver: props.activeChat._id, 
        message: message,
        created: new Date().getTime(),
        read: false
      }),
      mode: "cors" 
    }).then(async response => {
        
        if(!response.ok) {
            const err = response
            throw err
        }
        return response
    }).then(data => {
        setMessage("") // setting message as empty string so that the sent message disappears from textfield
        
    }).catch(error => {
        console.log("Error: ", error)
    })

    props.setUpdate(true) // setting update as true --> chatWindow fetches the just sent message data
  }


  return (
    <ThemeProvider theme={theme}>
      <Grid component={"form"} container flex={1} pacing={1} flexDirection={'row'} sx={{height:"10vh"}}>
        <Grid margin="auto" item xs={2} justifyContent={"center"}>
          {props.activeChat && <IconButton color="secondary" aria-label="refresh" onClick={() => props.setUpdate(true)}>
            <RefreshIcon />
          </IconButton>}
        </Grid>
        <Grid item xs={8}>
          {props.activeChat && (
            <TextField fullWidth id="outlined-basic" label={t("chat.messageInput", {name: props.activeChat.username})} value={message} onChange={(e) => setMessage(e.target.value)} />
          )}
          

        </Grid>
        {props.activeChat && ( // when there is no content in the textfield, send-button is disabled as user can't send empty messages
          <Grid margin="auto" item xs={2}>
            {message.length > 0 && <IconButton onClick={() => sendMessage()} variant="contained" color='secondary'><SendIcon/></IconButton>}
            {message.length === 0 && <IconButton disabled onClick={() => sendMessage()} variant="contained" color='secondary'><SendIcon/></IconButton>}
          </Grid>
        )}
      </Grid>
    </ThemeProvider>
  )
}

export default ChatInput