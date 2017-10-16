# Auth0-lock-demo

An example of how to use Auth0 from React and Node/Express.

## Instructions

Create a `.env` file based on `.env.example`. You will need:
* A connection string for Postgres.
* The domain and client ID for an Auth0 client. Make sure the callback URLs list includes http://localhost:3000/, and that OIDC conformant is turned off in Advanced Settings > OAuth.
