const { User, userRole } = require('../../../models');
const { emailRegExp, customShortId } = require('../../../lib/misc');
const error = require('../../../middlewares/error-handling/error-constants');

/**
 * @api {patch} /stores/:storeId/users/:userId Edit user
 * @apiVersion 1.0.0
 * @apiName Edit user
 * @apiDescription Edit user
 * @apiGroup User
 *
 * @apiParam (params) {String} storeId Store ID
 * @apiParam (params) {String} userId User ID
 * @apiParam (body) {String} name Name
 * @apiParam (body) {String='Manager','Employee'} role Role
 * @apiParam (body) {String} email Email
 * @apiParam (params) {String} newStore New store ID
 * @apiSuccessExample Success-Response:
 HTTP/1.1 200 OK
 {
   "message": "Successfully edited user"
 }
 * @apiUse MissingParamsError
 * @apiUse NotFound
 */
module.exports = async (req, res) => {
  const { storeId: store, userId: _id } = req.params;
  const {
    name,
    role,
    email,
    newStore,
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

  const updatedUser = await User.updateOne(
    {
      _id,
      store,
    },
    {
      $set: {
        name,
        role,
        store: newStore,
        email,
      }
    }
  );

  if (!updatedUser.matchedCount) {
    throw new Error(error.NOT_FOUND)
  }

  return res.status(200).send({
    message: 'Successfully edited user',
  });
};