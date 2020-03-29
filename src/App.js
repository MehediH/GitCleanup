import React, { Component } from 'react';
import { Router, Route } from "react-router-dom";
import { createGlobalStyle } from 'styled-components';

import history from "./history";

import Splash from "./views/Splash";
import Dashboard from "./views/Dashboard";

import "./styles/app.scss";

let GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Circular';
    src: url('./assets/circular-book.woff') format('woff');
    font-weight: normal;
    font-style: normal;
  }
  @font-face {
    font-family: 'Circular';
    src: url('./assets/circular-medium.woff') format('woff');
    font-weight: 600;
    font-style: normal;
  }
  html,
  body {
    height: 100%;
    width: 100%;
  }

  body {
    font-family: 'Circular', Helvetica, Arial, sans-serif;
  }
`

class App extends Component {
    constructor(props){
        super(props)

        this.state = {
            user: {}
        }
    }

    componentWillMount(){
        fetch("/api/user/").then(res => res.json()).then((res) => {
            this.setState({user: res})
        }).catch(err => console.log(err))
    }

    render() {
        return (
            <Router history={history}>
                <GlobalStyle/>
                {
                    this.state.user.accessToken ?
                        <Route path="/" component={Dashboard}/>
                    : <Route path="/" exact component={Splash}/>
                }
                
            </Router>
        );
    }
}

export default App;