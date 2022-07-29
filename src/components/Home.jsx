import React, { Component } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
const { default: data } = require('@solid/query-ldflex');

export default class Home extends Component {

  constructor(props) {
    super(props);

    this.state = {
      search_blog_url: null
    }

    this.handleChange = this.handleChange.bind(this);
    this.goToBlog = this.goToBlog.bind(this);

  }

  handleChange(event) {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  }

  async goToBlog() {
    //tests op legit zijn van url
    try {
      const type = (await data[this.state.search_blog_url].type).toString();
      if(type === "http://schema.org/Blog") {
        this.props.history.push("/blog/" + btoa(this.state.search_blog_url));
      } else {
        alert("de url die u ingaf is incorrect !");
      } 
    } catch (error) {
      alert("de url die u ingaf is incorrect !");
    }
  }

  render() {
    let { search_blog_url } = this.state;
    return (
      <div>
        <Navbar />
        <div className="container py-5 text-center">
          <h2>Welkom</h2>
          <h4>
            Klik op 'Mijn blog' in de navigatiebalk om naar je eigen blog te gaan.
            <br />
            Of gebruik onderstaande veld om een andere persoon zijn blog te bekijken.
          </h4>
          <div className="row justify-content-center">
            <input className="form-control col-6" onChange={this.handleChange} name="search_blog_url" value={search_blog_url} type="text" placeholder="blog url" required />
            <button onClick={this.goToBlog}>Ga naar deze blog</button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }
}
