const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const Article = require('../src/model/data').Articles
const Profile = require('../src/model/data').Profiles
//const uploadImage = require('./uploadCloudinary')
const {Profiles} = require("../src/model/data");

function getArticles(req, res) {    //efficient MongoDB query to get User's feed
    Profile.find({username: req.body.username}).exec(function(err, items){
        const userObj = items[0];
        const userToQuery = [req.body.username, ... userObj.followers]
        Article.find({author: {$in: userToQuery}}).sort('-date').limit(10).exec(function(err, item2) {
            res.status(200).send({posts: item2})
        })
    })
}

const getArticle = (req, res) => {
    let resArticles = [];
    let author = "";
    if (req.params.id) {
        author = req.params.id;
        Article.find ({ author: author}).exec(function(err, items) {
            if (items.length > 0) {
                resArticles.push({articles: items});
                res.status(200).send(resArticles);
            }
            else
            {
                Article.find ({ _id: author}).exec(function(err, items2) {
                    resArticles.push({articles: items});
                });
                res.status(200).send(resArticles);
            }
        })
    }
    else {
        author = req.username;
        Article.find ({ author: author}).exec(function(err, items) {
            items.forEach(item => {
                resArticles.push(item);
            })
            res.status(200).send(resArticles);
        })
    }

    return

}


// // TODO: get the correct article by using the id
// const getArticle = (req, res) => res.send(articles[req.params.id]);

const addArticle = (req, res) => {
    // TODO: add an article (i.e. push new article on existing article array)
    console.log("REQ-----",req.body.username);
    username = req.body.username;
    let post = req.body.text;
    let url = req.body.url;
    let newArticle = { author: req.body.username, text: post, date: new Date().getTime(), url: url}
    new Article({
        author: newArticle.author,
        text: newArticle.text,
        date: newArticle.date,
        url: newArticle.url,
        comments: []
    }).save(function(err, items) {
        Article.find({author: username}).exec(function (err, items) {
            res.status(200).send({articles: items});
        })
    })
  }

function putComment(req, res) {
    let pid = req.params.id;
    let text = req.body.text;
    let user = req.username;
    Profile.find({username: user}).exec(function(err,items) {
            Article.updateOne({_id: pid} , {$push : {comments: {author: req.username, text: text, date: new Date()}}}
                ,function (err, item4) {
                    Article.find({author: user}).exec(function (err, itemOut) {
                        res.status(200).send({articles: [itemOut]})
                    })
                })
    })
}
function putArticle(req, res) {
    let pid = req.params.id;
    let text = req.body.text;
    let user = req.username;
    let commentId = req.body.commentId;
    Profile.find({username: user}).exec(function(err,items) {
        if (!commentId) {
            Article.update({_id : pid},{$set: {text : text}}, function(err,items2) {
                Article.find({author:user}).exec(function(err,itemOut) {
                    res.status(200).send({articles : [itemOut]})
                })

            })
        }
        else if (commentId === -1){
            Article.update({_id: pid} , {$push : {newComments: {author: req.username, text: text, date: new Date()}}}
                ,function (err, item3) {
                    Article.find({author:user}).exec(function(err,itemOut) {
                        res.status(200).send({articles : [itemOut]})
                    })
                }
            )}
        else {
            Article.update({_id: pid} , {$push : {newComments: {author: req.username, text: text, date: new Date()}}}
                ,function (err, item4) {
                    Article.find({author:user}).exec(function(err,itemOut) {
                        res.status(200).send({articles : [itemOut]})
                    })
                }
            )
        }
    })
}

function putArticlesByDate(req, res) {
    let pid = req.params.date;
    let text = req.body.text;
    let user = req.username;
    let commentId = req.body.commentId;
    Profile.find({username: user}).exec(function(err,items) {
        if (!commentId) {
            Article.update({date : pid},{$set: {text : text}}, function(err,items2) {
                Article.find({author:user}).exec(function(err,itemOut) {
                    res.status(200).send({articles : [itemOut]})
                })

            })
        }
        else if (commentId === -1){
            Article.update({date: pid} , {$push : {newComments: {author: req.username, text: text, date: new Date()}}}
                ,function (err, item3) {
                    Article.find({author:user}).exec(function(err,itemOut) {
                        res.status(200).send({articles : [itemOut]})
                    })
                }
            )}
        else {
            Article.update({date: pid} , {$push : {newComments: {author: req.username, text: text, date: new Date()}}}
                ,function (err, item4) {
                    Article.find({author:user}).exec(function(err,itemOut) {
                        res.status(200).send({articles : [itemOut]})
                    })
                }
            )
        }
    })
}


function getUrl(req, res) {
    let user = "";
    if (req.params.user)
        user = req.params.user;
    else
        user = req.username;
    Article.find ({ username: user}).exec(function(err, items) {
        items.forEach(item => {
            res.status(200).send({username: item.username, url: item.url});
        })
    })
}

function putUrl(req, res) {
    let username = req.username;
    let newAvatar = req.fileurl;
    // Article.update({username: username}, {$set:{url: newAvatar}}, function(err, items) {
        res.status(200).send({username: username, url: newAvatar});
    // })
}

module.exports = (app) => {
    app.use(bodyParser.json());
    app.use(cookieParser());
    // app.get('/articles', getArticles);
    app.get('/articles/:id?', getArticle);
    app.get('/article/:id?', getArticles); //this from get this person and followers
    app.put('/articles/:id', putArticle);
    app.put('/comment/:id', putComment);
    app.put('/article/:date?', putArticlesByDate)
    //app.put('/url/', uploadImage('url'), putUrl)
    app.get('/url/', getUrl);
    app.post('/article', addArticle);
}
