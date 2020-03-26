const express = require("express");
const cors = require("cors");
const passport = require("passport");
const GitHubStrategy = require("passport-github").Strategy;
const request = require("request");
require('dotenv').config();

let user;

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
    callbackURL: "/auth/callback",
    scope: "repo,delete_repo"
  }, (accessToken, refreshToken, profile, cb) => {
    user = {
        ...profile,
        accessToken
    };
    return cb(null, profile);
  }
));

const app = express();
app.use(cors());
app.use(passport.initialize());

app.get("/auth", passport.authenticate("github"));

app.get("/auth/callback", passport.authenticate("github"), (req, res) => {
    res.redirect("http://localhost:3000/");
});

app.get("/auth/logout", (req, res) => {
    user = {};
    res.redirect("/");
});

app.get("/auth/user", (req, res) => {
    res.send(user);
});

app.get("/auth/user/repos", (req, res) => {
    if(!user){
        res.status(401).send({
            message: 'User is not logged in!'
        });

        return;
    } 

    let accessToken = user["accessToken"];
    
    return new Promise(resolve => {
        request({
            url: 'https://api.github.com/user/repos',
            headers: {
                "Authorization": `token ${accessToken}`,
                "User-Agent": "GitRemove"
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

app.get("/auth/user/delete/:id", (req, res) => {
    if(!user){
        res.status(401).send({
            message: "User is not logged in!"
        })

        return;
    }

    let accessToken = user["accessToken"];

    return new Promise(resolve => {
        request({
            url: `https://api.github.com/repos/${user["username"]}/${req.params.id}`,
            headers: {
                "Authorization": `token ${accessToken}`,
                "User-Agent": "GitRemove"
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