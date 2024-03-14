import React from 'react'
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Input from '@mui/material/Input';
import { useTranslation } from 'react-i18next';
import { createTheme, ThemeProvider, Typography } from '@mui/material';
import Alert from '@mui/material/Alert';

/* This component renders the profile for the logged in user. Here user can edit their information, 
like name, bio and age. They can also add an image for their profile which is also shown at
the swiping component. */
function Profile(props) {
    const [updateInfo, setUpdateInfo] = useState("") // for MUI alerts
    const [updateOK, setUpdateOK] = useState(false) // for MUI alerts

    // Where the user's input's in the profile are saved/set. userInfo is sent to server when update button is clicked
    const [userInfo, setUserInfo] = useState({ 
        age: 0,
        username: "",
        profileText: "",
        email: ""
    })
    const [userImg, setUserImg] = useState(null)
    const navigate = useNavigate()
    const { t } = useTranslation()

    // font for app
    const theme = createTheme({
        typography: {
            fontFamily: 'Concert One'
    },});

    

    useEffect(() => {
        // checking if user is authenticated
        if (!props.isUserLoggedIn) {
            navigate("/") // Redirect to frontpage if not authenticated
        }

        let mounted = true 
        
        // get user info from database to be shwon on the profile textfields
        const token = localStorage.getItem("auth_token");
        fetch("/users/api/user", {
            method: "get",
            headers: { "Authorization": "Bearer " + token },
            mode: "cors" 
        }).then(async response => {

            if(!response.ok) {
                const err = response;
                throw err;
            }
            return response.json()
        }).then(data => {

            setUserInfo({ // setting variables to alternatives (0 or empty string) if the age or 
                // username fields are empty. E-mail and username are always available as those 
                //checked and required at registration and e-mail is also needed for login. 
                age: data.age || 0,
                username: data.username,
                profileText: data.profileText || '',
                email: data.email
            })

            // user does not have an image when they first login, so checking first if image exists
            if(data.image) {
                const uniqueId = new Date().getTime() // adding an unique identifier when updating/adding 
                // user image. Needed this because if there wasn't a new identifier, the old picture 
                // (that was already replaced) kept uppearing most likely from web cache so adding a
                // unique id for each new image helped preventing this issue. 
                fetch(`/users/api/userImage/${data.image}?v=${uniqueId}`, { // getting the user image 
                    // based on the image's id and unique identifier (version in order to avoid using 
                    // cached picture). More about cache busting: https://www.keycdn.com/support/what-is-cache-busting 
                    method: "get",
                    mode: "cors" 
                }).then(async response => {
                    setUserImg(response.url) //"http://localhost:5000/users/api/userImage/" + id
                })
            }
            
        }).catch(error => {
            console.log("Error: ", error)
        })
 
        return () => { // cleanup function
            mounted = false 
        }
    }, [props.isUserLoggedIn, navigate]);


    // for setting a profile picture or replacing it with a new one
    // reference for displaying uploaded image in Avatar: https://stackoverflow.com/questions/61389790/display-an-image-in-avatar-react
    const handleImg = (event) => { 

        // call server to save image to datavase, and then set the picture
        let fd = new FormData()
        if (event.target.files.length > 0) {
            const file = URL.createObjectURL(event.target.files[0])
            setUserImg(file)
            fd.append("image", event.target.files[0])
        }

        const token = localStorage.getItem("auth_token")

        fetch("/users/api/userImage", {
            method: "post",
            headers: { "Authorization": "Bearer " + token },
            body: fd,
            mode: "cors" 
        }).then(async response => {

            if(!response.ok) {
                // if the response is not ok, error is thrown and shown for the user
                const err = await response.json()
                throw err
            }

            return response.json()
        }).then(data => {
            console.log(data.msg)
            setUpdateInfo("Profile picture updated!")
            setUpdateOK(true)
        }).catch(error => {
            console.log("Error when updating user image in Profile: ", error)
        })
    }

    // sending the new user info to server to be updated in the database for the current user
    const handleUserInfoUpdate = (event) => {
        event.preventDefault()
        const token = localStorage.getItem("auth_token")

        fetch("/users/api/user", {
            method: "post",
            headers: { 
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json" 
            },
            body: JSON.stringify(userInfo),
            mode: "cors" 
        }).then(async response => {

            if(!response.ok) {
                const err = await response.json()
                throw err
            }
            return response
            
        }).then(data => {
            console.log(data)
            setUpdateInfo("Profile information updated!")
            setUpdateOK(true)
        }).catch(error => {
            console.log('Error:', error.errors[0].msg)
            setUpdateInfo(error.errors[0].msg)
            setUpdateOK(false)
        })
    }

    return (
    <ThemeProvider theme={theme}>
        <Box>
            <Typography p={2} variant='h4'>{t("profile.title", { name: userInfo.username })}</Typography>
            <Paper elevation={3} sx={{ margin: 'auto', padding: 2, flexDirection:'column', maxWidth: { xs: '90%', sm: '80%', md: 600 }, display:'flex', alignItems:'center'}}>
                <Box display="flex" flexDirection="column" alignItems="center" mb={1}>
                    {/** If user image is available, it's shown - otherwise showing the default Avatar without image */}
                    {userImg && <Avatar src={userImg} sx={{ width: 200, height: 200, marginTop:1, marginBottom:1}}></Avatar>}
                    {!userImg && <Avatar sx={{ width: 200, height: 200, marginTop:1, marginBottom:1}}></Avatar>}
                    <input id="imageFile" type="file" accept="image/*,.pdf" placeholder="change image" onChange={handleImg}/>

                    <Box 
                        component={"form"}
                        sx={{
                            width: '100%',
                            '& .MuiTextField-root': { m: 1 },
                        }}
                    >
                        {/** some help for editing user info logic from here: https://stackoverflow.com/questions/65062187/need-to-have-the-user-be-able-to-edit-profile-with-an-edit-button  */}
                        <div>
                            {userInfo.username.length === 0 && <TextField
                                error
                                helperText="Username can't be empty"
                                required
                                id="name-required"
                                label={t("profile.nameInput")}
                                placeholder="Name for card"
                                value={userInfo.username}
                                onChange={(e) => setUserInfo({ ...userInfo, username: e.target.value })}
                                
                            />}
                            {userInfo.username.length !== 0 && <TextField
                                required
                                id="name-required"
                                label={t("profile.nameInput")}
                                placeholder="Name for card"
                                value={userInfo.username}
                                onChange={(e) => setUserInfo({ ...userInfo, username: e.target.value })}
                                
                            />}
                            <TextField
                                disabled
                                type="email"
                                id="email-required"
                                label={t("profile.emailInput")}
                                placeholder="Your E-mail"
                                value={userInfo.email}
                                onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                            />
                        </div>
                        <TextField
                            type='number'
                            required
                            id="age-required"
                            label={t("profile.ageInput")}
                            placeholder={t("profile.ageInput")}
                            value={userInfo.age}
                            onChange={(e) => setUserInfo({ ...userInfo, age: e.target.value })}
                        />
                        <br />
                        <TextField
                            multiline
                            maxRows={4}
                            id="profileText"
                            label={t("profile.profileTextInput")}
                            placeholder={t("profile.profileTextPlaceholder")}
                            value={userInfo.profileText}
                            onChange={(e) => setUserInfo({ ...userInfo, profileText: e.target.value })}
                        />
                        <br />
                        <Input type="submit" value={t("profile.update")} onClick={handleUserInfoUpdate} />
                    </Box>
                </Box>
                {updateInfo && !updateOK &&  <Alert severity="error" >{updateInfo}</Alert> || updateInfo && updateOK && <Alert severity="success" >{updateInfo}</Alert>}
                
            </Paper>
        </Box>
    </ThemeProvider>
    )
}

export default Profile