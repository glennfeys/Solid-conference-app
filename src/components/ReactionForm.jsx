import React, { Component } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import auth from 'solid-auth-client';
const $rdf = require("rdflib");
const { default: data } = require('@solid/query-ldflex');

export default class ReactionForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            blogPostURL: "",
            reactionURL: "",
            isEditing: false,
            text: "",
            isLoaded: false
        }
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.goBack = this.goBack.bind(this);
    }

    async componentDidMount() {
        
        if (this.props.match.params.rid) {
            const reactionUrl = atob(this.props.match.params.rid);
            const reaction = await data[reactionUrl];
            this.setState({ 
                isEditing: true,
                reactionURL: reactionUrl,
                text: (await data[reaction].schema$text).toString(),
                isLoaded: true,
            });
        } else {
            const url = atob(this.props.match.params.id);
            this.setState({
                isLoaded: true,
                blogPostURL: url,
            });
        }
    }

    async handleSubmit(event){
        event.preventDefault();
        console.log("##############################################");
        var { blogPostURL, text} = this.state;

        const store  = $rdf.graph();
        const session = await auth.currentSession();
        const schemaORG = new $rdf.Namespace("http://schema.org/");
        const rdf = new $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
        const myStorage = await data[session.webId].storage;

        let url = myStorage.toString() + "public/"+ this.uuid()
        console.log(url);
        const storage = store.sym(url);
        const me = store.sym(session.webId);
        
        store.add(storage, schemaORG("author"), me);
        store.add(storage, schemaORG("text"), text);
        store.add(storage, schemaORG("about"), blogPostURL);
        store.add(storage, schemaORG("dateCreated"), new Date().toJSON().slice(0,10));
        store.add(storage, schemaORG("url"), url);
        store.add(storage, rdf("type"), schemaORG("Comment"));
        const body = $rdf.Serializer(store).toN3(store);
        
        //Voorlopig kan je enkel zelf comment's aanmaken
        const response = await auth.fetch(url, {
        method: 'PUT',
        body: body,
        credentials: 'include',
        });
        console.log(response);

        const query = `
        INSERT DATA {
          <${blogPostURL}> <${schemaORG("comment").value}> <${url}>.
        }`;

        const response2 = await auth.fetch(blogPostURL, {
            'method': 'PATCH',
            'headers': { 'Content-Type': 'application/sparql-update' },
            'body': query,
            'credentials': "include"
        });
        console.log(response2);
        this.goBack();
    }

    async handleEdit(event){
        event.preventDefault();
        console.log("##############################################");
        var { text, reactionURL  } = this.state;

        const schemaORG = new $rdf.Namespace("http://schema.org/");
        console.log(reactionURL);
        console.log(schemaORG("text").value);

        const queryDelete = `
        DELETE {
            <${reactionURL}> <${schemaORG("text").value}> ?h.
        } WHERE {
            <${reactionURL}> <${schemaORG("text").value}> ?h.
        }`;

        const queryEdit = `
        INSERT DATA {
            <${reactionURL}> <${schemaORG("text").value}> "${text}".
          }`;

        const response1 = await auth.fetch(reactionURL, {
            'method': 'PATCH',
            'headers': { 'Content-Type': 'application/sparql-update' },
            'body': queryDelete,
            'credentials': "include"
        });
        console.log(response1);

        const response2 = await auth.fetch(reactionURL, {
            'method': 'PATCH',
            'headers': { 'Content-Type': 'application/sparql-update' },
            'body': queryEdit,
            'credentials': "include"
        });
        console.log(response2);
        this.goBack();
    }

    uuid() {
        return 'xxxxxxxxxx'.replace(/[xy]/g, c => {
          var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
    }

    handleChange(event) {
        const { name, value } = event.target;
        this.setState({ [name]: value });
    }

    goBack(){
        this.props.history.goBack();
        window.location.reload(true);
    }

    render() {
        var { isLoaded, text, isEditing } = this.state;
        return (
            <div>
                <Navbar />
                {!isLoaded ? ( // if users are not loaded
                    <div className="container py-5"><h2>Loading ...</h2></div>
                ) : (         // else
                        <div className="container py-5">
                            <form className="col-lg-6 mx-auto" onSubmit={isEditing?this.handleEdit:this.handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="text">inhoud:</label>
                                    <textarea className="form-control" onChange={this.handleChange} type="text" rows="5" name="text" placeholder="tekst" required>{isEditing ? text : ""}</textarea>
                                </div>
                                <div className="d-flex flex-row justify-content-between">
                                    <button className="btn btn-dark" type="submit">submit</button>
                                    <a href="#" onClick={this.props.history.goBack}>terug naar blogpost</a>
                                </div>
                            </form>
                        </div>
                    )}
                <Footer />
            </div>
        );
    }
}
