require('dotenv').config();

const { NODE_ENV } = process.env;
const {
  users,
  products,
  date_prices,
} = require('./fake_data');
const { query } = require('../util/mysqlcon.js');

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
    await truncateTable('product');
    await truncateTable('date_price');
    await setForeignKey(1);
    console.log('Truncated all fake data!');
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  createFakeData,
  truncateFakeData,
};
