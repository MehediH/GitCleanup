import React, { Component } from 'react';
import { Router, Route } from "react-router-dom";
import history from "./history";

import Home from "./Home";
import Dashboard from "./Dashboard";

import "./app.scss";

class App extends Component {
    constructor(props){
        super(props)

        this.state = {
            user: {}
        }
    }

    componentWillMount(){
        fetch("/auth/user/").then(res => res.json()).then((res) => {
            if(res["message"]){
                this.setState({needsLogin: true});
                return
            }

            this.setState({user: res})
        }).catch(err => console.log(err))
    }

    render() {
        return (
            <Router history={history}>
                {
                    this.state.user.accessToken ?
                        <Route path="/" component={Dashboard}/>
                    : <Route path="/" exact component={Home}/>
                }
                
            </Router>
        );
    }
}

export default App;