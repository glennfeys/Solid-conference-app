import React, { Component } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export default class Home extends Component {
  render() {
    return (
      <div>
          <Navbar />
          <div className="container" id="mainDiv">
            <h2>Error 404</h2>
            <h4>De link die u probeerde te bezoeken werd niet gevonden.</h4>
          </div>
          <Footer />
      </div>
    )
  }
}