import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar'; 
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import {Link} from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect} from 'react'
import { createTheme, ThemeProvider } from '@mui/material';

// avatar ref: https://mui.com/material-ui/react-avatar/

// reference for building the header. https://mui.com/material-ui/react-app-bar/ (app bar with responsive menu)


/* Renders the application's header. Accepts authentication details, size of screen (for responsiveness) and logout function as the logout button is located in header. */
function Header(props) { 

    // These are used for the 2 menus in the header. 
    const [anchorElNav, setAnchorElNav] = useState(null)
    const [anchorElUser, setAnchorElUser] = useState(null)

    const [userImg, setUserImg] = useState(null)

    const { t, i18n } = useTranslation()

    const changeLanguage = (lang) => { // when user presses language button on the header, the UI changes language to the clicked language.
        i18n.changeLanguage(lang)
    }

    // these are for showing the page names in different languages
    const pages = [t("nav-menu.swipe"), t("nav-menu.chat")]
    const settings = [t("profile-menu.profile"), t("profile-menu.settings")]

    // these are for correct url (e.g., localhost:3000/settings instead of navigating to /asetukset when language is set as finnish) when user presses the page name in a dropdown menu
    const linkNamePages = ["swipe", "chats"]
    const linkNameSettings = ["profile", "settings"]

    // Application name typography
    const titleTheme = createTheme({
        typography: {
            fontFamily: 'chewy'
    },});

    // Typography for all other text in the program
    const theme = createTheme({
        typography: {
            fontFamily: 'Concert One'
    },});


    useEffect(() => {
        let mounted = true 

        const token = localStorage.getItem("auth_token")
        if (token) { // if token is found (i.e., user is logged in) user data is fetched for the header
            fetch("/users/api/user", {
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
                
                if(data.image) {
                    const uniqueId = new Date().getTime() // adding unique identifier for each user image. Needed this because if I didn't have this the old picture (for example from previous logged in user) kept uppearing most likely from web cache(?) so adding unique id for each new image helped preventing this issue. 
                    fetch(`/users/api/userImage/${data.image}?v=${uniqueId}`, { // getting the user image based on the image's id. Using uniqueID as versioning to avoid caching and using previously loaded picture like explained above. 
                        method: "get",
                        mode: "cors" // "Cross-origin resource sharing", uses additional HTTP headers to tell web browser to allow applications to interact with resources in a different domain. Reference: https://aws.amazon.com/what-is/cross-origin-resource-sharing/ 
                    }).then(async response => {
                        setUserImg(response.url) //"http://localhost:5000/users/api/userImage//" + id
                    })
                } else {
                    setUserImg(null)
                }
                
            }).catch(error => {
                console.log("Error: ", error)
            })
    
            return () => { // cleanup function
                mounted = false 
            }
        }
        
    }, [props.isUserLoggedIn]); // updating every time new user logs in

    // the menu opens up at the location of the click, i.e., one of the icon buttons (avatar or menu icon)
    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget)
    };

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget) // opens the menu
      };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null)
    };

    const handleCloseUserMenu = () => {     
        setAnchorElUser(null) // closes the menu
    };

    

    return (
        <ThemeProvider theme={theme}>
            <AppBar position='static'>
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{flexGrow: 1, display: 'flex', justifyContent: 'flex-start' }}>

                        {!props.isUserLoggedIn && ( // when user is not logged in, the language buttons are shown in the header for the user. 
                        // When logged in, the possibility to change language is found from settings-component. 
                            <>
                            <Button id="fi" color="inherit" onClick={()=> changeLanguage("fi")}>FI</Button> 
                            <Button id="en" color="inherit" onClick={()=> changeLanguage("en")}>EN</Button>
                            </>
                        )}

                        {props.isUserLoggedIn && ( 
                            // when user is logged in, the page renders 2 menus: user menu and navigation menu (to navigate to chats or swiping).
                            // Here is rendered the navigation menu. 
                            <> 
                            <IconButton
                                size="large"
                                onClick={handleOpenNavMenu} // on click, the navigation menu is opened and anchored to this IconButton
                                color="inherit"
                            >
                                <MenuIcon />
                            </IconButton>
                            <Menu
                                anchorEl={anchorElNav} // menu is anchored to IconButton
                                open={Boolean(anchorElNav)} 
                                onClose={handleCloseNavMenu}
                            >
                                {pages.map((page, index) => ( /* adding elements to list and creating links to them for user to navigate, reference to using Link component in the menuItems: https://stackoverflow.com/questions/47873566/how-navigate-using-the-menuitem-material-ui-v1 -- helped with performance */
                                    <MenuItem key={page} onClick={handleCloseNavMenu} component={Link} to={`/${linkNamePages[index]}`}>
                                        <Typography textAlign="center">{page}</Typography>
                                    </MenuItem>
                                ))}
                            </Menu>
                            </>
                            )}
                        </Box>
                        
                    
                    <ThemeProvider theme={titleTheme}>
                        <Typography
                            variant="h4"
                            noWrap
                            sx={{
                                display: 'flex',
                                justifyContent: 'center', 
                                width: '100vw', // covers the whole width of screen
                                flexGrow: 1,
                                fontWeight: 1000, // thickness of the font
                                letterSpacing: '.4rem' // how far away the lettter are from each other
                            }}
                        >
                            LUTCRUSH
                        </Typography>
                    </ThemeProvider>
                    

                    
                        <Box sx={{ flexGrow: 0, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent:"flex-end"}}>
                            {props.isMediumUp && !props.isUserLoggedIn && // Box is for making sure that the LUTCRUSH -title is 
                            // in the middle of the header when user is not logged in. Width is the same as the buttons
                            // on the right side of the header
                            <Box width={"128px"} flexGrow={1}></Box>} 
                            {props.isUserLoggedIn && (
                                // Same aspects happen here as in the navigation menu part above. 
                                <>
                                <IconButton onClick={handleOpenUserMenu} >
                                    {userImg && <Avatar src={userImg}></Avatar>}
                                    {!userImg && <Avatar src={userImg}></Avatar>}
                                </IconButton>
                                
                                <Menu
                                    sx={{ mt: '45px', // makes the menu appear below the avatar
                                    width: '100%',
                                    display: 'flex' }}
                                    id="menu-appbar"
                                    anchorEl={anchorElUser}
                                    anchorOrigin={{ // for aligning the menu in the correct location below the IconButton
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    open={Boolean(anchorElUser)}
                                    onClose={handleCloseUserMenu}
                                    >
                                    {settings.map((setting, index) => (
                                        <MenuItem key={setting} onClick={handleCloseUserMenu} component={Link} to={`/${linkNameSettings[index]}`}>
                                            <Typography textAlign="center">{setting}</Typography>
                                        </MenuItem>
                                    ))}
                                </Menu>
                                
                                {/* Logging out function is located in app.js */}
                                <IconButton aria-label="logout" onClick={() => props.handleLogout()} >
                                    <LogoutIcon />
                                </IconButton>
                                </>
                            )}
                        </Box>
                </Toolbar>
            </AppBar>
        </ThemeProvider>
    );
}


export default Header