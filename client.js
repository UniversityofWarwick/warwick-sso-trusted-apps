'use strict';

const fetch = require('node-fetch');

const trustedApp = require('./lib/sso-trusted-app');

const PRIVATE_KEY = "SET ME";

trustedApp.setPrivateKey(PRIVATE_KEY);

let timestamp = new Date().getTime();
let providerId = 'whatever';
let username = 'u1473579';
let url = 'http://localhost:4040/';

let headers = trustedApp.getRequestHeaders(providerId, timestamp, url, username);
console.log(headers);

fetch(url, {
	headers: headers
}).then(response => console.log(response.headers));
