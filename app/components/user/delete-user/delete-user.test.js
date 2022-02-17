const request = require('supertest');
const mongoose = require('mongoose');
const should = require('chai').should();
const app = require('../../../../server');
const { sample } = require('../../../lib/misc');
const { issueNewToken } = require('../../../lib/jwt-handler');
const { User } = require('../../../models');
const { createUser, createStores } = require('../../../helpers');

describe('Delete user', () => {
  let stores;
  let firstLevelStore;
  let secondLevelStore;
  let firstLevelManager;
  let secondLevelManager;
  let employee;

  before(async () => {
    await mongoose.connection.db.dropDatabase();

    stores = await createStores();

    secondLevelStore = sample(stores.filter(s => s.ancestors.length === 1));
    [firstLevelStore] = stores.filter(s => secondLevelStore.parent.equals(s._id));

    [firstLevelManager, secondLevelManager, employee] = await Promise.all([
      createUser({ role: 'Manager', store: firstLevelStore._id }),
      createUser({ role: 'Manager', store: secondLevelStore._id }),
      createUser({ role: 'Employee', store: firstLevelStore._id }),
    ]);
  });

  it('DELETE /stores/:storeId/users/:userId Should return unauthorized (token is not valid)', (done) => {
    const invalidToken = issueNewToken({ _id: firstLevelManager.user._id, role: 'Manager' });
    request(app)
      .delete(`/api/v1/stores/${secondLevelStore._id}/users/${employee.user._id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${invalidToken}`)
      .expect(401)
      .then((res) => {
        res.body.errorCode.should.equal(12);
        res.body.message.should.equal('Invalid credentials');
        done();
      })
      .catch(done);
  });

  it('DELETE /stores/:storeId/users/:userId Should return unauthorized (user is employee)', (done) => {
    request(app)
      .delete(`/api/v1/stores/${firstLevelStore._id}/users/${employee.user._id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${employee.token}`)
      .expect(401)
      .then((res) => {
        res.body.errorCode.should.equal(12);
        res.body.message.should.equal('Invalid credentials');
        done();
      })
      .catch(done);
  });

  it('DELETE /stores/:storeId/users/:userId Should return unauthorized (manager tries to add user into ancestor store)', (done) => {
    request(app)
      .delete(`/api/v1/stores/${firstLevelStore._id}/users/${employee.user._id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${secondLevelManager.token}`)
      .expect(401)
      .then((res) => {
        res.body.errorCode.should.equal(12);
        res.body.message.should.equal('Invalid credentials');
        done();
      })
      .catch(done);
  });

  it('DELETE /stores/:storeId/users/:userId Should return not found', (done) => {
    request(app)
      .delete(`/api/v1/stores/${firstLevelStore._id}/users/${mongoose.Types.ObjectId()}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${firstLevelManager.token}`)
      .expect(404)
      .then((res) => {
        res.body.errorCode.should.equal(4);
        res.body.message.should.equal('Not found');
        done();
      })
      .catch(done);
  });

  it('DELETE /stores/:storeId/users/:userId Should successfully delete user (manager deleted user in his store)', (done) => {
    request(app)
      .delete(`/api/v1/stores/${firstLevelStore._id}/users/${employee.user._id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${firstLevelManager.token}`)
      .expect(200)
      .then((res) => {
        res.body.message.should.equal('Successfully deleted user');
        return User.findOne({ _id: employee.user._id }).lean().then((dbUser) => {
          should.not.exist(dbUser);
          done();
        });
      })
      .catch(done);
  });

  it('DELETE /stores/:storeId/users/:userId Should successfully delete user (manager deleted user in descendant store)', (done) => {
    request(app)
      .delete(`/api/v1/stores/${secondLevelStore._id}/users/${secondLevelManager.user._id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${firstLevelManager.token}`)
      .expect(200)
      .then((res) => {
        res.body.message.should.equal('Successfully deleted user');
        return User.findOne({ _id: secondLevelManager.user._id }).lean().then((dbUser) => {
          should.not.exist(dbUser);
          done();
        });
      })
      .catch(done);
  });
});
