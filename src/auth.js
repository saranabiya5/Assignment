const md5 =require('md5')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const session = require("express-session");
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const {Profiles} = require("../src/model/data");
const Users = require('../src/model/data').Users
const Profile = require('../src/model/data').Profiles
let sessionUser = {};
let cookieKey = "sid";
let userObjs = {};

function isLoggedIn(req, res, next) {
 
    if (!req.cookies) {
        res.sendStatus(401);
        return
    }

    let sid = req.cookies[cookieKey];
    if (!sid) {
        res.sendStatus(401);
        return
    }

    let username = undefined;
    redis.hget("temp", -1, (err, item) => {
        redis.hget("sessions", item, (err, item) =>{
            username = item;
            if (username) {
                req.username = username;
                next();
            }
            else {
                res.sendStatus(401)
                return
            }
        })
    })


}

function login(req, res) {
    let username = req.body.username;
    let password = req.body.password;

    // supply username and password
    if (!username || !password) {
        res.sendStatus(400);
        return
    }

    Users.find({username: username}).exec(function(err,items) {
        if (items.length === 1) {
            const user = {username: items[0].username, salt: items[0].salt, hash: items[0].hash}
            // TODO: create hash using md5, user salt and request password, check if hash matches user hash
            let hash = md5(user.salt + password);
            if (hash === user.hash) {
                // TODO: create session id, use sessionUser to map sid to user username
                let sid = md5(user.hash + user.salt);
                sessionUser[sid] = user.username;
                // Adding cookie for session id
                res.cookie(cookieKey, sid, { maxAge: 3600 * 1000, httpOnly: true ,sameSite:"", secure: true});
                let msg = {username: username, result: 'success'};
                res.send(msg);
            }
            else {
                res.status(401);
            }
        }
        else {
            res.status(401);
        }
    })
}

function register(req, res) {
    let username = req.body.username;
    let password = req.body.password;
    // supply username and password
    if (!username || !password) {
        res.sendStatus(400);
        return
    }


    let salt = md5(username + new Date().getTime());
    let hash = md5(salt + password);// TODO: Change this to use md5 to create a hash

    userObjs[username] =  {username: username, salt: salt, hash: hash} // TODO: Change this to store object with username, salt, hash

    Users.find({username:username}).exec(function(err, items) {
        if (items.length > 0) {
            res.status(200).send({result:'the username already exist'})
            return
        }

        if (items.length === 0) {
            new Users({
                username: username,
                salt: salt,
                hash: hash
            }).save()
            new Profile({
                username: username,
                headline: username + ' headline',
                followers: [],
                email: req.body.email,
                zipcode: req.body.zipcode,
                dob: req.body.dob,
                displayName: req.body.displayName,
                phone: req.body.phone,
                avatar: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/DWLeebron.jpg/220px-DWLeebron.jpg'
            }).save()
        }
        let msg = {username: username, result: 'success'};
        res.send(msg);
    })


}

function logout(req, res) {
    // let temp = req.cookies[cookieKey];
    // delete sessionUser[temp];
    res.clearCookie(cookieKey)
    res.send({result: 'logout success'})
}

module.exports = (app) => {
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.post('/login', login);
    app.post('/register', register);
    //app.use(session({secret: 'cookieSecret', resave: true, saveUninitialized: true}));
    //app.use(isLoggedIn);
    app.put('/logout', logout);


}