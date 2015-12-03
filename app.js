'use strict';

const express = require('express');
const trustedApp = require('./lib/sso-trusted-app');
const requestUrl = require('./lib/request-url');

var app = express();

const PUBLIC_KEY =
	"MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmP5gpPXUwXix9MieRN1bgI4odNVuRkPj+nmyKiLZ5zNhH" +
	"cecKzL9YFOf4LGvCjaukOt9thYdUBtgUdW0NjqqvtQ9PcnfDlNSdgfX/ag4X7WqKbJ8M+Z2yYsfQb32ItJYe/01OO" +
	"U6/k6twt1X4qIAIvJsflBh6Qqtjualwek28kSGCtC1JC/4m2pLvWrfxJqZF8UrMeZt2Zge0TanXz1Dnbjnz8dAH61" +
	"fABf7iFlCgkNn6U6jlYCoke9hMVMIWUe9Q5oBAre/jg5n8oCVLINgK7wWpIovBIT8foB7PL9SuM6gNkmtTVSBIvX3" +
	"t+P8ghvi8xafgoicl06PzwOwthYCPwIDAQAB";

trustedApp.setPublicKey(PUBLIC_KEY);

app.get('/*', (req, res) => {
	let url = requestUrl.getTarget(req);
	let providerId = req.header(trustedApp.HEADER_PROVIDER_ID);
	let certificate = req.header(trustedApp.HEADER_CERTIFICATE);
	let signature = req.header(trustedApp.HEADER_SIGNATURE);

	let okay = trustedApp.verifySignature(url, certificate, signature);

	res.set(trustedApp.HEADER_STATUS, okay ? 'OK' : 'Error').end();
});

var server = app.listen(4040, () => {
	console.log('Listening at port %s', server.address().port);
});
