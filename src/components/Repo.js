import React, { Component } from 'react';
import { FiTrash, FiStar, FiEye, FiGitMerge, FiCornerUpLeft, FiGlobe, FiLock } from "react-icons/fi";
import { GoMarkGithub } from "react-icons/go";

class Repo extends Component {
    constructor(props){
        super(props)        
    }

    render() {
        let repo = this.props;

        return (
            <li className="repo">
                <div className="header">
                    <a className="name" href={repo.html_url} target="_blank" rel="noopener noreferrer" title="View repository on GitHub">{repo.name}</a>
                </div>
                { repo.description && <p>{repo.description}</p>}
                <ul className="stats">
                    <a target="_blank" rel="noopener noreferrer" href={`${repo.html_url}/stargazers`}>
                        <li key="star">
                            <FiStar/>
                            <span>{repo.stargazers_count}</span>
                        </li>
                    </a>
                    <a target="_blank" rel="noopener noreferrer" href={`${repo.html_url}/network/members`}>
                        <li key="fork">
                            <FiGitMerge/>
                            <span>{repo.forks_count}</span>
                        </li>
                    </a>
                    <a target="_blank" rel="noopener noreferrer" href={`${repo.html_url}/watchers`}>
                        <li key="watch">
                            <FiEye/>
                            <span>{repo.watchers_count}</span>
                        </li>
                    </a>
                </ul>
                <footer>
                    <a className="gh-link" href={repo.html_url} target="_blank" rel="noopener noreferrer" title="View repository on GitHub"><GoMarkGithub/>Open on Github</a>
                    {
                        (repo.delete || repo.showIcon) && 
                            <React.Fragment>
                                {
                                    repo.private ? <FiLock/> : <FiGlobe/>
                                }
                            </React.Fragment>
                    }
                </footer>
                { repo.delete ? <span className="btn" onClick={e => this.props.onClick(e)}><FiCornerUpLeft/>Don't Delete</span> : <span className="btn" onClick={e => this.props.onClick(e)}><FiTrash/>Add to Delete</span>}
            </li>
        );
    }
}

export default Repo;