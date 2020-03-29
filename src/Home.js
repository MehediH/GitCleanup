import React, { Component } from 'react';
import { GoMarkGithub } from "react-icons/go";

class Home extends Component {
    render() {
        return (
            <div className="welcome">
                <h1>Welcome to GitCleanup</h1>
                <h2>Clean up your GitHub by deleting your abandoned or empty repositories with a few clicks.</h2>
                <a href="/api/login"><GoMarkGithub/>Login with GitHub</a>
            </div>
        );
    }
}

export default Home;