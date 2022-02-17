const request = require('supertest');
const mongoose = require('mongoose');
const should = require('chai').should();
const faker = require('faker');
const app = require('../../../../server');
const { createUser } = require('../../../helpers')

describe('Signin', () => {
  let createdUser;

  before(async () => {
    await mongoose.connection.db.dropDatabase();

    createdUser = await createUser();
  });

  it('POST /signin Should return missing parameters', (done) => {
    const body = {
      email: faker.internet.email(),
    };
    request(app)
      .post('/api/v1/signin')
      .set('Accept', 'application/json')
      .send(body)
      .expect(400)
      .then((res) => {
        res.body.errorCode.should.equal(2);
        res.body.message.should.equal('Missing parameters');
        done();
      })
      .catch(done);
  });

  it('POST /signin Should return credentials error', (done) => {
    const body = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };
    request(app)
      .post('/api/v1/signin')
      .set('Accept', 'application/json')
      .send(body)
      .expect(401)
      .then((res) => {
        res.body.errorCode.should.equal(8);
        res.body.message.should.equal('Wrong credentials');
        done();
      })
      .catch(done);
  });

  it('POST /signin Should successfully signin', (done) => {
    const body = {
      email: createdUser.user.email,
      password: createdUser.password,
    };
    request(app)
      .post('/api/v1/signin')
      .set('Accept', 'application/json')
      .send(body)
      .expect(200)
      .then((res) => {
        res.body.message.should.equal('Successfully signed in');
        should.exist(res.body.token);
        done();
      })
      .catch(done);
  });
});
