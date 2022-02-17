const { User } = require('../../../models');
const error = require('../../../middlewares/error-handling/error-constants');

/**
 * @api {post} /stores/:storeId/users/:userId Create user
 * @apiVersion 1.0.0
 * @apiName Create user
 * @apiDescription Create user
 * @apiGroup User
 *
 * @apiParam (params) {String} storeId Store ID
 * @apiParam (params) {String} userId User ID
 * @apiSuccessExample Success-Response:
 HTTP/1.1 200 OK
 {
   "message": "Successfully got user details",
   "results": {
     "_id": "620e8a100a1f9175a3403c2a",
     "name": "Rodolfo Beahan",
     "role": "Employee",
     "store": "620e8a0f0a1f9175a3403be6",
     "email": "caterina_leannon15@yahoo.com",
     "createdAt": "2022-02-17T17:46:56.052Z",
     "updatedAt": "2022-02-17T17:46:56.052Z",
     "__v": 0
   }
 }
 * @apiUse NotFound
 */
module.exports = async (req, res) => {
  const { role } = req.user;
  const { storeId: store, userId: _id } = req.params;

  const results = await User.findOne({ _id, store }).lean();

  if (!results) {
    throw new Error(error.NOT_FOUND);
  }

  if (role === 'Employee' && results.role !== 'Employee') {
    throw new Error(error.UNAUTHORIZED_ERROR);
  }

  return res.status(200).send({
    message: 'Successfully got user details',
    results,
  });
};