const mongoose = require('mongoose');
const { MONGO_DB } = require('../app/config/environments');
const { createStores, createUser } = require('../app/helpers')

mongoose.Promise = global.Promise;

createStores()
  .then(async (stores) => {
    await createUser({
      name: 'Top level manager',
      role: 'Manager',
      store: stores.filter(s => !s.parent)[0]._id,
      email: 'admin@admin.com',
      password: '1234',
    });

    for (let store of stores) {
      await Promise.all([
        createUser({ role: 'Manager', store: store._id }),
        createUser({ role: 'Manager', store: store._id }),
        createUser({ role: 'Employee', store: store._id }),
        createUser({ role: 'Employee', store: store._id }),
      ])
    }

    console.log('Successfully created database');
    process.exit(0);
  })
  .catch((error) => {
    console.log('Error', error);
    process.exit(1);
  });

// Create the database connection
mongoose.connect(MONGO_DB, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

mongoose.connection.on('connected', () => {
  console.log(`Mongoose default connection open to ${MONGO_DB}`);
});

// CONNECTION EVENTS
// If the connection throws an error
mongoose.connection.on('error', (err) => {
  console.log(`Mongoose default connection error: ${err}`);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', () => {
  console.log('Mongoose default connection disconnected');
});

// When the connection is open
mongoose.connection.on('open', () => {
  console.log('Mongoose default connection is open');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});
