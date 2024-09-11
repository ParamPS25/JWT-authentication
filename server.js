// const port = 4000;
require('dotenv').config();        // Loads .env file contents into process.env by default
const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

let refreshTokens = []; // just for demo, in real app stored in db

// Passing refresh token to generate new access token
app.post("/token", (req, res) => {
    const refreshToken = req.body.refreshToken;
    if (refreshToken == null) return res.status(401).json({ msg: "post the refreshToken" });
    if (!refreshTokens.includes(refreshToken)) return res.status(403).json({ msg: "refresh token initially not generated" });

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRETKEY, (err, decoded) => {
        if (err) return res.status(403).json({ msg: "refresh token not verified" });
        const accessToken = generateAccessToken({ username: decoded.username }); // Ensure payload is an object !! if payload is gives error
        res.json({ accessToken: accessToken }); // new access token generated using refresh token
    });
});

// Passing refreshToken in req.body to logout 
app.delete('/logout', (req, res) => {
    // Creates a new array that includes all tokens except the one that matches req.body.refreshToken. Essentially, it removes the specified token from the refreshTokens array // accessToken will expiresIn specified time
    refreshTokens = refreshTokens.filter(refreshToken => refreshToken !== req.body.refreshToken);
    res.status(201).json({ msg: "cleared" });
});

app.post('/login', (req, res) => {
    const newUser = req.body.username;
    const user = { username: newUser };
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.push(refreshToken);
    res.json({
        accessToken: accessToken,
        refreshToken: refreshToken,
    });
});

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRETKEY, { expiresIn: '1h' });
}

function generateRefreshToken(user) {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRETKEY);
}

app.listen(4000, () => { console.log("server started at port 4000") });
