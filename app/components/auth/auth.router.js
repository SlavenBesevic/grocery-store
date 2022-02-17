const express = require('express');
const { catchAsyncError } = require('../../lib/catch-async-error');
const { permissionAccess } = require('../../middlewares/permission-access');
const signIn = require('./signin/signin.controller');
const changePassword = require('./change-password/change-password.controller');

const router = express.Router();

router
  .post('/signin', catchAsyncError(signIn))
  .patch('/change-password', permissionAccess(), catchAsyncError(changePassword));

module.exports = router;
