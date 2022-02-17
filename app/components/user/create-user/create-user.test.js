const request = require('supertest');
const mongoose = require('mongoose');
const should = require('chai').should();
const faker = require('faker');
const app = require('../../../../server');
const { sample } = require('../../../lib/misc');
const { issueNewToken } = require('../../../lib/jwt-handler');
const { User, userRole } = require('../../../models');
const { createUser, createStores } = require('../../../helpers');

describe('Create user', () => {
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

  it('POST /stores/:storeId/users Should return unauthorized (token is not valid)', (done) => {
    const invalidToken = issueNewToken({ _id: firstLevelManager.user._id, role: 'Manager' });
    const body = {};
    request(app)
      .post(`/api/v1/stores/${secondLevelStore._id}/users`)
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

  it('POST /stores/:storeId/users Should return unauthorized (user is employee)', (done) => {
    const body = {};
    request(app)
      .post(`/api/v1/stores/${secondLevelStore._id}/users`)
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

  it('POST /stores/:storeId/users Should return unauthorized (manager tries to add user into ancestor store)', (done) => {
    const body = {};
    request(app)
      .post(`/api/v1/stores/${firstLevelStore._id}/users`)
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

  it('POST /stores/:storeId/users Should return missing parameters', (done) => {
    const body = {};
    request(app)
      .post(`/api/v1/stores/${secondLevelStore._id}/users`)
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

  it('POST /stores/:storeId/users Should return invalid value (invalid role)', (done) => {
    const body = {
      name: faker.name.lastName(),
      role: faker.name.lastName(),
      email: faker.internet.email(),
    };
    request(app)
      .post(`/api/v1/stores/${secondLevelStore._id}/users`)
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

  it('POST /stores/:storeId/users Should return invalid value (invalid email)', (done) => {
    const body = {
      name: faker.name.lastName(),
      role: sample(userRole),
      email: faker.internet.password(),
    };
    request(app)
      .post(`/api/v1/stores/${secondLevelStore._id}/users`)
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

  it('POST /stores/:storeId/users Should return duplicate email', (done) => {
    const body = {
      name: faker.name.lastName(),
      role: sample(userRole),
      email: employee.user.email,
    };
    request(app)
      .post(`/api/v1/stores/${secondLevelStore._id}/users`)
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

  it('POST /stores/:storeId/users Should successfully create user (manager creates user in his store)', (done) => {
    const body = {
      name: faker.name.lastName(),
      role: sample(userRole),
      email: faker.internet.email(),
    };
    request(app)
      .post(`/api/v1/stores/${firstLevelStore._id}/users`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${firstLevelManager.token}`)
      .send(body)
      .expect(200)
      .then((res) => {
        res.body.message.should.equal('Successfully created user');
        return User.findOne({ email: body.email }).lean().then((dbUser) => {
          should.exist(dbUser);
          done();
        });
      })
      .catch(done);
  });

  it('POST /stores/:storeId/users Should successfully create user (manager creates user in descendant store)', (done) => {
    const body = {
      name: faker.name.lastName(),
      role: sample(userRole),
      email: faker.internet.email(),
    };
    request(app)
      .post(`/api/v1/stores/${secondLevelStore._id}/users`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${firstLevelManager.token}`)
      .send(body)
      .expect(200)
      .then((res) => {
        res.body.message.should.equal('Successfully created user');
        return User.findOne({ email: body.email }).lean().then((dbUser) => {
          should.exist(dbUser);
          done();
        });
      })
      .catch(done);
  });
});
