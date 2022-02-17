const { Store } = require('../models');
const error = require('./error-handling/error-constants');

/**
 * Ensure that requested User has proper permissions
 * @param roles
 */
module.exports.permissionAccess = (...roles) => async (req, res, next) => {
  try {
    const { _id, role, store } = req.user;

    if (!_id || !role || !store) {
      throw new Error(error.UNAUTHORIZED_ERROR);
    }

    if (roles.length && !roles.includes(role)) {
      throw new Error(error.UNAUTHORIZED_ERROR);
    }

    const { storeId } = req.params;
    if (storeId && storeId !== store) {
      const descendant = await Store.findOne({ _id: storeId, ancestors: store }).lean();
      if (!descendant) {
        throw new Error(error.UNAUTHORIZED_ERROR);
      }
    }

    return next();
  } catch (err) {
    return next(err);
  }
};
