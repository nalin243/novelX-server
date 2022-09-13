const express = require('express')
const bodyParser = require('body-parser')

const cors = require('cors')
//////
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
	if(username=="nalin247" && password=="root")
		done(null,{id:1,name:"nalin"})
	else
		done(null,false,{message:"wrong info"})
}))

passport.serializeUser((user,done)=>{
	console.log("[*]Serializing user")
	done(null,user)
})

passport.deserializeUser((user,done)=>{
	console.log(`[*]Deserializing user ${user}`)
	done(null,user)
})

// app.get("/",passport)

app.post('/auth',passport.authenticate('local',{failureMessage:true}),(req,res)=>{	
	console.log("Sending req.user back to server as user key")
	console.log(req.session.passport)
	res.json({user:req.user})
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

app.get("/signout",(req,res)=>{
	console.log(req.session)
	req.logout((err)=>{
		if(err)
			console.log(err)
	})
	res.json({status:true})
})

app.listen(3001,"localhost",()=>{
	console.log("Server is running on 3001")
})