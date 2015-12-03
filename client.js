'use strict';

const fetch = require('node-fetch');
const trustedApps = require('./lib/sso-trusted-apps');

trustedApps.setSSOConfig(require('./sso-config.json'));

let timestamp = new Date().getTime();
let providerId = 'whatever';
let username = 'u1473579';
let url = 'http://localhost:4040/some/url?with=query_string';

let headers = trustedApps.getRequestHeaders(providerId, timestamp, url, username);
console.log(headers);

fetch(url, {
  headers: headers
}).then(response => {
  console.log(response.headers);
  response.text().then(text => console.log(text));
});
