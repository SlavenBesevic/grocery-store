const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../../server');
const { sample } = require('../../../lib/misc');
const { issueNewToken } = require('../../../lib/jwt-handler');
const { createUser, createStores } = require('../../../helpers');

describe('List managers', () => {
  let stores;
  let firstLevelStore;
  let secondLevelStore;
  let thirdLevelStore;
  let firstLevelManager;
  let secondLevelManager;
  let thirdLevelManager;
  let firstLevelEmployee;
  let secondLevelEmployee;
  let thirdLevelEmployee;

  before(async () => {
    await mongoose.connection.db.dropDatabase();

    stores = await createStores();

    thirdLevelStore = sample(stores.filter(s => s.ancestors.length === 2));
    [secondLevelStore] = stores.filter(s => thirdLevelStore.parent.equals(s._id));
    [firstLevelStore] = stores.filter(s => secondLevelStore.parent.equals(s._id));

    [
      firstLevelManager,
      secondLevelManager,
      thirdLevelManager,
      firstLevelEmployee,
      secondLevelEmployee,
      thirdLevelEmployee,
    ] = await Promise.all([
      createUser({ role: 'Manager', store: firstLevelStore._id }),
      createUser({ role: 'Manager', store: secondLevelStore._id }),
      createUser({ role: 'Manager', store: thirdLevelStore._id }),
      createUser({ role: 'Employee', store: firstLevelStore._id }),
      createUser({ role: 'Employee', store: secondLevelStore._id }),
      createUser({ role: 'Employee', store: thirdLevelStore._id }),
    ]);
  });

  it('GET /stores/:storeId/users Should return unauthorized (token is not valid)', (done) => {
    const invalidToken = issueNewToken({ _id: firstLevelManager.user._id, role: 'Manager' });
    request(app)
      .get(`/api/v1/stores/${secondLevelStore._id}/users?role=Manager`)
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

  it('GET /stores/:storeId/users Should return unauthorized (user is employee)', (done) => {
    request(app)
      .get(`/api/v1/stores/${firstLevelStore._id}/users?role=Manager`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${firstLevelEmployee.token}`)
      .expect(401)
      .then((res) => {
        res.body.errorCode.should.equal(12);
        res.body.message.should.equal('Invalid credentials');
        done();
      })
      .catch(done);
  });

  it('GET /stores/:storeId/users Should return unauthorized (manager tries to list users from ancestor store)', (done) => {
    request(app)
      .get(`/api/v1/stores/${firstLevelStore._id}/users?role=Manager`)
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

  it('GET /stores/:storeId/users Should successfully edit user (first level manager list managers from his store)', (done) => {
    request(app)
      .get(`/api/v1/stores/${firstLevelStore._id}/users?role=Manager`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${firstLevelManager.token}`)
      .expect(200)
      .then((res) => {
        res.body.message.should.equal('Successfully got a list of users');
        res.body.results.length.should.equal(1);
        done();
      })
      .catch(done);
  });

  it('GET /stores/:storeId/users Should successfully edit user (first level manager list managers from descendant stores)', (done) => {
    request(app)
      .get(`/api/v1/stores/${firstLevelStore._id}/users?role=Manager&descendant=true`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${firstLevelManager.token}`)
      .expect(200)
      .then((res) => {
        res.body.message.should.equal('Successfully got a list of users');
        res.body.results.length.should.equal(3);
        done();
      })
      .catch(done);
  });

  it('GET /stores/:storeId/users Should successfully edit user (second level manager list managers from his store)', (done) => {
    request(app)
      .get(`/api/v1/stores/${secondLevelStore._id}/users?role=Manager`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${secondLevelManager.token}`)
      .expect(200)
      .then((res) => {
        res.body.message.should.equal('Successfully got a list of users');
        res.body.results.length.should.equal(1);
        done();
      })
      .catch(done);
  });

  it('GET /stores/:storeId/users Should successfully edit user (second level manager list managers from descendant stores)', (done) => {
    request(app)
      .get(`/api/v1/stores/${secondLevelStore._id}/users?role=Manager&descendant=true`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${secondLevelManager.token}`)
      .expect(200)
      .then((res) => {
        res.body.message.should.equal('Successfully got a list of users');
        res.body.results.length.should.equal(2);
        done();
      })
      .catch(done);
  });

  it('GET /stores/:storeId/users Should successfully edit user (first level manager list employees from his store)', (done) => {
    request(app)
      .get(`/api/v1/stores/${firstLevelStore._id}/users?role=Employee`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${firstLevelManager.token}`)
      .expect(200)
      .then((res) => {
        res.body.message.should.equal('Successfully got a list of users');
        res.body.results.length.should.equal(1);
        done();
      })
      .catch(done);
  });

  it('GET /stores/:storeId/users Should successfully edit user (first level manager list employees from descendant stores)', (done) => {
    request(app)
      .get(`/api/v1/stores/${firstLevelStore._id}/users?role=Employee&descendant=true`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${firstLevelManager.token}`)
      .expect(200)
      .then((res) => {
        res.body.message.should.equal('Successfully got a list of users');
        res.body.results.length.should.equal(3);
        done();
      })
      .catch(done);
  });

  it('GET /stores/:storeId/users Should successfully edit user (second level manager list employees from his store)', (done) => {
    request(app)
      .get(`/api/v1/stores/${secondLevelStore._id}/users?role=Employee`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${secondLevelManager.token}`)
      .expect(200)
      .then((res) => {
        res.body.message.should.equal('Successfully got a list of users');
        res.body.results.length.should.equal(1);
        done();
      })
      .catch(done);
  });

  it('GET /stores/:storeId/users Should successfully edit user (second level manager list employees from descendant stores)', (done) => {
    request(app)
      .get(`/api/v1/stores/${secondLevelStore._id}/users?role=Employee&descendant=true`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${secondLevelManager.token}`)
      .expect(200)
      .then((res) => {
        res.body.message.should.equal('Successfully got a list of users');
        res.body.results.length.should.equal(2);
        done();
      })
      .catch(done);
  });

  it('GET /stores/:storeId/users Should successfully edit user (first level employee list employees from his store)', (done) => {
    request(app)
      .get(`/api/v1/stores/${firstLevelStore._id}/users?role=Employee`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${firstLevelEmployee.token}`)
      .expect(200)
      .then((res) => {
        res.body.message.should.equal('Successfully got a list of users');
        res.body.results.length.should.equal(1);
        done();
      })
      .catch(done);
  });

  it('GET /stores/:storeId/users Should successfully edit user (first level employee list employees from descendant stores)', (done) => {
    request(app)
      .get(`/api/v1/stores/${firstLevelStore._id}/users?role=Employee&descendant=true`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${firstLevelEmployee.token}`)
      .expect(200)
      .then((res) => {
        res.body.message.should.equal('Successfully got a list of users');
        res.body.results.length.should.equal(3);
        done();
      })
      .catch(done);
  });

  it('GET /stores/:storeId/users Should successfully edit user (second level employee list employees from his store)', (done) => {
    request(app)
      .get(`/api/v1/stores/${secondLevelStore._id}/users?role=Employee`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${secondLevelEmployee.token}`)
      .expect(200)
      .then((res) => {
        res.body.message.should.equal('Successfully got a list of users');
        res.body.results.length.should.equal(1);
        done();
      })
      .catch(done);
  });

  it('GET /stores/:storeId/users Should successfully edit user (second level employee list employees from descendant stores)', (done) => {
    request(app)
      .get(`/api/v1/stores/${secondLevelStore._id}/users?role=Employee&descendant=true`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${secondLevelEmployee.token}`)
      .expect(200)
      .then((res) => {
        res.body.message.should.equal('Successfully got a list of users');
        res.body.results.length.should.equal(2);
        done();
      })
      .catch(done);
  });
});
