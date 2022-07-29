import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import auth from 'solid-auth-client'
import { Image } from '@solid/react';
import '../App.css'
const { default: data } = require('@solid/query-ldflex')
const myImg = "https://fiverr-res.cloudinary.com/images/t_main1,q_auto,f_auto/gigs/109296518/original/ed82bc79de6c9acf7de693584d51edf27e06641d/create-a-custom-fortnite-character-profile-picture.png";


export default class Reaction extends Component {

    constructor(props) {
        super(props);
        this.state = {
            reaction: {
                author: null,
                text: null,
                about: null,
                dateCreated: null,
                url: null,
            },
            isLoaded: false,
            isOwner: null,
            owner: null,
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
        const reaction = await data[this.props.url];

        const blogOwner = await data[reaction].schema$author;


        const session = await auth.currentSession();
        if (session){
            const currentUser = session.webId;
            this.setState({
                isOwner: currentUser === blogOwner.toString(),
                owner: blogOwner.toString(),
            });
        } else {
            this.setState({
                isOwner: false,
                owner: blogOwner.toString(),
            });
        }

        this.setState({
            reaction: {
                author: (await data[await data[reaction].schema$author].name).toString(),
                text: (await data[reaction].schema$text).toString(),
                about: (await data[reaction].schema$about).toString(),
                created_date: (await data[reaction].schema$dateCreated).toString(),
                url: reaction,
            },
            isLoaded: true,
        });
    }

    render() {

        const invisible = {display: 'none'};
        const visible = {};

        var { isLoaded, reaction, isOwner, owner, isValid } = this.state;
        console.log(owner);

        return (
            <div className="my-3" style={isValid?visible:invisible}>
                {!isLoaded ? (
                    <div className="container py-5"><h2>Loading ...</h2></div>
                ) : (
                    <div className="card">
                        <div className="card-header p-2">
                            <h5>Beoordeling door {reaction.author}</h5></div>
                        <div className="card-body">
                            <Image src={`[${owner}].image`} defaultSrc={myImg} className="pic" />
                            <p>{reaction.text}</p>
                            <p>{reaction.created_date}</p>

                            {isOwner?(
                                <Link to={'/reaction/' + btoa(reaction.url) + "/edit"}>edit</Link>
                            ):(
                                <br/>
                            )}
                            
                        </div>
                    </div>
                )}
            </div>
        );
    }
}
