const mongoose = require("mongoose")

const Schema = mongoose.Schema // what is going to be in our database collection
const ObjectID = mongoose.Schema.Types.ObjectId;

// Database schema of messages
let messagesSchema = new Schema({
    conversationID: ObjectID, // Each message belongs to a conversation. Informs which conversation to save / fetch the message to/from
    sender: ObjectID, // user id of sender
    receiver: ObjectID, // user id of receiver
    message: String,
    created: Date,
    read: Boolean
})

module.exports = mongoose.model("Messages", messagesSchema)