const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const Profiles = require('../src/model/data').Profiles;
const Users = require('../src/model/data').Users
const thisLoginUser = require('./auth');
//const uploadImage = require('./uploadCloudinary')

const md5 = require("md5");



const getHeadline = (req, res) => {
    // this return the requested user headline
    let user = "";
    if (req.params.user)
        user = req.params.user;
    else
        user = req.username;
    Profiles.find ({ username: user}).exec(function(err, items) {
        if (items.length == 1) {
            items.forEach(item => {
                res.status(200).send({username: item.username, headline: item.headline});
            })
        }
        else
            res.status(200).send({username: items[0].username, headline: items[0].headline});
    })
}

const getHeadlines = (req, res) => {
    let result = [];
    Profiles.find ().exec(function(err, items) {
        items.forEach(item => {
            result.push({username: item.username, headline: item.headline})
        })
        res.status(200).send(result);
    })
}


function putHeadine(req, res) {
    let username = req.body.username;
    let newHeadline = req.body.headline;
    Profiles.update({username: username}, {$set:{headline: newHeadline}}, function(err, items) {
        res.status(200).send({username: username, headline: newHeadline});
    })
}

function putEmail(req, res) {
    let username = req.username;
    let newEmail = req.body.email;
    Profiles.update({username: username}, {$set:{email: newEmail}}, function(err, items) {
        res.status(200).send({username: username, email: newEmail});
    })
}

function getEmail(req, res) {
    let user = "";
    if (req.params.user)
        user = req.params.user;
    else
        user = req.username;
    Profiles.find ({ username: user}).exec(function(err, items) {
        items.forEach(item => {
            res.status(200).send({username: item.username, email: item.email});
        })
    })
}

function getDob(req, res) {
    let user = "";
    if (req.params.user)
        user = req.params.user;
    else
        user = req.username;
    Profiles.find ({ username: user}).exec(function(err, items) {
        items.forEach(item => {
            res.status(200).send({username: item.username, dob: item.dob});
        })
    })
}

function putDob(req, res) {
    let username = req.username;
    let newDob = req.body.dob;
    Profiles.update({username: username}, {$set:{dob: newDob}}, function(err, items) {
        res.status(200).send({username: username, dob: newDob});
    })
}


function getAvatar(req, res) {
    let user = "";
    if (req.params.user)
        user = req.params.user;
    else
        user = req.username;
    Profiles.find ({ username: user}).exec(function(err, items) {
        items.forEach(item => {
            res.status(200).send({username: item.username, avatar: item.avatar});
        })
    })
}

function putAvatar(req, res) {
    let username = req.username;
    let newAvatar = req.fileurl;
    Profiles.updateOne({username: username}, {$set:{avatar: newAvatar}}, function(err, items) {
        res.status(200).send({username: username, avatar: newAvatar});
    })
}

function putPassword(req, res) {
    let username = req.username;
    let newPassword = req.body.password;
    let salt = md5(username + new Date().getTime());
    let hash = md5(salt + newPassword);// TODO: Change this to use md5 to create a hash
    Users.update({username: username}, {$set:{salt: salt, hash: hash}}, function(err, items) {
        res.status(200).send({username: username, result: "success"});
    })
}


function getZipcode(req, res) {
    let user = "";
    if (req.params.user)
        user = req.params.user;
    else
        user = req.username;
    Profiles.find ({ username: user}).exec(function(err, items) {
        items.forEach(item => {
            res.status(200).send({username: item.username, zipcode: item.zipcode});
        })
    })
}
function getUsername(req, res) {
            res.status(200).send({username: req.username});
}
function getPassword(req, res) {
    res.status(200).send({password: req.password});
}
function getDisplayName(req, res) {
    let user = "";
    if (req.params.user)
        user = req.params.user;
    else
        user = req.username;
    Profiles.find ({ username: user}).exec(function(err, items) {
        items.forEach(item => {
            res.status(200).send({username: item.username, displayName: item.displayName});
        })
    })
}
function getPhone(req, res) {
    let user = "";
    if (req.params.user)
        user = req.params.user;
    else
        user = req.username;
    Profiles.find ({ username: user}).exec(function(err, items) {
        items.forEach(item => {
            res.status(200).send({username: item.username, phone: item.phone});
        })
    })
}
function putZipcode(req, res) {
    let username = req.username;
    let newZipcode = req.body.zipcode;
    Profiles.update({username: username}, {$set:{zipcode: newZipcode}}, function(err, items) {
        res.status(200).send({username: username, zipcode: newZipcode});
    })
}

module.exports = (app) => {
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.put('/headline', putHeadine);
    app.get('/headline/:user?', getHeadline);
    app.get('/headline', getHeadlines);
    app.put('/email', putEmail);
    app.get('/email/:user?', getEmail);
    app.get('/dob/:user?', getDob);
    app.put('/dob',putDob);
    app.get('/zipcode/:user?', getZipcode);
    app.put('/zipcode', putZipcode);
    app.get('/avatar/:user?', getAvatar);
   // app.put('/avatar', uploadImage('avatar'), putAvatar)
    app.put('/password', putPassword);
    app.get('/username', getUsername);
    app.get('/password', getPassword);
    app.get('/displayName',getDisplayName);
    app.get('/phone', getPhone);
}
