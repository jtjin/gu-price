const router = require('express').Router();
const path = require('path');

// router.get('/products/:number', (req, res) => {
//    res.sendFile(path.join(__dirname, '../../public/product.html'));
// })

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index');
});

/* GET product page. */
router.get('/products/:number', (req, res, next) => {
  try {
    res.render('product', { title: `商品編號 ${req.params.number} | GU 搜尋 | GU 比價` });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
