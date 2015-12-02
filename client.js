'use strict';

const fetch = require('node-fetch');

const trustedApp = require('./lib/sso-trusted-app');

const PRIVATE_KEY =
	"MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCY/mCk9dTBeLH0yJ5E3VuAjih01W5GQ+P6ebIqI" +
	"tnnM2Edx5wrMv1gU5/gsa8KNq6Q6322Fh1QG2BR1bQ2Oqq+1D09yd8OU1J2B9f9qDhftaopsnwz5nbJix9BvfYi0l" +
	"h7/TU45Tr+Tq3C3VfiogAi8mx+UGHpCq2O5qXB6TbyRIYK0LUkL/ibaku9at/EmpkXxSsx5m3ZmB7RNqdfPUOduOf" +
	"Px0AfrV8AF/uIWUKCQ2fpTqOVgKiR72ExUwhZR71DmgECt7+ODmfygJUsg2ArvBakii8EhPx+gHs8v1K4zqA2Sa1N" +
	"VIEi9fe34/yCG+LzFp+CiJyXTo/PA7C2FgI/AgMBAAECggEAIy4rTwNwXuTAFweizTcReWg3CVaiuumVnN0rCOFmt" +
	"fFsnYpu8MgS13mjQ+nX1ENqtMxR5fMD3o3NAkRf4jBvXt4zDuhCsGqchaOcGSn7fJargFcYlF6kZgflshpaZPt1eV" +
	"1qRaEAhcXV0v9O3EBgQ6j3JbyaJxpbeoazCvnztpWLJh6CIPxjC8h9JG5H59z4TZTL/zZjaGxyNY+Xt9wvS9DNHVF" +
	"xNgy0/mS0dafjLyjzqNi2e+hxz0C59BABO7d/iSlqvQHyxxVeu3w1+xntFrKUsNYuFckc0OpWaC49CbTURxCUbL2W" +
	"odnTbT6QFgexas74+QYMbdSiXxe8F0Jn8QKBgQDmNNra9XHAIx7xUsCtBTDxO6EiepkcLjRKLgMCxjfbRBOI2Y0o1" +
	"HRLSAaAXXBwvrQ23ezlC/XONwz9D9wH81tJ/IRwyM+OZKbcLfj81TVVNTuUQBBaNuPvf7mq1vaSvrkxflXhzHT5cF" +
	"9M7rc8i+2dKLs+6d9RlVBB0k01tuloEwKBgQCqIsh94bakx1PdecsdNIr7bbQ67juS2nKQnq+7KpIcjWwBdhCH5Ri" +
	"dBsJOLcqZ/lVaQmFzK7AyL1qBZ1FV4igwz9EJtnsaR3g7ECQ6WDCVXZZMLbpMvBybWV4mNYdt/yXxy4qMusQWzxXq" +
	"O4i7II0SWBfW1CJApcSLSEVbuRwapQKBgCeWU0RwDN2jrICHYIbga6gwPud0+bt03p0bCH2DpLtaG5ne/31T+6Oug" +
	"R+18c4RnWAKDeDdi6mood0qywW6/andeNEEV1z/Rgp7BWRFLeS3QMWftrAs3EmlR0JvsPtPPP2b4hzwUfVLM7hBHN" +
	"WWoofyJzEMetDGwoRvK8Pe7ohtAoGBAJeQWwmBXWMXy0dfK6m92B46Ube56Upe3nalVymmt/lFpzT6B6n4Vl/02H4" +
	"q3vUmlMTOo9+kyNc8RiVHdDbNPT6Ws8MyVCJKDvqW2586VzWI5M7CYdfgMJ/YEj55q0c7aIMp7yiFbRBgtUYweRMy" +
	"4Vm5LquL2WO8CQaHgHpAwp+dAoGAVN5iVD8mZIzl7+lYBy9qbzB13xHCP9Z+AHVuUO2/djO6VRR4j1gDEC8RLICr1" +
	"ue0bObmHY1FzFh1ClC4Bh+Kd4bERviu3C0p+wv5Mau+TW1dcAqcrlmZS9rNEHNmgBXZbBbMTS4x2/vmjwnrQ6R7/e" +
	"1szkwZnureQ30ObXrOoMs=";

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
