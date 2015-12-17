'use strict';

const express = require('express');
const trustedApps = require('../lib/trusted-apps');

trustedApps.setConfig(require('./config.json'));

var app = express();
app.use(trustedApps.middleware);

app.get('/*', (req, res) => {
  if (req.user) {
    res.send('Hello, ' + req.user.usercode);
  } else {
    res.send('Who are you?');
  }
});

var server = app.listen(4040, () => {
  console.log('Listening at port %s', server.address().port);
});
