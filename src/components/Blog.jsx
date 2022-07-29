import React, { Component } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import BlogPostSmall from './BlogPostSmall'
import { Link } from 'react-router-dom'
import auth from 'solid-auth-client'
const { default: data } = require('@solid/query-ldflex');
const $rdf = require("rdflib");

export default class Blog extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isOwner: null,
            blog: {
                url: null,
                isValid: true,
                blogPosts: null
            },
            isLoaded: false
        }
    }

    async componentDidMount() {
        const blog = atob(this.props.match.params.id);

        await auth.fetch(blog, {
            method: 'GET',
            credentials: 'include',
          }).then(res => {
            if (res.status === 404) this.setState({blog: {isValid: false}});
        });

        if(this.state.blog.isValid) {
            const blogOwner = await data[blog].schema$author;
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
            let blogPosts = [];
            for await(const post of data[blog].schema$blogPost) blogPosts.push(post.toString());
            this.setState({
                blog: {
                    url: blog,
                    blogPosts: blogPosts, 
                    isValid: true
                }
            });
        }

        this.setState({ isLoaded: true });
    }

    async handleCreateBlog() {
        const store = $rdf.graph();
        const session = await auth.currentSession();
        const schemaORG = new $rdf.Namespace("http://schema.org/");
        const rdf = new $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
        const myStorage = await data[session.webId].storage;
    
        const storage = store.sym(myStorage.toString() + "public/blog");
        const me = store.sym(session.webId);
        store.add(storage, schemaORG("author"), me);
        store.add(storage, rdf("type"), schemaORG("Blog"));
        const body = $rdf.Serializer(store).toN3(store);
    
        const response = await auth.fetch(myStorage.toString() + "public/blog", {
          method: 'PUT',
          body: body,
          credentials: 'include',
        });
        console.log(response);
        window.location.reload();
      }

    render() {
        var { isLoaded, blog, isOwner } = this.state;
        return (
            <div>
                <Navbar />
                {!isLoaded ? (
                    <div className="container py-5"><h2>Loading ...</h2></div>
                ) : (
                    blog.isValid ? (
                        <div className="container py-5">
                            <h2>Welkom op deze blog</h2>
                            <hr/>
                            <h2>Blog posts:</h2>
                            {isOwner?(
                                <Link to="/blogpost/create">Maak een nieuwe blog post aan</Link>
                            ):(
                                <br/>
                            )}
                            <div>
                                {blog.blogPosts.map((url, i) => (
                                    <BlogPostSmall key={i} url={url} />
                                ))}
                            </div>
                        </div> 
                    ) : (
                        <div className="container py-5">
                            <h2>
                                Je hebt nog geen blog. Klik op onderstaande link om een nieuwe blog aan te maken.
                            </h2>
                            <button onClick={this.handleCreateBlog}>Maak een nieuwe blog aan</button>
                        </div> 
                    )
                )}
                <Footer />
            </div>
        );
    }
}
