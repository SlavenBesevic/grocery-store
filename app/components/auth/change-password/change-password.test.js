const request = require('supertest');
const mongoose = require('mongoose');
const should = require('chai').should();
const faker = require('faker');
const app = require('../../../../server');
const { User } = require('../../../models');
const { issueNewToken } = require('../../../lib/jwt-handler');
const { createUser } = require('../../../helpers')

describe('Change password', () => {
  let createdUser;

  before(async () => {
    await mongoose.connection.db.dropDatabase();

    createdUser = await createUser();
  });

  it('PATCH /change-password Should return unauthorized (token is not valid)', (done) => {
    const invalidToken = issueNewToken({ _id: createdUser.user._id, role: 'Manager' });
    const body = {};
    request(app)
      .patch('/api/v1/change-password')
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

  it('PATCH /change-password Should return missing parameters (missing oldPassword or newPassword)', (done) => {
    const body = { oldPassword: createdUser.password };
    request(app)
      .patch('/api/v1/change-password')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${createdUser.token}`)
      .send(body)
      .expect(400)
      .then((res) => {
        res.body.errorCode.should.equal(2);
        res.body.message.should.equal('Missing parameters');
        done();
      })
      .catch(done);
  });

  it('PATCH /change-password Should return invalid value (password must be at least 4 characters)', (done) => {
    const body = {
      oldPassword: createdUser.password,
      newPassword: 'ab',
    };
    request(app)
      .patch('/api/v1/change-password')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${createdUser.token}`)
      .send(body)
      .expect(400)
      .then((res) => {
        res.body.errorCode.should.equal(6);
        res.body.message.should.equal('Value is not valid');
        done();
      })
      .catch(done);
  });

  it('PATCH /change-password Should return credentials error (If old password is not the same as current user password)', (done) => {
    const body = {
      oldPassword: faker.internet.password(),
      newPassword: createdUser.password,
    };
    request(app)
      .patch('/api/v1/change-password')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${createdUser.token}`)
      .send(body)
      .expect(401)
      .then((res) => {
        res.body.errorCode.should.equal(8);
        res.body.message.should.equal('Wrong credentials');
        done();
      })
      .catch(done);
  });

  it('PATCH /change-password Should successfully change password', (done) => {
    const body = {
      oldPassword: createdUser.password,
      newPassword: faker.internet.password(),
    };
    request(app)
      .patch('/api/v1/change-password')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${createdUser.token}`)
      .send(body)
      .expect(200)
      .then((res) => {
        res.body.message.should.equal('Password successfully updated');
        // If password is successfully changed user should successfully sign in
        const bodySignin = {
          email: createdUser.user.email,
          password: body.newPassword,
        };
        return request(app)
          .post('/api/v1/signin')
          .set('Accept', 'application/json')
          .send(bodySignin)
          .expect(200)
          .then((res) => {
            res.body.message.should.equal('Successfully signed in');
            done();
          });
      })
      .catch(done);
  });
});
