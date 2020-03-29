require('dotenv').config();

const express = require("express");
const cors = require("cors");
const passport = require("passport");
const GitHubStrategy = require("passport-github").Strategy;
const request = require("request");
const connect = require("connect-ensure-login");

let loginUrl = "/";

passport.serializeUser((user, cb) => {
    cb(null, user);
})

passport.deserializeUser((user, cb) => {
    cb(null, user);
})

// GitHub Strategy for login
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "/api/callback",
    scope: "repo,delete_repo"
  }, (accessToken, refreshToken, profile, cb) => {
    let user = {
        ...profile,
        accessToken
    };
    return cb(null, user);
  }
));

const app = express();

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'totoro', resave: true, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
    if(!req.user){
        res.send({
            message: "Please login to use the GitCleanup API"
        })
    } else{
        res.send({
            userProfile: "/api/user",
            userRepos: "/api/user/repos",
            logout: "/api/logout",
            deleteRepo: "/api/user/delete/:repoName"
        })
    }
})

app.get("/api/login", passport.authenticate("github"));

app.get("/api/callback", passport.authenticate("github", {failureRedirect: loginUrl}), (req, res) => {
    res.redirect("/")
});

app.get("/api/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

app.get("/api/user", connect.ensureLoggedIn(loginUrl), (req, res) => {
    res.send(req.user);
});

app.get("/api/repos", connect.ensureLoggedIn(loginUrl), (req, res) => {
    let user = req.user;

    let accessToken = user["accessToken"];

    return new Promise(resolve => {
        request({
            url: 'https://api.github.com/user/repos?sort=created',
            headers: {
                "Authorization": `token ${accessToken}`,
                "User-Agent": "GitCleanup"
            }
        }, function(err, res) {
            if(!err){
                resolve(res.body)
            }
        });
    }).then(data => {
        res.send(data)
    })
})

app.get("/api/repos/delete/:id", connect.ensureLoggedIn(loginUrl), (req, res) => {
    let user = req.user;
    let accessToken = user["accessToken"];

    return new Promise(resolve => {
        request({
            url: `https://api.github.com/repos/${user["username"]}/${req.params.id}`,
            headers: {
                "Authorization": `token ${accessToken}`,
                "User-Agent": "GitCleanup"
            },
            method: "DELETE"
        }, function(err, res) {
            if(!err){
                resolve(res)
            }
        });
    }).then(out => {
        if(out.statusCode === 204 ){
            res.json({
                statusCode: out.statusCode,
                message: `Successfully deleted your repository: ${req.params.id}`
            })
        } else{
            res.json({
                statusCode: out.statusCode,
                message: `Something went wrong: ${out.statusMessage}`
            })
        }
    })
})

const PORT = process.env.PORT || 5000;
app.listen(PORT); 