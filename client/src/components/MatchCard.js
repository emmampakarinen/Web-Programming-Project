import React from 'react'
import { useEffect } from "react";
import Box from '@mui/material/Box';
import { motion, useAnimation, useMotionValue } from "framer-motion"
import '../App.css'
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material';

/* REFERENCES */
// https://www.geeksforgeeks.org/how-to-create-tinder-card-swipe-gesture-using-react-and-framer-motion/ got help for animation purposes
// https://www.npmjs.com/package/react-tinder-card card styling and idea gotten from here
// https://www.framer.com/motion/use-drag-controls/ used framer-motion for animating, used drag documentation as a help

/** This component renders the cards of users to be swiped on the Swipe-component. Accepts user info for the card (person),
 * the current index of the card (0 or 1), isVisible-boolean (index === currentIndex) and swipeAction (the direction where the card is swiped) */
function MatchCard(props) {
    // Initializing motion value for the x position of the card. Using this variable for tracking the cards horizontal position. 
    const motionValue = useMotionValue(0) 
    // Initializing animation control instance. Used for starting animations on the card. 
    const animControls = useAnimation()

    const theme = createTheme({
        typography: {
            fontFamily: 'Concert One'
    },});
    
    useEffect(() => { // useEffect for animating
        if (props.isVisible && props.swipeAction) { // if we have current card active and swipeAction is not set as null
            let xDist = props.swipeAction === "right" ? "100vw" : "-100vw" // if swipeAction is set as right, move card to 100% of view width and if it's left, move card to the left. 
            
            animControls.start({ 
                x: xDist, 
                opacity: 0, // card fades out as it's mvoing towards exiting the screen
                transition: { ease: "easeOut", duration: 0.7 } // provides smooth movement
            });
        } 
    }, [props.swipeAction, animControls]) // every time a swipe is done, useEffect updates, i.e., does the animation for the swiped card
    
    const backToOrigin = () => {
        animControls.start({
            x: 0,
            transition: { type: "spring", stiffness: 400, damping: 15 }, 
        })
    }
    
    return (
        <ThemeProvider theme={theme}>
            <div className='cardContainer'>
                <motion.div // Draggable part of the code
                    drag= "x" // user can drag the card only in x-axis
                    x={motionValue} 
                    onDragEnd={(event, info) => {
                        if (info.offset.x > 100) {
                            // if card is dragged more than 100 pixels to the right, swipe-action is triggered
                            props.onSwipe('right')
                        } else if (info.offset.x < -100) {
                            // same logic for dislike action
                            props.onSwipe('left')
                        } else {
                            backToOrigin() // if user lets go of the card (and haven't dragged it far enough), card jumps back to origin with animation
                        }
                    }}
                    initial={{ opacity: 1, x: 0 }} // initial state of the animated card
                    animate={animControls}
                >
                    <Box
                        className='card'
                    >
                        {props.person.image && <div className='cardImg' style={{backgroundImage: `url(/users/api/userImage/${props.person.image})`}} />}
                        {!props.person.image && <div className='cardImg' style={{backgroundImage: `url("/blankAvatar.jpg")`}}></div>}
                        <div className='cardContent'>
                            <Typography p={2} variant='h5'>{props.person.username}, {props.person.age}</Typography>
                            <Typography>{props.person.profileText}</Typography>
                        </div>
                    </Box>
                </motion.div>
            </div>
        </ThemeProvider>
    )
}

export default MatchCard