const { User } = require('../../../models');
const error = require('../../../middlewares/error-handling/error-constants');

/**
 * @api {patch} /stores/:storeId/users/:userId Delete user
 * @apiVersion 1.0.0
 * @apiName Delete user
 * @apiDescription Delete user
 * @apiGroup User
 *
 * @apiParam (params) {String} storeId Store ID
 * @apiParam (params) {String} userId User ID
 * @apiSuccessExample Success-Response:
 HTTP/1.1 200 OK
 {
   "message": "Successfully deleted user"
 }
 * @apiUse MissingParamsError
 * @apiUse NotFound
 */
module.exports = async (req, res) => {
  const { storeId: store, userId: _id } = req.params;

  const deletedUser = await User.deleteOne({ _id, store });

  if (!deletedUser.n) {
    throw new Error(error.NOT_FOUND)
  }

  return res.status(200).send({
    message: 'Successfully deleted user',
  });
};