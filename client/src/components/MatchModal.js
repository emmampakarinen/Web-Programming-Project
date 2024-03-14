import React, { useState } from 'react'
import { Box, Modal, Avatar } from '@mui/material'
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material';
import TextField from '@mui/material/TextField';
import SendIcon from '@mui/icons-material/Send';
import { IconButton } from '@mui/material';

/** Reference for building the modal: https://mui.com/material-ui/react-modal/ (Basic modal part) */

/** This component renders the modal that is shown for current user when they get a match with a user they liked.
 * The user also has the option to send a message to the match right away. Component accepts following props:
 * closeModal: boolean, open: boolean, user: current user object, 
 * match: user object without sensitive info (password, email, likes, matces), convo: conversation object
 */
function MatchModal({ closeModal, open, user, match, convo }) { 
    const { t } = useTranslation()
    const [message, setMessage] = useState("")
    const [msgCoutner, setMsgCounter] = useState(0)

    const theme = createTheme({
        typography: {
            fontFamily: 'Concert One'
    },});

    // Calling server to save the message current user has sent sent
    const sendMessage = () => {
        console.log(message)
        const token = localStorage.getItem("auth_token")
        const user = localStorage.getItem("user") // getting current user's id
        
        fetch("/users/api/newMessage", {
          method: "post",
          headers: { 
              "Authorization": "Bearer " + token,
              "Content-Type": "application/json" 
          },
          body: JSON.stringify({
            chatID: convo._id,
            sender: user,
            receiver: match._id, 
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
            console.log(data)
            setMessage("") // setting message as empty string so that the sent message disappears from textfield
            setMsgCounter(1)// settign msgCounter as one, because user can only send one message in the modal. 
            // An info about having sent the message is shown in the modal for user. 
            
        }).catch(error => {
            console.log("Error: ", error)
        })
    
      }

    return (
        <ThemeProvider theme={theme}>
            <Modal open={open}
                onClose={closeModal}>
                <Box sx={{
                    borderRadius: "20px", // rounded corners
                    flexDirection: "column",
                    justifyContent: "center",
                    position: 'absolute',
                    display: "flex",
                    top: '50%', // centering the modal
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    maxWidth: 500,
                    maxHeight: 700,
                    bgcolor: "#f8bbd0",
                    boxShadow: 24,
                    p: 4,
                }}>
                    <Box sx={{display: "flex", flexDirection: "row", justifyContent: "center", gap: 2 }}>

                        {user.image && 
                            <Avatar src={`/users/api/userImage/${user.image}`} sx={{ minWidth: 100, minHeight: 100, marginTop:1, marginBottom:1 }}>
                            </Avatar>
                        }
                        {!user.image && 
                            <Avatar sx={{ minWidth: 100, minHeight: 100, marginTop:1, marginBottom:1}}>
                            </Avatar>
                        }

                        {match.image && 
                            <Avatar src={`/users/api/userImage/${match.image}`} sx={{ minWidth: 100, minHeight: 100, marginTop:1, marginBottom:1}}>
                            </Avatar>
                        }
                        {!match.image && 
                            <Avatar sx={{ minWidth: 100, minHeight: 100, marginTop:1, marginBottom:1}}>
                            </Avatar>
                        }

                    </Box>
                    
                    
                    <Box display={"flex"} m={1} justifyContent={"center"} flexDirection={"column"} >
                        <Typography align="center" variant='h4'>
                            {t("swipe.match", { name: match.username })}
                        </Typography>

                        <Box mt={3} display={"flex"} flexDirection={"row"} justifyContent={"center"}>

                            {msgCoutner === 0 && 
                                <>
                                <TextField 
                                    fullWidth 
                                    id="outlined-basic" 
                                    label={t("chat.messageInput", {name: match.username})} 
                                    value={message} 
                                    onChange={(e) => setMessage(e.target.value)} 
                                />

                                {message.length > 0 && 
                                    <IconButton onClick={() => sendMessage()} variant="contained" color='secondary'>
                                        <SendIcon/>
                                    </IconButton>
                                }

                                {message.length === 0 && // when there is no text in the textField, the message can't be sent
                                    <IconButton disabled onClick={() => sendMessage()} variant="contained" color='secondary'>
                                        <SendIcon/>
                                    </IconButton>
                                }
                                </>
                            }
                            {msgCoutner !== 0 && // when a message is sent, the textinput is hidden and replaced with info that message has been sent successfully
                                <>
                                <Typography align="center">{t("swipe.matchMsgSent")}</Typography>
                                </>
                            }
                        </Box>
                    </Box>
                </Box>
            </Modal>
        </ThemeProvider>
    )
}

export default MatchModal