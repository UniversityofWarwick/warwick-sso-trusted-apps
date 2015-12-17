'use strict';

const fetch = require('node-fetch');
const trustedApps = require('../lib/trusted-apps');

trustedApps.setConfig(require('./config.json'));

let timestamp = new Date().getTime();
let providerId = 'example';
let username = 'someone';
let url = 'http://localhost:4040/some/url?with=query_string';

let headers = trustedApps.getRequestHeaders(providerId, timestamp, url, username);
console.log(headers);

fetch(url, {
  headers: headers
}).then(response => {
  console.log(response.headers);
  response.text().then(text => console.log(text));
});
