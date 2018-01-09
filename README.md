<img src="https://devmounta.in/img/logowhiteblue.png" width="250" align="right">

# Project Summary

In this project, we'll use a service called Auth0 to do the heavy lifting of auth for us, including allowing for social integrations (github, google, etc). We'll build a site that looks similar to the [auth-bcrypt-mini](https://github.com/tylercollier-devmtn/auth-bcrypt-mini) project but does not store any sensitive data in our tables.

## Setup

* `Fork` and `clone` this repository.
* `cd` into the project directory.
* Run `yarn`. You know to use yarn instead of npm because there is a `yarn.lock` file.
* Create a Postgres database. Use this project's `db/init.sql` file to create the schema.
* Copy the `env.example` file to a new file called `.env` and paste in the connection string to the postgres database. Later, we'll fill out your Auth0 domain and client ID.
* Start the server with `nodemon`.
* Start the web dev server with `npm start`. In your browser, open `http://localhost:3000`.

## Step 1

### Summary

In this step, we'll go to `manage.auth0.com` to create an account. We'll create a 'client' that represents this particular app.

### Instructions

* Go to `manage.auth0.com`.
* Register for an account.
  * Set the account type to `Personal`.
  * Set the role to `Developer`.
  * Set the project to `Just playing around`.
* Log in to your Auth0 account.
* Go to `Clients` using the left navigation bar.
* Click the `Create Client` button in the top right.
  * Pick a name (recommendation: `auth0-lock-mini`)
  * Change the `Client Type` to `Single Page Web Applications`.
  * Click Create.
  * Switch to the client's `Settings` tab.
  * Change the `Allowed Callback URLs` to `http://localhost:3000`.
  * Scroll toward the bottom and click the `Show Advanced Settings`, and switch to the OAuth tab. Change the `OIDC Conformant` toggle to off.
* Click `Save Changes`.
* Back at the top of the settings, copy the domain and client ID to your project's `.env` file. Be sure to restart your React web dev server to use these values.
* On the Auth0 website, click on Connections on the left hand side navigation, and then Social.
  * Enable the Github connection.

## Step 2

### Summary

In this step, we'll add the Auth0 Lock library to the React website and initialize it.

### Instructions

* First add the `auth0-lock` library with `yarn add auth0-lock`.
* Open the `src/App.js` file.
* In the `constructor`:
  * set state for `user` and `secureDataResponse` to `null`.
  * Set a member property named `lock` to `null`.
* Add a `componentDidMount()` method:
  * Set `this.lock` to equal `new Auth0Lock()`, and pass in your client ID and domain, using the environment variables from `process.env.<ENV VAR NAME HERE>`.
  * Add a handler to Lock's `authenticated` event using `this.lock.on(...)`. The handler should be a prototype method named `onAuthenticated`. We'll fill out that method in the next step.
  * Make an axios GET request to `/user-data`. Use the response data to set the React user state.
    * If there is no response data, set the React user state to `null`. By setting the state to null instead of `undefined`, the displayed user state will show as the word "null" instead of blank.

### Solution

<details>
<summary><code>App.js</code></summary>

```js
import Auth0Lock from 'auth0-lock';

class App extends Component {
  constructor() {
    super();
    this.state = {
      user: null,
      secureDataResponse: null
    };
    this.lock = null;
    this.logout = this.logout.bind(this);
    this.fetchSecureData = this.fetchSecureData.bind(this);
  }

  componentDidMount() {
    this.lock = new Auth0Lock(process.env.REACT_APP_AUTH0_CLIENT_ID, process.env.REACT_APP_AUTH0_DOMAIN);
    this.lock.on('authenticated', this.onAuthenticated);
    axios.get('/user-data').then(response => {
      this.setState({ user: response.data.user || null });
    });
  }
```
</details>

## Step 3

### Summary

In this step, we'll add a handler for when someone clicks the Log in button, and handle when authentication has happened on the client side.

### Instructions

* Open the `src/App.js` file.
* Bind the `onAuthenticated` prototype method in the constructor.
* In the previous step, we set up the handler for `this.lock.on('authenticated')`. Create that method.
  * It should take in a variable named `authResult`.
  * In the method, make an axios POST to `/login`. Send as the body an object with a property named `idToken`. The value should be the `idToken` from `authResult`.
* Add a `login` prototype method.
  * Show the Lock screen with `this.lock.show()`.
  * Bind the `login` prototype method in the constructor. 

### Solution

<details>
<summary><code>App.js</code></summary>

```js
class App extends Component {
  constructor() {
    // ...
    this.login = this.login.bind(this);
    this.onAuthenticated = this.onAuthenticated.bind(this);
  }
  
  // ...

  onAuthenticated(authResult) {
    axios.post('/login', { idToken: authResult.idToken} ).then(response => {
      this.setState({ user: response.data.user });
    })
  };

  login() {
    this.lock.show();
  };
```
</details>

## Step 4

### Summary

In this step, we'll handle the authentication on the server side.

### Instructions

* Open the `server/index.js` file.
* Navigate to the code for the `/login` endpoint.
* Destructure the `idToken` value from the request body.
* Construct a variable named `auth0Url` that looks like this: `https://<YOUR AUTH0 DOMAIN>/tokeninfo`. Use `process.env.<ENV VARIABLE NAME HERE>` to get the domain.
* Make an axios POST to that URL, sending the id token in a property called `id_token`.
    * First, put a `.catch()` on that call. If there's an error, it likely represents an invalid login. Simply return a 500 with a message.
    * The response data will include a property called `user_id`. Use that and `db/find_user_by_auth0_id.sql` to look up the user in the database.
    * If a user is found, create a `user` object on the session that is that user object from the database, and send back a response with that user in a property called `user`.
    * If the user is not found, it means they have never logged in before. This is conceptually a "register" situation. Use the `user_id` and `email` field from the response to create a user record. The `db/create_user.sql` file will be helpful for this.
      * After the record has been created, put the user object on the session in a property named `user`, and send back a response with that user in a property called `user`.

### Solution

<details>
<summary><code>server/index.js</code></summary>

```js
app.post('/login', (req, res) => {
  const { idToken } = req.body;
  const auth0Url = 'https://' + process.env.REACT_APP_AUTH0_DOMAIN + '/tokeninfo';
  axios.post(auth0Url, { id_token: idToken }).then(response => {
    const userData = response.data;
    app.get('db').find_user_by_auth0_id(userData.user_id).then(users => {
      if (users.length) {
        req.session.user = users[0];
        res.json({ user: req.session.user });
      } else {
        app.get('db').create_user([userData.user_id, userData.email]).then((newUsers) => {
          req.session.user = newUsers[0];
          res.json({ user: req.session.user });
        })
      }
    })
  }).catch(error => {
    console.log('error A', error);
    res.status(500).json({ message: "An error occurred; for security reasons it can't be disclosed" });
  });
});
```
</details>

## Contributions

If you see a problem or a typo, please fork, make the necessary changes, and create a pull request so we can review your changes and merge them into the master repo and branch.

## Copyright

© DevMountain LLC, 2018. Unauthorized use and/or duplication of this material without express and written permission from DevMountain, LLC is strictly prohibited. Excerpts and links may be used, provided that full and clear credit is given to DevMountain with appropriate and specific direction to the original content.

<p align="center">
<img src="https://devmounta.in/img/logowhiteblue.png" width="250">
</p>
