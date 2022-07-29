import React, { Component } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './components/Home';
import Blog from './components/Blog';
import BlogPost from './components/BlogPost';
import BlogPostForm from './components/BlogPostForm';
import ReactionForm from './components/ReactionForm';
import Error404 from './components/Error404';

class App extends Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path='/' component={Home} />
          <Route exact path='/blog/:id'  render={(props) => <Blog {...props}/>} />
          <Route exact path='/blogpost/create'  render={(props) => <BlogPostForm {...props}/>} />
          <Route exact path='/blogpost/:id'  render={(props) => <BlogPost {...props}/>} />
          <Route exact path='/blogpost/:id/edit'  render={(props) => <BlogPostForm {...props} isEdit={true}/>} />
          <Route exact path='/blogpost/:id/react'  render={(props) => <ReactionForm {...props}/>} />
          <Route exact path='/reaction/:rid/edit'  render={(props) => <ReactionForm {...props}/>} />
          <Route path="*" component={Error404} />
        </Switch>
      </Router>
    );
  }
}

export default App;
