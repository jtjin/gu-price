require('dotenv').config();
const {PORT, API_VERSION} = process.env;

// Express Initialization
const express = require('express');
const bodyparser = require('body-parser');
const app = express();

app.set('json spaces', 2);

app.use(express.static('public'));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));

// API routes
app.use('/api/' + API_VERSION,
    [
        require('./server/routes/product_route'),
    ]
);

// Page not found
app.use((req, res, next) => {
   res.status(404).send('Page Not Found');
 });
 
 // Error Response
 app.use((err, req, res, next) => {
   console.log(err);
   res.status(500).send('Internal Server Error');
 });

 app.listen(PORT, () => {console.log(`Listening on port: ${PORT}`);});