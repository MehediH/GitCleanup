import React, { Component } from 'react';
import { FiLogOut, FiSearch, FiSun, FiMoon, FiCoffee, FiMenu, FiX} from "react-icons/fi";
import logo from "../assets/logo.png";
import lightLogo from "../assets/lightLogo.png";
import Fuse from "fuse.js";
import Repo from './Repo';

class Nav extends Component {
    constructor(props){
        super(props)

        this.state = {
            user: {},
            search: false,
            searchResults: [],
            searchQuery: "",
            mobileMenuOpen: false,
            searchBoxX: 0,
            searchBoxWidth: 0,
            resized: false
        }
        
        this.searchBox = React.createRef();

        window.addEventListener("resize", () => {
            this.resetSearchBoxPosition(false)
        })
    }

    componentWillMount(){
        fetch("/api/user").then(res => res.json()).then((res) => {
            this.setState({user: res})
        }).catch(err => console.log(err))
    }

    resetSearchBoxPosition(resized=true){
        this.setState({
            searchBoxX: this.searchBox.current.getBoundingClientRect().x,
            searchBoxWidth: this.searchBox.current.getBoundingClientRect().width,
            resized
        })
    }

    performSearch(query){
        if(!this.state.resized){
            this.resetSearchBoxPosition()
        }
        
        this.setState({searchQuery: query})

        const options = {
            threshold: 0.5,
            keys: ['name', 'description', 'url', 'language']
        }
        
        let {repos} = this.props;

        let fuse = new Fuse(repos, options)

        let result = fuse.search(query);

        this.setState({searchResults: result})
    }
    
    switchTheme(){
        let isLight = document.body.classList.contains("light") ? true : false;

        if(isLight){
            document.body.classList.replace("light", "dark")
            localStorage.setItem("gcTheme", "dark")
        } else{
            document.body.classList.replace("dark", "light")
            localStorage.setItem("gcTheme", "light")
        }
        
        
        this.setState({isLight: !this.state.isLight})
    }

    render() {
        const {user} = this.state;

        return (
            <React.Fragment>
                <header className={`mobile-${this.state.mobileMenuOpen ? "open" : "closed"}`}>
                    <div className="brand">
                        <img src={lightLogo} alt="GitCleanup logo" draggable="false" className="logo lightLogo"/>
                        <img src={logo} alt="GitCleanup logo" draggable="false" className="logo darkLogo"/>
                        <FiX className="closeMenu mm" onClick={e => {
                            this.setState({mobileMenuOpen: false, search: false, searchResults: []})
                            document.body.classList.remove("mm-open")
                        }}/>
                    </div>
                    <ul className={`nav-items search-${this.state.search ? "open" : "closed"} results-${this.state.searchResults.length !== 0 ? "showing" : "hidden"} `}>
                        <li onClick={e => this.setState({search: true})} className="search nav-item" ref={this.searchBox}>
                            <FiSearch/>
                            
                            {!this.state.search && <span>Search</span>}

                            {this.state.search && 
                                <React.Fragment>
                                    <input spellCheck="false" autoFocus type="text" placeholder="Start typing to search..." value={this.state.searchQuery} onChange={e => this.performSearch(e.target.value)} onFocus={e => this.performSearch(e.target.value)}/>
                                </React.Fragment>
                            }
                        </li>
                        <li className="nav-item" onClick={e => this.switchTheme()} title="Switch theme">
                            <FiMoon className="lightLogo"/> 
                            <FiSun className="darkLogo"/>
                            <span className="mm">Switch theme</span>
                        </li>

                        <a href="https://ko-fi.com/mehedi" title="Buy me a coffee" target="_blank" rel="noopener noreferrer">
                            <li className="nav-item">
                                <FiCoffee/>
                                <span>Donate</span>
                            </li>
                        </a>

                        <a href={user.profileUrl} target="_blank" rel="noopener noreferrer" title="View profile on GitHub">
                            <li className="nav-item">
                                <img src={user.photos ? user.photos[0].value : ""} alt=""/>
                                <span>{user.username}</span>
                            </li>
                        </a>

                        <a href="/api/logout" title="Logout">
                            <li className="nav-item">
                                <FiLogOut/>
                                <span className="mm">Logout</span>
                            </li>
                        </a>
                    </ul>
                    <FiMenu className="mobileMenu" onClick={e => {
                        this.setState({mobileMenuOpen: true})
                        document.body.classList.add("mm-open")
                    }}/>
                </header>
                {
                    (this.state.searchResults.length !== 0) &&
                    
                    <React.Fragment>
                        <div className="search-box repo-list" style={{left: this.state.searchBoxX + "px", width: this.state.searchBoxWidth + "px"}}>
                            <div className="inner">
                                <ul className="results">
                                    {this.state.searchResults.map((repo) => {
                                        repo = repo.item;

                                        return <Repo key={repo.id} showIcon={true} onClick={e => {
                                            this.props.addToDelete(repo)
                                            this.setState({search: false, searchResults: []})
                                        }} {...repo}></Repo>
                                    })}
                                </ul>
                            </div>
                        </div>
                        <div className="backdrop" onClick={e => this.setState({search: false, searchResults: []})}></div>
                    </React.Fragment>
                }        
            </React.Fragment>             
        );
    }
}

export default Nav;