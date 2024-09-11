const express = require("express");
const jwt = require("jsonwebtoken");
require('dotenv').config()           //Loads .env file contents into process.env by default

const app = express();

app.use(express.json());

const users =[
    {
        username : "jhon",
        title : "swe",
    },
    {
        username : "smith",
        title : "sde",
    },

]

app.get('/users',autenticateUsers,(req,res)=>{    // will first authenticateUser through middleware then handle callback function
    
    res.json(users.filter(user => user.username === req.decoded.username));
})

// middleware fn to authenticate
function autenticateUsers(req,res,next){
    const authHeader = req.headers["authorization"]
    // as authorization header :- Bearer Token // ie. we only need token so spliting this from " " space and accesing token ie. [1]    
    const token = authHeader && authHeader.split(' ')[1];
    if(token == null) return res.status(401).json("token not sent");

    jwt.verify(token,process.env.ACCESS_TOKEN_SECRETKEY,(err,decoded)=>{
        if(err) return res.status(403).json("token is no longer valid");

        req.decoded = decoded;  // adding decoded info about user in req obj through req.user = user
        console.log(decoded);
        next();
    });
}

app.listen(8080,()=>console.log("server started"))