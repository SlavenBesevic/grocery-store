const request = require('supertest');
const mongoose = require('mongoose');
const should = require('chai').should();
const app = require('../../../../server');
const { sample } = require('../../../lib/misc');
const { issueNewToken } = require('../../../lib/jwt-handler');
const { createUser, createStores } = require('../../../helpers');

describe('Get user', () => {
  let stores;
  let firstLevelStore;
  let secondLevelStore;
  let firstLevelManager;
  let secondLevelManager;
  let employee1;
  let employee2;

  before(async () => {
    await mongoose.connection.db.dropDatabase();

    stores = await createStores();

    secondLevelStore = sample(stores.filter(s => s.ancestors.length === 1));
    [firstLevelStore] = stores.filter(s => secondLevelStore.parent.equals(s._id));

    [firstLevelManager, secondLevelManager, employee1, employee2] = await Promise.all([
      createUser({ role: 'Manager', store: firstLevelStore._id }),
      createUser({ role: 'Manager', store: secondLevelStore._id }),
      createUser({ role: 'Employee', store: firstLevelStore._id }),
      createUser({ role: 'Employee', store: secondLevelStore._id }),
    ]);
  });

  it('GET /stores/:storeId/users/:userId Should return unauthorized (token is not valid)', (done) => {
    const invalidToken = issueNewToken({ _id: firstLevelManager.user._id, role: 'Manager' });
    request(app)
      .get(`/api/v1/stores/${firstLevelStore._id}/users/${employee1.user._id}`)
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

  it('GET /stores/:storeId/users/:userId Should return unauthorized (employee tries to get manager)', (done) => {
    request(app)
      .get(`/api/v1/stores/${secondLevelStore._id}/users/${secondLevelManager.user._id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${employee1.token}`)
      .expect(401)
      .then((res) => {
        res.body.errorCode.should.equal(12);
        res.body.message.should.equal('Invalid credentials');
        done();
      })
      .catch(done);
  });

  it('GET /stores/:storeId/users/:userId Should return unauthorized (manager tries to get user from ancestor store)', (done) => {
    request(app)
      .get(`/api/v1/stores/${firstLevelStore._id}/users/${employee1.user._id}`)
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

  it('GET /stores/:storeId/users/:userId Should return not found', (done) => {
    request(app)
      .get(`/api/v1/stores/${firstLevelStore._id}/users/${mongoose.Types.ObjectId()}`)
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

  it('GET /stores/:storeId/users/:userId Should successfully got user (manager get user from his store)', (done) => {
    request(app)
      .get(`/api/v1/stores/${firstLevelStore._id}/users/${employee1.user._id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${firstLevelManager.token}`)
      .expect(200)
      .then((res) => {
        res.body.message.should.equal('Successfully got user details');
        res.body.results.name.should.equal(employee1.user.name);
        res.body.results.role.should.equal(employee1.user.role);
        res.body.results.store.should.equal(employee1.user.store.toString());
        res.body.results.email.should.equal(employee1.user.email);
        should.not.exist(res.body.results.password);
        should.exist(res.body.results.createdAt);
        should.exist(res.body.results.updatedAt);
        done();
      })
      .catch(done);
  });

  it('GET /stores/:storeId/users/:userId Should successfully got user (manager get user in descendant store)', (done) => {
    request(app)
      .get(`/api/v1/stores/${firstLevelStore._id}/users/${employee1.user._id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${firstLevelManager.token}`)
      .expect(200)
      .then((res) => {
        res.body.message.should.equal('Successfully got user details');
        res.body.results.name.should.equal(employee1.user.name);
        res.body.results.role.should.equal(employee1.user.role);
        res.body.results.store.should.equal(employee1.user.store.toString());
        res.body.results.email.should.equal(employee1.user.email);
        should.not.exist(res.body.results.password);
        should.exist(res.body.results.createdAt);
        should.exist(res.body.results.updatedAt);
        done();
      })
      .catch(done);
  });

  it('GET /stores/:storeId/users/:userId Should successfully got user (employee get user from his store)', (done) => {
    request(app)
      .get(`/api/v1/stores/${firstLevelStore._id}/users/${employee1.user._id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${employee1.token}`)
      .expect(200)
      .then((res) => {
        res.body.message.should.equal('Successfully got user details');
        res.body.results.name.should.equal(employee1.user.name);
        res.body.results.role.should.equal(employee1.user.role);
        res.body.results.store.should.equal(employee1.user.store.toString());
        res.body.results.email.should.equal(employee1.user.email);
        should.not.exist(res.body.results.password);
        should.exist(res.body.results.createdAt);
        should.exist(res.body.results.updatedAt);
        done();
      })
      .catch(done);
  });

  it('GET /stores/:storeId/users/:userId Should successfully got user (employee get user in descendant store)', (done) => {
    request(app)
      .get(`/api/v1/stores/${secondLevelStore._id}/users/${employee2.user._id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${firstLevelManager.token}`)
      .expect(200)
      .then((res) => {
        res.body.message.should.equal('Successfully got user details');
        res.body.results.name.should.equal(employee2.user.name);
        res.body.results.role.should.equal(employee2.user.role);
        res.body.results.store.should.equal(employee2.user.store.toString());
        res.body.results.email.should.equal(employee2.user.email);
        should.not.exist(res.body.results.password);
        should.exist(res.body.results.createdAt);
        should.exist(res.body.results.updatedAt);
        done();
      })
      .catch(done);
  });
});
