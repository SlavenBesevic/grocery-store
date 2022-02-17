const { User, userRole } = require('../../../models');
const { emailRegExp, customShortId } = require('../../../lib/misc');
const error = require('../../../middlewares/error-handling/error-constants');

/**
 * @api {post} /stores/:storeId/users Create user
 * @apiVersion 1.0.0
 * @apiName Create user
 * @apiDescription Create user
 * @apiGroup User
 *
 * @apiParam (params) {String} storeId Store ID
 * @apiParam (body) {String} name Name
 * @apiParam (body) {String='Manager','Employee'} role Role
 * @apiParam (body) {String} email Email
 * @apiSuccessExample Success-Response:
 HTTP/1.1 200 OK
 {
   "message": "Successfully created user"
 }
 * @apiUse MissingParamsError
 * @apiUse NotFound
 */
module.exports = async (req, res) => {
  const { storeId: store } = req.params;
  const {
    name,
    role,
    email,
  } = req.body;

  if (!name || !role || !store || !email) {
    throw new Error(error.MISSING_PARAMETERS);
  }

  if (!userRole.includes(role)) {
    throw new Error(error.INVALID_VALUE);
  }

  if (!email.match(emailRegExp)) {
    throw new Error(error.INVALID_EMAIL);
  }

  const existingUser = await User.findOne({ email }).lean();
  if (existingUser) {
    throw new Error(error.DUPLICATE_EMAIL);
  }

  const password = customShortId();

  // TODO: email with password

  await new User({
    name,
    role,
    store,
    email,
    password,
  }).save();

  return res.status(200).send({
    message: 'Successfully created user',
  });
};