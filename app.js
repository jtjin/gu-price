require('dotenv').config();

const {
  PORT_TEST, PORT, NODE_ENV, API_VERSION,
} = process.env;
const port = NODE_ENV == 'test' ? PORT_TEST : PORT;

// Express Initialization
const express = require('express');
const bodyparser = require('body-parser');
const path = require('path');

const app = express();

app.set('trust proxy', 'loopback');
app.set('json spaces', 2);

app.use('/static', express.static('static'));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

// view engine setup
app.set('views', path.join(__dirname, './server/views'));
app.set('view engine', 'pug');

// API routes
app.use(`/api/${API_VERSION}`,
  [
    require('./server/routes/product_route'),
    require('./server/routes/user_route'),
  ]);

// Page routes
app.use('/', require('./server/routes/index_route'));

// Page not found
app.use((req, res, next) => {
  res.status(404).render('error', { title: '找不到頁面 | GU 搜尋 | GU 比價', status: '404', message: '找不到頁面' });
});

// Internal Server Error Response
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).render('error', { title: '伺服器錯誤 | GU 搜尋 | GU 比價', status: '500', message: '伺服器錯誤' });
});

app.listen(port, () => { console.log(`Listening on port: ${port}`); });

module.exports = app;
