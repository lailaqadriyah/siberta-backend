require('dotenv').config();

const baseConfig = {
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'siberta',
  host: process.env.DB_HOST || 'localhost',
  dialect: process.env.DB_DIALECT || 'mysql',
  logging: false
};

module.exports = {
  development: baseConfig,
  test: {
    ...baseConfig,
    database: process.env.DB_TEST_NAME || `${baseConfig.database}_test`
  },
  production: {
    ...baseConfig,
    logging: false
  }
};
