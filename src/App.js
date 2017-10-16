import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';

class App extends Component {
  state = {
    user: null,
    secureDataResponse: null
  };

  login = () => {
    
  };

  logout = () => {
    
  };

  getMessage = error => error.response
    ? error.response.data
      ? error.response.data.message
      : JSON.stringify(error.response.data, null, 2)
    : error.message;

  fetchSecureData = () => {
    axios.get('/secure-data').then(response => {
      this.setState({ secureDataResponse: JSON.stringify(response.data, null, 2) });
    }).catch(error => {
      this.setState({ secureDataResponse: this.getMessage(error) });
    })
  };

  render() {
    const { user, secureDataResponse } = this.state;
    const userData = JSON.stringify(user, null, 2);

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <div className="App-intro">
          <div className="section">
            <button onClick={this.login}>Log in</button>
            {' '}
            <button onClick={this.logout}>Log out</button>
          </div>
          <div className="section">
            <h2>User data:</h2>
            <div>{userData}</div>
          </div>
          <div className="section">
            <button onClick={this.fetchSecureData}>Fetch secure data</button>
            <div>{secureDataResponse}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
