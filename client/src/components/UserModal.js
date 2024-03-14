import React from 'react'
import { Box, Modal, Avatar } from '@mui/material'
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material';

/** This component renders the user modal, which is shown for user when they double click the user card on the swipe component or user on the match list in chats. 
 * In the modal, there are listed user's registration date, name, bio, age and profile picture. 
 * Accepted props: closeModal-function, open-boolean and user which modal is rendered. 
 */
function UserModal({ closeModal, open, user }) {
    const { t } = useTranslation()
    
    const theme = createTheme({
        typography: {
            fontFamily: 'Concert One'
    },});

    const formatDate = (dateString) => {
        // formatting date to more readable form
        
        if (dateString) {
            const date = new Date(dateString)
            const options = { year: 'numeric', month: 'numeric', day: 'numeric' }
            const formattedDate = date.toLocaleDateString('en-US', options)

            return formattedDate
        }
        return "Invalid date"
    }

    return ( // quite same styling as MatchCard -component
        <ThemeProvider theme={theme}>
            <Modal open={open}
                onClose={closeModal}>
                <Box sx={{
                    borderRadius: "20px", // rounded corners
                    flexDirection: "column",
                    justifyContent: "center",
                    alignContent: "center",
                    alignItems: "center",
                    position: 'absolute',
                    display: "flex",
                    top: '50%', // showing the modal in the middle of the screen
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    minWidth: "50vw",
                    maxHeight: 700,
                    bgcolor: 'white',
                    boxShadow: 24,
                    p: 4,
                }}>
                    {user.image && <Avatar src={`/users/api/userImage/${user.image}`} sx={{ minWidth: 200, minHeight: 200, marginTop:2, marginBottom:2}}></Avatar>}
                    {!user.image && <Avatar sx={{ minWidth: 100, minHeight: 100, marginTop:1, marginBottom:1}}></Avatar>}
                    <Typography>{t("modal.registerDate", { date: formatDate(user.registerDate) })}</Typography>
                    <Typography>{t("modal.name", { name: user.username })}</Typography>
                    <Typography>{t("modal.bio", { bio: user.profileText })}</Typography>
                    <Typography>{t("modal.age", { age: user.age })}</Typography>
                </Box>
            </Modal>
        </ThemeProvider>
    )
}

export default UserModal