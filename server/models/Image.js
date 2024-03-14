const mongoose = require("mongoose")

const Schema = mongoose.Schema 

// Database schema for saving user images
let imageSchema = new Schema({
    name: String,
    buffer: Buffer,
    mimetype: String,
    encoding: String
})

module.exports = mongoose.model("Image", imageSchema)