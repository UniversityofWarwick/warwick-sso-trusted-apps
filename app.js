'use strict';

const express = require('express');
const trustedApp = require('./lib/sso-trusted-app');

var app = express();

const PUBLIC_KEY = "SET ME";

trustedApp.setPublicKey(PUBLIC_KEY);

app.get('/', (req, res) => {
	let providerId = req.header(trustedApp.HEADER_PROVIDER_ID);
	let certificate = req.header(trustedApp.HEADER_CERTIFICATE);
	let signature = req.header(trustedApp.HEADER_SIGNATURE);

	let url = 'http://localhost:4040/';

	let okay = trustedApp.verifySignature(url, certificate, signature);

	res.set(trustedApp.HEADER_STATUS, okay ? 'OK' : 'Error').end();
});

var server = app.listen(4040, () => {
	console.log('Listening at port %s', server.address().port);
});
