require('dotenv').config('../');
const mysql = require('mysql');
const { promisify } = require('util');

const {
  MYSQL_HOST, MYSQL_USERNAME, MYSQL_PASSWORD, MYSQL_DATABASE,
} = process.env;

const dbConfig = {
  connectionLimit: 40,
  host: MYSQL_HOST,
  user: MYSQL_USERNAME,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
};

const pool = mysql.createPool(dbConfig);
const query = promisify(pool.query).bind(pool);

module.exports = {
  pool,
  query,
};
