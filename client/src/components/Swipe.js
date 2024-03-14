import React from 'react'
import { useState, useEffect } from "react";
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useNavigate } from "react-router-dom";
import MatchCard from './MatchCard';
import UserModal from './UserModal';
import MatchModal from './MatchModal';
import '../App.css'
import { useTranslation } from 'react-i18next';
import { createTheme, ThemeProvider } from '@mui/material';

/** This component includes the swiping functioniality and it also renders the usercards */
function Swipe(props) {
    const [people, setPeople] = useState([]) // variable to hold unmatched users
    const [displayedPeople, setDisplayedPeople] = useState([]) // DisplayedPeople will have maximum of two users to be shown to the current user 
    // who is swiping. Had to implement showing/rendering only two users on cards at once because of performance issues. 
    const [currentIndex, setCurrentIndex] = useState(null) // Current active card index that is shown to user
    const [direction, setDirection] = useState(null) // For saving which direction user swiped / pressed button. Needed this for animation purposes as well as figuring out when to call database for liking action. 
    
    // states for opening and closing the modals
    const [openUser, setOpenUserModal] = useState(false) 
    const [openMatch, setOpenMatchModal] = useState(false) 
    const [matchModalInfo, setMatchModalInfo] = useState(null) // info to be shown on the match modal (sent as a prop to modal component)
    const [refreshKey, setRefreshKey] = useState(0) // This is for React to know to render the same card that was just swiped. Had to implement this
    // when there was only 2 or 1 people to be shown for the user on the cards. Without this refreshKey, React would not render the just swiped card again.
    // Refreshkey is used at the div where the cards are rendered. 
    // This idea was originally from ChatGPT https://chat.openai.com/

    // font for app
    const theme = createTheme({
        typography: {
            fontFamily: 'Concert One'
    },});

    const navigate = useNavigate()
    const { t } = useTranslation()


    useEffect(() => {

        if (!props.isUserLoggedIn) { // if user is not logged in, navigate to frontpage
            navigate("/")
        }

        let mounted = true

        const token = localStorage.getItem("auth_token") // token for getting data from server
        fetch("users/api/unmatched", {
            method: "GET",
            headers: { "Authorization": "Bearer " + token },
            mode: "cors" 
        }).then(async response => {
            
            if(!response.ok) {
                const err = response
                throw err
            }
            return response.json()
        }).then(data => {
            
            if (mounted) {
                setPeople(data) // setting all unmatched users 
                setDisplayedPeople(data.slice(-2)) // adding last 2 of unmatched users to be displayed for current user
                
                if (data.length < 2) {
                    setCurrentIndex(0) 
                } else {
                    setCurrentIndex(1) 
                } // if there is only one user (or none) to be shown, index is set as 0, otherwise as 1 (becase there is always maximum of 2 cards to be shown and the one on top/active card has index of 1) 
            }
            
        }).catch(error => {
            console.log("Error: ", error)
        })

        return () => { // cleanup function
            mounted = false 
        }
    },[props.isUserLoggedIn, navigate]) // running this effect only when the component mounts (page is rendered)


    // calling database to handle like and if a match is found, showing MatchModal on UI 
    const handleLike = (personID) => {
        const token = localStorage.getItem("auth_token")

        fetch("/users/like", {
            method: "POST",
            headers: {
                "Content-type": "application/json",
                "Authorization": "Bearer " + token 
            },
            body: JSON.stringify({
                "like": personID,
            }),
            mode: "cors"
        }).then(async response => {
            if (!response.ok) {
                // If the response status code is not ok, error is thrown
                const err = response
                throw err
            }
            return response.json()
        }).then(data => {
            let info = document.getElementById("infoText")
            if(data.match) { // if there was a match between users
                openMatchModal() // setting the matchmodal as open (=true)
                setMatchModalInfo(data) // data includes the match (user), current user and conversation
            } else if (data.like) { // if no match, just showing on the info text that user has liked the swiped person
                info.innerHTML = t("swipe.like", {name: data.like})
            }
        }).catch(error => {
            console.log("Error: ", error)
        })
        
    }

    /** Here is implemented the "carousel" of users to be swiped. When the last user is swiped on the card stack, the first user that had been swiped left is shown
     * again and the stack is started from the start again. Comments explain the logic behind the carousel. 
     * 
     * TL;DR: There is 2 users displayed on match cards at once. When a swipe is done, the next index from people list would be = swiped person's index - 2 
     * (for example, after swiping the first user, we want the 3rd first on the list because the 2nd first is already been rendered behind the first card). Logic
     * is a little different when there are only 1 or 2 people available to render on cards. 
     */
    const swipe = (dir, swipedPerson) => {    
        console.log("**************** JUST SWIPED ****************")   
        if (currentIndex >= 0) {
            let info = document.getElementById("infoText")
            let peopleTemp = people // Addressing people array to a temp variable, needed this when a liked user is removed from 
            // people-array on line 137. UseState does not give immediate changes so using this temp variable solved an issue 
            // with the people-array not being updated straight after setting it with (caused rendering with already 
            // liked users).

            // if user swiped by pressing a button, swipePerson is null and 
            // the correct person is found with current index from displayedPeople
            if (!swipedPerson) { 
                swipedPerson = displayedPeople[currentIndex]
            }

            // finding the swiped person's index to know the next index on peopleTemp-array to be rendered for the card
            let swipedPersonIndex = peopleTemp.findIndex(person => person._id === swipedPerson._id)
            
            console.log(`Swiped ${dir} on ${swipedPerson.username}`)
            setDirection(dir)
            
            // if user swiped right, handling the change in database and removing liked user from people-list
            if (dir==="right") {
                handleLike(swipedPerson._id) 
                peopleTemp = [...people].filter(person => person._id !== swipedPerson._id)
                setPeople(peopleTemp) // updating people-array
            }
            
            // newDisplayed is going to be the new displayedPeople-array, now without the previously swiped user (i.e., newDisplayed.length = 1)
            let newDisplayed = [...displayedPeople].filter(person => person._id !== swipedPerson._id) 
            
            let nextIndex
            if (peopleTemp.length > 2) {
                if (swipedPersonIndex === 1) { 
                    // if we swiped the second last user of the tempPeople-array, the next index is the first user on 
                    // the peopleTemp-array (because the last user has already been rendered)
                    nextIndex = peopleTemp.length-1
                } else if (swipedPersonIndex === 0) { 
                    // if the last user on tempPeople-array was swiped, the next user to be rendered is the second first on the array
                    nextIndex = peopleTemp.length-2
                } else {
                    // if the last swiped user's index was neither the above, the next index is simply 2 indexes less than the swiped user's index
                    nextIndex = swipedPersonIndex-2
                }
                
            
            } else if (peopleTemp.length === 2) { // in case there is only 2 users to be shown on cards, the next index is 0 or 1

                if (swipedPersonIndex === 2) { // if there were 3 people available and person with index 2 (3rd) got liked, next index would be 0
                    nextIndex = 0
                } else if (swipedPersonIndex === 0) { // if the last person on the list was swiped left, next index would be its index
                    nextIndex = 0
                } else { // if the user swiped was the first one the list, the next index to be added is 1 (i.e., their own index)
                    nextIndex = 1
                }
            
            } else if (peopleTemp.length === 1) { // next index is always the same (= 0) if there is only one card to be rendered
                nextIndex = 0 
            }
            
            
            setTimeout(() => { // needed this for showing the card exit-animation in MatchCard-component
                if (peopleTemp.length > 2) {
                    newDisplayed.unshift(peopleTemp[nextIndex]) // using unshift to add the next user to index 0 (behind the first displayed card)
                    setCurrentIndex(1) // current index is 1 when there is two cards available and the one on top is on index 1

                } else if (peopleTemp.length === 2) {
                    newDisplayed.unshift(peopleTemp[nextIndex])
                    setCurrentIndex(1) // same logic here as above

                } else if (peopleTemp.length === 1) {
                    newDisplayed = [peopleTemp[nextIndex]]
                    setCurrentIndex(0) // when there is only one card displayed, the index is 0 

                }
            
                setDisplayedPeople(newDisplayed)

                setRefreshKey(prevKey => prevKey + 1) // triggers React to render the new card
                info.innerHTML = t("swipe.swipeText")
                setDirection(null) // Resetting the direction state
            }, 700)
        }
    }

    // when user double clicks the MatchCard, user modal is opened. When user clicks outside the modal it's closed.
    const openUserModal = () => setOpenUserModal(true)
    const closeUserModal = () => setOpenUserModal(false)

    // when when user gets a match with a liked user, match modal is opened. When user clicks outside the modal it's closed.
    const openMatchModal = () => setOpenMatchModal(true)
    const closeMatchModal = () => setOpenMatchModal(false)
    
    

    return (
        <ThemeProvider theme={theme}>
            {/** Using conditional rendering mostly based on the length of displayedPeople and making sure variables
             * are set before calling elements/components that need those. 
             */}
            {displayedPeople.length > 0 && <Typography p={1} variant='h4' id="infoText">{t("swipe.swipeText")}</Typography>}
            {displayedPeople.length === 0 && <Typography display mt={10} variant='h5' id="infoText">{t("swipe.end")}</Typography>}
            <div className='swipeContainer'>
                
                <div className='matchCardContainer'>
                    {displayedPeople.length > 0 && displayedPeople.map((person, index) =>

                        <div className="swipe" key={`${person._id}-${refreshKey}`} onDoubleClick={openUserModal} >
                            <MatchCard 
                                person={person} 
                                index={currentIndex} 
                                isVisible={index === currentIndex} // a check that the card for the animation is indeed visible
                                swipeAction={currentIndex === index ? direction : null} // has a value of right or left when card is swiped, otherwise null
                                onSwipe={(direction) => swipe(direction, person)}
                            />
                        </div>
                    )}
                </div>
                                    
                {displayedPeople.length > 0 && currentIndex >= 0 && displayedPeople[currentIndex] &&
                    <UserModal closeModal={closeUserModal} open={openUser} user={displayedPeople[currentIndex]} />
                }

                {matchModalInfo && closeMatchModal && openMatch && 
                    <MatchModal 
                        closeModal={closeMatchModal} 
                        open={openMatch} 
                        user={matchModalInfo.user} 
                        match={matchModalInfo.match} 
                        convo={matchModalInfo.convo}
                    ></MatchModal>
                }

                <div className='buttonContainer'>
                    {displayedPeople.length > 0 && 
                    <>
                        <Button 
                            sx={{margin:"20px"}} 
                            variant="contained" 
                            onClick={() => swipe('left')}
                        >{t("swipe.dislikeBtn")}</Button>
                        
                        <Button 
                            sx={{margin:"20px"}} 
                            variant="contained" 
                            onClick={() => swipe('right')}
                        >{t("swipe.likeBtn")}</Button>
                    </>
                    }
                </div>
            </div>  
        </ThemeProvider>
    )
}

export default Swipe