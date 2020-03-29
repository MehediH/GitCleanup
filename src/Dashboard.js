import React, { Component } from 'react';
import Nav from "./Nav";
import { GoGlobe, GoLock, GoTrashcan} from "react-icons/go";
import { PropagateLoader } from "react-spinners";

class Dashboard extends Component {
    constructor(props){
        super(props)

        this.state = {
            repos: {},
            needsLogin: false,
            deletedRepos: [],
            loading: true
        }
    }

    componentWillMount(){
        fetch("/api/user/repos").then(res => res.json()).then((res) => {
            if(res["message"]){
                this.setState({needsLogin: true});
                return
            }

            this.setState({repos: res, loading: false})
        }).catch(err => console.log(err))
    }

    addToDelete(repo){
        let repos = Object.values(this.state.repos);
        this.setState({
            repos: {...repos.filter(r => r.name !== repo.name)},
            deletedRepos: [...this.state.deletedRepos, repo]
        })
    }

    render() {
        let {repos, deletedRepos, needsLogin, loading} = this.state;

        repos = Object.values(repos);

        return (
            <div className="dashboard">
                <Nav/>

                <div className="repo-list">
                    <div className="group public">
                        <h3>Public Repositories <GoGlobe/></h3>

                        {
                            loading ? <div className="loader"><PropagateLoader size={15} color={"#fff"}/></div> : 
                            
                            <React.Fragment>
                                <ul className="group-list">
                                    {repos.filter(repo => !repo.private).map((repo) => {
                                        return <li key={repo.id} onClick={e => this.addToDelete(repo)}>{repo.name}</li>
                                    })}
                                </ul>
                            </React.Fragment>
                        }
                        
                    </div>

                    <div className="group private">
                        <h3>Private Repositories <GoLock/></h3>
                        
                        {
                            loading ? <div className="loader"><PropagateLoader size={15} color={"#fff"}/></div> : 
                            
                            <React.Fragment>
                                <ul className="group-list">
                                    {repos.filter(repo => repo.private).map((repo) => {
                                        return <li key={repo.id} onClick={e => this.addToDelete(repo)}>{repo.name}</li>
                                    })}
                                </ul>
                            </React.Fragment>
                        }

                    </div>

                    <div className="group public">
                        <h3>Deleted Repositories <GoTrashcan/></h3>
                        
                        <ul className="group-list">
                            {deletedRepos.map((repo) => {
                                return <li key={repo.id}>{repo.name}</li>
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}

export default Dashboard; 