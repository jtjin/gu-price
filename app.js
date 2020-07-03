require('dotenv').config();

const { PORT, API_VERSION } = process.env;
const express = require('express');
const bodyparser = require('body-parser');
const path = require('path');
const logger = require('morgan'); // HTTP request logger
const createError = require('http-errors');

const app = express();

app.set('json spaces', 2);

app.use('/static', express.static('public'));
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

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//    next(createError(404));
//  });

//  // error handler
//  app.use(function(err, req, res, next) {
//    res.locals.message = err.message;
//    res.locals.error = req.app.get('env') === 'development' ? err : {};

//    res.status(err.status || 500);
//    res.render('error');
//  });

// Page not found
app.use((req, res, next) => {
  res.status(404).send('Page Not Found');
});

// Error Response
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send('Internal Server Error');
});

app.listen(PORT, () => { console.log(`Listening on port: ${PORT}`); });
