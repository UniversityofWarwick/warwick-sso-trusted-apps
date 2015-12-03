'use strict';

const express = require('express');
const trustedApps = require('./lib/sso-trusted-apps');

trustedApps.setSSOConfig(require('./sso-config.json'));

var app = express();
app.use(trustedApps.middleware);

app.get('/*', (req, res) => {
  res.send('Hello, ' + req.user.usercode);
});

var server = app.listen(4040, () => {
  console.log('Listening at port %s', server.address().port);
});
