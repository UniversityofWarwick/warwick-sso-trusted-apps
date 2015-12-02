'use strict';

const crypto = require('crypto');
const forge = require('node-forge');

const HEADER_PREFIX = 'X-Trusted-App-';

// Request headers
const HEADER_PROVIDER_ID = HEADER_PREFIX + 'ProviderID';
const HEADER_CERTIFICATE = HEADER_PREFIX + 'Cert';
const HEADER_SIGNATURE = HEADER_PREFIX + 'Signature';

// Response headers
const HEADER_STATUS = HEADER_PREFIX + "Status";
const HEADER_ERROR_CODE = HEADER_PREFIX + "Error-Code";
const HEADER_ERROR_MESSAGE = HEADER_PREFIX + "Error-Message";

const SIGNATURE_ALGORITHM = 'RSA-SHA1';

function generateSignatureBaseString(timestamp, url, username) {
	let separator = "\n";

	return timestamp + separator + url + separator + username;
}

function makeCertificate(timestamp, username) {
	let separator = "\n";

	return forge.util.encode64(timestamp + separator + username);
}

function toPublicKey(str) {
	return forge.pki.publicKeyToPem(
		forge.pki.publicKeyFromAsn1(
			forge.asn1.fromDer(
				forge.util.decode64(str)
			)
		)
	);
}

function toPrivateKey(str) {
	return forge.pki.privateKeyToPem(
		forge.pki.privateKeyFromAsn1(
			forge.asn1.fromDer(
				forge.util.decode64(str)
			)
		)
	);
}

var privateKey, publicKey;

function setPublicKey(str) {
	publicKey = toPublicKey(str);
}

function setPrivateKey(str) {
	privateKey = toPrivateKey(str);
}

function createSignature(timestamp, url, username) {
	return crypto.createSign(SIGNATURE_ALGORITHM)
		.update(generateSignatureBaseString(timestamp, url, username))
		.sign(privateKey, 'base64');
}

function verifySignature(url, certificate, signature) {
	let cert = decodeCertificate(certificate);

	return crypto.createVerify(SIGNATURE_ALGORITHM)
		.update(generateSignatureBaseString(cert.timestamp, url, cert.username))
		.verify(publicKey, signature, 'base64');
}

function getRequestHeaders(providerId, timestamp, url, username) {
	let certificate = makeCertificate(timestamp, username);
	let signature = createSignature(timestamp, url, username);

	return {
		[HEADER_PROVIDER_ID]: providerId,
		[HEADER_CERTIFICATE]: certificate,
		[HEADER_SIGNATURE]: signature
	};
}

function decodeCertificate(certificate) {
	let decodedCertificate = forge.util.decode64(certificate).split("\n");

	return {
		timestamp: decodedCertificate[0],
		username: decodedCertificate[1]
	};
}

module.exports = {
	setPublicKey,
	setPrivateKey,
	getRequestHeaders,
	verifySignature,
	HEADER_PROVIDER_ID,
	HEADER_SIGNATURE,
	HEADER_CERTIFICATE,
	HEADER_STATUS,
	HEADER_ERROR_CODE,
	HEADER_ERROR_MESSAGE
};
