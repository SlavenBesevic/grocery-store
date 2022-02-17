const { User, userRole, Store } = require('../../../models');
const error = require('../../../middlewares/error-handling/error-constants');

/**
 * @api {get} /stores/:storeId/users/users List users
 * @apiVersion 1.0.0
 * @apiName List users
 * @apiDescription List users
 * @apiGroup User
 *
 * @apiParam (params) {String} storeId Store ID
 * @apiParam (query) {String='Manager','Employee'} role Role
 * @apiParam (query) {String='true'} descendant Include descendant users
 * @apiSuccessExample Success-Response:
 HTTP/1.1 200 OK
 {
   message: 'Successfully got a list of users',
   results: [
     {
       _id: '620e9dc82982438a3609439f',
       name: 'Ralph Feeney',
       role: 'Manager',
       store: '620e9dc82982438a3609435b',
       email: 'nikki.gusikowski46@gmail.com',
       createdAt: '2022-02-17T19:11:04.119Z',
       updatedAt: '2022-02-17T19:11:04.119Z',
       __v: 0
     },
     {
       _id: '620e9dc82982438a3609439e',
       name: 'Brian Pacocha',
       role: 'Manager',
       store: '620e9dc82982438a36094359',
       email: 'berry_parker61@gmail.com',
       createdAt: '2022-02-17T19:11:04.119Z',
       updatedAt: '2022-02-17T19:11:04.119Z',
       __v: 0
     }
   ]
 }
 * @apiUse MissingParamsError
 */
module.exports = async (req, res) => {
  const { role: myRole } = req.user;
  const { storeId: store } = req.params;
  const { role, descendant } = req.query;

  if (!role) {
    throw new Error(error.MISSING_PARAMETERS);
  }

  if (!userRole.includes(role)) {
    throw new Error(error.INVALID_VALUE);
  }

  if (myRole === 'Employee' && role !== 'Employee') {
    throw new Error(error.UNAUTHORIZED_ERROR);
  }

  const query = { store, role };

  if (descendant) {
    const stores = await Store.distinct('_id', { ancestors: store });
    stores.push(store);
    query.store = { $in: stores };
  }

  const results = await User.find(query).lean();

  return res.status(200).send({
    message: 'Successfully got a list of users',
    results,
  });
};