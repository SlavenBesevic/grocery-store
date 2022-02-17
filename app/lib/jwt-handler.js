const jwt = require('jsonwebtoken');
const environments = require('../config/environments');

/**
 * Returns a jwt-signed token
 * @param {*} user
 */
module.exports.issueNewToken = user => jwt.sign(user, environments.JWT_SECRET, { expiresIn: '1h' });
