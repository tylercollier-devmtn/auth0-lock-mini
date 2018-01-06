import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Auth0Lock from 'auth0-lock';
import axios from 'axios';

class App extends Component {
  state = {
    user: null,
    secureDataResponse: null
  };
  lock = null;

  componentDidMount() {
    this.lock = new Auth0Lock(process.env.REACT_APP_AUTH0_CLIENT_ID, process.env.REACT_APP_AUTH0_DOMAIN);
    this.lock.on('authenticated', this.onAuthenticated);
    axios.get('/user-data').then(response => {
      this.setState({ user: response.data.user || null });
    });
  }

  onAuthenticated = (authResult) => {
    console.log('authResult', authResult);
    axios.post('/login', { accessToken: authResult.accessToken} ).then(response => {
      this.setState({ user: response.data.user });
    });
  };

  login = () => {
    this.lock.show();
  };

  logout = () => {
    axios.post('/logout').then(() => {
      this.setState({ user: null });
    });
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
            <div><pre>{userData}</pre></div>
          </div>
          <div className="section">
            <button onClick={this.fetchSecureData}>Fetch secure data</button>
            <div><pre>{secureDataResponse}</pre></div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
