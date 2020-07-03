require('dotenv').config('../');
const mysql = require('mysql');
const { promisify } = require('util');

const {
  MYSQL_HOST, MYSQL_USERNAME, MYSQL_PASSWORD, MYSQL_DATABASE,
} = process.env;

const dbConfig = {
  connectionLimit: 10,
  host: MYSQL_HOST,
  user: MYSQL_USERNAME,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
};

const pool = mysql.createPool(dbConfig);
const promiseQuery = promisify(pool.query).bind(pool);
const promiseEnd = promisify(pool.end).bind(pool);

module.exports = {
  query: promiseQuery,
  end: promiseEnd,
};
