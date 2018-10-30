# Work in Progress Cultural Heritage 3D Viewer Platform
Built with React, Node, and three.js

## Dependencies

Node.js >= v8.9.0

npm >= 5.5.1

MongoDB >= v3.0

## Installation
Clone this repo and run:

`npm install-all`

to install both the server and client apps.

The server app requires 2 configuration files located in the server/ folder:

###### *privatekey.json*

Stores the private key used for JWT generation, eg:

```
{
  "key": "myprivatekey"
}
```

###### *email.json*
Stores the email configuration for the server app, eg:

```
{
  "verificationRoute": "http://localhost:3000/admin/verify/",
  "service": "gmail",
  "email": "myemail@gmail.com",
  "password": "mypassword"
}
```

service, email, and password are standard Nodemailer transport options. vertificationRoute is the client side (React Router) route that will be linked in the body of all verification e-mails. The user's verification token will be appended to that route.

An optional *config.js* file can be added to the server folder, allowing customization of both the MongoDB URL and the API server port:

```
const config = {
  mongoURL: 'mongodb://localhost:27017/mydb',
  port: 3001
};

module.exports = config;
```

All of the above files have sample versions (i.e. sample-config.js) you can reference in the server folder.

##### To run in dev mode:

`npm run dev`

This runs the API server on localhost:3001 and the create-react-app dev server on localhost:3000. All API requests are proxied from port 3000 to 3001.

##### To run with a production build of the client app:
Change the "homepage" property in client/package.json in order to set process.env.PUBLIC_URL to the URL that the app will be served from, i.e.
"https://myapps/threejs-app".

Build the client app with the environment variable REACT_APP_API_URL to specify the API URL for the server app, i.e.

API_URL='https://myapps/threejs-server' npm run build

Follow the instructions in the terminal to deploy the client app.
