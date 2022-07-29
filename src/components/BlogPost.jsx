import React, { Component } from 'react'
import Navbar from './Navbar';
import Reaction from './Reaction';
import Footer from './Footer';
import { Link } from 'react-router-dom'
import auth from 'solid-auth-client';
import { LoggedIn  } from '@solid/react';
const { default: data } = require('@solid/query-ldflex');

export default class BlogPost extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isOwner: null,
            blogPost: {
                author: null,
                headline: null,
                body: null,
                created_date: null,
                tags: null,
                comments: null,
                url: null,
            },
            isLoaded: false
        }
    }

    async componentDidMount() {
        const url = atob(this.props.match.params.id);
        const blogPost = await data[url];

        const blogOwner = await data[blogPost].schema$author;
        const session = await auth.currentSession();
        if (session){
            const currentUser = session.webId;
            this.setState({
                isOwner: currentUser === blogOwner.toString()
            });
        } else {
            this.setState({
                isOwner: false
            });
        }

        let comments = [];
        for await(const comment of data[blogPost].schema$comment) comments.push(comment.toString());

        await this.setState({
            blogPost: {
                author: (await data[blogPost].schema$author).toString(),
                headline: (await data[blogPost].schema$headline).toString(),
                body: (await data[blogPost].schema$articleBody).toString(),
                created_date: (await data[blogPost].schema$dateCreated).toString(),
                tags: (await data[blogPost].schema$keywords).toString(),
                comments: comments,
                url: blogPost,
            },
            isLoaded: true,
        });
    }

    render() {
        var { isLoaded, blogPost, isOwner } = this.state;
        console.log(blogPost.url)
        return (
            <div>
                {!isLoaded ? (
                    <div className="container py-5"><h2>Loading ...</h2></div>
                ) : (
                    <div>
                        <Navbar />
                        <div className="container py-5">
                            <h5>{blogPost.headline}</h5>
                            <p>Tags: {blogPost.tags}</p>
                            <p>{blogPost.body}</p>
                            <p>{blogPost.created_date}</p>
                            
                            {isOwner?(
                                <Link to={'/blogPost/' + this.props.match.params.id + "/edit"}>Bewerk deze blog post</Link>
                            ):(
                                <br/>
                            )}

                            <div className="conatainer py-5">
                            <h2>Reacties:</h2>

                            <LoggedIn>
                                <Link to={'/blogPost/' + btoa(blogPost.url) + "/react"}>Maak een nieuwe reactie aan</Link>
                            </LoggedIn>
                            
                            {blogPost.comments.map((comment, i) => (
                                <Reaction url={comment} key={i} />
                            ))}
                            </div>
                        </div>
                        <Footer />
                    </div>
                )}
            </div>
        );
    }
}