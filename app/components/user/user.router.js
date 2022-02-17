const express = require('express');
const { catchAsyncError } = require('../../lib/catch-async-error');
const { permissionAccess } = require('../../middlewares/permission-access');
const createUser = require('./create-user/create-user.controller');
const listUsers = require('./list-users/list-users.controller');
const getUser = require('./get-user/get-user.controller');
const editUser = require('./edit-user/edit-user.controller');
const deleteUser = require('./delete-user/delete-user.controller');

const router = express.Router();

router
  .post('/stores/:storeId/users', permissionAccess('Manager'), catchAsyncError(createUser))
  .get('/stores/:storeId/users', permissionAccess('Manager', 'Employee'), catchAsyncError(listUsers))
  .get('/stores/:storeId/users/:userId', permissionAccess('Manager', 'Employee'), catchAsyncError(getUser))
  .patch('/stores/:storeId/users/:userId', permissionAccess('Manager'), catchAsyncError(editUser))
  .delete('/stores/:storeId/users/:userId', permissionAccess('Manager'), catchAsyncError(deleteUser));

module.exports = router;
