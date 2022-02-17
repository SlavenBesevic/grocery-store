const bcrypt = require('bcrypt');
const { User } = require('../../../models');
const error = require('../../../middlewares/error-handling/error-constants');

/**
 * @api {patch} /change-password Sign in User
 * @apiVersion 1.0.0
 * @apiName Sign in
 * @apiDescription Sign in User
 * @apiGroup User
 *
 * @apiParam (body) {String} oldPassword Password that is needed to be changed
 * @apiParam (body) {String} newPassword New password
 * @apiSuccessExample Success-Response:
 HTTP/1.1 200 OK
 {
   "message": "Password successfully updated"
 }
 * @apiUse MissingParamsError
 * @apiUse NotFound
 */
module.exports = async (req, res) => {
  const { _id } = req.user;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) throw new Error(error.MISSING_PARAMETERS);

  if (newPassword.length < 4) throw new Error(error.INVALID_VALUE);

  const user = await User.findOne({ _id }).select('+password').lean();

  if (!bcrypt.compareSync(oldPassword, user.password)) throw new Error(error.CREDENTIALS_ERROR);

  await User.updateOne(
    {
      _id,
    },
    {
      $set: {
        password: bcrypt.hashSync(newPassword, 10),
      },
    },
  );

  return res.status(200).send({
    message: 'Password successfully updated',
  });
};