require('dotenv').config('../');
const mysql = require('mysql');
const { promisify } = require('util');

const env = process.env.NODE_ENV || 'production';

const {
  MYSQL_HOST, MYSQL_USERNAME, MYSQL_PASSWORD, MYSQL_DATABASE, MYSQL_DATABASE_TEST,
} = process.env;

const dbConfig = {
  production: { // for EC2 machine
    host: MYSQL_HOST,
    user: MYSQL_USERNAME,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
  },
  development: { // for localhost development
    host: MYSQL_HOST,
    user: MYSQL_USERNAME,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
  },
  test: { // for automation testing (command: npm run test)
    host: MYSQL_HOST,
    user: MYSQL_USERNAME,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE_TEST,
  },
};

const pool = mysql.createPool(dbConfig[env]);
const query = promisify(pool.query).bind(pool);

module.exports = {
  pool,
  query,
};
