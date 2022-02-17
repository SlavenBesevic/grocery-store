const request = require('supertest');
const mongoose = require('mongoose');
const should = require('chai').should();
const faker = require('faker');
const app = require('../../../../server');
const { sample } = require('../../../lib/misc');
const { issueNewToken } = require('../../../lib/jwt-handler');
const { User, userRole } = require('../../../models');
const { createUser, createStores } = require('../../../helpers');

describe('Edit user', () => {
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

  it('PATCH /stores/:storeId/users/:userId Should return unauthorized (token is not valid)', (done) => {
    const invalidToken = issueNewToken({ _id: firstLevelManager.user._id, role: 'Manager' });
    const body = {};
    request(app)
      .patch(`/api/v1/stores/${secondLevelStore._id}/users/${employee.user._id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${invalidToken}`)
      .send(body)
      .expect(401)
      .then((res) => {
        res.body.errorCode.should.equal(12);
        res.body.message.should.equal('Invalid credentials');
        done();
      })
      .catch(done);
  });

  it('PATCH /stores/:storeId/users/:userId Should return unauthorized (user is employee)', (done) => {
    const body = {};
    request(app)
      .patch(`/api/v1/stores/${firstLevelStore._id}/users/${employee.user._id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${employee.token}`)
      .send(body)
      .expect(401)
      .then((res) => {
        res.body.errorCode.should.equal(12);
        res.body.message.should.equal('Invalid credentials');
        done();
      })
      .catch(done);
  });

  it('PATCH /stores/:storeId/users/:userId Should return unauthorized (manager tries to add user into ancestor store)', (done) => {
    const body = {};
    request(app)
      .patch(`/api/v1/stores/${firstLevelStore._id}/users/${employee.user._id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${secondLevelManager.token}`)
      .send(body)
      .expect(401)
      .then((res) => {
        res.body.errorCode.should.equal(12);
        res.body.message.should.equal('Invalid credentials');
        done();
      })
      .catch(done);
  });

  it('PATCH /stores/:storeId/users/:userId Should return missing parameters', (done) => {
    const body = {};
    request(app)
      .patch(`/api/v1/stores/${secondLevelStore._id}/users/${employee.user._id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${firstLevelManager.token}`)
      .send(body)
      .expect(400)
      .then((res) => {
        res.body.errorCode.should.equal(2);
        res.body.message.should.equal('Missing parameters');
        done();
      })
      .catch(done);
  });

  it('PATCH /stores/:storeId/users/:userId Should return invalid value (invalid role)', (done) => {
    const body = {
      name: faker.name.lastName(),
      role: faker.name.lastName(),
      email: faker.internet.email(),
      store: firstLevelStore._id,
    };
    request(app)
      .patch(`/api/v1/stores/${secondLevelStore._id}/users/${employee.user._id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${firstLevelManager.token}`)
      .send(body)
      .expect(400)
      .then((res) => {
        res.body.errorCode.should.equal(6);
        res.body.message.should.equal('Value is not valid');
        done();
      })
      .catch(done);
  });

  it('PATCH /stores/:storeId/users/:userId Should return invalid value (invalid email)', (done) => {
    const body = {
      name: faker.name.lastName(),
      role: sample(userRole),
      email: faker.internet.password(),
      store: firstLevelStore._id,
    };
    request(app)
      .patch(`/api/v1/stores/${secondLevelStore._id}/users/${employee.user._id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${firstLevelManager.token}`)
      .send(body)
      .expect(400)
      .then((res) => {
        res.body.errorCode.should.equal(9);
        res.body.message.should.equal('Please fill a valid email address');
        done();
      })
      .catch(done);
  });

  it('PATCH /stores/:storeId/users/:userId Should return duplicate email', (done) => {
    const body = {
      name: faker.name.lastName(),
      role: sample(userRole),
      email: employee.user.email,
      store: firstLevelStore._id,
    };
    request(app)
      .patch(`/api/v1/stores/${secondLevelStore._id}/users/${employee.user._id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${firstLevelManager.token}`)
      .send(body)
      .expect(406)
      .then((res) => {
        res.body.errorCode.should.equal(10);
        res.body.message.should.equal('This email address is already registered');
        done();
      })
      .catch(done);
  });

  it('PATCH /stores/:storeId/users/:userId Should return not found', (done) => {
    const body = {
      name: faker.name.lastName(),
      role: sample(userRole),
      email: faker.internet.email(),
      store: firstLevelStore._id,
    };
    request(app)
      .patch(`/api/v1/stores/${firstLevelStore._id}/users/${mongoose.Types.ObjectId()}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${firstLevelManager.token}`)
      .send(body)
      .expect(404)
      .then((res) => {
        res.body.errorCode.should.equal(4);
        res.body.message.should.equal('Not found');
        done();
      })
      .catch(done);
  });

  it('PATCH /stores/:storeId/users/:userId Should successfully edit user (manager updates user in his store)', (done) => {
    const body = {
      name: faker.name.lastName(),
      role: sample(userRole),
      email: faker.internet.email(),
      store: firstLevelStore._id,
    };
    request(app)
      .patch(`/api/v1/stores/${firstLevelStore._id}/users/${employee.user._id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${firstLevelManager.token}`)
      .send(body)
      .expect(200)
      .then((res) => {
        res.body.message.should.equal('Successfully edited user');
        return User.findOne({ _id: employee.user._id }).lean().then((dbUser) => {
          should.exist(dbUser);
          done();
        });
      })
      .catch(done);
  });

  it('PATCH /stores/:storeId/users/:userId Should successfully edit user (manager updates user in descendant store)', (done) => {
    const body = {
      name: faker.name.lastName(),
      role: sample(userRole),
      email: faker.internet.email(),
      store: firstLevelStore._id,
    };
    request(app)
      .patch(`/api/v1/stores/${secondLevelStore._id}/users/${secondLevelManager.user._id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${firstLevelManager.token}`)
      .send(body)
      .expect(200)
      .then((res) => {
        res.body.message.should.equal('Successfully edited user');
        return User.findOne({ _id: secondLevelManager.user._id }).lean().then((dbUser) => {
          should.exist(dbUser);
          done();
        });
      })
      .catch(done);
  });
});
