import React, { Component } from 'react';
import Nav from "../components/Nav";
import { FiGlobe, FiLock, FiTrash2, FiXCircle} from "react-icons/fi";
import { PropagateLoader } from "react-spinners";
import Repo from '../components/Repo';

class Dashboard extends Component {
    constructor(props){
        super(props)

        this.state = {
            repos: {},
            deleteWarn: false,
            deletedRepos: [],
            loading: true,
            deleting: false,
            deleteLog: []
        }
    }

    sortByStar(obj){
        return Object.values(obj).sort((a,b)=>a.stargazers_count-b.stargazers_count).reverse();
    }

    componentWillMount(){
        fetch("/api/repos").then(res => res.json()).then((res) => {
            this.setState({repos: this.sortByStar(res), loading: false})
        }).catch(err => console.log(err))
    }

    addToDelete(repo){
        let repos = Object.values(this.state.repos);
        this.setState({
            repos: {...repos.filter(r => r.name !== repo.name)},
            deletedRepos: [repo, ...this.state.deletedRepos]
        })
    }

    removeFromDelete(repo, addBack=true){
        let deletedRepos = this.state.deletedRepos;
        let repos = Object.values(this.state.repos)
        
        if(addBack){
            repos.unshift(repo);
        }

        this.setState({
            repos: {...repos},
            deletedRepos: deletedRepos.filter(r => r.name !== repo.name)
        })
    }

    deleteRepos(){
        this.setState({deleting: true})

        let {deletedRepos} = this.state;

        let app = this;
        deletedRepos.map((repo) => {
            let deleteRepo = async () => {
                await fetch("/api/repos/delete/" + repo.name).then(res => res.json()).then((res) => {
                    let deleteLog =  this.state.deleteLog;
                    deleteLog.unshift(res)
                    app.setState({
                        deleteLog
                    })

                    if(res.statusCode === 204){
                        app.removeFromDelete(repo, false)
                    }
                })
            }
            
            deleteRepo();
        })

   
    }

    closeModal(){
        this.setState({
            deleteWarn: false,
            deleting: false,
            currentDelete: ""
        })
    }

    render() {
        let {repos, deletedRepos, loading, deleteWarn, deleting, deleteLog} = this.state;
        repos = Object.values(repos); 
        let privateRepos = repos.filter(repo => repo.private);
        let publicRepos = repos.filter(repo => !repo.private);

        return (
            <div className="dashboard" onKeyDown={e => e.keyCode === 27 ? this.closeModal() : null}>
                <Nav/>

                <div className="repo-list">
                    <div className="group public">
                        <h3>Public Repositories <FiGlobe/></h3>

                        {
                            loading ? <div className="loader"><PropagateLoader size={15} color={"#fff"}/></div> : 
                            
                            <React.Fragment>
                                { publicRepos.length === 0 ?
                                    <p className="notice">Looks like you don't have any public repositories or have selected all your public repositories to be deleted.</p>
                                : <ul className="group-list">
                                        {publicRepos.map((repo) => {
                                            return <Repo key={repo.id} onClick={e => this.addToDelete(repo)} {...repo}></Repo>
                                        })}
                                    </ul>
                                }
                            </React.Fragment>
                        }
                        
                    </div>

                    <div className="group private">
                        <h3>Private Repositories <FiLock/></h3>
                        
                        {
                            loading ? <div className="loader"><PropagateLoader size={15} color={"#fff"}/></div> : 
                            
                            <React.Fragment>
                                { privateRepos.length === 0 ?
                                    <p className="notice">Looks like you don't have any private repositories or have selected all your private repositories to be deleted.</p>
                                : <ul className="group-list">
                                        {privateRepos.map((repo) => {
                                            return <Repo key={repo.id} onClick={e => this.addToDelete(repo)} {...repo}></Repo>
                                        })}
                                    </ul>
                                }
                            </React.Fragment>
                        }

                    </div>

                    <div className="group delete">
                        <h3>Deleted Repositories <FiTrash2/></h3>
                        
                        <ul className={`group-list ${deletedRepos.length === 0 ? "" : "delete-list"}`}>
                            { deletedRepos.length === 0 ?
                                <p className="notice">To delete repositories, start by adding repositories from the list of public or private repositories.</p>
                             : <React.Fragment>
                                {deletedRepos.map((repo) => {
                                    return <Repo key={repo.id} onClick={e => this.removeFromDelete(repo)} {...repo} delete={true}></Repo>
                                })}
                                <button className="delete-button" onClick={e => this.setState({deleteWarn: true})}><FiTrash2/>Delete Repositories</button>
                              </React.Fragment>
                            }
                        </ul>
                    </div>
                </div>
           
                { deleteWarn &&
                   <React.Fragment>
                        <div className="modal">
                            <div className="inner">
                                <div className="header">
                                    <h3>Deleting Repositories</h3>
                                    <FiXCircle onClick={e => this.closeModal()}/>
                                </div>
                                <div className="content">
                                    { !deleting && 
                                        <React.Fragment>
                                            <div className="warning">
                                                <p><strong>Warning:</strong> this will completely delete the following repositories, including all your commits, files, stars, settings, releases, etc. for the selected repositories. Please make sure you want to delete the following repositories.</p>
                                                <p>Note: you will only be able recover some of the following repositories after you delete them if needed. However, if your repository was part of a fork network, it cannot be restored unless every other repository in the network is deleted or has been detached from the network. You'll need to contact GitHub support to restore such a repository.</p>
                                            </div>
                                            <ul>
                                                {deletedRepos.map((repo) => {
                                                    return (
                                                        <li key={repo.id}>
                                                            <a href={repo.html_url} target="_blank" rel="noopener noreferrer" title="View repository on GitHub">{repo.name}</a>
                                                            <FiXCircle title="Don't delete this repository" onClick={e => this.removeFromDelete(repo)}/>
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                            <button className="delete-button" onClick={e => this.deleteRepos()}>Permanently Delete {deletedRepos.length} Repositories</button>
                                        </React.Fragment>
                                    } 

                                    { deleting && 
                                        <div className="deleting">
                                            <FiTrash2/>
                                            <h3>Deleting your repositories...</h3>
                                            {
                                                deleteLog.map((out) => {
                                                    return<li key={out.message}>{out.message} (Status: {out.statusCode})</li>
                                                })
                                            }
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>

                        <div className="overlay" onClick={e => this.closeModal()}></div>
                   </React.Fragment>

                }
            </div>
        );
    }
}

export default Dashboard; 