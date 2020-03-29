import React, { Component } from 'react';
import { GoSignOut } from "react-icons/go";

class Nav extends Component {
    constructor(props){
        super(props)

        this.state = {
            user: {}
        }
    }

    componentWillMount(){
        fetch("/api/user").then(res => res.json()).then((res) => {
            this.setState({user: res})
        }).catch(err => console.log(err))
    }

    render() {
        const {user} = this.state;

        return (
            <header>
                <h1>GitCleanup</h1>
                <ul>
                    <a href={user.profileUrl} target="_blank" rel="noopener noreferrer" title="View profile on GitHub">
                        <li>
                            <img src={user.photos ? user.photos[0].value : ""} alt=""/>
                            <span>{user.username}</span>
                        </li>
                    </a>
                    <a href="/api/logout" title="Logout">
                        <li>
                            <GoSignOut/>
                            <span>Logout</span>
                        </li>
                    </a>
                </ul>
            </header>
        );
    }
}

export default Nav;