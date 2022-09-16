const mongoose = require('mongoose')
const {Schema,model} = mongoose;

const BookSchema = new Schema({
	name: String,
	Pages: Number,
	Read: Boolean,
	Author: String,
	Description: String
})

const UserSchema = new Schema({
	username: String,
	password: String,
	Library: [BookSchema]
})

const User = model('User',UserSchema)
module.exports = User