'use strict';

let getTarget = (req) => req.protocol + '://' + req.header('Host') + req.url;

module.exports = {
	getTarget: getTarget
};
