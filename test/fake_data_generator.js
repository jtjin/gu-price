require('dotenv').config();

const { NODE_ENV } = process.env;
const bcrypt = require('bcrypt');
const {
  users,
  tracks,
  products,
  date_prices,
} = require('./fake_data');
const { pool, query } = require('../util/mysqlcon.js');

const salt = parseInt(process.env.BCRYPT_SALT);

async function _createFakeUser() {
  const encryped_users = users.map((user) => {
    const encryped_user = {
      provider: user.provider,
      email: user.email,
      password: user.password ? bcrypt.hashSync(user.password, salt) : null,
      name: user.name,
      picture: user.picture,
      access_token: user.access_token,
      access_expired: user.access_expired,
      login_at: user.login_at,
      confirmed: user.confirmed,
      favorite: user.favorite,
    };
    return encryped_user;
  });
  await query('INSERT INTO user (provider, email, password, name, picture, access_token, access_expired, login_at, confirmed, favorite) VALUES ?', [encryped_users.map((x) => Object.values(x))]);
}

async function _createFakeTrack() {
  await query('INSERT INTO track (number, price, email, confirmed, user_id) VALUES ?', [tracks.map((x) => Object.values(x))]);
}

async function _createFakeProduct() {
  await query('INSERT INTO product (category, chinese_list, type, chinese_type, name, number, about, texture, main_image, images, update_at) VALUES ?', [products.map((x) => Object.values(x))]);
}

async function _createFakeDatePrice() {
  await query('INSERT INTO date_price (date, price, product_id) VALUES ?', [date_prices.map((x) => Object.values(x))]);
}

async function createFakeData() {
  if (NODE_ENV !== 'test') {
    console.log('Not in test env');
    return;
  }
  try {
    console.log('Creating fake data...');
    await _createFakeUser();
    await _createFakeTrack();
    await _createFakeProduct();
    await _createFakeDatePrice();
    console.log('Created all fake data!');
  } catch (err) {
    console.log(err);
  }
}

async function truncateFakeData() {
  if (NODE_ENV !== 'test') {
    console.log('Not in test env');
    return;
  }
  const setForeignKey = async (status) => {
    await query('SET FOREIGN_KEY_CHECKS = ?', status);
  };

  const truncateTable = async (table) => {
    await query(`TRUNCATE TABLE ${table}`);
  };
  try {
    console.log('Truncating fake data...');
    await setForeignKey(0);
    await truncateTable('user');
    await truncateTable('track');
    await truncateTable('product');
    await truncateTable('date_price');
    await setForeignKey(1);
    console.log('Truncated all fake data!');
  } catch (err) {
    console.log(err);
  }
}

async function closeConnection() {
  pool.end();
}

module.exports = {
  createFakeData,
  truncateFakeData,
  closeConnection,
};
