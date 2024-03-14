const mongoose = require("mongoose")

const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema // what is going to be in our database copllection

// Database schema for saving users and their information
let usersSchema = new Schema({
    email: String,
    password: String,
    username: String, 
    image: ObjectId,
    age: Number,
    profileText: String,
    registerDate: Date,
    likes: [String], // array of likes with the match's _id
    matches: [String] // array of matches with the match's _id
})

module.exports = mongoose.model("Users", usersSchema)