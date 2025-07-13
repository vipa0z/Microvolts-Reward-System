const router = require('express').Router()
const jwt = require("jsonwebtoken")

module.exports = function auth(req, res, next) {

// This is a mock auth middleware

    // REAL MIDDLEWARE TO BE ADDED ONCE THE ALL THE API ENDPOINTS ARE READY

    // replace with actual auth middleware for players and admins


   
    // for admins, if you plan to send rewards by making request to the emulator's API,
    // ensure the JWT_ADMIN_SECRET is set in the env file and matches the secret key used in the emulator

 // you must provide a user object with the following properties:
    // nickName, playerId, grade
    // min grade to configure items is defined in env file
    const user = {
    nickName: "vipa0z",
    playerId: 680155,
    grade: 1
}
// attach player object to request body
   req.user=user
next();
}
