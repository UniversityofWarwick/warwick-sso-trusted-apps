'use strict';

var expect = require('chai').expect;
var assert = require('assert');
var sinon = require('sinon');

const SSO_CONFIG = require('./sso-config.json');
var trustedApps = require('../lib/sso-trusted-apps');
trustedApps.setSSOConfig(SSO_CONFIG);

let timestamp = Date.parse('2014-12-25 09:31:29.384');
let url = 'http://warwick.ac.uk?external=true';
let username = 'cuscav';
let exampleSignature =
  "E2DIaXFajtZU1abI51sWR+5WomVPYt/RpYLDA0XTkTfxATYm3cyX7IQPM8A9ZmkPBpHqKqG6pz9YBXraARhB9Fwjx+" +
  "skXI4GY5SCFJeosq3NDjj4Nkp5mFS8270hYsGisxQaoz9CwEnMT490DxqIB6ay801JGHXY68GSs0Cfv22IGumn3GhZ" +
  "3TYxaGHv63QYUsGATINoHlNkbnqmT5RfbnmywAb24rLrU5Scxa8Up3XWBNpmflmF//JybOhufRk7ewDLmtpfFFdwi6" +
  "elBjYtofUekVbxK811zzp1yd/IUhxq9nkODIMeSMYRdrZUCJcdJ963RCQBixzCxmkfN7Wiyw==";

let app = SSO_CONFIG.trustedApps.apps.example;

function errorObject(id, message) {
  return {
    success: false,
    status: 'Unauthorized',
    errors: [
      {
        id: id,
        message: message
      }
    ]
  };
}

function mockRequest(headers) {
  return {
    protocol: 'https',
    url: '/',
    header: (header) => headers[header]
  };
}

function mockResponse() {
  let res = {};
  res.status = sinon.stub().returns(res);
  res.set = sinon.stub().returns(res);
  res.send = sinon.stub().returns(res);
  res.end = sinon.stub().returns(res);
  return res;
}

describe('sso-trusted-apps', () => {

  it('constructs the request URL', () => {
    let req = {
      protocol: 'https',
      header: () => 'example.warwick.ac.uk',
      url: '/example'
    };

    expect(trustedApps.getRequestUrl(req)).to.equal('https://example.warwick.ac.uk/example')
  });

  it('creates a valid signature', () => {
    expect(trustedApps.createSignature(timestamp, url, username)).to.equal(exampleSignature);
  });

  it('verifies a valid signature', () => {
    let certificate = trustedApps.createCertificate(timestamp, username);

    expect(trustedApps.verifySignature(app, url, certificate, exampleSignature)).to.equal(true);
  });

  it('refuses an invalid signature', () => {
    let username = 'someone-else';

    let certificate = trustedApps.createCertificate(timestamp, username);

    expect(trustedApps.verifySignature(app, url, certificate, exampleSignature)).to.equal(false);
  });

  it('rejects if no provider id', () => {
    let req = mockRequest({
      Host: 'example.warwick.ac.uk',
      [trustedApps.HEADER_CERTIFICATE]: 'some certificate'
    });
    let res = mockResponse();
    let next = sinon.spy();

    trustedApps.middleware(req, res, next);

    assert(res.status.calledWith(401));
    assert(res.set.calledWith(trustedApps.HEADER_STATUS, 'Error'));
    assert(res.send.calledWith(errorObject('no-provider-id', 'Provider ID not found in request')));

    assert(next.called == false);
  });

  it('rejects if provider not known', () => {
    let req = mockRequest({
      Host: 'example.warwick.ac.uk',
      [trustedApps.HEADER_CERTIFICATE]: 'some certificate',
      [trustedApps.HEADER_PROVIDER_ID]: 'random-provider'
    });
    let res = mockResponse();
    let next = sinon.spy();

    trustedApps.middleware(req, res, next);

    assert(res.status.calledWith(401));
    assert(res.set.calledWith(trustedApps.HEADER_STATUS, 'Error'));
    assert(res.send.calledWith(errorObject('unknown-app', 'Unknown application: random-provider')));

    assert(next.called == false);
  });

  it('rejects if signature missing', () => {
    let req = mockRequest({
      Host: 'example.warwick.ac.uk',
      [trustedApps.HEADER_CERTIFICATE]: 'some certificate',
      [trustedApps.HEADER_PROVIDER_ID]: 'example'
    });
    let res = mockResponse();
    let next = sinon.spy();

    trustedApps.middleware(req, res, next);

    assert(res.status.calledWith(401));
    assert(res.set.calledWith(trustedApps.HEADER_STATUS, 'Error'));
    assert(res.send.calledWith(errorObject('no-signature', 'Missing signature in request')));

    assert(next.called == false);
  });

  it('rejects if signature invalid', () => {
    let req = mockRequest({
      Host: 'example.warwick.ac.uk',
      [trustedApps.HEADER_CERTIFICATE]: 'some certificate',
      [trustedApps.HEADER_PROVIDER_ID]: 'example',
      [trustedApps.HEADER_SIGNATURE]: 'invalid signature'
    });
    let res = mockResponse();
    let next = sinon.spy();

    trustedApps.middleware(req, res, next);

    assert(res.status.calledWith(401));
    assert(res.set.calledWith(trustedApps.HEADER_STATUS, 'Error'));
    assert(res.send.calledWith(errorObject('bad-signature', 'Bad signature for URL: https://example.warwick.ac.uk/')));

    assert(next.called == false);
  });

  it('accepts otherwise', () => {
    let certificate = trustedApps.createCertificate(timestamp, username);

    let req = mockRequest({
      Host: 'warwick.ac.uk',
      [trustedApps.HEADER_CERTIFICATE]: certificate,
      [trustedApps.HEADER_PROVIDER_ID]: 'example',
      [trustedApps.HEADER_SIGNATURE]: exampleSignature,
    });
    req.protocol = 'http';
    req.url = '?external=true';
    let res = mockResponse();
    let next = sinon.spy();

    trustedApps.middleware(req, res, next);

    assert(next.called);

    expect(req.user.usercode).to.equal('cuscav');
  });

  it('passes through non-trusted app requests', () => {
    let req = mockRequest({});
    let res = mockResponse();
    let next = sinon.spy();

    trustedApps.middleware(req, res, next);

    expect(req.user).to.equal(undefined);

    assert(next.called);
  });

});
