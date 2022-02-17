const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../../../models');
const { issueNewToken } = require('../../../lib/jwt-handler');
const { customShortId } = require('../../../lib/misc');
const error = require('../../../middlewares/error-handling/error-constants');

/**
 * @api {post} /signin Sign in User
 * @apiVersion 1.0.0
 * @apiName Sign in
 * @apiDescription Sign in User
 * @apiGroup User
 *
 * @apiParam {String} email Email
 * @apiParam {String} password Password
 * @apiSuccessExample Success-Response:
 HTTP/1.1 200 OK
 {
   "message": "Successfully signed in",
   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OWFlNzAwMGJmZDgyNzNhYjI3ZDVmYTki"
 }
 * @apiUse MissingParamsError
 * @apiUse NotFound
 */
module.exports = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new Error(error.MISSING_PARAMETERS);
  }

  const user = await User.findOne({ email: email.toLowerCase() }, { password: 1 }).lean();

  if (!user || !bcrypt.compareSync(password, user.password)) {
    throw new Error(error.CREDENTIALS_ERROR);
  }

  return res.status(200).send({
    message: 'Successfully signed in',
    token: issueNewToken({
      _id: user._id,
      role: user.role,
      store: user.store,
    }),
  });
};