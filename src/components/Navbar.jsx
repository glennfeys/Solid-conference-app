import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { AuthButton, LoggedIn } from '@solid/react';
import auth from 'solid-auth-client';
const { default: data } = require('@solid/query-ldflex');

export default class Navbar extends Component {

    constructor(props) {
        super(props);

        this.state = {
            blog: null
        }
    }

    async componentDidMount() {
        const session = await auth.currentSession()
        if (session != null) this.setState({blog: await data[session.webId].storage + "public/blog"}); // blog of user
    }

    render() {
        return (
            <nav className="navbar navbar-expand-sm navbar-dark bg-dark">
                <div className="container d-flex">
                    <a className="navbar-brand" href="/">Startpagina</a>
                    <button className="navbar-toggler d-lg-none" type="button" data-toggle="collapse" data-target="#collapsibleNavId" aria-controls="collapsibleNavId"
                        aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="collapsibleNavId">
                        <ul className="navbar-nav mt-2 mt-lg-0 mr-auto">
                            <LoggedIn>
                                <li className="nav-item">
                                    <Link className="nav-link" to={'/blog/' + btoa(this.state.blog)}>Mijn blog</Link>
                                </li>
                            </LoggedIn>
                        </ul>
                        <AuthButton className="btn btn-light" popup="/popup.html" login="Login here!" logout="Log me out"/>
                    </div>
                </div>
            </nav>
        )
    }
}
