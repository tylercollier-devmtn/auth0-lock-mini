const express = require('express');
const bodyPaser = require('body-parser');
const session = require('express-session');
const massive = require('massive');
const axios = require('axios');

require('dotenv').config();
massive(process.env.CONNECTION_STRING).then(db => app.set('db', db));

const app = express();
app.use(bodyPaser.json());
app.use(session({
  secret: "mega hyper ultra secret",
  saveUninitialized: false,
  resave: false,
}));
app.use(express.static(`${__dirname}/../build`));

app.post('/login', (req, res) => {
  const { accessToken } = req.body;
  const auth0Url = 'https://' + process.env.REACT_APP_AUTH0_DOMAIN + '/userinfo';
  axios.get(auth0Url, {
    headers: { authorization: 'Bearer ' + accessToken },
  }).then(response => {
    const userData = response.data;
    app.get('db').find_user_by_auth0_id(userData.sub).then(users => {
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

app.post('/logout', (req, res) => {
  req.session.destroy();
  res.send();
});

app.get('/user-data', (req, res) => {
  res.json({ user: req.session.user });
});

function checkLoggedIn(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.status(403).json({ message: 'Unauthorized' });
  }
}

app.get('/secure-data', checkLoggedIn, (req, res) => {
  res.json({ someSecureData: 123 });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server listening on port ' + PORT);
});
