require('dotenv').config();

const { NODE_ENV } = process.env;
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');

const { truncateFakeData, createFakeData } = require('./fake_data_generator');

chai.use(chaiHttp);

const { assert } = chai;
const requester = chai.request(app).keepOpen();

before(async () => {
  if (NODE_ENV !== 'test') {
    throw 'Not in test env';
  }
  await truncateFakeData();
  await createFakeData();
});

module.exports = {
  assert,
  requester,
};
