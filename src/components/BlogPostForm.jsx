import React, { Component } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import auth from 'solid-auth-client';
const $rdf = require("rdflib");
const { default: data } = require('@solid/query-ldflex');

export default class BlogPostForm extends Component {
    constructor(props) {
        super(props);
        console.log(props)
        this.state = {
            blogPostURL: "",
            isEditing: false,
            headline: "", 
            articleBody: "", 
            keywords: "",
            isLoaded: false
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.goBack = this.goBack.bind(this);
    }

    async componentDidMount() {
        if (this.props.isEdit) {
            const url = atob(this.props.match.params.id);
            const blogPost = await data[url];
            this.setState({
                isEditing: true,
                blogPostURL: url,
                headline: (await data[blogPost].schema$headline).toString(),
                articleBody: (await data[blogPost].schema$articleBody).toString(),
                keywords: (await data[blogPost].schema$keywords).toString(),
            });
        }
        this.setState({ isLoaded: true });
    }

    async handleSubmit(event){
        event.preventDefault();
        console.log("############################################## handle submit");
        var { headline, articleBody, keywords } = this.state;

        const store  = $rdf.graph();
        const session = await auth.currentSession();
        const schemaORG = new $rdf.Namespace("http://schema.org/");
        const rdf = new $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
        const myStorage = await data[session.webId].storage;
        
        let uuid = this.uuid();
        let url = myStorage.toString() + "public/"+ uuid;
        console.log(url);
        const storage = store.sym(url);
        const me = store.sym(session.webId);
        
        store.add(storage, schemaORG("author"), me);
        store.add(storage, schemaORG("headline"), headline);
        store.add(storage, schemaORG("articleBody"), articleBody);
        store.add(storage, schemaORG("keywords"), keywords);
        store.add(storage, schemaORG("dateCreated"), new Date().toJSON().slice(0,10));
        store.add(storage, schemaORG("url"), url);
        store.add(storage, rdf("Type"), schemaORG("BlogPosting"));
        const body = $rdf.Serializer(store).toN3(store);

        const response = await auth.fetch(url, {
        method: 'PUT',
        body: body,
        credentials: 'include',
        });
        console.log(response);

        const blogURL = myStorage.toString() + "public/blog";

        const query = `
        INSERT DATA {
          <${blogURL}> <${schemaORG("blogPost").value}> <${url}>.
        }`;

        const response2 = await auth.fetch(blogURL, {
            'method': 'PATCH',
            'headers': { 'Content-Type': 'application/sparql-update' },
            'body': query,
            'credentials': "include"
        });
        console.log(response2);

        //edit permissions
        
        const queryACL = `
        @prefix : <#>.
        @prefix n0: <http://www.w3.org/ns/auth/acl#>.
        @prefix pub: <./>.
        @prefix n1: <http://xmlns.com/foaf/0.1/>.
        @prefix c: </profile/card#>.

        :Append a n0:Authorization; n0:accessTo pub:${uuid}; n0:mode n0:Append.

        :AppendRead
            a n0:Authorization;
            n0:accessTo pub:${uuid};
            n0:agentClass n1:Agent;
            n0:mode n0:Append, n0:Read.
        :ControlReadWrite
            a n0:Authorization;
            n0:accessTo pub:${uuid};
            n0:agent c:me;
            n0:mode n0:Control, n0:Read, n0:Write.
        `;

        const response3 = await auth.fetch(url+".acl", {
            'method': 'PUT',
            'body': queryACL,
            'credentials': "include"
        });
        console.log(response3);
        this.goBack();
    }

    async handleEdit(event){
        event.preventDefault();
        console.log("##############################################");
        var { headline, articleBody, keywords, blogPostURL } = this.state;

        const schemaORG = new $rdf.Namespace("http://schema.org/");
        console.log(blogPostURL);

        const queryDelete = `
        DELETE { 
            <${blogPostURL}> <${schemaORG("headline").value}> ?h.
            <${blogPostURL}> <${schemaORG("keywords").value}> ?k.
            <${blogPostURL}> <${schemaORG("articleBody").value}> ?a.
        } WHERE { 
            <${blogPostURL}> <${schemaORG("headline").value}> ?h.
            <${blogPostURL}> <${schemaORG("keywords").value}> ?k.
            <${blogPostURL}> <${schemaORG("articleBody").value}> ?a.
        }`;

        const queryEdit = `
        INSERT DATA {
            <${blogPostURL}> <${schemaORG("headline").value}> "${headline}".
            <${blogPostURL}> <${schemaORG("keywords").value}> "${keywords}".
            <${blogPostURL}> <${schemaORG("articleBody").value}> "${articleBody}".
          }`;

        const response1 = await auth.fetch(blogPostURL, {
            'method': 'PATCH',
            'headers': { 'Content-Type': 'application/sparql-update' },
            'body': queryDelete,
            'credentials': "include"
        });
        console.log(response1);

        const response2 = await auth.fetch(blogPostURL, {
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

        var { isLoaded, isEditing, headline, articleBody, keywords } = this.state;
        return (
            <div>
                <Navbar />
                {!isLoaded ? ( // if users are not loaded
                    <div className="container py-5"><h2>Loading ...</h2></div>
                ) : (         // else
                        <div className="container py-5">
                            <form className="col-lg-6 mx-auto" onSubmit={isEditing?this.handleEdit:this.handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="headline">headline</label>
                                    <input className="form-control" value={headline} onChange={this.handleChange} type="text" name="headline" placeholder="titel" required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="articleBody">inhoud:</label>
                                    <textarea className="form-control" onChange={this.handleChange} type="articleBody" rows="5" name="articleBody" placeholder="tekst" required>{articleBody}</textarea>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="keywords">tags:</label>
                                    <textarea className="form-control" onChange={this.handleChange} type="keywords" rows="5" name="keywords" placeholder="tekst" required>{keywords}</textarea>
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


