require('dotenv').config();

const { PORT, API_VERSION } = process.env;
const express = require('express');
const bodyparser = require('body-parser');
const path = require('path');
const logger = require('morgan'); // HTTP request logger

const app = express();

app.set('json spaces', 2);

app.use('/static', express.static('static'));
app.use(logger('dev'));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

// view engine setup
app.set('views', path.join(__dirname, './server/views'));
app.set('view engine', 'pug');

// API routes
app.use(`/api/${API_VERSION}`,
  [
    require('./server/routes/product_route'),
  ]);

// Page routes
app.use('/', require('./server/routes/index_route'));

// Page not found
app.use((req, res, next) => {
  res.status(404).render('error');
});

// Error Response
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send('Internal Server Error');
});

app.listen(PORT, () => { console.log(`Listening on port: ${PORT}`); });
