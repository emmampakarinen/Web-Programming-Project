var express = require('express');
var router = express.Router();
router.use(express.json());

var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

// Schemas: 
const Users = require("../models/Users")
const Image = require("../models/Image")
const Conversation = require("../models/Conversation")
const Messages = require("../models/Messages")

// multer for image handling
const multer  = require('multer')
const upload = multer(); // reference: https://stackoverflow.com/questions/69921812/multer-file-buffer-missing 

// using JWT passport for authentication
var JwtStrategy = require('passport-jwt').Strategy // http://www.passportjs.org/packages/passport-jwt/
var ExtractJwt = require('passport-jwt').ExtractJwt
const passport = require('passport')
var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
opts.secretOrKey = 'secret'

passport.use(new JwtStrategy(opts, function(jwt_payload, done) { 
  console.log("JWT payload received", jwt_payload)
  Users.findOne({ email: jwt_payload.email }) // extracting JWT payload from request and looking up the user from database
      .then(user => done(null, user))
      .catch(err => done(err, false))
})) // initializing the passport settings to be used in the jwtStrategy with the token 

/* express-validator for checking sufficient passwords and correct e-mails */

// 'body' is for validating and sanitizing body parameters from requests
// 'validationResult' is a function that gives the result of the validation (errors) 
var {body, validationResult} = require('express-validator'); 
const registerValidator = [ // reference: https://medium.com/@hcach90/using-express-validator-for-data-validation-in-nodejs-6946afd9d67e 
  body('username', 'Username is empty').not().isEmpty(),
  body('email', 'E-mail was not provided in e-mail format').isEmail(),
  body('password', 'Password is empty').not().isEmpty(),
  body('password', 'Password is not strong enough').isStrongPassword({ // Setting up requirements for the password when registrating. Reference: https://express-validator.github.io/docs/api/validation-chain/ 
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
] // password validator

const usernameValidator = [ // user can change their name on their profile, so using this for checking that the username is valid
  body('username', "Username can't be empty").not().isEmpty(),
]



/** Route for sending login information from user */
router.post('/login', function(req, res, next) {
  let pswd = req.body.password

  Users.findOne({ email: req.body.email }).then((user) => { // checking if provided e-mail is found from database
    if (!user) { // if user not found
      return res.status(403).json({ "msg": "Invalid credentials" }) // responding with forbidden code

    } else {
      bcrypt.compare(pswd, user.password).then((resp) => { // if user is found, comparing the provided password to one from the database
        if (resp === true) {
          var token = jwt.sign({ email: req.body.email }, "secret") // Creating token and including email in it. More info: https://stackoverflow.com/questions/31309759/what-is-secret-key-for-jwt-based-authentication-and-how-to-generate-it 
          return res.status(200).send({ "success": true, "token": token, "userid": user._id }) // responding with token and user id to be saved in local storage
        } else {
          return res.status(403).json({ "msg": "Invalid credentials" }) // if password was incorrect
        }
      })
    }
  })
});


/** Route for registering */
router.post('/register', registerValidator, function(req, res, next) {
  const result = validationResult(req) // checking first whether the username, e-mail and password given pass the requirements
  console.log(result)

  if (!result.isEmpty()) { // If the e-mail, username and/or password are insufficient, error is given. Reference: https://express-validator.github.io/docs/guides/getting-started
    return res.status(400).send({ errors: result.array() })
  }
  
  // Continuing user registration after passing register elements -check
  let pswd = req.body.password

  Users.findOne({ email: req.body.email }).then(async (email) => { // checking if a user with same e-mail as provided already exists
    
    if (!email) { // if not found, continuing with creating new user
      var salt = bcrypt.genSaltSync(10) // Hashing the password with bcrypt. Reference https://www.npmjs.com/package/bcryptjs
      var hash = bcrypt.hashSync(pswd, salt) 

      // Creating new user to database
      const new_user = new Users({
        email: req.body.email, 
        password: hash,
        username: req.body.username,
        profileText: "",
        registerDate: new Date().getTime(),
        image: null
      })
      
      new_user.save()
      .then(() => {
        console.log("User registered")
        return res.status(200).send({ "success": true, "message": "registration complete" })
      })


    } else { // if user with same e-mail already exists
      return res.status(403).json({ "msg": "Email already in use" })
    }
  })
});


/* Route for user changing or adding a profile picture and this picture is shown also on the tinder card */
router.post('/api/userImage', upload.single("image"), passport.authenticate('jwt', { session: false }), function(req, res) {

  if (!req.file) { // if no file was provided 
    return res.status(400).json({ "msg": "No file uploaded" })
  }

  const file = req.file

  Users.findOne({ email: req.user.email }).then((user) => { // finding current logged in user from database
    if (!user) { // if user not found
      return res.status(403).json({ "msg": "Error in finding user from database" })
    } else if (user && user.image) { // if user is updating their profile picture when a previous one is already existing --> delete the previous from database and update the picture

      Image.findOneAndReplace({ _id: user.image }, // reference: https://mongoosejs.com/docs/tutorials/findoneandupdate.html 
        {name: file.originalname, 
        buffer: file.buffer,
        mimetype: file.mimetype,
        encoding: file.encoding}).then((img) => { 
        if (!img) { // if image not found
          return res.status(403).json({ "msg": "Error in updating the picture" })
        } else {
          Users.updateOne({ _id: user._id }, { $set: { image: img._id } }).then(() => { // reference: https://www.mongodb.com/docs/manual/reference/operator/update/set/
            return res.status(200).json({ "msg": "User image updated successfully" })
          }).catch(err => {
            console.error(err)
            return res.status(500).json({ "msg": "Error updating user image" })
          })
        }
      })
    } else { // no image set previsouly so adding a new image

      const new_image = new Image({
        name: file.originalname, 
        buffer: file.buffer,
        mimetype: file.mimetype,
        encoding: file.encoding
      })

      new_image.save().then(savedImg => {
        user.image = savedImg._id // updating the user database to include the current picture

        user.save().then(() => {
          res.json({ "msg": "Image uploaded and user updated successfully" })
        }).catch(err => {
          console.log("Error when updating user: ", err)
          res.status(500).send("Error updating user: " + err.message)
        })
      }).catch(err => {
        console.log("Erroe when saving img: ", err)
        res.status(500).send("Error saving image: " + err.message)
      })
    }
  })
});


/** Route for getting current user's image */
router.get('/api/userImage/:imageID', function(req, res) { // no authentication required because only way to get access to the photo is the have the objectId retrieved from the database which one needs an authentication for as seen in the get route to /api/user

  Image.findOne({ _id: req.params.imageID }).then((img) => { 
    if (img) { 
      res.setHeader('Cache-Control', 'no-store') // prevents caching for images
      res.setHeader('Content-Type', img.mimetype)
      res.setHeader('Content-Disposition', 'inline')

      res.send(img.buffer)

    } else { 
      return res.status(403).send("image not found")
    }
  })

});


/* Route for editing user's info from the user's profile in client side. Using registerValidator here to check that user has not tried to update username for an empty string. */
router.post('/api/user', usernameValidator, passport.authenticate('jwt', { session: false }), function(req, res) { 

  const result = validationResult(req) // checking that the username sent to update is not empty
  console.log(result)
  if (!result.isEmpty()) { // If username is empty, error is given
    return res.status(400).send({ errors: result.array() })
  }
  
  Users.findOneAndUpdate({ email: req.user.email }, req.body).then((user) => { // reference: https://mongoosejs.com/docs/tutorials/findoneandupdate.html 
    if (!user) { // if user not found
      return res.status(403).json({ "msg": "Error in finding user from database" })

    } else {
      return res.status(200).send("ok")
    }
  })
});


/* Route for getting current user's data */ 
router.get('/api/user', passport.authenticate('jwt', { session: false }), function(req, res) { 

  Users.findOne({ email: req.user.email }).then(async (user) => { // finding user from database
    if (!user) { // if user not found
      return res.status(403).json({ "msg": "Error in finding user from database" })

    } else {
      // Responding with user data
      const userResp = {
        email: user.email,
        username: user.username,
        age: user.age,
        image: user.image,
        profileText: user.profileText
      }

      return res.status(200).send(userResp)
    }
  })
});


/* Route for getting user data based on ID. Called in ChatList.js component */ 
router.get('/api/user/:id', passport.authenticate('jwt', { session: false }), function(req, res) { 

  Users.findOne({ _id: req.params.id }).then(async (user) => {
    if (!user) { // if user not found
      return res.status(403).json({ "msg": "Error in finding user from database" })

    } else {
      const userResp = {
        _id: user._id,
        email: user.email,
        username: user.username,
        age: user.age,
        profileText: user.profileText,
        registerDate: user.registerDate,
        image: user.image
      }

      return res.status(200).send(userResp)
    }
  })
});


/** Route for getting current user's unmatches (people they have not matched with yet on swipe-component) */
router.get('/api/unmatched', passport.authenticate('jwt', { session: false }), function(req, res) {

  if (req.user) {
    // finding all except the current user, reference: https://stackoverflow.com/questions/59687620/how-to-find-all-users-except-current-user-with-mongoose
    Users.find({ _id: { $ne: req.user.id } }).select([ 
      "email", "username", "age", "image", "profileText", "registerDate" // selecting all but sensitive info
    ]).then((users) => { 
      const unmatched = users.filter(user => 
        !req.user.likes.includes(user._id.toString()) && // filtering out users who current user have already liked or matched with
        !req.user.matches.includes(user._id.toString())
      ) 

      return res.status(200).json(unmatched) // responding with a list of unmatched users to show in the swiping component
    }).catch(err => {
      res.status(500).send("Error in fetching users")
    })
  } else {
      res.status(403).send("Unauthorized")
  }
});



/* Route for adding a new liked user for current user */
router.post('/like', passport.authenticate('jwt', { session: false }), async function(req, res) {
  let currentUser = req.user
  
  if (currentUser) {
    likedUser = await Users.findById(req.body.like) // finding the liked user from database

    currentUser.likes.push(likedUser._id) // adding liked user to current user's liked-array
    await currentUser.save()

    // checking if current user is found from the liked user's liked-array
    if (likedUser.likes.includes(req.user._id)) {
      // if found --> adding users to each other's match-arrays and creating a new Conversation schema for chatting
      likedUser.matches.push(currentUser._id)
      currentUser.matches.push(likedUser._id)
      
      const new_conversation = new Conversation({
        participants: [currentUser._id, likedUser._id]
      })

      await likedUser.save()
      await currentUser.save()
      await new_conversation.save()

      const likedUserObject = likedUser.toObject() 
      const { likes, matches, password, email, ...userWithoutSensitiveInfo } = likedUserObject // "removing" sensitive info from user to be sent in response with spread syntax

      return res.status(201).json({ "match": userWithoutSensitiveInfo, "convo": new_conversation, "user": currentUser }) // status 201 = created, just to distinguish a match created
    } else { // if current user is not in liked user's liked-array, no match --> adding the user to current user's liked array
      return res.status(200).json({ "like": likedUser.username })
    }
  } else {
      res.status(403).send("Unauthorized")
  }
});


/* Route for getting current user's conversations */
router.get('/api/conversations', passport.authenticate('jwt', { session: false }), function(req, res) { 

  if (req.user) {
    Conversation.find({ participants: req.user.id }).then((convos) => {
      return res.status(200).json({"chats": convos, "matches": req.user.matches}) // responding with a list of chatIDs and matches to show in the ChatList-component

    }).catch((err) => {
      console.log("error in fetching conversation ids")
      return res.status(500).json({"msg": "Error when trying to fetch conversation IDs."})
    })
  } else {
      res.status(403).send("Unauthorized")
  }
});



/* Route for sending a message */
router.post('/api/newMessage', passport.authenticate('jwt', { session: false }), async function(req, res) { 
  if (req.user) {
    let new_message = new Messages({
      conversationID: req.body.chatID, // tells which conversation to save / fetch the message to/from
      sender: req.body.sender, // user id of sender
      receiver: req.body.receiver, // user id of receiver
      message: req.body.message,
      created: req.body.created,
      read: false
    }) 

    await new_message.save()
    return res.status(200).json({"msg": "ok"}) 
  } else {
      res.status(403).send("Unauthorized")
  }
});


/* Route for getting messages of current chat/conversation */ 
router.get('/api/messages/:chatid', passport.authenticate('jwt', { session: false }), function(req, res) { 
  if (req.user) {
    Messages.find({conversationID: req.params.chatid}).then((messages) => {
      return res.status(200).json({"messages": messages}) // responding with a list of messages beloning to current active chat
    }).catch((err) => {
      console.log("error in fetching messages: ", err)
      return res.status(500).json({"msg": "Error when trying to fetch messages."})
    }) 
     
  } else {
      res.status(403).send("Unauthorized")
  }
});

/** Route for deleting user from the system. Called when user presses the delete-button at settings. */
router.get('/delete/:userid', passport.authenticate('jwt', { session: false }), function(req, res) { 
  if (req.user) {
    let userIdToDel = req.params.userid
    console.log(userIdToDel)

    // deleting user's image from database
    Users.findById({_id: userIdToDel}).then((user) => {
      if(user.image) {
        console.log(user.image)
        Image.deleteOne({_id: user.image.toString()}).exec()
      }
    })

    // deleting user and its id from other users' array of likes/matches
    Users.deleteOne({_id: userIdToDel}).then(() => {
      Users.updateMany({}, { $pull: {likes: userIdToDel, matches: userIdToDel} }).exec() // deleting the user id from other users likes and matches arrays. Reference: https://www.mongodb.com/docs/manual/reference/operator/update/pull/       

      // deleting user references on messages and conversations
      Messages.deleteMany({sender: userIdToDel}).exec()
      Messages.deleteMany({receiver: userIdToDel}).exec()

      Conversation.deleteMany({participants: { $in: [userIdToDel] }}).exec()


      res.status(200).send({"msg": "User and references to user deleted."})
    }).catch(err => {
      return res.status(500).send({"msg": "Error, user was not deleted."})
    })
  } else {
      res.status(403).send("Unauthorized")
  }
});


module.exports = router;
