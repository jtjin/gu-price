require('dotenv').config('../');

// Connecting to MySQL server
const pool = require('mysql').createPool({
  connectionLimit: 10,
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

const query = (sql, queryArgs) => new Promise((resolve, reject) => {
  pool.query(sql, queryArgs, (err, result) => {
    if (err) {
      reject(err);
    } else {
      resolve(result);
    }
  });
});

module.exports = { pool, query };
