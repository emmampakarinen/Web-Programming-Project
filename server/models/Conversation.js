const mongoose = require("mongoose")

const Schema = mongoose.Schema // what is going to be in our database collection
const ObjectID = mongoose.Schema.Types.ObjectId;

// Database schema for saving participants of conversations images
let conversationSchema = new Schema({
    participants: [ObjectID] // array of 2 user ids
})

module.exports = mongoose.model("Conversation", conversationSchema)