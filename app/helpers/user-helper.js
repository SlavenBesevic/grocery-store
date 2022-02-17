const faker = require('faker');
const { ObjectId } = require('mongoose').Types;
const { User, userRole } = require('../models');
const { issueNewToken } = require('../lib/jwt-handler');
const { sample } = require('../lib/misc');

module.exports.createUser = async ({
  name = faker.name.findName(),
  role = sample(userRole),
  store = ObjectId(),
  email = faker.internet.email().toLowerCase(),
  password = faker.internet.password(),
} = {}) => {
  const user = await new User({
    name,
    role,
    store,
    email,
    password,
  }).save();
  const token = issueNewToken({
    _id: user._id,
    role: user.role,
    store: user.store,
  });
  return { user, password, token };
};

module.exports.createManyUsers = async ({
  number = 1,
} = {}) => {
  const set = [];
  for (let i = 0; i < number; i += 1) {
    set.push({
      name: faker.name.findName(),
      role: sample(userRole),
      store: ObjectId(),
      email: faker.internet.email().toLowerCase(),
      password: faker.internet.password(),
    });
  }
  return User.insertMany(set);
};
