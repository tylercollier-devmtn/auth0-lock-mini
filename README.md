# Auth0-lock-demo

An example of how to use Auth0's Lock library with React and Node/Express.

## Instructions

Create a `.env` file based on `.env.example`. You will need:
* A connection string for Postgres.
* The domain and client ID for an Auth0 client. Make sure, in the settings on the Auth0 website for the client you use, the callback URLs list includes http://localhost:3000/, and that OIDC conformant is turned off in Advanced Settings > OAuth.

Now run `npm start` in one terminal to run the create-react-app server. It should launch your browser, pointed at http://localhost:3000.

You'll also need to run `node server/index.js` in another to start our server.

## FAQ

**Is using Auth0's Lock library less secure than the old Auth0 flow?**

Nope. The Lock library communicates with Auth0 servers and gets back a JWT (JSON Web Token). This value is encoded, though not encrypted. You can decode JWTs for debug purposes at https://jwt.io. However, encryption isn't necessary assuming your site is served using HTTPS.

On [this page](https://auth0.com/blog/json-web-token-signing-algorithms-overview/), it says:

> At Auth0 we rely heavily on the features of JWTs. All of our APIs handle authentication and authorization through JWTs. For instance, our Lock library returns a JWT that you can store client side and use for future requests to your own APIs. Thanks to JWS and JWE, the contents of the client-side JWTs are safe.

**What else should I notice?**

Compare how much code, and confusion, has been cut out, compared to the "old way". There's no use of or need for Passport either. Not only have students had trouble logging in with Auth0 in the past, they've even had trouble logging out. That's an operation that *should* be trivial, and certainly is in this flow. It doesn't need to touch Auth0 at all. That's because the traditional Auth0 flow uses cookies. The Auth0 Lock flow instead uses JWTs.
