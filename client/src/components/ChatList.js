import React, {useState, useEffect} from 'react'
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import { useNavigate } from "react-router-dom";
import Box from '@mui/material/Box';
import UserModal from './UserModal';
import { createTheme, ThemeProvider } from '@mui/material';

// Refernce for creating the list: https://mui.com/material-ui/react-list/ (ineractive part)

/* This component is for user to see a list of matches who they can choose to chat with. 
Accepts following props: 
isMediumUp (for knowing the screensize for rendering purposes), setUpdate (trigger for fetching messages
  when another chat is activated), activeChat, setActiveChat */ 
function ChatList(props) {
  const [matches, setMatches] = useState([]) // Initializing matches as an empty list
  const [open, setOpen] = useState(false)
  const [userModal, setUserModal] = useState(null)
  const navigate = useNavigate()

  const theme = createTheme({
    typography: {
        fontFamily: 'Concert One'
  },});

  // fetching matches from database
  useEffect(() => {
    let mounted = true 

    const token = localStorage.getItem("auth_token") // token needed for getting the matches from server

    // get list of conversations with matches from database
    fetch("/users/api/conversations", {
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
        let matchIDs = data.matches
        if (matchIDs.length === 0) {
          return
        }

        // fecth each match's info from database and set it
        const userInfos = matchIDs.map(id => 
          fetch(`/users/api/user/${id}`, {
            method: "GET",
            headers: { "Authorization": "Bearer " + token },
            mode: "cors"
          })
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok')
            }
            return response.json()
          })
        )

        Promise.all(userInfos).then(users => { // reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all 
          // In this part I'm adding the correct chatID to each user, so that we know which chat's messages to load when user clicks a match on the chatlist
          for (let chat of data.chats) {
            for (let user of users) {
              if (chat.participants.includes(user._id)) { // if match is in the chat participant-list, adding the chatID as an attribute for user. 
                user.convo = chat._id
              }
            }
          }
          props.setActiveChat(users[0]) // initializing the active chat as the first match of chatlist
          if (mounted) {
            setMatches(users)
          }
        })
    }).catch(error => {
        console.log("Error: ", error)
    })

    // Cleanup function to set mounted to false when component unmounts
    return () => {
      mounted = false
    };

  }, [navigate])


  // if chat is changed, new active chat is set and update is set as true which triggers other components to refresh
  const activateChat = (user) => { 
    props.setActiveChat(user)
    props.setUpdate(true)
  }

  const openModal = (user) => { 
    // when user double clikcs an element on the chat list, user modal is opened where there is match's
    // profile infomation listed
    setOpen(true)
    setUserModal(user)
  }
  const closeModal = () => setOpen(false)

  const colorTheme = createTheme({ // colors for UI. Helps current user to distinguish which chat is currently open for them on the list
    palette: {
      primary: {
        main: '#b3e5fc',
      },
      secondary: {
        main: '#29b6f6',
      },
    },
  });

  const listItems = matches.map(user =>
    <ListItem onDoubleClick={() => openModal(user)} onClick={() => activateChat(user)} key={user._id} 
      sx={{ 
        justifyContent: "center", 
        backgroundColor: props.activeChat && user._id === props.activeChat._id ? colorTheme.palette.secondary.main : colorTheme.palette.primary.main, 
        borderRadius:"10px", // conditionally selecting color for active and non-active chats on the list
        p:1, 
        marginTop:1, 
        mr: 1,
        maxWidth:"50vw"
        }}>
      <ListItemButton>
        <ListItemAvatar>
          {props.isMediumUp && user.image && <Avatar src={`/users/api/userImage/${user.image}`} >
          </Avatar>}
          {!props.isMediumUp && user.image && <Avatar src={`/users/api/userImage/${user.image}`} sx={{  flexGrow: 1, minWidth: 50, minHeight: 50, marginTop:1, marginBottom:1}}>
          </Avatar>}

          {props.isMediumUp && !user.image && <Avatar/>}
          {!props.isMediumUp && !user.image && <Avatar sx={{ flexGrow: 1, minWidth: 50, minHeight: 50, marginTop:1, marginBottom:1}}>
          </Avatar>}
        </ListItemAvatar>
        {props.isMediumUp && <ListItemText
          primary={user.username}
        />}
      </ListItemButton>
    </ListItem>
  );


  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', maxHeight:"calc(100vh - 64px)",  overflow: 'auto' }} > {/** Subtracting the height of header */}
        <List sx={{ overflow: 'auto' }}>
          {listItems}
        </List>
        {userModal && <UserModal closeModal={closeModal} open={open} user={userModal} />}
      </Box>
    </ThemeProvider>
  )
}

export default ChatList