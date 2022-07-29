import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import auth from 'solid-auth-client'
const { default: data } = require('@solid/query-ldflex');

export default class BlogPost extends Component {

    constructor(props) {
        super(props);
        this.state = {
            blogPost: {
                url: null,
                headline: null,
                body: null,
                created_date: null
            },
            isLoaded: false,
            isValid: true,
        }
    }

    async componentDidMount() {
        const response = await auth.fetch(this.props.url , {
            method: 'GET',
            credentials: 'include',
        });
        console.log(response.status);
        if (response.status !== 200){
            this.setState({
                isLoaded: true,
                isValid:false,
            });
            return;
        }

        const blogPost = await data[this.props.url];

        this.setState({blogPost: {
            url: this.props.url,
            headline: (await data[blogPost].schema$headline).toString(),
            body: (await data[blogPost].schema$articleBody).toString(),
            created_date: (await data[blogPost].schema$dateCreated).toString() // TODO: should be created
        }});

        this.setState({ isLoaded: true });
    }

    render() {

        const invisible = {display: 'none'};
        const visible = {};

        var { isLoaded, blogPost, isValid } = this.state;
        return (
            <div style={isValid?visible:invisible}>
                {!isLoaded ? ( // if users are not loaded
                    <div className="container py-5"><h2>Loading ...</h2></div>
                ) : (         // else
                    
                    <div className="py-3">
                        <div className="card">
                            <div className="card-body">
                                <h5>{blogPost.headline}</h5>
                                <p>{blogPost.body}</p>
                                <p>{blogPost.created_date}</p>
                                <Link to={'/blogpost/' + btoa(blogPost.url)}>Lees meer...</Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}