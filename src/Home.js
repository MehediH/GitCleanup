import React, { Component } from 'react';
import { GoMarkGithub } from "react-icons/go";

class Home extends Component {
    render() {
        return (
            <div className="welcome">
                <h1>Welcome to GitDelete</h1>
                <h2>Delete all your abandoned or empty GitHub repositories with a few clicks.</h2>
                <a href="/auth"><GoMarkGithub/>Login with GitHub</a>
            </div>
        );
    }
}

export default Home;