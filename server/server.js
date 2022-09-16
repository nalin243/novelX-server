const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const User = require('./models/UserSchema')//importing model for users


mongoose.connect("mongodb://127.0.0.1/novelX")//connecting to database novelX

const cors = require('cors')

const passport = require('passport')
const session  = require('express-session')
const LocalStrategy = require('passport-local')

const app = express()

app.use(cors({credentials:true,origin:true}))
app.use(express.json())
app.use(session({
	secret:"lolwa-donkey",
	resave:false,
	name:"authCookie",
	saveUninitialized: true,
	cookie:{secure:false}
}))//sets a session id in cookie

app.use(passport.initialize())
app.use(passport.session())//basically tries reading a user out of a session if it's there it stores it in req.user if not it doesn't do shit

passport.use(new LocalStrategy((username,password,done)=>{//this is basically called whenever passport.authenticate is called
	console.log(`Username from client is ${username} and password is ${password}` )
	User.findOne({username: username})//trying to find username in database, P.S findOne returns a promise
		.then((user)=>{
			if(user!== null){
				if(user.password === password)
					done(null,{id:1,name:username})
				else 
					done(null,false,{message:"wrong info"})
			}
			else 
				done(null,false,{message:"wrong info"})
		})
}))

passport.serializeUser((user,done)=>{
	console.log("[*]Serializing user")
	done(null,user)
})

passport.deserializeUser((user,done)=>{
	console.log(`[*]Deserializing user ${user}`)
	done(null,user)
})

app.post('/login',passport.authenticate('local',{failureMessage:true}),(req,res)=>{	
	// console.log("Sending req.user back to server as user key")
	// console.log(req.session.passport)
	res.json({user:req.user})
})

app.post('/signup',(req,res)=>{
	console.log(req.body)
	const user = new User(req.body)
	user.save()
	res.json({status:200})
})

app.get("/user",(req,res)=>{
	res.json({username:req.user.name})
})

app.get("/checkauth",(req,res)=>{
	if(req.user !== undefined ){
		console.log("req.user exists so user is authenticated")
		res.json({authenticated:true,
			user:{id:req.user.id,name:req.user.name}
		})
	}
	else
		res.json({authenticated:false})
})

app.post("/updatelibrary",(req,res)=>{
	const {username,book} = req.body
	User.findOne({username: username})
		.then((user)=>{
			console.log(`Received from ${username}`)
			console.log(book)
			user.Library.push(book)
			user.save()
		})
})

app.post("/getlibrary",(req,res)=>{
	const {username} = req.body 
	console.log(username)
	User.findOne({username: username})
		.then((user)=>{
			res.json({Library: user.Library})
		})
		.catch((err)=>{
			console.log(err)
		})
})

app.post("/deletebook",(req,res)=>{
	const {username,bookname} = req.body 
	User.findOne({username: username})
		.then((user)=>{
			user.Library.forEach((book)=>{
				if(book.name == bookname){
					console.log(book._id)
					user.Library.pull(book._id)
					user.save()
				}
			})
		})
})

app.get("/signout",(req,res)=>{
	req.logout((err)=>{
		if(err)
			console.log(err)
	})
	res.json({status:true})
})

app.listen(3001,"localhost",()=>{
	console.log("Server is running on 3001")
})