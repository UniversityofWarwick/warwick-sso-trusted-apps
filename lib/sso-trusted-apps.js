'use strict';

const crypto = require('crypto');
const forge = require('node-forge');

var CONFIG;

function setSSOConfig(config) {
  CONFIG = config;

  // Trust thyself
  CONFIG.trustedApps.apps[CONFIG.shire.providerId] = {
    publicKey: CONFIG.trustedApps.publicKey
  };

  setPublicKey(CONFIG.trustedApps.publicKey);
  setPrivateKey(CONFIG.trustedApps.privateKey);
}

let getRequestUrl = (req) => req.protocol + '://' + req.header('Host') + req.url;

function middleware(req, res, next) {
  function error(res, message) {
    res.status(400)
    .set(trustedapp.HEADER_STATUS, 'Error')
    .send({error: message})
    .end();
  }

  let url = getRequestUrl(req);

  let certificate = req.header(HEADER_CERTIFICATE);
  let providerId = req.header(HEADER_PROVIDER_ID);
  let signature = req.header(HEADER_SIGNATURE);

  if (certificate) {
    if (!providerId)
      return error(res, 'Provider ID not found in request');

    let app = CONFIG.trustedApps.apps[providerId];

    if (!app)
      return error(res, 'Unknown application: ' + providerId);

    if (!signature)
      return error(res, 'Missing signature in request');

    let okay = verifySignature(url, certificate, signature);

    if (!okay)
      return error(res, 'Bad signature for URL: ' + url);

    res.set(HEADER_STATUS, 'OK');

    req.user = {
      usercode: decodeCertificate(certificate).username
    };
  } else {
    req.user = {};
  }

  next();
}

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
  setSSOConfig,
  getRequestHeaders,
  verifySignature,
  decodeCertificate,
  middleware,
  HEADER_PROVIDER_ID,
  HEADER_SIGNATURE,
  HEADER_CERTIFICATE,
  HEADER_STATUS,
  HEADER_ERROR_CODE,
  HEADER_ERROR_MESSAGE
};
