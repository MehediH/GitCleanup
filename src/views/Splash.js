import React, { Component } from 'react';
import { GoMarkGithub } from "react-icons/go";
import logo from "../assets/logo.png";
import lightLogo from "../assets/lightLogo.png";

class Splash extends Component {

    render() {        
        return (
            <div className="welcome">
                <div className="logo-cont">
                    <img src={logo} alt="GitCleanup logo" draggable="false" className="darkLogo logo"/>
                    <img src={lightLogo} alt="GitCleanup logo" draggable="false" className="lightLogo logo"/>
                </div>
                <h1>Welcome to GitCleanup</h1>
                <h2>Say hello to GitHub Zero: de-clutter your GitHub profile and get rid of unused repositories with just a few clicks.</h2>
                <a href="/api/login"><GoMarkGithub/>Login with GitHub</a>
            </div>
        );
    }
}

export default Splash;