const router = require('express').Router();
const { wrapAsync } = require('../../util/util');
const { getProducts, updateFavorite } = require('../controllers/product_controller');

router.route('/products/:category')
  .get(wrapAsync(getProducts));

router.route('/favorite')
  .post(wrapAsync(updateFavorite));

module.exports = router;
