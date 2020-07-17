require('dotenv').config();

const { PORT, API_VERSION } = process.env;
const express = require('express');
const bodyparser = require('body-parser');
const path = require('path');
const logger = require('morgan'); // HTTP request logger
const _ = require('lodash');

const app = express();
const httpServer = require('http').createServer(app);
const http_io = require('socket.io')(httpServer);

app.set('trust proxy', 'loopback');
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
    require('./server/routes/product_route'), require('./server/routes/user_route'),
  ]);

// Page routes
app.use('/', require('./server/routes/index_route'));

// Page not found
app.use((req, res, next) => {
  res.status(404).render('error', { title: 'Not Found | GU 搜尋 | GU 比價', status: '404', message: 'Not Found' });
});

// Internal Server Error Response
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).render('error', { title: 'Internal Server Error | GU 搜尋 | GU 比價', status: '500', message: 'Internal Server Error' });
});

httpServer.listen(PORT, () => { console.log(`Listening on port: ${PORT}`); });

// Socket
http_io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('message', (msg) => {
    console.log("Got message: " + msg);
    ip = socket.request.connection.remoteAddress;
    url = msg;
    console.log(url);
    console.log(ip)
    // http_io.emit('someone_paid', 'Update dashboard');
  });
});