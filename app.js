require('dotenv').config();

const { PORT, API_VERSION } = process.env;
const express = require('express');
const bodyparser = require('body-parser');
const path = require('path');

const app = express();
const httpServer = require('http').createServer(app);
const http_io = require('socket.io')(httpServer);

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
  ip = socket.handshake.headers['x-real-ip'] ? socket.handshake.headers['x-real-ip'] : socket.handshake.address;
  socket.on('in', (msg) => {
    url = msg;
    http_io.emit('pageviewConnect', {
      id: socket.id,
      ip,
      url,
      ip2: `***.***.***.${ip.substring(ip.lastIndexOf('.') + 1)}`,
      connections: Object.keys(http_io.sockets.connected).length,
    });
  });
  socket.on('out', (msg) => {
    url = msg;
    http_io.emit('pageviewDisconnect', {
      id: socket.id,
      ip,
      url,
      ip2: `***.***.***.${ip.substring(ip.lastIndexOf('.') + 1)}`,
      connections: Object.keys(http_io.sockets.connected).length,
    });
  });
  socket.on('disconnect', () => {
    http_io.emit('pageviewDisconnect', { connections: Object.keys(http_io.sockets.connected).length });
  });
});
