require('dotenv').config();

const express = require("express");
const cors = require("cors");
const passport = require("passport");
const GitHubStrategy = require("passport-github").Strategy;
const request = require("request");
const connect = require("connect-ensure-login");
const compression = require("compression");
const path = require("path");
const sslRedirect = require('heroku-ssl-redirect');

let loginUrl = "/"; // default redirect path when auth fails

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
    scope: "repo,delete_repo,user" // we need to view repo details and have permission to delete
  }, (accessToken, refreshToken, profile, cb) => {
    let user = {
        ...profile,
        accessToken
    };
    return cb(null, user);
  }
));

const app = express();
const dev = app.get("env") !== "production";

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'totoro', resave: true, saveUninitialized: true }));
app.use(cors());
app.use(sslRedirect());

if(!dev){
    app.disable("x-powered-by")
    app.use(compression())
    app.use(require('morgan')('tiny'));

    app.use(express.static(path.resolve(__dirname, "build")))

} else{
    app.use(require('morgan')('dev'));
}

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

app.get("/api/login", passport.authenticate("github"));

app.get("/api/callback", passport.authenticate("github", {failureRedirect: loginUrl}), (req, res) => {
    res.redirect("/")
});

app.get("/api/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

// Retrusn user details
app.get("/api/user", connect.ensureLoggedIn(loginUrl), (req, res) => {
    res.send(req.user);
});


// Get user's repository details from GitHub API and return
app.get("/api/repos", connect.ensureLoggedIn(loginUrl), (req, res) => {
    let user = req.user;

    let accessToken = user["accessToken"];

    let repos = []
    let pages = [1]

    let repoCount = user["_json"]["public_repos"] + user["_json"]["total_private_repos"];

    while(repoCount > 100){
        pages.push(pages[pages.length-1] + 1);
        repoCount -= 100;
    }

    let getAPIPages = pages.map((page) => {
        return new Promise((resolve, reject) => {
            console.log('https://api.github.com/user/repos?sort=created&per_page=100&page=' + page)
            request({
                url: 'https://api.github.com/user/repos?sort=created&per_page=100&page=' + page,
                headers: {
                    "Authorization": `token ${accessToken}`,
                    "User-Agent": "GitCleanup"
                }
            }, function(err, res) {
                if(!err){
                    let data = Object.values(JSON.parse(res.body));
                    repos.push(...data)

                    resolve(repos)
                }
            })
        })
        
    })

    Promise.all(getAPIPages).then((data) => {
        res.json([].concat.apply([], repos))
    })

})

// Given a repo name, we can delete the repository
app.get("/api/repos/delete/:fullname", connect.ensureLoggedIn(loginUrl), (req, res) => {
    let user = req.user;
    let accessToken = user["accessToken"];

    return new Promise(resolve => {
        request({
            url: `https://api.github.com/repos/${req.params.fullname}`,
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



if(!dev){
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "build", "index.html"));
    })
}


const PORT = process.env.PORT || 5000;
app.listen(PORT); 