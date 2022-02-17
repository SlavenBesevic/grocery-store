const path = require('path');

const envPath = path.join(process.cwd(), `.env.${process.env.NODE_ENV}`);
require('dotenv').config({ path: envPath });

/*
 * Project wide enviroment variables
 * If a new environment variable is added to the project,
 * add it to the respective .env file and to the object below.
 */
const environmentVariables = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_ALGORITHMS: process.env.JWT_ALGORITHMS.split(' '),
  MONGO_DB: process.env.MONGO_DB,
};

/**
 * Returns Project environment variables based on NODE_ENV
 * @returns {Object}
 */
const getEnvVariables = () => {
  if (!environmentVariables.NODE_ENV) {
    throw new Error('Missing NODE_ENV environment variable');
  }

  return environmentVariables;
};

// Check for missing environment variables
Object
  .entries(getEnvVariables())
  .forEach(([key, value]) => {
    if (!value) {
      throw new Error(`Missing ${key} environment variable`);
    }
  });

module.exports = getEnvVariables();
